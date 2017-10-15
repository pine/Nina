'use strict'

const appStoreScraper = require('app-store-scraper')
const config = require('config')
const fecha = require('fecha')
const pEachSeries = require('p-each-series')
const promiseRetry = require('promise-retry')
const { WebClient } = require('@slack/client')

module.exports = async () => {
  const token = config.get('slack.token')
  const web = new WebClient(token)

  const apps = config.get('apps')
  const iosApps = apps.filter(app => app.platform === 'ios')

  await pEachSeries(iosApps, async app => {
    const detail = await appStoreScraper.app({
      id: app.id,
      country: app.country,
    })

    const updated = fecha.parse(detail.updated, 'YYYY-MM-DDTHH:mm:ssZZ')
    const updatedStr = fecha.format(updated, 'YYYY/MM/DD HH:mm')

    await pEachSeries(app.channels, channel => promiseRetry(async () => {
      await web.chat.postMessage(channel, 'アプリの新しいバージョンが公開されました。', {
        attachments: [{
          fields: [
            {
              title: 'タイトル',
              value: detail.title,
              short: false,
            },
            {
              title: 'バージョン',
              value: detail.version,
              short: true,
            },
            {
              title: '公開日時',
              value: updatedStr,
              short: true,
            },
            {
              title: '更新情報',
              value: detail.releaseNotes,
              short: false,
            },
            {
              title: 'URL',
              value: detail.url,
              short: false,
            },
          ],
        }],
      })
    }))
  })
}
