import AggregateError from 'aggregate-error'
const resolveConfig = require('./resolve-config')
const getError = require('./get-error')

module.exports = async (pluginConfig, context) => {
  const cfg = resolveConfig(context)
  const errors = []
  if (cfg.whmcsLOGIN === false || cfg.whmcsPASSWORD === false) {
    errors.push(getError('EWHMCSNOCREDENTIALS'))
  }
  if (cfg.whmcsPRODUCTID === false) {
    errors.push(getError('EWHMCSNOPRODUCTID'))
  }
  if (!/^[0-9]+$/.test(cfg.whmcsPRODUCTID)) {
    errors.push(getError('EWHMCSINVALIDPRODUCTID'))
  }
  if (errors.length > 0) {
    throw new AggregateError(errors)
  }
}
