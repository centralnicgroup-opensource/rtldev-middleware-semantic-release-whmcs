import puppet from "./puppet.js";
import debugConfig from "debug";
import { fileURLToPath } from "node:url";
const debug = debugConfig("semantic-release:whmcs");
const __filename = fileURLToPath(import.meta.url);

/**
 * A method to publish the module update on WHMCS marketplace
 */
export default async (pluginConfig, context) => {
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

  try {
    // Navigate to product administration
    const url = `${urlbase}/product/${productid}/edit#versions`;
    await page.goto(url, gotoOpts);
    debug("Product page loaded at %s", url);

    // Fetch all version rows
    const rows = await page.$$("tr"); // Get all rows in the table

    let deleteButton = null;

    // Loop through rows to find the one containing the specified version
    for (const row of rows) {
      const textContent = await row.evaluate((el) => el.textContent);
      if (textContent.includes(`Version ${version}`)) {
        // Found the correct row, now look for the delete button
        deleteButton = await row.$("a.btn-styled-red");
        break; // Exit the loop once found
      }
    }

    if (!deleteButton) {
      debug(`Delete button for version ${version} not found.`);
      return false;
    }

    // Click the delete button and wait for navigation
    debug("Clicking the delete button.");
    await Promise.all([deleteButton.click(), page.waitForNavigation(navOpts)]);

    // Confirm deletion by clicking the confirmation button
    const confirmSelector = "button.btn-styled-red";
    await page.waitForSelector(confirmSelector, selectorOpts);
    debug("Deletion confirmation button available.");

    await Promise.all([page.click(confirmSelector), page.waitForNavigation(navOpts)]);

    debug("Clicked confirmation button. WHMCS Marketplace product version deleted successfully.");
  } catch (error) {
    debug("Deleting product version failed.", error.message);
    await page.browser().close();
    return false;
  }

  await page.browser().close();
  return {
    name: "WHMCS Marketplace Product Version",
    url: `${urlbase}/product/${productid}`,
  };
};
