import test from 'ava'
import { stub } from 'sinon'
const verify = require('../lib/verify')
/* eslint camelcase: ["error", {properties: "never"}] */

test.beforeEach(t => {
  // Mock logger
  t.context.log = stub()
  t.context.error = stub()
  t.context.logger = { log: t.context.log, error: t.context.error }
})

test.serial('Verify credentials [no login]', async t => {
  const env = {}
  const [error] = await t.throwsAsync(
    verify({}, { env, logger: t.context.logger })
  )
  t.is(error.name, 'SemanticReleaseError')
  t.is(error.code, 'EWHMCSNOCREDENTIALS')
})

test.serial('Verify credentials [no password]', async t => {
  const env = { WHMCSMP_LOGIN: 'mylogin' }
  const [error] = await t.throwsAsync(
    verify({}, { env, logger: t.context.logger })
  )
  t.is(error.name, 'SemanticReleaseError')
  t.is(error.code, 'EWHMCSNOCREDENTIALS')
})

test.serial('Verify product id [no product id]', async t => {
  const env = { WHMCSMP_LOGIN: 'mylogin', WHMCSMP_PASSWORD: 'mypassword' }
  const [error] = await t.throwsAsync(
    verify({}, { env, logger: t.context.logger })
  )
  t.is(error.name, 'SemanticReleaseError')
  t.is(error.code, 'EWHMCSNOPRODUCTID')
})

test.serial('Verify product id [invalid product id]', async t => {
  const env = { WHMCSMP_LOGIN: 'mylogin', WHMCSMP_PASSWORD: 'mypassword', WHMCSMP_PRODUCTID: 'myproductid' }
  const [error] = await t.throwsAsync(
    verify({}, { env, logger: t.context.logger })
  )
  t.is(error.name, 'SemanticReleaseError')
  t.is(error.code, 'EWHMCSINVALIDPRODUCTID')
})

test.serial('Verify data [all fine]', async t => {
  const env = { WHMCSMP_LOGIN: 'mylogin', WHMCSMP_PASSWORD: 'mypassword', WHMCSMP_PRODUCTID: '123456' }
  await t.notThrowsAsync(
    verify({}, { env, logger: t.context.logger })
  )
})
