/**
 * Safely close a Puppeteer page and its browser if defined.
 */
export async function safeClose(page) {
  if (page) {
    try {
      if (typeof page.close === "function") await page.close();
      if (typeof page.browser === "function") {
        const browser = page.browser();
        if (browser && typeof browser.close === "function") await browser.close();
      }
    } catch (e) {
      // ignore errors on close
    }
  }
}
/**
 * Login, navigate to a URL, and return the page object if successful.
 * Throws on login failure or navigation failure.
 */
/**
 * Log in, then build the URL using the logged-in config, then navigate.
 * urlBuilder: function that receives püppi and returns the URL string.
 */
export async function loginAndNavigate(puppet, context, urlBuilder, gotoOpts) {
  const debug = context && context.debug ? context.debug : console.debug;
  const püppi = await puppet(context);
  const loginResult = await püppi.login();
  if (!loginResult) {
    debug && debug("Login failed or returned falsy result.");
    throw new Error("Login failed");
  }
  const { page } = püppi.config;
  const url = typeof urlBuilder === "function" ? urlBuilder(püppi) : urlBuilder;
  const navOpts = gotoOpts || { waitUntil: ["load", "domcontentloaded"], timeout: 10000 };
  debug && debug(`Navigating to: ${url} with options: ${JSON.stringify(navOpts)}`);
  await page.goto(url, navOpts);
  debug && debug(`Navigation to ${url} complete.`);
  return { page, püppi };
}

/**
 * Click a selector, wait for navigation or alert, and return the result.
 * Handles both navigation and in-place alert scenarios.
 */
export async function clickAndWaitForResult(page, selector, { navOpts, resultTimeout = 10000, waitAfter = 200 } = {}) {
  await page.waitForSelector(selector, { visible: true, timeout: navOpts?.timeout || 10000 });
  const btn = await page.$(selector);
  if (!btn) throw new Error(`Button not found: ${selector}`);
  const isDisabled = await btn.evaluate((el) => el.disabled);
  if (isDisabled) throw new Error(`Button is disabled: ${selector}`);
  await btn.evaluate((el) => el.scrollIntoView({ block: "center" }));
  await new Promise((res) => setTimeout(res, waitAfter));
  let navigated = false;
  try {
    await Promise.all([
      page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: navOpts?.timeout || 10000 }),
      btn.evaluate((el) => el.click()),
    ]);
    navigated = true;
  } catch (err) {
    // Navigation may not always happen
  }
  await new Promise((res) => setTimeout(res, waitAfter));
  return navigated;
}
/**
 * Wait for a success or error alert after a form submit, and return 'success', 'error', or 'none'.
 */
export async function waitForSubmitResult(page, { timeout = 10000 } = {}) {
  const successSelector = ".alert-success, .alert.alert-success";
  const errorSelector = ".alert-danger, .alert.alert-danger";
  try {
    await page.waitForSelector(`${successSelector},${errorSelector}`, { timeout });
    if (await page.$(successSelector)) return "success";
    if (await page.$(errorSelector)) return "error";
  } catch (e) {
    // No alert appeared
  }
  return "none";
}
// Shared Puppeteer utility functions for robust automation

/**
 * Wait for either a navigation (URL change) or a selector to appear, polling for up to timeout ms.
 * Returns { redirected: boolean, selectorFound: boolean, url: string }
 */
export async function waitForNavigationOrSelector(
  page,
  { urlPart = "", selector = "", timeout = 15000, pollInterval = 300 } = {}
) {
  const oldUrl = page.url();
  let redirected = false;
  let selectorFound = false;
  let urlAfter = "";
  const start = Date.now();
  while (Date.now() - start < timeout) {
    urlAfter = page.url();
    if (urlPart && urlAfter.includes(urlPart)) {
      redirected = true;
      break;
    }
    if (selector) {
      try {
        await page.waitForSelector(selector, { timeout: pollInterval });
        selectorFound = true;
        urlAfter = page.url();
        break;
      } catch (e) {
        // ignore, keep polling
      }
    }
    await new Promise((res) => setTimeout(res, pollInterval));
  }
  return { redirected, selectorFound, url: urlAfter };
}

/**
 * Robustly fill an input field: focus, clear, type, and fallback to evaluate if needed.
 */
export async function robustType(page, selector, value, delay = 30) {
  await page.focus(selector);
  await page.click(selector, { clickCount: 3 });
  await page.keyboard.press("Backspace");
  await page.type(selector, value, { delay });
  let actual = await page.$eval(selector, (el) => el.value);
  if (actual !== value) {
    await page.evaluate(
      (sel, val) => {
        document.querySelector(sel).value = val;
      },
      selector,
      value
    );
    actual = await page.$eval(selector, (el) => el.value);
  }
  return actual;
}

/**
 * Wait for a short time (ms)
 */
export function wait(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
