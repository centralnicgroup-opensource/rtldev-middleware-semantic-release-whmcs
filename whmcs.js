import { createRequire } from "node:module";
import { publish, syncVersions, delVersion, updateCompatibility } from "./index.js";
const require = createRequire(import.meta.url);

const context = {
  env: process.env,
  logger: new (class {
    log(msg) {
      console.log(msg);
    }
    info(msg) {
      console.log(msg);
    }
    error(msg, details) {
      console.error(msg + " " + details);
    }
  })(),
};

// eslint-disable-next-line no-unused-expressions
require("yargs")
  .scriptName("whmcs.js")
  .usage("$0 <cmd> [args]")
  .command(
    "publish [ver] [notes]",
    "publishes the specified version to the WHMCS Marketplace",
    (yargs) => {
      yargs
        .positional("ver", {
          type: "string",
          demandOption: true,
          describe: "the version to publish",
        })
        .positional("notes", {
          type: "string",
          demandOption: true,
          describe: "the changelog",
        });
    },
    function (argv) {
      context.nextRelease = {
        version: argv.ver,
        notes: argv.notes,
      };
      publish({}, context).then((r) => {
        console.log(r === false ? "Failed" : "Successful");
      });
    }
  )
  .command(
    "sync",
    "adds missing versions to the WHMCS Marketplace",
    () => {},
    function () {
      syncVersions({}, context).then((r) => {
        console.log(r === false ? "Failed" : "Successful");
      });
    }
  )
  .command(
    "del [ver]",
    "deletes the specified version from the WHMCS Marketplace",
    (yargs) => {
      yargs.positional("ver", {
        type: "string",
        demandOption: true,
        describe: "the version to delete",
      });
    },
    function (argv) {
      context.version = argv.ver;
      delVersion({}, context).then((r) => {
        console.log(r === false ? "Failed" : "Successful");
      });
    }
  )
  .command(
    "compatibility",
    "set the compatible WHMCS versions in the Marketplace",
    () => {},
    function () {
      updateCompatibility({}, context).then((r) => {
        console.log(r === false ? "Failed" : "Successful");
      });
    }
  )
  .help().argv;
