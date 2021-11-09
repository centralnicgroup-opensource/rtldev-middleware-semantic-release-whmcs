const test = require('ava')
const { WritableStreamBuffer } = require('stream-buffers')
const verify = require('../lib/verify')
/* eslint camelcase: ["error", {properties: "never"}] */

test.beforeEach((t) => {
  t.context.stdout = new WritableStreamBuffer()
  t.context.stderr = new WritableStreamBuffer()
  // Mock logger
  t.context.log = function (msg) {
    if (
      process.env.DEBUG &&
      /^semantic-release:(\*|whmcs)$/.test(process.env.DEBUG)
    ) {
      console.log(msg)
    }
  }
  t.context.error = function (msg, details) {
    console.error(msg + ' ' + details)
  }
  t.context.logger = { log: t.context.log, error: t.context.error }
})

test.serial('Verify credentials [no login]', async (t) => {
  const context = {
    env: {},
    stdout: t.context.stdout,
    stderr: t.context.stderr,
    logger: t.context.logger,
    options: {}
  }
  const [error] = await t.throwsAsync(verify({}, context))
  t.is(error.name, 'SemanticReleaseError')
  t.is(error.code, 'EWHMCSNOCREDENTIALS')
})

test.serial('Verify credentials [no password]', async (t) => {
  const context = {
    env: { WHMCSMP_LOGIN: 'mylogin' },
    stdout: t.context.stdout,
    stderr: t.context.stderr,
    logger: t.context.logger,
    options: {}
  }
  const [error] = await t.throwsAsync(verify({}, context))
  t.is(error.name, 'SemanticReleaseError')
  t.is(error.code, 'EWHMCSNOCREDENTIALS')
})

test.serial('Verify product id [no product id]', async (t) => {
  const context = {
    env: { WHMCSMP_LOGIN: 'mylogin', WHMCSMP_PASSWORD: 'mypassword' },
    stdout: t.context.stdout,
    stderr: t.context.stderr,
    logger: t.context.logger,
    options: {}
  }
  const [error] = await t.throwsAsync(verify({}, context))
  t.is(error.name, 'SemanticReleaseError')
  t.is(error.code, 'EWHMCSNOPRODUCTID')
})

test.serial('Verify product id [invalid product id]', async (t) => {
  const context = {
    env: {
      WHMCSMP_LOGIN: 'mylogin',
      WHMCSMP_PASSWORD: 'mypassword',
      WHMCSMP_PRODUCTID: 'myproductid'
    },
    stdout: t.context.stdout,
    stderr: t.context.stderr,
    logger: t.context.logger,
    options: {}
  }
  const [error] = await t.throwsAsync(verify({}, context))
  t.is(error.name, 'SemanticReleaseError')
  t.is(error.code, 'EWHMCSINVALIDPRODUCTID')
})

test.serial('Verify data [all fine]', async (t) => {
  const context = {
    env: {
      WHMCSMP_LOGIN: 'mylogin',
      WHMCSMP_PASSWORD: 'mypassword',
      WHMCSMP_PRODUCTID: '123456'
    },
    stdout: t.context.stdout,
    stderr: t.context.stderr,
    logger: t.context.logger,
    options: {}
  }
  await t.notThrowsAsync(verify({}, context))
})
