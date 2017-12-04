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
  const androidApps = apps.filter(app => app.platform === 'android')

  await pEachSeries(androidApps, async app => {
    const appId = app.appId
    const detail = await store.app({
      appId,
      lang: app.lang,
      country: app.country,
      cache: false,
    })

    // Check minimum version
    const version = detail.version
    if (semver.lte(version, app.minVersion)) return

    // Check latest version
    const latestVersion = await mongo.findLatestVersion({ platform: 'android', appId })
    if (latestVersion && semver.lte(version, latestVersion)) return

    // Save latest version
    await mongo.saveLatestVersion({ platform: 'android', appId, version })

    const updated = fecha.parse(detail.updated, 'YYYY年MM月DD日')
    const updatedAt = fecha.format(updated, 'YYYY/MM/DD')

    await pEachSeries(app.channels, channel => promiseRetry(async () => {
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
