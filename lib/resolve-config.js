module.exports = ({ env }) => ({
  whmcsLOGIN: env.WHMCSMP_LOGIN || false,
  whmcsPASSWORD: env.WHMCSMP_PASSWORD || false,
  whmcsPRODUCTID: env.WHMCSMP_PRODUCTID || false,
  DEBUG: (env.DEBUG && /^semantic-release:(\*|whmcs)$/.test(env.DEBUG)) || false
})
