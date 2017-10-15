'use strict'

const config = require('config')
const fecha = require('fecha')
const pEachSeries = require('p-each-series')
const promiseRetry = require('promise-retry')
const store = require('app-store-scraper')

const SlackClient = require('../lib/slack_client')

module.exports = async () => {
  const webhookUrl = config.get('slack.webhookUrl')
  const botUser = config.get('slack.botUsers.ios')
  const apps = config.get('apps')
  const localized = config.get('localized')

  const slack = new SlackClient({ webhookUrl, botUser })
  const iosApps = apps.filter(app => app.platform === 'ios')

  await pEachSeries(iosApps, async ({ id, country, channels }) => {
    const detail = await store.app({ id, country })
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
}
