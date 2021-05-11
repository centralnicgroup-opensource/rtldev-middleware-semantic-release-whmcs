const debug = require('debug')('semantic-release:whmcs')
const resolveConfig = require('./resolve-config')
const puppeteer = require('puppeteer')
const gotoOpts = {
  waitUntil: ['load', 'domcontentloaded'],
  timeout: 240000
}
const navOpts = { waitUntil: 'networkidle0', timeout: 240000 }
const selectorOpts = { timeout: 10000 }

/**
 * A method to publish the module update on whmcs market place
 */
module.exports = async (pluginConfig, context) => {
  const {
    version,
    logger
  } = context

  if (!version || !version.length) {
    debug('deleting product version failed. No input data available.')
    logger.error('WHMCS Marketplace deleting product version failed. No input data available.')
    return false
  }

  let success = true
  const { whmcsLOGIN, whmcsPASSWORD, whmcsPRODUCTID, DEBUG } = resolveConfig(context)

  debug(`WHMCS Marketplace Product ID: ${whmcsPRODUCTID}`)
  logger.log(`WHMCS Marketplace Product ID: ${whmcsPRODUCTID}`)

  debug(`Delete Version: ${version}`)
  logger.log(`Delete Version: ${version}`)

  // strip markdown links from notes as not allowed to keep
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
      // open versions tab
      url = `${wmbase}/product/${whmcsPRODUCTID}/edit#versions`
      await page.goto(url, gotoOpts)
      debug('product page loaded at %s', url)

      // delete version
      const xpath = `//td[contains(., "Version ${version}")]/following-sibling::td/a[contains(@class, "btn-styled-red")]`
      await page.waitForXPath(xpath, selectorOpts)
      debug('XPath found.')
      let nav = page.waitForNavigation(navOpts)
      const elements = await page.$x(xpath)
      debug('Delete Button - click.')
      await elements[0].click()
      debug('Delete Button - clicked.')
      await nav
      debug('Navigation finished.')

      // confirm deletion
      const selector = 'div.listing-edit-container form button[type="submit"]'
      await page.waitForSelector(selector, selectorOpts)
      debug('confirmation form loaded at %s', url)
      nav = page.waitForNavigation(navOpts)
      await page.click(selector)
      await nav

      debug('deleting product version succeeded.')
      logger.log('WHMCS Marketplace deleting product version succeeded.')
      success = true
    } catch (error) {
      debug('deleting product version failed.', error.message)
      logger.error('WHMCS Marketplace deleting product version failed.', error.message)
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
