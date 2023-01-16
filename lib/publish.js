import puppet from "./puppet.js";
import setCompatibleVersions from "./set-compatible-versions.js";
import debugConfig from "debug";
import { fileURLToPath } from "node:url";
const debug = debugConfig("semantic-release:whmcs");
const __filename = fileURLToPath(import.meta.url);

/**
 * A method to publish the module update on whmcs market place
 */
export default async (pluginConfig, context) => {
  const sep = "+++++++++++++++++++++++++++++++++++++++++++++++++++";
  const out = `\n${sep}\n${__filename}\n${sep}\n`;
  const {
    nextRelease: { notes, version, releaseDate },
  } = context;
  if (!notes || !notes.length || !version || !version.length) {
    debug(`${out}Publishing new product version failed. No input data available.`);
    return false;
  }
  // strip markdown links from notes as not allowed to keep (taken from remove-markdown and cleaned up)
  const cleanedNotes = notes.replace(/\[([^[\]]*)\]\([^()]*\)/gm, "$1");

  const püppi = await puppet(context);
  const result = await püppi.login();
  if (!result) {
    return result;
  }
  const { page, gotoOpts, selectorOpts, productid, urlbase } = püppi.config;

  debug(`Release Version: ${version}`);
  debug(`Notes: ${notes}`);

  try {
    // add new version
    const url = `${urlbase}/product/${productid}/versions/new`;
    await page.goto(url, gotoOpts);
    debug("product page loaded at %s", url);
    const selector = 'div.listing-edit-container form button[type="submit"]';
    await page.waitForSelector(selector, selectorOpts);
    debug("product page submit button selector found");
    /* istanbul ignore next */
    await page.$eval(
      "#version",
      (el, value) => {
        el.value = value;
      },
      version
    );
    debug("form input for version finished.");

    // fill input type date with localized string
    // https://www.mattzeunert.com/2020/04/01/filling-out-a-date-input-with-puppeteer.html
    const date = releaseDate ? new Date(releaseDate) : new Date();
    /* istanbul ignore next */
    const dateString = await page.evaluate(
      (d) =>
        new Date(d).toLocaleDateString(navigator.language, {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      date.toISOString()
    );
    await page.enterAndType("#released_at", dateString);

    debug("form input for released_at finished.");
    /* istanbul ignore next */
    await page.$eval(
      "#description",
      (el, value) => {
        el.value = value;
      },
      cleanedNotes
    );
    debug("form input for description finished.");

    await page.clickAndNavigate('div.listing-edit-container form button[type="submit"]');
    await setCompatibleVersions(pluginConfig, context);
  } catch (error) {
    debug("Publishing new product version failed.", error.message);
    await page.browser().close();
    return false;
  }
  debug("Publishing new product version succeeded.");
  await page.browser().close();

  return {
    name: "WHMCS Marketplace Product Version",
    url: `${urlbase}/product/${productid}`,
  };
};
