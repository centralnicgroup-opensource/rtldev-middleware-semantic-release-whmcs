import resolveConfig from "./resolve-config.js";
import debugConfig from "debug";
import path from "path";
import fs from "fs";
import os from "os";
import { fileURLToPath } from "url";
import { waitForNavigationOrSelector, robustType, wait, safeClose } from "./puppet-utils.js";

const debug = debugConfig("semantic-release:whmcs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export default async (context) => {
  // Set PUPPETEER_CACHE_DIR BEFORE importing puppeteer
  const workDir = process.env.PROJECT_WORKDIR || process.cwd();
  if (!process.env.PUPPETEER_CACHE_DIR) {
    process.env.PUPPETEER_CACHE_DIR = path.join(workDir, ".cache", "puppeteer");
  }

  debug("PROJECT_WORKDIR: %s", process.env.PROJECT_WORKDIR);
  debug("PUPPETEER_CACHE_DIR: %s", process.env.PUPPETEER_CACHE_DIR);
  debug("PUPPETEER_EXECUTABLE_PATH: %s", process.env.PUPPETEER_EXECUTABLE_PATH);

  // Check if cache dir exists and list contents
  const cacheDir = process.env.PUPPETEER_CACHE_DIR;
  if (fs.existsSync(cacheDir)) {
    debug("Cache dir contents: %s", fs.readdirSync(cacheDir).join(", "));
    const chromeDir = path.join(cacheDir, "chrome");
    if (fs.existsSync(chromeDir)) {
      debug("Chrome dir contents: %s", fs.readdirSync(chromeDir).join(", "));
    }
  } else {
    debug("Cache dir does NOT exist: %s", cacheDir);
  }

  const puppeteer = (await import("puppeteer")).default;

  // Get executable path - prefer env var, then puppeteer's default
  let executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (!executablePath) {
    executablePath = puppeteer.executablePath();
    debug("Using puppeteer.executablePath(): %s", executablePath);
  }

  // Check if executable exists
  if (!fs.existsSync(executablePath)) {
    // Try to find Chrome in the configured cache dir
    const chromeDir = path.join(cacheDir, "chrome");
    let found = false;
    if (fs.existsSync(chromeDir)) {
      const versions = fs.readdirSync(chromeDir);
      debug("Available Chrome versions: %s", versions.join(", "));
      if (versions.length > 0) {
        const latestVersion = versions.sort().pop();
        const possiblePath = path.join(chromeDir, latestVersion, "chrome-linux64", "chrome");
        if (fs.existsSync(possiblePath)) {
          executablePath = possiblePath;
          debug("Found Chrome at: %s", executablePath);
          found = true;
        }
      }
    }

    if (!found) {
      // Fallback: Check default cache locations (home dir)
      // This handles cases where PROJECT_WORKDIR is set but prepare step didn't run or install to project cache
      const homeCache = path.join(os.homedir(), ".cache", "puppeteer", "chrome");
      if (fs.existsSync(homeCache)) {
        debug("Checking fallback cache at: %s", homeCache);
        const versions = fs.readdirSync(homeCache).filter((v) => v.startsWith("linux-") || v.startsWith("chrome-"));
        if (versions.length > 0) {
          const latestVersion = versions.sort().pop();
          const possiblePath = path.join(homeCache, latestVersion, "chrome-linux64", "chrome");
          if (fs.existsSync(possiblePath)) {
            executablePath = possiblePath;
            debug("Found Chrome in fallback location: %s", executablePath);
          }
        }
      }
    }
  }

  if (!fs.existsSync(executablePath)) {
    throw new Error(
      `Chrome executable not found at: ${executablePath}\n` +
        `PUPPETEER_CACHE_DIR: ${cacheDir} (exists: ${fs.existsSync(cacheDir)})\n` +
        `PUPPETEER_EXECUTABLE_PATH: ${process.env.PUPPETEER_EXECUTABLE_PATH}\n` +
        `PROJECT_WORKDIR: ${process.env.PROJECT_WORKDIR}\n` +
        `process.cwd(): ${process.cwd()}`
    );
  }

  debug("Final Chrome executable: %s", executablePath);

  let config;
  const cfg = {
    urlbase: "https://marketplace.whmcs.com",
    ...resolveConfig(context),
    // logger: logger,
    gotoOpts: {
      waitUntil: ["load", "domcontentloaded"],
      timeout: 30 * 1000, // increase to 30 seconds to handle slower loads
    },
    navOpts: {
      waitUntil: ["networkidle0"],
      timeout: 30 * 1000, // increase to 30 seconds to handle slower navigation
    },
    selectorOpts: {
      timeout: 15 * 1000, // increase to 15 seconds for selector waits
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
    headless: cfg.headless,
    defaultViewport: null, // automatically full-sized
    args: launchArgs,
    executablePath,
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
    const { page, login, password, productid, gotoOpts, urlbase, selectorOpts, keepBrowserOpenOnError } = config;
    const submitSelector = 'div.login-leftcol form button[type="submit"]';
    try {
      await page.goto(`${urlbase}/user/login`, gotoOpts);
      debug("login form loaded at %s", `${urlbase}/user/login`);
      // Give cookie banners/extensions a short window to run before interacting
      await wait(2000);
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
        timeout: 15000,
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
        if (keepBrowserOpenOnError) {
          debug("Keeping browser open for debugging after login failure.");
          await wait(60 * 1000);
        } else {
          await safeClose(page);
        }
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
      if (keepBrowserOpenOnError) {
        debug("Keeping browser open for debugging after login error.");
        await wait(60 * 1000);
      } else {
        await safeClose(page);
      }
      return false;
    }

    // access MP Product ID
    let tmp = productid;
    if (!tmp || !/^[0-9]+$/.test(productid) || !parseInt(productid, 10)) {
      debug("No or invalid WHMCS Marketplace Product ID provided.");
      if (keepBrowserOpenOnError) {
        debug("Keeping browser open for debugging due to invalid product id.");
        await wait(60 * 1000);
      } else {
        await safeClose(page);
      }
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
