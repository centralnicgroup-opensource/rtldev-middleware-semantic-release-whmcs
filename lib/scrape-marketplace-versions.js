import puppet from "./puppet.js";
import debugConfig from "debug";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const debug = debugConfig("semantic-release:whmcs");

/**
 * A method to publish the module update on whmcs market place
 */
export default async (pluginConfig, context) => {
  const sep = "+++++++++++++++++++++++++++++++++++++++++++++++++++";
  const out = `\n${sep}\n${__filename}\n${sep}\n`;

  const püppi = await puppet(context);
  const result = await püppi.login();
  if (!result) {
    return result;
  }
  const { page, gotoOpts, selectorOpts, productid, urlbase } = püppi.config;

  let marketplaceVersions = [];
  try {
    // scrap versions from WHMCS marketplace
    const url = `${urlbase}/product/${productid}/edit#versions`;
    await page.goto(url, gotoOpts);
    debug(`${out}product page loaded at %s`, url);
    const selector = "div#versions tr strong";
    await page.waitForSelector(selector, selectorOpts);
    debug("product version table found");
    /* istanbul ignore next */
    marketplaceVersions = await page.$$eval(selector, (tds) =>
      tds.map((td) => {
        return td.innerText.substring(8);
      })
    );
    marketplaceVersions.reverse();
    marketplaceVersions.forEach((v) => debug(`Detected WHMCS version ${v}`));
  } catch (error) {
    debug("Publishing new product version failed.", error.message);
    await page.browser().close();
    return false;
  }

  debug("Publishing new product version succeeded.");
  await page.browser().close();
  return marketplaceVersions;
};
