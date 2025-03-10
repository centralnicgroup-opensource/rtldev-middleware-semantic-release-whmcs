import resolveConfig from "./resolve-config.js";
import { Octokit } from "@octokit/rest";
import debugConfig from "debug";
const debug = debugConfig("semantic-release:whmcs");

/**
 * A method to get releases from github repository
 */
export default async (pluginConfig, context) => {
  debug("Getting releases from GitHub");

  const { ghrepo, ghtoken } = resolveConfig(context);

  const octokit = new Octokit({
    auth: ghtoken,
  });

  if (ghrepo) {
    const [owner, repo] = ghrepo.split("/");
    try {
      const githubReleases = await octokit.repos.listReleases({
        owner,
        repo,
      });

      if (githubReleases.status === 200) {
        githubReleases.data.forEach((r) => debug(`Detected GitHub release ${r.name.substring(1)}`));
        githubReleases.data.reverse();
        return githubReleases.data;
      }
    } catch (error) {
      debug("Failed to get releases from GitHub", error);
    }
  }
  return false;
};
