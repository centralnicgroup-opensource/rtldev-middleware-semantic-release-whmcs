import verifyWHMCS from "./lib/verify.js";
import publishWHMCS from "./lib/publish.js";
import deleteVersion from "./lib/delete-marketplace-version.js";
import setCompatibleVersions from "./lib/set-compatible-versions.js";
import githubReleases from "./lib/get-github-releases.js";
import marketplaceVersions from "./lib/scrape-marketplace-versions.js";

let verified;

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
  return publishWHMCS(pluginConfig, context);
}

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
        await publish(pluginConfig, context);
      }
    }
  }
}

async function delVersion(pluginConfig, context) {
  await verifyConditions(pluginConfig, context);
  await deleteVersion(pluginConfig, context);
}

async function updateCompatibility(pluginConfig, context) {
  await verifyConditions(pluginConfig, context);
  await setCompatibleVersions(pluginConfig, context);
}

async function fail(pluginConfig, context) {
  await verifyConditions(pluginConfig, context);
}

export default {
  verifyConditions,
  publish,
  fail,
  syncVersions,
  delVersion,
  githubReleases,
  marketplaceVersions,
  updateCompatibility,
};
