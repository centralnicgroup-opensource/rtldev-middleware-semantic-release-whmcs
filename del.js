const verifyWHMCS = require('./lib/verify')
const deleteVersion = require('./lib/delete-marketplace-version')

let verified

async function delVersion (pluginConfig, context) {
  if (!verified) {
    await verifyWHMCS(pluginConfig, context)
    verified = true
  }

  await deleteVersion(pluginConfig, context)
}

module.exports = { delVersion }
