import puppet from "./puppet.js";
import debugConfig from "debug";
import { fileURLToPath } from "node:url";
import { robustType, wait, waitForSubmitResult, loginAndNavigate, clickAndWaitForResult } from "./puppet-utils.js";
import { safeClose } from "./puppet-utils.js";
const debug = debugConfig("semantic-release:whmcs");
const __filename = fileURLToPath(import.meta.url);

/**
 * A method to publish the module update on whmcs market place
 */
export default async (pluginConfig, context) => {
  const sep = "+++++++++++++++++++++++++++++++++++++++++++++++++++";
  const out = `\n${sep}\n${__filename}\n${sep}\n`;

  let page, püppi, urlbase, productid, gotoOpts, selectorOpts, minversion;
  debug(out);
  let success = false;
  try {
    // Login and navigate to compatibility page
    ({ page, püppi } = await loginAndNavigate(
      puppet,
      context,
      (p) => `${p.config.urlbase}/product/${p.config.productid}/edit#compatibility`,
      undefined
    ));
    ({ urlbase, productid, gotoOpts, selectorOpts, minversion } = püppi.config);
    const url = `${urlbase}/product/${productid}/edit#compatibility`;
    debug("product page loaded at %s", url);

    const selector = 'input[name="versionIds[]"]';
    const submitSelector = 'div#compatibility button[type="submit"]';
    await page.waitForSelector(selector, selectorOpts);
    await page.waitForSelector(submitSelector, selectorOpts);
    debug("compatibility version table found");

    let tmp = minversion;
    if (tmp) {
      tmp = tmp.replace(/(.)/g, "$&\u200E");
    }
    debug(`Minimum required WHMCS version: ${tmp}`);
    // No robustType needed for checkboxes, but keep logic DRY
    await page.$$eval(
      selector,
      (checkboxes, minversion) =>
        checkboxes.forEach(function (c) {
          const checkParts = c.className.split("-")[0].split("_");
          const minParts = minversion.split(".");
          let check = true;
          for (let i = 0; i < 2; i++) {
            const a = ~~checkParts[i];
            const b = ~~minParts[i];
            if (a > b) {
              break;
            }
            if (a < b) {
              check = false;
              break;
            }
          }
          c.checked = check;
        }),
      minversion
    );
    // Wait for submit button to be enabled
    await page.waitForFunction((sel) => !document.querySelector(sel).disabled, {}, submitSelector);
    // Click submit and wait for navigation/alert using shared util
    await clickAndWaitForResult(page, submitSelector, { navOpts: gotoOpts });
    const result = await waitForSubmitResult(page, { timeout: gotoOpts.timeout || 10000 });
    if (result === "error") {
      debug("Compatibility update failed: error alert shown.");
      success = false;
    } else if (result === "success") {
      debug("Compatibility update succeeded.");
      success = true;
    } else {
      debug("No success or error alert appeared after submit.");
    }
  } catch (error) {
    debug("Updating whmcs compatibility list failed.", error.message);
    success = false;
  } finally {
    if (page) {
      await safeClose(page);
    }
  }

  if (success) {
    debug("Updating whmcs compatibility list succeeded.");
    return {
      name: "WHMCS Marketplace Compatibility Update",
      url: `${urlbase}/product/${productid}/edit#compatibility`,
    };
  } else {
    debug("Updating whmcs compatibility list failed.");
    return false;
  }
};
