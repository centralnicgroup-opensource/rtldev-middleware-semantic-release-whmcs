const verifyWHMCS = require('./lib/verify')
const githubReleases = require('./lib/get-github-releases.js')
const marketplaceVersions = require('./lib/scrape-marketplace-versions.js')
const publish = require('./lib/publish')

let verified

async function syncVersions (pluginConfig, context) {
  if (!verified) {
    await verifyWHMCS(pluginConfig, context)
    verified = true
  }
  const releases = await githubReleases(pluginConfig, context)
  const versions = await marketplaceVersions(pluginConfig, context)

  releases.forEach((release) => {
    if (!versions.includes(release.name.substring(1))) {
      context.nextRelease = {
        version: release.name.substring(1),
        notes: release.body,
        releaseDate: release.published_at
      }
      console.log(`Adding missing version ${context.nextRelease.version}`)
      publish(pluginConfig, context)
    }
  })
}

module.exports = { syncVersions }
