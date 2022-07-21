const debug = require('debug')('semantic-release:whmcs')
const resolveConfig = require('./resolve-config')
const puppet = require('./puppet')

/**
 * A method to publish the module update on whmcs market place
 */
module.exports = async (pluginConfig, context) => {
  const { logger } = context

  let success = true
  const { whmcsLOGIN, whmcsPASSWORD, whmcsPRODUCTID, headless, DEBUG } =
    resolveConfig(context)
  const { gotoOpts, navOpts, selectorOpts, page } = await puppet(
    headless,
    DEBUG,
    logger
  )

  debug(`WHMCS Marketplace Product ID: ${whmcsPRODUCTID}`)
  logger.log(`WHMCS Marketplace Product ID: ${whmcsPRODUCTID}`)

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
  let marketplaceVersions = false
  if (success) {
    try {
      if (!parseInt(whmcsPRODUCTID, 10)) {
        return false
      }

      // scrap versions from WHMCS marketplace
      url = `${wmbase}/product/${whmcsPRODUCTID}/edit#versions`
      await page.goto(url, gotoOpts)
      debug('product page loaded at %s', url)
      const selector = 'div#versions tr strong'
      await page.waitForSelector(selector, selectorOpts)
      debug('product version table found')
      /* istanbul ignore next */
      marketplaceVersions = await page.$$eval(
        'div#versions tr td strong',
        (tds) =>
          tds.map((td) => {
            return td.innerText.substring(8)
          })
      )
      marketplaceVersions.reverse()
      marketplaceVersions.forEach((v) =>
        logger.log(`Detected WHMCS version ${v}`)
      )

      debug('publishing new product version succeeded.')
      logger.log('WHMCS Marketplace publishing new product version succeeded.')
      success = true
    } catch (error) {
      debug('publishing new product version failed.', error.message)
      logger.error(
        'WHMCS Marketplace publishing new product version failed.',
        error.message
      )
      success = false
    }
  }

  await page.browser().close()
  if (!success) {
    return false
  }
  return marketplaceVersions
}
