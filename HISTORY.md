# [5.0.0](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v4.0.4...v5.0.0) (2023-01-18)


### chore

* **node:** Refactored SemanticRelease to make it compatible with ESM ([f5a3640](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/f5a36404e978d072f60497787074301d34255633))


### BREAKING CHANGES

* **node:** Ported to ESM

## [4.0.4](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v4.0.3...v4.0.4) (2023-01-04)


### Bug Fixes

* **conditions:** verifies required env variables before publish step ([5ed84c9](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/5ed84c9b84dcb031d0784f1e0b786b2fefcb87e8))

## [4.0.3](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v4.0.2...v4.0.3) (2022-08-09)


### Bug Fixes

* **with_head:** env var renamed to PUPPETEER_HEADLESS, code reviewed/patched ([5278c61](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/5278c618ec6e515651319f235e4a78d6dbd2597c))

## [4.0.2](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v4.0.1...v4.0.2) (2022-06-29)


### Bug Fixes

* **ci:** introduce WITH_HEAD env parameter ([7f28751](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/7f287516e2b7e518ab467a5ef4cf0e0bba1482ba))
* **ci:** run tests with debug ([94e9a0e](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/94e9a0e1efee3fda9baa030e85ffbf6fc15bcecf))

## [4.0.1](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v4.0.0...v4.0.1) (2022-06-14)


### Bug Fixes

* **semantic-release:** include package-lock.json in version commit ([3adb404](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/3adb4047fb0b0691124a2f11ed2931adffd6f1bf))

# [4.0.0](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v3.1.3...v4.0.0) (2022-06-08)


### chore

* bump semantic-release from 18.0.1 to 19.0.2 ([cd94520](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/cd94520c1bf99e92f762b1521137b0bd4c57d9e7))


### BREAKING CHANGES

* major upgrade of semantic-release to v19

