import puppeteer from "puppeteer";
import resolveConfig from "./resolve-config.js";
import debugConfig from "debug";
import path from "path";
import { fileURLToPath } from "url";
import { waitForNavigationOrSelector, robustType, wait } from "./puppet-utils.js";
const debug = debugConfig("semantic-release:whmcs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default async (context) => {
  let config;
  const cfg = {
    urlbase: "https://marketplace.whmcs.com",
    ...resolveConfig(context),
    // logger: logger,
    gotoOpts: {
      waitUntil: ["load", "domcontentloaded"],
      timeout: 20 * 1000,
    },
    navOpts: {
      waitUntil: ["networkidle0"],
      timeout: 20 * 1000,
    },
    selectorOpts: {
      timeout: 20 * 1000,
    },
    logger: context.logger,
  };

  // Configure browser launch arguments
  const baseArgs = [
    "--disable-gpu",
    "--start-maximized",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-infobars",
    "--ignore-certifcate-errors",
    "--ignore-certifcate-errors-spki-list",
    "--ignoreHTTPSErrors=true",
  ];

  const launchArgs = [...baseArgs];
  // Add extension if not using incognito mode and if extension is available
  if (cfg.useCookieExtension && !cfg.incognito) {
    const extensionPath = path.join(__dirname, "../extensions/I-Still-Dont-Care-About-Cookies");
    launchArgs.push(`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`);
    debug("Loading I Still Don't Care About Cookies extension");
  } else if (cfg.incognito) {
    launchArgs.push("--incognito");
  }

  const browser = await puppeteer.launch({
    headless: cfg.headless === "1" ? "true" : false,
    defaultViewport: null, // automatically full-sized
    args: launchArgs,
  });
  const { logger } = cfg;
  const [page] = await browser.pages();
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
  });
  await page.setUserAgent(
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
  );
  await page.setJavaScriptEnabled(true);

  if (cfg.debug) {
    page.on("console", (msg) => {
      for (let i = 0; i < msg.args().length; i++) {
        logger.log(`${i}: ${msg.args()[i]}`);
      }
    });
  }

  async function login() {
    const { page, login, password, productid, gotoOpts, urlbase, selectorOpts } = config;
    const submitSelector = 'div.login-leftcol form button[type="submit"]';
    try {
      await page.goto(`${urlbase}/user/login`, gotoOpts);
      debug("login form loaded at %s", `${urlbase}/user/login`);
      // Wait for login form
      await page.waitForSelector("#email", selectorOpts);
      await page.waitForSelector("#password", selectorOpts);
      await page.waitForSelector(submitSelector, selectorOpts);
      // Enter credentials
      await robustType(page, "#email", login);
      await robustType(page, "#password", password);
      debug("WHMCS Marketplace credentials entered");
      await page.click(submitSelector);
      // Wait for either navigation or post-login selector
      const { redirected, selectorFound, url } = await waitForNavigationOrSelector(page, {
        urlPart: "/account",
        selector: ".account-navbar",
        timeout: 5000,
      });
      if (!redirected && !selectorFound) {
        // Check for alert-danger (login error) on the same page
        const errorAlert = await page.$(".alert-danger, .alert.alert-danger");
        if (errorAlert) {
          debug("Login failed: error alert shown on login page.");
        } else {
          debug("Login failed: no navigation, no selector, and no error alert after submit");
        }
        // await page.screenshot({ path: `login-failed-no-redirect-or-selector.png` });
        await page.browser().close();
        return false;
      }
      debug("WHMCS Marketplace login succeeded (redirected: %s, selectorFound: %s)", redirected, selectorFound);
    } catch (error) {
      debug("WHMCS Marketplace login failed", error.message);
      try {
        // await page.screenshot({ path: `login-error.png` });
      } catch (e) {
        debug("Screenshot failed", e.message);
      }
      await page.browser().close();
      return false;
    }

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
