module.exports = ({ env }) => ({
  whmcsLOGIN: env.WHMCSMP_LOGIN || false,
  whmcsPASSWORD: env.WHMCSMP_PASSWORD || false,
  whmcsPRODUCTID: env.WHMCSMP_PRODUCTID || false,
  githubTOKEN: env.GITHUB_TOKEN || false,
  githubUSER: env.GITHUB_USER || false,
  githubREPO: env.GITHUB_REPO || false,
  DEBUG: (env.DEBUG && /^semantic-release:(\*|whmcs)$/.test(env.DEBUG)) || false
})
