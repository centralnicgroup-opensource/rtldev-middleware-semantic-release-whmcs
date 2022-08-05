const debug = require('debug')('semantic-release:whmcs')
const puppet = require('./puppet')
const path = require('path')

/**
 * A method to publish the module update on whmcs market place
 */
module.exports = async (pluginConfig, context) => {
  const sep = '+++++++++++++++++++++++++++++++++++++++++++++++++++'
  const out = `\n${sep}\n${path.basename(__filename)}\n${sep}\n`

  const püppi = await puppet(context)
  const result = await püppi.login()
  if (!result) {
    return result
  }
  const { page, gotoOpts, selectorOpts, productid, urlbase, minversion } =
    püppi.config

  debug(out)
  try {
    // scrap versions from WHMCS marketplace
    const url = `${urlbase}/product/${productid}/edit#compatibility`
    await page.goto(url, gotoOpts)
    debug('product page loaded at %s', url)

    const selector = 'input[name="versionIds[]"]'
    const submitSelector = 'div#compatibility button[type="submit"]'
    await page.waitForSelector(selector, selectorOpts)
    await page.waitForSelector(submitSelector, selectorOpts)
    debug('compatibility version table found')

    let tmp = minversion
    if (tmp) {
      tmp = tmp.replace(/(.)/g, '$&\u200E')
    }
    debug(`Minimum required WHMCS version: ${tmp}`)
    /* istanbul ignore next */
    await page.$$eval(
      selector,
      (checkboxes, minversion) =>
        checkboxes.forEach(function (c) {
          const checkParts = c.className.split('-')[0].split('_')
          const minParts = minversion.split('.')
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
      minversion
    )
    await page.clickAndNavigate(submitSelector)
  } catch (error) {
    debug('Updating whmcs compatibility list failed.', error.message)
    await page.browser().close()
    return false
  }

  debug('Updating whmcs compatibility list succeeded.')
  await page.browser().close()
  return true
}
