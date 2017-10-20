'use strict'

const { MongoClient } = require('mongodb')
const get = require('lodash.get')

class MongoDb {
  constructor(url) {
    this.url = url
    this.db = null
  }

  async connect() {
    this.db = await MongoClient.connect(this.url)
  }

  disconnect() {
    return this.db.close()
  }

  async findLatestVersion({ platform, id }) {
    const collection = this.db.collection('versions')
    const versions = await collection
      .find({ platform, id })
      .sort({ createdAt: -1 })
      .limit(1)
      .toArray()
    return get(versions, '0.version')
  }

  saveLatestVersion({ platform, appId, version }) {
    const collection = this.db.collection('versions')
    return collection.insert({
      platform,
      appId,
      version,
      createdAt: new Date(),
    })
  }
}

module.exports = MongoDb
