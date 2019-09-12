const debug = require('debug')('semantic-release:whmcs')
const resolveConfig = require('./resolve-config')
const puppeteer = require('puppeteer')

/**
 * A method to publish the module update on whmcs market place
 */
module.exports = async (pluginConfig, context) => {
  const {
    nextRelease: { gitTag, notes },
    logger
  } = context

  const { whmcsLOGIN, whmcsPASSWORD, whmcsPRODUCTID } = resolveConfig(context)

  const wmbase = 'https://marketplace.whmcs.com'
  let url = `${wmbase}/user/login`
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--incognito'
    ]
  })
  const [page] = await browser.pages()
  const err = {
    success: true
  }
  try {
    await page.setJavaScriptEnabled(true)
    await page.goto(url, {
      waitUntil: ['load', 'domcontentloaded'],
      timeout: 60000
    })
    // do login
    const selector = 'div.login-leftcol form button[type="submit"]'
    await page.waitForSelector(selector)
    debug('login form loaded at %s', url)
    await page.type('#email', whmcsLOGIN)
    await page.type('#password', whmcsPASSWORD)
    debug('WHMCS Marketplace credentials entered')
    const nav = page.waitForNavigation()
    await page.click(selector)
    await nav
    debug('Login form successfully submitted.')
    logger.log('WHMCS Marketplace Login Form successfully submitted.')
  } catch (error) {
    debug('WHMCS Marketplace login failed.', error.message)
    logger.error('WHMCS Marketplace login failed.', error.message)
    err.success = false
  }
  if (err.success) {
    try {
      // add new version
      url = `${wmbase}/product/${whmcsPRODUCTID}/versions/new`
      await page.goto(url, {
        waitUntil: ['load', 'domcontentloaded'],
        timeout: 10000
      })
      debug('product page loaded at %s', url)
      const selector = 'div.listing-edit-container form button[type="submit"]'
      await page.waitForSelector(selector)
      await page.type('#version', gitTag)
      const date = new Date()
      const day = date.getDate()
      const month = date.getMonth() + 1
      // tt.mm.jjjj
      // but for any reason we need to provide mm.tt.jjjj when doing it though puppeteer
      // tt.mm.jjjj in non-headless mode mm.tt.jjjj otherwise? lol?
      await page.type('#released_at', `${month < 10 ? '0' : ''} ${month}.${day < 10 ? '0' : ''} ${day}.${date.getFullYear()} `)
      await page.type('#description', notes)
      const nav = page.waitForNavigation()
      await page.click(selector)
      await nav
      debug('publishing new product version succeeded.')
      logger.log('WHMCS Marketplace pusblishing new product version succeeded.')
    } catch (error) {
      debug('publishing new product version failed.', error.message)
      logger.error('WHMCS Marketplace publishing new product version failed.', error.message)
      err.success = false
    }
  }
  // const pages = await browser.pages()
  // pages.forEach(async (page) => { await page.close() })
  await browser.close()
  return !err.success ? false : err
}
