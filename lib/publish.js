import puppet from "./puppet.js";
import setCompatibleVersions from "./set-compatible-versions.js";
import debugConfig from "debug";
import { fileURLToPath } from "node:url";
import { robustType, safeClose, waitForSubmitResult, loginAndNavigate, clickAndWaitForResult } from "./puppet-utils.js";
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

  let page, püppi, urlbase, productid, gotoOpts, selectorOpts;

  debug(`Release Version: ${version}`);
  debug(`Notes: ${notes}`);

  try {
    // Login and navigate using a urlBuilder function
    ({ page, püppi } = await loginAndNavigate(
      puppet,
      context,
      (p) => `${p.config.urlbase}/product/${p.config.productid}/versions/new`,
      undefined
    ));
    ({ urlbase, productid, gotoOpts, selectorOpts } = püppi.config);
    const url = `${urlbase}/product/${productid}/versions/new`;
    debug("product page loaded at %s", url);
    const submitSelector = 'div.listing-edit-container form button[type="submit"]';
    await page.waitForSelector(submitSelector, selectorOpts);
    debug("product page submit button selector found");
    // Fill version
    await robustType(page, "#version", version);
    debug("form input for version finished.");

    // Fill release date (input type="date" expects yyyy-mm-dd)
    // Simplified date logic: support dd/mm/yyyy and ISO, always output yyyy-mm-dd
    // Always use the current date for the release date input
    const now = new Date();
    const dateString = now.toISOString().slice(0, 10);
    // Set the value directly for input[type=date] (robust for Puppeteer)
    await page.evaluate(
      (selector, value) => {
        const el = document.querySelector(selector);
        if (el) {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        }
      },
      "#released_at",
      dateString
    );
    debug("form input for released_at finished.");

    // Fill description
    await robustType(page, "#description", cleanedNotes);
    debug("form input for description finished.");

    // Wait for submit button to be enabled
    await page.waitForFunction((sel) => !document.querySelector(sel).disabled, {}, submitSelector);

    // Click submit and wait for navigation/alert using shared util
    await clickAndWaitForResult(page, submitSelector, { navOpts: selectorOpts });
    const result = await waitForSubmitResult(page, { timeout: selectorOpts.timeout || 15000 });
    if (result === "error") {
      debug("Publish failed: error alert shown.");
      await safeClose(page);
      return false;
    } else if (result === "success") {
      debug("Publish succeeded.");
    } else {
      debug("No success or error alert appeared after submit.");
    }

    await setCompatibleVersions(pluginConfig, context);
  } catch (error) {
    debug("Publishing new product version failed.", error.message);
    await safeClose(page);
    return false;
  }
  debug("Publishing new product version succeeded.");
  await safeClose(page);

  return {
    name: "WHMCS Marketplace Product Version",
    url: `${urlbase}/product/${productid}`,
  };
};
