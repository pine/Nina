'use strict'

const sleep = require('promise.sleep')
const { IncomingWebhook } = require('@slack/client')

class SlackClient {
  constructor({ webhookUrl, botUser }) {
    this.webhook = new IncomingWebhook(webhookUrl)
    this.botUser = botUser
  }

  async notify({
    channel,
    title,
    version,
    updatedAt,
    releaseNotes,
    url,
    localized,
  }) {
    await this.webhook.send(Object.assign({}, this.botUser, {
      channel,
      attachments: [{
        fields: [
          {
            title: localized.title,
            value: title,
            short: false,
          },
          {
            title: localized.version,
            value: version,
            short: true,
          },
          {
            title: localized.updatedAt,
            value: updatedAt,
            short: true,
          },
          {
            title: localized.releaseNotes,
            value: releaseNotes,
            short: false,
          },
          {
            title: localized.url,
            value: url,
            short: false,
          },
        ],
      }],
    }))
    await sleep(1000)
  }
}

module.exports = SlackClient
