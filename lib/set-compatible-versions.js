const debug = require('debug')('semantic-release:whmcs')
const resolveConfig = require('./resolve-config')
const puppet = require('./puppet')
const path = require('path')

/**
 * A method to publish the module update on whmcs market place
 */
module.exports = async (pluginConfig, context) => {
  const { logger } = context

  let success = true
  const {
    whmcsLOGIN,
    whmcsPASSWORD,
    whmcsPRODUCTID,
    whmcsMINVERSION,
    headless,
    DEBUG
  } = resolveConfig(context)
  const { gotoOpts, navOpts, selectorOpts, page } = await puppet(
    headless,
    DEBUG,
    logger
  )

  const sep = '+++++++++++++++++++++++++++++++++++++++++++++++++++'
  const out = `\n${sep}\n${path.basename(__filename)}\n${sep}`
  debug(out)
  logger.log(out)

  let tmp = whmcsPRODUCTID
  if (tmp) {
    tmp = tmp.replace(/(.)/g, '$&\u200E')
  }
  debug(`WHMCS Marketplace Product ID: ${tmp}`)
  logger.log(`WHMCS Marketplace Product ID: ${tmp}`)

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

      // scrap versions from WHMCS marketplace
      url = `${wmbase}/product/${whmcsPRODUCTID}/edit#compatibility`
      await page.goto(url, gotoOpts)
      debug('product page loaded at %s', url)

      const selector = 'input[name="versionIds[]"]'
      const submitSelector = 'div#compatibility button[type="submit"]'
      await page.waitForSelector(selector, selectorOpts)
      await page.waitForSelector(submitSelector, selectorOpts)
      debug('compatibility version table found')

      let tmp = whmcsMINVERSION
      if (tmp) {
        tmp = tmp.replace(/(.)/g, '$&\u200E')
      }
      logger.log(`Minimum required WHMCS version: ${tmp}`)
      /* istanbul ignore next */
      await page.$$eval(
        selector,
        (checkboxes, whmcsMINVERSION) =>
          checkboxes.forEach(function (c) {
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
          }),
        whmcsMINVERSION
      )
      const submitNav = page.waitForNavigation(navOpts)
      await page.hover(submitSelector)
      await page.click(submitSelector)
      await submitNav

      debug('updating whmcs compatibility list succeeded.')
      logger.log(
        'WHMCS Marketplace updating whmcs compatibility list succeeded.'
      )
      success = true
    } catch (error) {
      debug('updating whmcs compatibility list failed.', error.message)
      logger.error(
        'WHMCS Marketplace updating whmcs compatibility list failed.',
        error.message
      )
      success = false
    }
  }

  await page.browser().close()
  return success
}
