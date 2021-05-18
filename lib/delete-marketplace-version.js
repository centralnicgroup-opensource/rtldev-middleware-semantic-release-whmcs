const debug = require('debug')('semantic-release:whmcs')
const resolveConfig = require('./resolve-config')
const puppet = require('./puppet')

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
  const { gotoOpts, navOpts, selectorOpts, page } = await puppet(DEBUG, logger)

  debug(`WHMCS Marketplace Product ID: ${whmcsPRODUCTID}`)
  logger.log(`WHMCS Marketplace Product ID: ${whmcsPRODUCTID}`)

  debug(`Delete Version: ${version}`)
  logger.log(`Delete Version: ${version}`)

  // strip markdown links from notes as not allowed to keep
  const wmbase = 'https://marketplace.whmcs.com'
  let url = `${wmbase}/user/login`

  try {
    await page.goto(url, gotoOpts)
    // do login
    const selector = 'div.login-leftcol form button[type="submit"]'
    await page.waitForSelector(selector, selectorOpts)
    debug('login form loaded at %s', url)
    await page.type('#email', whmcsLOGIN)
    await page.type('#password', whmcsPASSWORD)
    debug('WHMCS Marketplace credentials entered')
    const nav = page.waitForNavigation(navOpts)
    await page.hover(selector)
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
      /* istanbul ignore next */
      const elements = await page.$x(xpath)
      debug('Delete Button - click.')
      await elements[0].hover()
      await elements[0].click()
      debug('Delete Button - clicked.')
      await nav
      debug('Navigation finished.')

      // confirm deletion
      const selector = 'div.listing-edit-container form button[type="submit"]'
      await page.waitForSelector(selector, selectorOpts)
      debug('confirmation form loaded at %s', url)
      nav = page.waitForNavigation(navOpts)
      await page.hover(selector)
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

  await page.browser().close()
  if (!success) {
    return false
  }
  return {
    name: 'WHMCS Marketplace Product Version',
    url: `${wmbase}/product/${whmcsPRODUCTID}`
  }
}
