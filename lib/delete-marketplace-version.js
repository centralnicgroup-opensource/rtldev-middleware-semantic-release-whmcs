import puppet from "./puppet.js";
import debugConfig from "debug";
import { fileURLToPath } from "node:url";
const debug = debugConfig("semantic-release:whmcs");
const __filename = fileURLToPath(import.meta.url);
/**
 * A method to publish the module update on whmcs market place
 */
export default async (pluginConfig, context) => {
  // if (!context.logger) {
  //    context.logger = console;
  // }

  const sep = "+++++++++++++++++++++++++++++++++++++++++++++++++++";
  const out = `\n${sep}\n${__filename}\n${sep}\n`;

  const { version } = context;
  if (!version || !version.length) {
    debug(`${out}Deleting product version failed. No input data available.`);
    return false;
  }

  debug(`${out}Delete Version: ${version}`);

  const püppi = await puppet(context);
  const result = await püppi.login();
  if (!result) {
    return result;
  }
  const { page, navOpts, gotoOpts, selectorOpts, productid, urlbase } = püppi.config;

  // strip markdown links from notes as not allowed to keep
  try {
    // navigate to product administration
    const url = `${urlbase}/product/${productid}/edit#versions`;
    await page.goto(url, gotoOpts);
    debug("product page loaded at %s", url);
    // open versions tab (instead of doing it via url)
    // let selector = '#nav-tabs li a[href="#versions"]';
    // await page.waitForSelector(selector, selectorOpts);
    // await page.click(selector);

    // delete version
    // xpath improvements / changes with v16.1.0
    // -> https://github.com/puppeteer/puppeteer/pull/8730
    // https://github.com/puppeteer/puppeteer/blob/d1681ec06b7c3db4b51c20b17b3339f852efbd4d/test/src/queryhandler.spec.ts
    let elements = [];
    do {
      const xpath = `xpath/.//td[contains(., "Version ${version}")]/following-sibling::td/a[contains(@class, "btn-styled-red")]`;
      await page.waitForSelector(xpath, selectorOpts);
      debug("XPath found.");
      const nav = page.waitForNavigation(navOpts);
      elements = await page.$$(xpath);
      if (elements.length) {
        debug("Delete Button - click.");
        await elements[0].hover();
        await elements[0].click();
        debug("Delete Button - clicked.");
        await nav;
        debug("Navigation finished.");
        // confirm deletion
        const selector = "button.btn-styled-red";
        await page.waitForSelector(selector, selectorOpts);
        debug("deletion confirmation button available");
        debug("click confirmation button");
        await page.clickAndNavigate(selector);
        debug("clicked confirmation button");
        await nav;
        debug("WHMCS Marketplace deleting product version succeeded.");
      }
    } while (elements.length);
  } catch (error) {
    // while loop and having all versions deleted
    if (!/waiting for selector `.\/\//i.test(error.message)) {
      debug("Deleting product version failed.", error.message);
      await page.browser().close();
      return false;
    }
  }

  await page.browser().close();
  return {
    name: "WHMCS Marketplace Product Version",
    url: `${urlbase}/product/${productid}`,
  };
};
