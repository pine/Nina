'use strict'

const config = require('config')
const fecha = require('fecha')
const store = require('google-play-scraper')
const pEachSeries = require('p-each-series')
const promiseRetry = require('promise-retry')
const semver = require('semver')

const SlackClient = require('../lib/slack_client')
const MongoDb = require('../lib/mongo_db')

module.exports = async () => {
  const mongoDbUrl = config.get('mongoDb.url')
  const webhookUrl = config.get('slack.webhookUrl')
  const botUser = config.get('slack.botUsers.android')
  const apps = config.get('apps')
  const localized = config.get('localized')

  const mongo = new MongoDb(mongoDbUrl)
  await mongo.connect()

  const slack = new SlackClient({ webhookUrl, botUser })
  const iosApps = apps.filter(app => app.platform === 'android')

  await pEachSeries(iosApps, async ({ platform, appId, minVersion, channels }) => {
    const detail = await store.app({ appId })

    // Check minimum version
    const version = detail.version
    if (semver.lte(version, minVersion)) return

    // Check latest version
    const latestVersion = await mongo.findLatestVersion({ platform, appId })
    if (latestVersion && semver.lte(version, latestVersion)) return

    // Save latest version
    await mongo.saveLatestVersion({ platform, appId, version })

    const updated = fecha.parse(detail.updated, 'MMMM D, YYYY')
    const updatedAt = fecha.format(updated, 'YYYY/MM/DD')

    await pEachSeries(channels, channel => promiseRetry(async () => {
      await slack.notify({
        channel,
        title: detail.title,
        version,
        updatedAt,
        releaseNotes: detail.recentChanges.join('\n'),
        url: detail.url,
        localized,
      })
    }))
  })

  await mongo.disconnect()
}
