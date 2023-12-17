# CHANGELOG

# v6.2.1 - 2023.12.17 16
* bump up dependencies


# v6.2.0 - 2023.12.07 10
* tweak enviroment
* bump up dependencies


# v6.1.1 - 2023.07.11 11
* bump up peer dependencies


# v6.1.0 - 2023.07.11 11
* (new) mare `parseRaw` supports skipping self with face option `parseRaw`
* (new )face options will be passed to `wock-face` handle now
* fix face option `toSuccess` cannot be used properly with mare `toSuccess`
* fix face option `toSuccess` cannot be used properly with mare `toSuccess`
* fix the wock cast to throw an error when `wock-face` handle does not return data array
* fix wrongly referencing data when creating Wockman
* bump up dependencies
	* update `typescript` to `v5.x`, and renew jsdoc
* use eslint flat config, and related config udpate
	* use `eslint.config.js` instead `eslintrc.cjs`


# v6.0.0 - 2023.04.10 16
* (break) `@nuogz/desire-harb-default` has been renamed to `@nuogz/desire-harbour`
* (break) refactor config
* (new) HTTP face supports export multiple methods in the `method` variable
* reorganize all code. now `Harbour` is more independent from `Desire`
* add `d.ts`
* bump up `@nuogz/i18n` to `v3.1.0` and renew related code
* renew locales
* bump up dependencies



## v5.3.1 - 2022.10.13 09
* use `@nuogz/wock-server` instead `@nuogz/wock@1`
* bump up dependencies
* tweak locale


## v5.3.0 - 2022.10.11 11
* add `W` as the fourth parameter of the `Wock Face` handle
* bump up dependencies


## v5.2.0 - 2022.09.14 09
* `parseRaw` support parse `multipart/form-data`
* bump up dependencies


## v5.1.0 - 2022.08.26 17
* use `@nuogz/wock` instead built-in websocket library
* bump up dependencies
* improve `package.json`


## v5.0.2 - 2022.08.11 11
* change `route.method` splitter to `;` from `.`
* bump `@nuogz/i18n` to `v1.2.0` and fixed related `lib/i18n.js`


## v5.0.1 - 2022.08.11 11
* bump `@nuogz/i18n` to `v1.1.0` and fixed related `lib/i18n.js`


## v5.0.0 - 2022.08.11 11
* tweak all files for publishing to npm
* start use `CHANGLOG.md` since version `v5.0.0`
* translate all inline documents info english
* use `@nuogz/i18n` for i18n text
* bump up `koa-router` to `v12.x`
* improve `index.js` code style for init middlewares
