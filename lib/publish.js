const debug = require('debug')('semantic-release:whmcs')
const resolveConfig = require('./resolve-config')
const puppeteer = require('puppeteer')
const gotoOpts = {
  waitUntil: ['load', 'domcontentloaded'],
  timeout: 240000
}
const navOpts = { waitUntil: 'networkidle0', timeout: 240000 }
const selectorOpts = { timeout: 240000 }
const setCompatibleVersions = require('./set-compatible-versions')

/**
 * A method to publish the module update on whmcs market place
 */
module.exports = async (pluginConfig, context) => {
  const {
    nextRelease: { notes, version, releaseDate },
    logger
  } = context

  if (!notes || !notes.length || !version || !version.length) {
    debug('publishing new product version failed. No input data available.')
    logger.error('WHMCS Marketplace publishing new product version failed. No input data available.')
  }

  let success = true
  const { whmcsLOGIN, whmcsPASSWORD, whmcsPRODUCTID, DEBUG } = resolveConfig(context)

  debug(`WHMCS Marketplace Product ID: ${whmcsPRODUCTID}`)
  logger.log(`WHMCS Marketplace Product ID: ${whmcsPRODUCTID}`)

  debug(`Release Version: ${version}`)
  logger.log(`Release Version: ${version}`)
  debug(`Notes: ${notes}`)
  logger.log(`Release Notes: ${notes}`)

  // strip markdown links from notes as not allowed to keep
  const cleanedNotes = notes.replace(/\[(.*?)\]\((.+?)\)/gm, '$1')
  const wmbase = 'https://marketplace.whmcs.com'
  let url = `${wmbase}/user/login`
  const browser = await puppeteer.launch({
    headless: !DEBUG,
    defaultViewport: null, // automatically full-sized
    args: [
      '--incognito',
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--ignoreHTTPSErrors=true',
      '--user-agent="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36"'
    ]
  })
  const [page] = await browser.pages()

  if (DEBUG) {
    page.on('console', msg => {
      for (let i = 0; i < msg.args().length; i++) {
        logger.log(`${i}: ${msg.args()[i]}`)
      }
    })
  }

  try {
    await page.setRequestInterception(true)
    page.on('request', request => {
      if (/^(image|stylesheet|other)$/i.test(request.resourceType())) {
        request.abort()
      } else {
        request.continue()
      }
    })

    await page.setJavaScriptEnabled(true)
    await page.goto(url, gotoOpts)
    // do login
    const selector = 'div.login-leftcol form button[type="submit"]'
    await page.waitForSelector(selector, selectorOpts)
    debug('login form loaded at %s', url)
    await page.type('#email', whmcsLOGIN)
    await page.type('#password', whmcsPASSWORD)
    debug('WHMCS Marketplace credentials entered')
    const nav = page.waitForNavigation(navOpts)
    await page.click(selector)
    await nav
    debug('Login form successfully submitted.')
    logger.log('WHMCS Marketplace Login Form successfully submitted.')
  } catch (error) {
    debug('WHMCS Marketplace login failed.', error.message)
    logger.error('WHMCS Marketplace login failed.', error.message)
    success = false
  }
  if (success) {
    try {
      if (!parseInt(whmcsPRODUCTID, 10)) {
        return false
      }
      // add new version
      url = `${wmbase}/product/${whmcsPRODUCTID}/versions/new`
      await page.goto(url, gotoOpts)
      debug('product page loaded at %s', url)
      const selector = 'div.listing-edit-container form button[type="submit"]'
      await page.waitForSelector(selector, selectorOpts)
      debug('product page submit button selector found')
      await page.$eval('#version', (el, value) => {
        el.value = value
      }, version)
      debug('form input for version finished.')

      // fill input type date with localized string
      // https://www.mattzeunert.com/2020/04/01/filling-out-a-date-input-with-puppeteer.html
      const date = releaseDate ? new Date(releaseDate) : new Date()
      const dateString = await page.evaluate(d => new Date(d).toLocaleDateString(navigator.language, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }), date.toISOString())
      await page.type('#released_at', dateString)

      debug('form input for released_at finished.')
      await page.$eval('#description', (el, value) => {
        el.value = value
      }, cleanedNotes)
      debug('form input for description finished.')
      const nav = page.waitForNavigation(navOpts)
      await page.click(selector)
      await nav

      await setCompatibleVersions(pluginConfig, context)

      debug('publishing new product version succeeded.')
      logger.log('WHMCS Marketplace publishing new product version succeeded.')
      success = true
    } catch (error) {
      debug('publishing new product version failed.', error.message)
      logger.error('WHMCS Marketplace publishing new product version failed.', error.message)
      success = false
    }
  }

  await browser.close()
  if (!success) {
    return false
  }
  return {
    name: 'WHMCS Marketplace Product Version',
    url: `${wmbase}/product/${whmcsPRODUCTID}`
  }
}
