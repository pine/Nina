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

// vim: se et ts=2 sw=2 sts=2 ft=javascript :
