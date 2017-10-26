'use strict'

const store = require('app-store-scraper')
const config = require('config')
const fecha = require('fecha')
const pEachSeries = require('p-each-series')
const promiseRetry = require('promise-retry')
const semver = require('semver')

const SlackClient = require('../lib/slack_client')
const MongoDb = require('../lib/mongo_db')

module.exports = async () => {
  const mongoDbUrl = config.get('mongoDb.url')
  const webhookUrl = config.get('slack.webhookUrl')
  const botUser = config.get('slack.botUsers.ios')
  const apps = config.get('apps')
  const localized = config.get('localized')

  const mongo = new MongoDb(mongoDbUrl)
  await mongo.connect()

  const slack = new SlackClient({ webhookUrl, botUser })
  const iosApps = apps.filter(app => app.platform === 'ios')

  await pEachSeries(iosApps, async ({ platform, appId, country, minVersion, channels }) => {
    const detail = await store.app({ id: appId, country })

    // Check minimum version
    const version = detail.version
    if (semver.lte(version, minVersion)) return

    // Check latest version
    const latestVersion = await mongo.findLatestVersion({ platform, appId })
    if (latestVersion && semver.lte(version, latestVersion)) return


    // Save latest version
    await mongo.saveLatestVersion({ platform, appId, version })

    const updated = fecha.parse(detail.updated, 'YYYY-MM-DDTHH:mm:ssZZ')
    const updatedAt = fecha.format(updated, 'YYYY/MM/DD HH:mm')

    await pEachSeries(channels, channel => promiseRetry(async () => {
      await slack.notify({
        channel,
        title: detail.title,
        version: detail.version,
        updatedAt,
        releaseNotes: detail.releaseNotes,
        url: detail.url,
        localized,
      })
    }))
  })

  await mongo.disconnect()
}
