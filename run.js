'use strict'

const log = require('fancy-log')

const checkAndroidApps = require('./tasks/check_android_apps')
const checkIosApps = require('./tasks/check_ios_apps')

!async function() {
  try {
    await checkAndroidApps()
    // await checkIosApps()
  } catch (e) {
    log.error(e)
    process.exit(1)
  }
  process.exit(0)
}()