Bumps [semantic-release](https://github.com/semantic-release/semantic-release) from 18.0.1 to 19.0.2.
- [Release notes](https://github.com/semantic-release/semantic-release/releases)
- [Commits](https://github.com/semantic-release/semantic-release/compare/v18.0.1...v19.0.2)

## [3.1.3](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v3.1.2...v3.1.3) (2022-06-08)


### Bug Fixes

* **regexp:** fixing redos possibility ([53060bd](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/53060bd2bb0df52dfd80aa5cd938d69a3d5f6d42))

## [3.1.2](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v3.1.1...v3.1.2) (2022-06-08)


### Bug Fixes

* **regex:** polygonal regular expression used on uncontrolled data ([bcaf404](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/bcaf40466a59baaf4a1fe8f55c819ef3ff325064))
* **regular expression:** fixed unnecessary escape character ([5613eba](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/5613eba3684060fd33c47db1dc4a82f2eb262c77))

## [3.1.1](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v3.1.0...v3.1.1) (2021-11-09)


### Performance Improvements

* **dep bumps:** upgraded dependencies ([f54620f](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/f54620f1fcdd54f62b6d43f15ef0a6e4b0e70292))

# [3.1.0](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v3.0.2...v3.1.0) (2021-05-19)


### Bug Fixes

* **coverage:** fixed coverage report by ignoring puppeteer browser-side code ([612403d](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/612403d25f211766118ce96016967d554e976c98))
* **gh_repo:** fix implementation of GH_REPO and syncVersions ([cf33e36](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/cf33e36d8d26d4396642d33791bb774382c9fc28))
* **gh_repo:** fix implementation of GH_REPO and syncVersions ([c4f8165](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/c4f8165d0d2d1fcf3ea83680d895b35eea3abc5a))
* **puppeteer:** ensure to hover to selector before clicking ([aad85a6](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/aad85a60c42d226342d72b19ef7cf86d2ad2ca20))


### Features

* **log:** improve logging ([5573b6a](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/5573b6a255ef755e67fcacbe33fdeacc232e4b15))

## [3.0.2](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v3.0.1...v3.0.2) (2021-04-28)


### Bug Fixes

* bump puppeteer from 8.0.0 to 9.0.0 ([577a3fc](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/577a3fc1b264eb0da5b24a083bb086fbc74ce023))

## [3.0.1](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v3.0.0...v3.0.1) (2021-03-01)


### Bug Fixes

* bump puppeteer from 7.1.0 to 8.0.0 ([ea82a37](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/ea82a3766996d42a56b7e332b7e29a19d2198380))

# [3.0.0](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v2.0.2...v3.0.0) (2021-02-19)


### Features

* **compatibility:** implement setting compatible whmcs versions ([905b61a](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/905b61a984f718b2a490c21e99550b3a8a307859))
* **versions:** implement adding missing github versions in whmcs marketplace ([4308538](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/43085387daf6db5c5266ded8df5c2b4df1d9e7c1))
* **versions:** implement deleting specific versions from whmcs marketplace ([b73d3f5](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/b73d3f59c2d1feb7a877de06a1259298f48ea7ae))


### BREAKING CHANGES

* **versions:** introduced new environment variables

## [2.0.2](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v2.0.1...v2.0.2) (2021-01-19)


### Bug Fixes

* **ci:** extend logging; exclude coverage from tests ([40b0a70](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/40b0a702e271c9420cfc9faef59f39aa9d7d441f))

## [2.0.1](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v2.0.0...v2.0.1) (2021-01-19)


### Bug Fixes

* **github actions:** add missing env vars ([efcac00](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/efcac00abb76d8a89ed513036c5cd3396de7ddd7))
* **github actions:** add missing env vars from secrets ([01b7543](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/01b7543c6db00ec443d68dda6a50957f3924d667))
* **github actions:** migrate from Travis CI ([0d579eb](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/0d579eb9145b76f08cf0364bdce3a110a55fafb4))

# [2.0.0](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.11...v2.0.0) (2021-01-13)


### Features

* **adding new version:** automation fixed. tests reviewed/fixed. performance highly improved ([4b75872](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/4b75872fa0c7df7185375fceabb5fc9ee238111f))


### BREAKING CHANGES

* **adding new version:** markdown links are automatically stripped.

## [1.0.11](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.10...v1.0.11) (2020-10-28)


### Bug Fixes

* **dep-bump:** upgrade dependencies and review package.json ([c984270](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/c984270ac9618f9637f9f3517a58a8f99412a463))

## [1.0.10](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.9...v1.0.10) (2020-10-28)


### Bug Fixes

* **dep-bump:** bump dependency versions (eslint-config-standard) and reviewed code ([c1967d7](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/c1967d779c1a723bbf2b3cc83375694ba9a2e097))

## [1.0.9](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.8...v1.0.9) (2020-01-20)


### Bug Fixes

* **ava:** use of esm module to support es modules ([bb17269](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/bb172697c466aabf948af05305feaf112a4ecbdc))

## [1.0.8](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.7...v1.0.8) (2019-09-17)


### Bug Fixes

* **npm:** remove dependencies already included in semantic-release itself ([e0d5735](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/e0d5735))

## [1.0.7](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.6...v1.0.7) (2019-09-17)


### Bug Fixes

* **publish:** use nextRelease.version instead of nextRelease.gitTag ([c14b843](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/c14b843))

## [1.0.6](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.5...v1.0.6) (2019-09-17)


### Bug Fixes

* **package.json:** configure publishConfig ([bbb71d3](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/bbb71d3))
* **release process:** review semantic-release configuration ([d03ff7c](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/d03ff7c))

## [1.0.5](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.4...v1.0.5) (2019-09-17)


### Bug Fixes

* **package name:** changed at the npm registry ([265f2c6](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/265f2c6))

## [1.0.4](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.3...v1.0.4) (2019-09-13)


### Bug Fixes

* **publish:** fix version number, review return value ([9bfe9ad](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/9bfe9ad))

## [1.0.3](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.2...v1.0.3) (2019-09-12)


### Bug Fixes

* **publish:** review step to return false in error case ([360f787](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/360f787))

## [1.0.2](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.1...v1.0.2) (2019-09-12)


### Bug Fixes

* **publish:** review publish step to return an object ([8f193d4](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/8f193d4))

## [1.0.1](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/compare/v1.0.0...v1.0.1) (2019-09-12)


### Bug Fixes

* **npm:** add missing puppeteer dependency ([ea8b648](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/ea8b648))

# 1.0.0 (2019-09-12)


### Features

* **pkg:** initial version ([89ce53c](https://github.com/centralnicgroup-opensource/rtldev-middleware-semantic-release-whmcs/commit/89ce53c))
