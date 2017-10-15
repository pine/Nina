'use strict'

const log = require('fancy-log')

const checkIosApps = require('./tasks/check_ios_apps')

!async function() {
  try {
    await checkIosApps()
  } catch (e) {
    log.error(e)
  }
}()
