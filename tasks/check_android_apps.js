'use strict'

const config = require('config')
const fecha = require('fecha')
const store = require('google-play-scraper')
const pEachSeries = require('p-each-series')
const promiseRetry = require('promise-retry')
const sleep = require('promise.sleep')
const { WebClient } = require('@slack/client')

module.exports = async () => {
  const token = config.get('slack.token')
  const web = new WebClient(token)

  const apps = config.get('apps')
  const iosApps = apps.filter(app => app.platform === 'android')

  await pEachSeries(iosApps, async app => {
    const detail = await store.app({
      appId: app.appId,
    })

    const updated = fecha.parse(detail.updated, 'MMMM D, YYYY')
    const updatedStr = fecha.format(updated, 'YYYY/MM/DD')

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
              value: detail.recentChanges.join('\n'),
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
      await sleep(1000)
    }))
  })
}
