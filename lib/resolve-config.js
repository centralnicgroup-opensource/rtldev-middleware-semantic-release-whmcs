export default ({ env }) => ({
  login: env.WHMCSMP_LOGIN || false,
  password: env.WHMCSMP_PASSWORD || false,
  productid: env.WHMCSMP_PRODUCTID || false,
  minversion: env.WHMCSMP_MINVERSION || "7.10",
  ghtoken: env.GH_TOKEN || env.GITHUB_TOKEN || false,
  ghrepo: env.GH_REPO || env.GITHUB_REPO || false,
  headless: env.PUPPETEER_HEADLESS || "1",
  debug: (env.DEBUG && /^semantic-release:(\*|whmcs)$/.test(env.DEBUG)) || false,
});
