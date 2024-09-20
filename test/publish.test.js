import test from "ava";
import publish from "../lib/publish.js";
import deleteVersion from "../lib/delete-marketplace-version.js";

test.beforeEach((t) => {
  // Mock logger
  t.context.logger = new (class {
    log(msg) {
      if (process.env.DEBUG && /^semantic-release:(\*|whmcs)$/.test(process.env.DEBUG)) {
        console.log(msg);
      }
    }

    error(msg, details) {
      console.error(msg + " " + details);
    }
  })();
});

test.serial("Verify publishing [login fails]", async (t) => {
  const context = {
    env: {
      WHMCSMP_LOGIN: "anonymous@hexonet.net",
      WHMCSMP_PASSWORD: "1234567890",
      WHMCSMP_PRODUCTID: "0",
    },
    logger: t.context.logger,
    nextRelease: {
      version: "v6.6.6",
      notes: "# something changed\n\ntwice.",
    },
  };
  const result = await publish({}, context);
  t.is(result, false);
});

test.serial("Verify publishing [no product id]", async (t) => {
  const env = {
    WHMCSMP_LOGIN: process.env.WHMCSMP_LOGIN,
    WHMCSMP_PASSWORD: process.env.WHMCSMP_PASSWORD,
  };
  t.truthy(env.WHMCSMP_LOGIN);
  t.truthy(env.WHMCSMP_PASSWORD);
  const context = {
    env,
    logger: t.context.logger,
    nextRelease: {
      version: "v6.6.6",
      notes: "# something changed\n\ntwice.",
    },
  };
  const result = await publish({}, context);
  t.is(result, false);
});

test.serial("Verify publishing [all fine]", async (t) => {
  const env = process.env;
  env.WHMCSMP_PRODUCTID = "4887"; // deprecated module
  t.truthy(env.WHMCSMP_LOGIN);
  t.truthy(env.WHMCSMP_PASSWORD);
  t.truthy(env.WHMCSMP_PRODUCTID);
  const context = {
    env,
    logger: t.context.logger,
    nextRelease: {
      version: "0.0.1",
      notes:
        "# something changed\n\ntwice\n\n[link test](https://github.com/kaischwarz-cnic) [link test2](https://github.com/kaischwarz-cnic)\n\ndone.",
    },
  };
  const result = await publish({}, context);
  t.assert(result !== false);
  if (result) {
    // wait 10s between adding and deleting
    await new Promise((resolve) => setTimeout(resolve, 10 * 1000));

    const delContext = {
      env,
      logger: t.context.logger,
      version: context.nextRelease.version,
    };
    const del = await deleteVersion({}, delContext);

    t.assert(del !== false);
  }
});
