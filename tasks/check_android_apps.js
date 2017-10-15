'use strict'

const config = require('config')
const fecha = require('fecha')
const pEachSeries = require('p-each-series')
const promiseRetry = require('promise-retry')
const store = require('google-play-scraper')

const SlackClient = require('../lib/slack_client')

module.exports = async () => {
  const webhookUrl = config.get('slack.webhookUrl')
  const botUser = config.get('slack.botUsers.android')
  const apps = config.get('apps')
  const localized = config.get('localized')

  const slack = new SlackClient({ webhookUrl, botUser })
  const iosApps = apps.filter(app => app.platform === 'android')

  await pEachSeries(iosApps, async ({ appId, channels }) => {
    const detail = await store.app({ appId })
    const updated = fecha.parse(detail.updated, 'MMMM D, YYYY')
    const updatedAt = fecha.format(updated, 'YYYY/MM/DD')

    await pEachSeries(channels, channel => promiseRetry(async () => {
      await slack.notify({
        channel,
        title: detail.title,
        version: detail.version,
        updatedAt,
        releaseNotes: detail.recentChanges.join('\n'),
        url: detail.url,
        localized,
      })
    }))
  })
}
