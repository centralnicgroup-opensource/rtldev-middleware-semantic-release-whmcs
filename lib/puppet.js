const puppeteer = require('puppeteer')
const debug = require('debug')('semantic-release:whmcs')
const resolveConfig = require('./resolve-config')

module.exports = async (context) => {
  const cfg = {
    urlbase: 'https://marketplace.whmcs.com',
    ...resolveConfig(context),
    // logger: logger,
    gotoOpts: {
      waitUntil: ['load', 'domcontentloaded'],
      timeout: 240000
    },
    navOpts: {
      waitUntil: ['networkidle0'],
      timeout: 240000
    },
    selectorOpts: {
      timeout: 10000
    },
    logger: context.logger
  }

  const browser = await puppeteer.launch({
    headless: cfg.headless === '1',
    defaultViewport: null, // automatically full-sized
    args: [
      '--disable-gpu',
      '--incognito',
      '--start-maximized',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--ignoreHTTPSErrors=true'
    ]
  })
  const { logger } = cfg
  const [page] = await browser.pages()
  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8'
  })
  await page.setUserAgent(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
  )
  await page.setJavaScriptEnabled(true)

  if (cfg.debug) {
    page.on('console', (msg) => {
      for (let i = 0; i < msg.args().length; i++) {
        logger.log(`${i}: ${msg.args()[i]}`)
      }
    })
  }

  page.clickAndNavigate = async (selector) => {
    const { page, navOpts } = this.config
    const nav = page.waitForNavigation(navOpts)
    await page.hover(selector)
    await page.click(selector)
    await nav
  }

  page.enterAndType = async (selector, value) => {
    const { page, selectorOpts } = this.config
    await page.waitForSelector(selector, selectorOpts)
    await page.type(selector, value)
  }

  this.login = async () => {
    const { page, login, password, productid, gotoOpts, urlbase } = this.config
    const selector = 'div.login-leftcol form button[type="submit"]'
    // do login
    try {
      await page.goto(`${urlbase}/user/login`, gotoOpts)
      debug('login form loaded at %s', `${urlbase}/user/login`)
      await page.enterAndType('#email', login)
      await page.enterAndType('#password', password)
      debug('WHMCS Marketplace credentials entered')
      await page.clickAndNavigate(selector)
      debug('WHMCS Marketplace login form submitted.')
    } catch (error) {
      debug(
        'WHMCS Marketplace login failed or Product ID missing',
        error.message
      )
      await page.browser().close()
      return false
    }
    debug('WHMCS Marketplace login succeeded.')

    // access MP Product ID
    let tmp = productid
    if (!tmp || !/^[0-9]+$/.test(productid) || !parseInt(productid, 10)) {
      debug('No or invalid WHMCS Marketplace Product ID provided.')
      await page.browser().close()
      return false
    }

    tmp = tmp.replace(/(.)/g, '$&\u200E')
    debug(`WHMCS Marketplace Product ID: ${tmp}`)

    return true
  }

  this.config = {
    ...cfg,
    page
  }

  return this
}
