import verifyWHMCS from "./lib/verify.js";
import prepareWHMCS from "./lib/prepare.js";
import publishWHMCS from "./lib/publish.js";
import deleteVersion from "./lib/delete-marketplace-version.js";
import setCompatibleVersions from "./lib/set-compatible-versions.js";
import githubReleases from "./lib/get-github-releases.js";
import marketplaceVersions from "./lib/scrape-marketplace-versions.js";

let verified;
let whmcsPublishResult = null;

/**
 * Called by semantic-release during the prepare step
 * @param {*} pluginConfig The semantic-release plugin config
 * @param {*} context The context provided by semantic-release
 */
async function prepare(pluginConfig, context) {
  await prepareWHMCS(pluginConfig, context);
}

/**
 * Called by semantic-release during the verify step
 * @param {*} pluginConfig The semantic-release plugin config
 * @param {*} context The context provided by semantic-release
 */
async function verifyConditions(pluginConfig, context) {
  if (!verified) {
    await verifyWHMCS(pluginConfig, context);
    verified = true;
  }
}

/**
 * Called by semantic-release during the publish step
 * @param {*} pluginConfig The semantic-release plugin config
 * @param {*} context The context provided by semantic-release
 */
async function publish(pluginConfig, context) {
  await verifyConditions(pluginConfig, context);

  const result = await publishWHMCS(pluginConfig, context);

  // Store the result globally for success/fail hooks
  whmcsPublishResult = {
    success: !!result,
    version: context.nextRelease?.version,
    result: result,
  };

  if (result) {
    console.log(`✅ WHMCS: Published version ${context.nextRelease?.version}`);
  } else {
    console.log(`❌ WHMCS: Failed to publish version ${context.nextRelease?.version}`);
  }

  return result;
}

/**
 * Sync versions from GitHub releases to WHMCS marketplace
 * @param {*} pluginConfig The semantic-release plugin config
 * @param {*} context The context provided by semantic-release
 */
async function syncVersions(pluginConfig, context) {
  await verifyConditions(pluginConfig, context);
  const releases = await githubReleases(pluginConfig, context);

  if (releases && releases.length) {
    const versions = await marketplaceVersions(pluginConfig, context);
    for (const release of releases) {
      if (!versions.includes(release.name.substring(1))) {
        context.nextRelease = {
          version: release.name.substring(1),
          notes: release.body,
          releaseDate: release.published_at,
        };
        console.log(`Adding missing version ${context.nextRelease.version}`);
        const result = await publish(pluginConfig, context);
        console.log(`Published version ${context.nextRelease.version}:`, result);
      }
    }
  }
  return undefined;
}

/**
 * Delete a version from WHMCS marketplace
 * @param {*} pluginConfig The semantic-release plugin config
 * @param {*} context The context provided by semantic-release
 */
async function delVersion(pluginConfig, context) {
  await verifyConditions(pluginConfig, context);
  const result = await deleteVersion(pluginConfig, context);
  return result;
}

/**
 * Update compatibility versions for a product
 * @param {*} pluginConfig The semantic-release plugin config
 * @param {*} context The context provided by semantic-release
 */
async function updateCompatibility(pluginConfig, context) {
  await verifyConditions(pluginConfig, context);
  const result = await setCompatibleVersions(pluginConfig, context);
  return result;
}

// /**
//  * Called by semantic-release when a release succeeds
//  * @param {*} pluginConfig The semantic-release plugin config
//  * @param {*} context The context provided by semantic-release
//  */
// async function success(pluginConfig, context) {
//   if (whmcsPublishResult) {
//     if (whmcsPublishResult.success) {
//       console.log(`🎉 WHMCS: Successfully published version ${whmcsPublishResult.version} to marketplace`);
//       if (whmcsPublishResult.result?.url) {
//         console.log(`🔗 WHMCS: ${whmcsPublishResult.result.url}`);
//       }
//     } else {
//       console.log(`⚠️  WHMCS: Version ${whmcsPublishResult.version} was NOT published to marketplace (WHMCS publish failed)`);
//     }
//   } else {
//     console.log(`⚠️  WHMCS: No WHMCS publish attempted during this release`);
//   }
// }

/**
 * Called by semantic-release when a release fails
 * @param {*} pluginConfig The semantic-release plugin config
 * @param {*} context The context provided by semantic-release
 */
async function fail(pluginConfig, context) {
  if (whmcsPublishResult) {
    if (whmcsPublishResult.success) {
      console.log(`✅ WHMCS: Version ${whmcsPublishResult.version} was successfully published to marketplace`);
      console.log(`ℹ️  WHMCS: Release failed due to other plugins, not WHMCS`);
    } else {
      console.log(`❌ WHMCS: Failed to publish version ${whmcsPublishResult.version} to marketplace`);
    }
  } else {
    console.log(`ℹ️  WHMCS: No WHMCS publish was attempted before failure`);
  }

  // Also show any WHMCS-specific errors from context
  const { errors } = context;
  const whmcsErrors = errors?.filter(
    (e) => e.message?.toLowerCase().includes("whmcs") || e.message?.toLowerCase().includes("marketplace")
  );

  if (whmcsErrors?.length > 0) {
    console.log(`🔍 WHMCS: ${whmcsErrors.map((e) => e.message).join(", ")}`);
  }
}

export default {
  prepare,
  verifyConditions,
  publish,
  //success,
  fail,
  syncVersions,
  delVersion,
  githubReleases,
  marketplaceVersions,
  updateCompatibility,
};
