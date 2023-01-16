import test from "ava";
import { WritableStreamBuffer } from "stream-buffers";
import verify from "../lib/verify.js";

/* eslint camelcase: ["error", {properties: "never"}] */

test.beforeEach((t) => {
  t.context.stdout = new WritableStreamBuffer();
  t.context.stderr = new WritableStreamBuffer();
  // Mock logger
  t.context.log = function (msg) {
    if (process.env.DEBUG && /^semantic-release:(\*|whmcs)$/.test(process.env.DEBUG)) {
      console.log(msg);
    }
  };
  t.context.error = function (msg, details) {
    console.error(msg + " " + details);
  };
  t.context.logger = { log: t.context.log, error: t.context.error };
});

test.serial("Verify github token [missing]", async (t) => {
  const context = {
    env: {},
    stdout: t.context.stdout,
    stderr: t.context.stderr,
    logger: t.context.logger,
    options: {},
  };
  const errors = [...(await t.throwsAsync(verify({}, context))).errors];
  t.is(errors[0].name, "SemanticReleaseError");
  t.is(errors[0].code, "ENOGHTOKEN");
});

test.serial("Verify credentials [no login]", async (t) => {
  const context = {
    env: {
      GITHUB_TOKEN: "gregergege",
    },
    stdout: t.context.stdout,
    stderr: t.context.stderr,
    logger: t.context.logger,
    options: {},
  };
  const errors = [...(await t.throwsAsync(verify({}, context))).errors];
  t.is(errors[0].name, "SemanticReleaseError");
  t.is(errors[0].code, "EWHMCSNOCREDENTIALS");
});

test.serial("Verify credentials [no password]", async (t) => {
  const context = {
    env: { WHMCSMP_LOGIN: "mylogin", GITHUB_TOKEN: "gregergege" },
    stdout: t.context.stdout,
    stderr: t.context.stderr,
    logger: t.context.logger,
    options: {},
  };
  const errors = [...(await t.throwsAsync(verify({}, context))).errors];
  t.is(errors[0].name, "SemanticReleaseError");
  t.is(errors[0].code, "EWHMCSNOCREDENTIALS");
});

test.serial("Verify product id [no product id]", async (t) => {
  const context = {
    env: {
      WHMCSMP_LOGIN: "mylogin",
      WHMCSMP_PASSWORD: "mypassword",
      GITHUB_TOKEN: "gregergege",
    },
    stdout: t.context.stdout,
    stderr: t.context.stderr,
    logger: t.context.logger,
    options: {},
  };
  const errors = [...(await t.throwsAsync(verify({}, context))).errors];
  t.is(errors[0].name, "SemanticReleaseError");
  t.is(errors[0].code, "EWHMCSNOPRODUCTID");
});

test.serial("Verify product id [invalid product id]", async (t) => {
  const context = {
    env: {
      WHMCSMP_LOGIN: "mylogin",
      WHMCSMP_PASSWORD: "mypassword",
      WHMCSMP_PRODUCTID: "myproductid",
      GITHUB_TOKEN: "gregergege",
    },
    stdout: t.context.stdout,
    stderr: t.context.stderr,
    logger: t.context.logger,
    options: {},
  };
  const errors = [...(await t.throwsAsync(verify({}, context))).errors];
  t.is(errors[0].name, "SemanticReleaseError");
  t.is(errors[0].code, "EWHMCSINVALIDPRODUCTID");
});

test.serial("Verify data [all fine]", async (t) => {
  const context = {
    env: {
      WHMCSMP_LOGIN: "mylogin",
      WHMCSMP_PASSWORD: "mypassword",
      WHMCSMP_PRODUCTID: "123456",
      GITHUB_TOKEN: "gregergege",
    },
    stdout: t.context.stdout,
    stderr: t.context.stderr,
    logger: t.context.logger,
    options: {},
  };
  await t.notThrowsAsync(verify({}, context));
});
