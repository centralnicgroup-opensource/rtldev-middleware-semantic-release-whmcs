module.exports = ({ env }) => ({
  whmcsLOGIN: env.WHMCSMP_LOGIN || false,
  whmcsPASSWORD: env.WHMCSMP_PASSWORD || false,
  whmcsPRODUCTID: env.WHMCSMP_PRODUCTID || false,
  whmcsMINVERSION: env.WHMCSMP_MINVERSION || '7.10',
  githubTOKEN: env.GH_TOKEN || env.GITHUB_TOKEN || false,
  githubREPO: env.GH_REPO || env.GITHUB_REPO || false,
  headless: env.PUPPETEER_HEADLESS || '1',
  DEBUG:
    (env.DEBUG && /^semantic-release:(\*|whmcs)$/.test(env.DEBUG)) || false
})
