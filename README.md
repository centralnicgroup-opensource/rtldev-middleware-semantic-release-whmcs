# semantic-release-whmcs

[![npm version](https://img.shields.io/npm/v/semantic-release-whmcs.svg?style=flat)](https://www.npmjs.com/package/semantic-release-whmcs)
[![node](https://img.shields.io/node/v/semantic-release-whmcs.svg)](https://www.npmjs.com/package/semantic-release-whmcs)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Build Status](https://github.com/hexonet/semantic-release-whmcs/workflows/Release/badge.svg?branch=master)](https://github.com/hexonet/semantic-release-whmcs/workflows/Release/badge.svg?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/hexonet/node-sdk/blob/master/CONTRIBUTING.md)

[**semantic-release**](https://github.com/semantic-release/semantic-release) plugin to publish a WHMCS product/module version to [WHMCS Marketplace](https://marketplace.whmcs.com).

| Step | Description |
| ---- | ----------- |
| `verifyConditions` | Verify the presence and the validity of the authentication credentials (set via [environment variables](#environment-variables)) and the product id option configuration. |
| `publish` | Publish product/module version to [WHMCS Marketplace](https://marketplace.whmcs.com) including changelog notes. |

## Resources

* [Usage Guide](#usage-guide)
* [Release Notes](https://github.com/hexonet/semantic-release-whmcs/releases)
* [Development Guide](https://github.com/hexonet/semantic-release-whmcs/wiki/Development-Guide)

## Usage Guide

### Requirements

* Installed nodejs/npm. We suggest using [nvm](https://github.com/creationix/nvm).
* Using [semantic-release](https://github.com/semantic-release/semantic-release) in your CI/CD process

### Install

```bash
> npm i semantic-release-whmcs -D
```

### Configuration

The plugin can be loaded in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration). Currently no configuration options are available.

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "semantic-release-whmcs"
  ]
}
```

With this example product/module versions will be published to the [WHMCS Marketplace](https://marketplace.whmcs.com) including changelog notes.

### WHMCS Marketplace authentication

The WHMCS Marketplace authentication configuration is **required** and can be set via [environment variables](#environment-variables).

If you don't have an WHMCS Marketplace account yet, please create one. The credentials have to be made available in your CI environment via the `WHMCSMP_LOGIN` and  `WHMCSMP_PASSWORD` environment variables. The account must have access to the product(s) you want to publish new versions for.

### WHMCS Marketplace Product ID

The WHMCS Marketplace Product ID configuration is **required**  and can be set via [environment variables](#environment-variables).

The Product ID has to be made available in your CI environment via the `WHMCSMP_PRODUCTID` environment variable.

That said, before you can use this module for publishing new product/module version to the WHMCS Marketplace, this Product has already to exist and as mentioned above, the account you provide here for authentication has to have access to manage that product. You can find the Product ID in the url when being in edit mode e.g. [https://marketplace.whmcs.com/product/**1234**/edit](https://marketplace.whmcs.com/).

### Environment variables

| Variable                       | Description                                               |
| ------------------------------ | --------------------------------------------------------- |
| `WHMCSMP_LOGIN` | **Required.** The email address of the WHMCS Marketplace account to use for authentication. |
| `WHMCSMP_PASSWORD` | **Required.** The password of the WHMCS Marketplace account to use for authentication. |
| `WHMCSMP_PRODUCTID` | **Required.** The product id of the product/module you want to publish versions for. |
| `WHMCSMP_MINVERSION` | **Optional.** The minimum supported WHMCS version. Defaults to 7.10. |
| `GH_TOKEN` | **Optional.** GitHub API authentication token to use for syncing versions. |
| `GH_REPO` | **Optional.** GitHub repository name (format: organization/repository) to use for syncing versions. |

### Options

None available yet.

### Routines

Type `./whmcs.js --help` for command reference

## Contributing

Please read [Contribution Guide Lines](https://github.com/hexonet/semantic-release-whmcs/blob/master/CONTRIBUTING.md) for details on our code of conduct, then address a PR to us.
Contributors are highly welcome.

## Authors

* **Kai Schwarz** - *lead development* - [PapaKai](https://github.com/papakai)
* **Sebastian Vassiliou** - *development* - [h9k](https://github.com/h9k)

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/hexonet/semantic-release-whmcs/blob/master/LICENSE) file for details.

[HEXONET GmbH](https://hexonet.net)
