#!/usr/bin/env node
'use strict'

const log = require('fancy-log')
const http = require('http')

const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/health' || req.url === '/healthcheck') {
    res.writeHead(200)
    res.end('OK')
  } else {
    res.writeHead(404)
    res.end('Not Found')
  }
})

server.on('clientError', (err, socket) => {
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})

const port = process.env.PORT || 5000
server.listen(port, () => {
   log(`Listining: http://0.0.0.0:${port}`)
})

// ----------------------------------------------------------------------------

const { CronJob } = require('cron')

const checkAndroidApps = require('./tasks/check_android_apps')
const checkIosApps = require('./tasks/check_ios_apps')

const job = new CronJob('00 */5 * * * *', async () => {
  await checkAndroidApps()
  await checkIosApps()
}, null, true, 'Asia/Tokyo')

// vim: se et ts=2 sw=2 sts=2 ft=javascript :
