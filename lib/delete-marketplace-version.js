import puppet from "./puppet.js";
import debugConfig from "debug";
import { fileURLToPath } from "node:url";
import { wait, waitForSubmitResult, safeClose, loginAndNavigate, clickAndWaitForResult } from "./puppet-utils.js";
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

  let page, püppi;
  const { productid, urlbase, gotoOpts, navOpts, selectorOpts } = (context && context.config) || {};
  try {
    // Login and navigate to product administration
    ({ page, püppi } = await loginAndNavigate(
      puppet,
      context,
      (p) => `${p.config.urlbase}/product/${p.config.productid}/edit#versions`,
      undefined
    ));
    const { urlbase, productid, gotoOpts, navOpts, selectorOpts } = püppi.config;
    const url = `${urlbase}/product/${productid}/edit#versions`;
    debug("Product page loaded at %s", url);

    // Wait for the table to appear
    debug("Waiting for table to appear...");
    await page.waitForSelector("table", selectorOpts);
    debug("Table found, fetching rows...");

    // Fetch all version rows
    const rows = await page.$$("tr"); // Get all rows in the table
    debug(`Found ${rows.length} rows in the table.`);

    // Find the correct row and delete button for the specified version
    let deleteButton = null;
    for (const row of rows) {
      const textContent = await row.evaluate((el) => el.textContent);
      if (!textContent.includes(`Version ${version}`)) continue;
      const rightCell = await row.$("td.text-right");
      if (!rightCell) continue;
      const candidates = await rightCell.$$("a.btn-styled-red");
      for (const btn of candidates) {
        const btnText = (await btn.evaluate((el) => el.textContent)).trim().toLowerCase();
        if (btnText === "delete") {
          deleteButton = btn;
          break;
        }
      }
      if (deleteButton) break;
    }
    if (!deleteButton) {
      debug(`Delete button for version ${version} not found.`);
      await safeClose(page);
      return false;
    }

    // Click the delete button and wait for navigation/alert
    const box = await deleteButton.boundingBox();
    if (!box) {
      debug("Delete button is not visible in the viewport.");
      await safeClose(page);
      return false;
    }
    await deleteButton.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await wait(200);
    let navigated = false;
    try {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "networkidle0", timeout: navOpts.timeout }),
        deleteButton.click(),
      ]);
      navigated = true;
      debug("Navigation after delete button click complete.");
    } catch (err) {
      debug("Navigation after delete button click timed out, will check for alert anyway.");
    }

    // Click the confirmation button and wait for navigation/alert
    await clickAndWaitForResult(page, "button.btn-styled-red", { navOpts });
    await wait(300);
    debug("Checking for alert-success after confirmation...");
    const result = await waitForSubmitResult(page, { timeout: navOpts.timeout });
    if (result === "error") {
      debug("Delete failed: error alert shown.");
      await safeClose(page);
      return false;
    }
    if (result === "success") {
      debug("Delete succeeded.");
      // Success, return as normal
    } else {
      // Fallback: check if the version row is gone
      debug("No success or error alert appeared after delete. Checking if version row is gone...");
      await page.waitForSelector("table", { timeout: 1000 });
      const rowsAfter = await page.$$("tr");
      for (const row of rowsAfter) {
        const textContent = await row.evaluate((el) => el.textContent);
        if (textContent.includes(`Version ${version}`)) {
          debug("Delete failed: version row still present.");
          await safeClose(page);
          return false;
        }
      }
      debug("Delete succeeded (row is gone).");
    }
  } catch (error) {
    debug("Deleting product version failed.", error && error.message);
    // await page.screenshot({ path: `delete-version-error.png` });
    await safeClose(page);
    return false;
  }

  await safeClose(page);
  return {
    name: "WHMCS Marketplace Product Version",
    url: `${urlbase}/product/${productid}`,
  };
};
