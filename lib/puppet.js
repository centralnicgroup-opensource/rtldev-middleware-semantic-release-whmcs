const puppeteer = require('puppeteer')

module.exports = async (DEBUG, logger) => {
  if (!logger) {
    logger = console
  }
  const gotoOpts = {
    waitUntil: ['load', 'domcontentloaded'],
    timeout: 240000
  }
  const navOpts = {
    waitUntil: 'networkidle0',
    timeout: 240000
  }
  const selectorOpts = {
    timeout: 10000
  }

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

  await page.setRequestInterception(true)
  page.on('request', request => {
    if (/^(image|stylesheet|other)$/i.test(request.resourceType())) {
      request.abort()
    } else {
      request.continue()
    }
  })
  await page.setJavaScriptEnabled(true)

  if (DEBUG) {
    page.on('console', msg => {
      for (let i = 0; i < msg.args().length; i++) {
        logger.log(`${i}: ${msg.args()[i]}`)
      }
    })
  }

  page.clickAndNavigate = async (selector) => {
    const nav = page.waitForNavigation(navOpts)
    await page.hover(selector)
    await page.click(selector)
    await nav
  }

  return { page, gotoOpts, navOpts, selectorOpts }
}
