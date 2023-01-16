import resolveConfig from "./resolve-config.js";
import GitHub from "github-api";
import debugConfig from "debug";
const debug = debugConfig("semantic-release:whmcs");

// https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting
// Rate limits to 60 requests/hour per IP for anonymous requests, 5000/hour with authentication

/**
 * A method to get releases from github repository
 */
export default async (pluginConfig, context) => {
  debug("Getting releases from GitHub");

  const { ghrepo, ghtoken } = resolveConfig(context);

  const gh = new GitHub({
    token: ghtoken,
  });
  if (ghrepo) {
    // optional by default false
    const repo = ghrepo.split("/");
    const githubReleases = await gh.getRepo(repo[0], repo[1]).listReleases();
    if (githubReleases.status === 200) {
      githubReleases.data.forEach((r) => debug(`Detected GitHub release ${r.name.substring(1)}`));
      githubReleases.data.reverse();
      return githubReleases.data;
    }
    debug("Failed to get releases from GitHub");
  }
  return false;
};
