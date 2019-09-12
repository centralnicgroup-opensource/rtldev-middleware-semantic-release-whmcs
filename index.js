const verifyWHMCS = require('./lib/verify')
const publishWHMCS = require('./lib/publish')

let verified

/**
 * Called by semantic-release during the verify step
 * @param {*} pluginConfig The semantic-release plugin config
 * @param {*} context The context provided by semantic-release
 */
async function verifyConditions (pluginConfig, context) {
  await verifyWHMCS(pluginConfig, context)
  verified = true
}

/**
 * Called by semantic-release during the publish step
 * @param {*} pluginConfig The semantic-release plugin config
 * @param {*} context The context provided by semantic-release
 */
async function publish (pluginConfig, context) {
  if (!verified) {
    await verifyWHMCS(pluginConfig, context)
    verified = true
  }
  return publishWHMCS(pluginConfig, context)
}

module.exports = { verifyConditions, publish }
