const SemanticReleaseError = require('@semantic-release/error')
const ERROR_DEFINITIONS = require('./definitions/errors.js')

module.exports = (code) => {
  const { message, details } = ERROR_DEFINITIONS[code]()
  return new SemanticReleaseError(message, code, details)
}
