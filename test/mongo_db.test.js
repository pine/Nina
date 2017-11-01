'use strict'

const MongoDb = require('../lib/mongo_db')

const mongoUrl = 'mongodb://127.0.0.1:27017/test'


test('can initialize', () => {
  const mongo = new MongoDb(mongoUrl)
  expect(mongo.url).toBe(mongoUrl)
  expect(mongo.db).toBeNull()
})


test('can connect db', async () => {
  const mongo = new MongoDb(mongoUrl)
  await mongo.connect()
  await mongo.disconnect()
})


test('can findLatestVersion', async () => {
  const mongo = new MongoDb(mongoUrl)
  await mongo.connect()

  await mongo.db.collection('versions').deleteMany()
  await mongo.db.collection('versions').insertMany([
    {
      platform: 'platform',
      appId: '12345',
      version: '1.0.0',
      createdAt: new Date(2017, 1, 1, 0, 0, 0),
    },
    {
      platform: 'platform',
      appId: '12345',
      version: '1.0.1',
      createdAt: new Date(2017, 1, 1, 1, 0, 0),
    },
  ])

  const version = await mongo.findLatestVersion({
    platform: 'platform',
    appId: '12345',
  })
  expect(version).toBe('1.0.1')

  await mongo.disconnect()
})
