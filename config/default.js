'use strict'

module.exports = {
  slack: {
    webhookUrl: '',
    botUsers: {
      ios: {
        username: 'App Store',
        iconUrl: '',
        text: 'アプリの新しいバージョンが公開されました。',
      },
      android: {
        username: 'Google Play',
        iconUrl: '',
        text: 'アプリの新しいバージョンが公開されました。',
      },
    },
  },

  apps: [
    {
      platform: 'ios',
      country: 'jp',
      id: '12345',
      minVersion: '1.0.0',
      channels: ['general'],
    },
    {
      platform: 'ios',
      appId: 'com.example.app',
      minVersion: '1.0.0',
      channels: ['general'],
    },
  ],

  localized: {
    title: 'タイトル',
    version: 'バージョン',
    updatedAt: '公開日時',
    releaseNotes: '更新情報',
    url: 'URL',
  },
}
