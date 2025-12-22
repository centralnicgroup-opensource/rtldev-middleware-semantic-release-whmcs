import { spawn } from "child_process";
import debugConfig from "debug";

const debug = debugConfig("semantic-release:whmcs");

// Exported for testing/debugging
export const DEBIAN_MARKER = "/etc/debian_version";

let spawnImplementation = spawn;

/**
 * Test-only hook to override the child_process.spawn implementation.
 * @param {(cmd: string, args?: string[], options?: object) => NodeJS.Process} implementation
 */
export function __setSpawnImplementation(implementation) {
  spawnImplementation = implementation;
}

/**
 * Test-only hook to reset spawn back to the native implementation.
 */
export function __resetSpawnImplementation() {
  spawnImplementation = spawn;
}

/**
 * Spawn a child process and return a promise
 * @param {string} command The command to run
 * @param {string[]} args The arguments to pass to the command
 * @param {object} options Options to pass to spawn
 * @returns {Promise<number>} The exit code of the process
 */
function spawnPromise(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawnImplementation(command, args, { stdio: "inherit", ...options });
    child.on("exit", (code) => {
      if (code === 0) resolve(code);
      else reject(new Error(`Process exited with code ${code}`));
    });
    child.on("error", reject);
  });
}

/**
 * Check if the system is Debian-like
 * @returns {Promise<boolean>}
 */
async function isDebianLike() {
  return new Promise((resolve) => {
    const child = spawnImplementation("test", ["-f", DEBIAN_MARKER], { stdio: "ignore" });
    child.on("exit", (code) => resolve(code === 0));
  });
}

/**
 * Called by semantic-release during the prepare step
 * @param {*} pluginConfig The semantic-release plugin config
 * @param {*} context The context provided by semantic-release
 */
export default async (pluginConfig = {}, context = {}) => {
  const { nextRelease, lastRelease } = context;

  // Only run if there is a new version
  if (lastRelease?.version && nextRelease?.version === lastRelease.version) {
    debug("Skipping prepare step: No new version detected");
    return;
  }

  // Check if OS dependency installation is disabled
  if (pluginConfig.skipOsDeps === true) {
    debug("OS dependency installation skipped (skipOsDeps=true)");
    console.log("ℹ️  Skipping OS dependency installation");
    return;
  }

  // Check if osDepsCommand is configured
  if (!Array.isArray(pluginConfig.osDepsCommand) || pluginConfig.osDepsCommand.length === 0) {
    debug("No osDepsCommand configured, skipping OS dependency installation");
    return;
  }

  try {
    debug("Installing Chromium/Chrome OS dependencies for puppeteer...");
    if (await isDebianLike()) {
      const fullCommand = pluginConfig.osDepsCommand.join(" ");
      debug("Detected Debian/Ubuntu system, installing dependencies via: %s", fullCommand);

      // Wrap command in bash with sudo and preserved PATH to handle CI environments
      // Use single quotes for PATH to avoid issues with spaces or special characters
      const wrappedCommand = `sudo env PATH='${process.env.PATH}' ${fullCommand}`;
      debug("Executing with elevated privileges: %s", wrappedCommand);

      try {
        await spawnPromise("/bin/bash", ["-c", wrappedCommand]);
        debug("Chromium/Chrome dependencies installed successfully");
      } catch (error) {
        debug("Warning: Could not install dependencies via %s: %s", fullCommand, error.message);
        console.warn(
          `⚠️  Warning: Failed to install some OS dependencies: ${error.message}\n` +
            "⚠️  Some dependencies may need to be installed manually or puppeteer may fall back to downloading Chromium"
        );
      }
    } else {
      debug("Debian/Ubuntu system not detected, skipping OS dependency installation");
      console.log("ℹ️  Running on non-Debian system. Puppeteer will download Chromium if needed.");
    }
  } catch (error) {
    debug("Prepare step failed: %s", error.message);
    throw error;
  }
};
