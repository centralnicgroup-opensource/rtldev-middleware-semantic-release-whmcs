import puppeteer from "puppeteer";
import resolveConfig from "./resolve-config.js";
import debugConfig from "debug";
const debug = debugConfig("semantic-release:whmcs");
export default async (context) => {
  let config;
  const cfg = {
    urlbase: "https://marketplace.whmcs.com",
    ...resolveConfig(context),
    // logger: logger,
    gotoOpts: {
      waitUntil: ["load", "domcontentloaded"],
      timeout: 60 * 1000 * 10,
    },
    navOpts: {
      waitUntil: ["networkidle0"],
      timeout: 60 * 1000 * 5,
    },
    selectorOpts: {
      timeout: 60 * 1000 * 5,
    },
    logger: context.logger,
  };

  const browser = await puppeteer.launch({
    headless: cfg.headless === "1" ? "new" : false,
    defaultViewport: null, // automatically full-sized
    args: [
      "--disable-gpu",
      "--incognito",
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-infobars",
      "--ignore-certifcate-errors",
      "--ignore-certifcate-errors-spki-list",
      "--ignoreHTTPSErrors=true",
    ],
  });
  const { logger } = cfg;
  const [page] = await browser.pages();
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
  });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36 Edg/139.0.0.0"
  );
  await page.setJavaScriptEnabled(true);

  if (cfg.debug) {
    page.on("console", (msg) => {
      for (let i = 0; i < msg.args().length; i++) {
        logger.log(`${i}: ${msg.args()[i]}`);
      }
    });
  }

  page.clickAndNavigate = async (selector) => {
    const { page, navOpts } = config;
    const nav = page.waitForNavigation(navOpts);
    await page.hover(selector);
    await page.click(selector);
    await nav;
  };

  page.enterAndType = async (selector, value) => {
    const { page, selectorOpts } = config;
    await page.waitForSelector(selector, selectorOpts);
    await page.type(selector, value);
  };

  async function login() {
    const { page, login, password, productid, gotoOpts, urlbase } = config;
    const selector = 'div.login-leftcol form button[type="submit"]';
    // do login
    try {
      await page.goto(`${urlbase}/user/login`, gotoOpts);
      debug("login form loaded at %s", `${urlbase}/user/login`);
      await page.enterAndType("#email", login);
      await page.enterAndType("#password", password);
      debug("WHMCS Marketplace credentials entered");
      await page.clickAndNavigate(selector);
      debug("WHMCS Marketplace login form submitted.");
    } catch (error) {
      debug("WHMCS Marketplace login failed or Product ID missing", error.message);
      await page.browser().close();
      return false;
    }

    debug("WHMCS Marketplace login succeeded.");

    // access MP Product ID
    let tmp = productid;
    if (!tmp || !/^[0-9]+$/.test(productid) || !parseInt(productid, 10)) {
      debug("No or invalid WHMCS Marketplace Product ID provided.");
      await page.browser().close();
      return false;
    }

    tmp = tmp.replace(/(.)/g, "$&\u200E");
    debug(`WHMCS Marketplace Product ID: ${tmp}`);

    return true;
  }

  config = {
    ...cfg,
    page,
  };

  return { config, login };
};
