const debug = require('debug')('semantic-release:whmcs')
const resolveConfig = require('./resolve-config')
const puppeteer = require('puppeteer')
const gotoOpts = {
  waitUntil: ['load', 'domcontentloaded'],
  timeout: 240000
}
const navOpts = { waitUntil: 'networkidle0', timeout: 240000 }
const selectorOpts = { timeout: 240000 }

/**
 * A method to publish the module update on whmcs market place
 */
module.exports = async (pluginConfig, context) => {
  const {
    logger
  } = context

  let success = true
  const { whmcsLOGIN, whmcsPASSWORD, whmcsPRODUCTID, whmcsMINVERSION, DEBUG } = resolveConfig(context)

  debug(`WHMCS Marketplace Product ID: ${whmcsPRODUCTID}`)
  logger.log(`WHMCS Marketplace Product ID: ${whmcsPRODUCTID}`)

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

      // scrap versions from WHMCS marketplace
      url = `${wmbase}/product/${whmcsPRODUCTID}/edit#compatibility`
      await page.goto(url, gotoOpts)
      debug('product page loaded at %s', url)

      const selector = 'input[name="versionIds[]"]'
      const submitSelector = 'div#compatibility button[type="submit"]'
      await page.waitForSelector(selector, selectorOpts)
      await page.waitForSelector(submitSelector, selectorOpts)
      debug('compatibility version table found')

      logger.log(`Minimum required WHMCS version: ${whmcsMINVERSION}`)
      await page.$$eval(selector, (checkboxes, whmcsMINVERSION) => checkboxes.forEach(function (c, i) {
        const checkParts = c.className.split('-')[0].split('_')
        const minParts = whmcsMINVERSION.split('.')
        let check = true
        for (let i = 0; i < 2; i++) {
          const a = ~~checkParts[i]
          const b = ~~minParts[i]
          if (a > b) {
            break
          }
          if (a < b) {
            check = false
            break
          }
        }
        c.checked = check
      }), whmcsMINVERSION)
      const submitNav = page.waitForNavigation(navOpts)
      await page.click(submitSelector)
      await submitNav

      debug('updating whmcs compatibility list succeeded.')
      logger.log('WHMCS Marketplace updating whmcs compatibility list succeeded.')
      success = true
    } catch (error) {
      debug('updating whmcs compatibility list failed.', error.message)
      logger.error('WHMCS Marketplace updating whmcs compatibility list failed.', error.message)
      success = false
    }
  }

  await browser.close()
  return success
}
