import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import KoaRouter from '@koa/router';

import { loadI18NResource, TT } from '@nuogz/i18n';
import Wockman from '@nuogz/wock-server';

import mountHTTPFolder from './lib/mounter/http-fold.js';
import mountHTTPFace from './lib/mounter/http-face.js';
import mountWockFace from './lib/mounter/wock-face.js';



/** @typedef {KoaRouter.Middleware} Mare */

/**
 * Mare(Middleware) Initial Function
 * - Promise is supported.
 * @typedef {Function} MareIniter
 * @returns {Promise<Mare>}
 */

/**
 * Mare(Middleware) Initial Option
 * @typedef {Array<MareIniter>|string} MareInitOption
 */


/**
 * Mare(Middleware) option for Wock.
 * - Its route is the same as Face by default.
 * @typedef {Object} WockMareOption
 * @property {MareInitOption} [before] An array for before-mare initer, or a string for one built-in mare.
 * @property {MareInitOption} [after] An array for after-mare initer, or a string for one built-in mare.
 * @property {MareInitOption} [upgrade] An array for upgrade-mare initer, or a string for one built-in mare.
 * @property {MareInitOption} [close] An array for close-mare initer, or a string for one built-in mare.
 */

/**
 * Wock option
 * - Wock, abbreviation for `WebSocket`.
 * - Its route is the same as Face by default.
 * @typedef {Object} WockOption
 * @property {boolean} [disable=false] Indicates whether disabled. `undefined` or `true` for disabled；`false` for enabled.
 * @property {string} [route='wock'] Route under WebSocket. **ATTENTION** This option is fully independent that will not concat with `{HarbourOption.facePrefix}`
 * @property {boolean} [ping=false] Indicates whether send `ping` event after websocket connected. `undefined` or `false` for not send；`true` for will send
 * @property {WockMareOption} [mare] Mare(Middleware) option for Wock.
 */


/**
 * Mare(Middleware) option map
 * - Mare, abbreviation for `Middleware`.
 * - Its route is the same as Face by default.
 * @typedef {Object} MareOptionMap
 * @property {MareInitOption} [before] An array for before-mare initer, or a string for one built-in mare.
 * @property {MareInitOption} [after] An array for after-mare initer, or a string for one built-in mare.
 */


/**
 * Folder mapping option
 * @typedef {Object} FolderOption
 * @property {string} prefix the prefix of URL path, not affected by `{HarbourOption.facePrefix}`
 * @property {string} location the location in the file system
 * @property {import('koa-static').Options} option `koa-static` option
 */


/**
 * Face option
 * @typedef {Object} FaceOption
 * @property {string} method Multi methods splited by `;`. methods used in `koa-router` (HTTP 1.1), or `wock` for wock face
 * @property {string} route
 * @property {Function} handle
 * @property {boolean} upload Indicates whether file upload is enabled. `undefined` or `true` for enabled；`false` for disabled
 * @property {string} [destUpload]
 */


/**
 * @typedef {Object} HarbourOption
 *
 * @property {string} [facePrefix='/'] prefix for interface
 * @property {FaceOption[]} [faces] the options of interfaces
 * @property {FolderOption[]} [folds] the options of folder mappings
 *
 * @property {MareOptionMap} [mare] the options of mare
 * @property {WockOption} [wock] Wock option
 *
 * @property {import('@koa/multer').Options} [multer] module `multer` option
 *
 * @property {string} [destUpload]
 */



/** @typedef {import('@nuogz/desire').default} Desire */

/**
 * @typedef {Object} DesireExtend
 * @property {HarbourOption} optionHarbour
 * @property {KoaRouter} router
 * @property {Wockman} wockman
 * @property {import('@koa/multer').Instance} multer
 */

/** @typedef {DesireExtend & Desire} DesireWithHarbour */



loadI18NResource('@nuogz/desire-harbour', resolve(dirname(fileURLToPath(import.meta.url)), 'locale'));

const T = TT('@nuogz/desire-harbour');



/**
 * @param {MareInitOption} initsMare
 * @param {DesireWithHarbour} desire
 * @param {string} textAction
 * @returns {Promise<Mare[]>}
 */
const initMares = async (initsMare, desire, textAction) => {
	/** @type {Mare[]} */
	const mares = [];


	for(const initMareRaw of initsMare) {
		try {
			const initMare = typeof initMareRaw == 'string'
				? (await import(`./lib/mare/${initMareRaw}.js`)).default
				: initMareRaw;


			mares.push(await initMare(desire));
		}
		catch(error) {
			desire.logWarn(textAction, error);
		}
	}

	return mares;
};


/** @param {DesireWithHarbour} desire */
const initHTTPMares = async desire => {
	const mare = desire.optionHarbour?.mare;


	return [
		await initMares(mare?.before ?? [], desire, T('http.initMare.before')),
		await initMares(mare?.after ?? [], desire, T('http.initMare.after')),
	];
};

/** @param {DesireWithHarbour} desire */
const initWockMares = async desire => {
	const mare = desire.optionHarbour?.wock?.mare;


	return [
		await initMares(mare?.before ?? [], desire, T('wock.initMare.before')),
		await initMares(mare?.after ?? [], desire, T('wock.initMare.after')),
		await initMares(mare?.upgrade ?? [], desire, T('wock.initMare.upgrade')),
		await initMares(mare?.close ?? [], desire, T('wock.initMare.close')),
	];
};



export default class DesireHarbour {
	/** @param {DesireWithHarbour} desire */
	async init(desire) {
		const { koa } = desire;

		/** @type {HarbourOption} */
		const { facePrefix = '/', faces = [], folds = [], wock } = desire.optionHarbour;



		// HTTP folder mapping
		for(const fold of folds) {
			await mountHTTPFolder(fold, desire);
		}



		// HTTP interface
		desire.router = KoaRouter();
		const methodsRouter = desire.router.methods.map(m => m.toLowerCase());

		const [maresHTTPBefore, maresHTTPAfter] = await initHTTPMares(desire);


		for(const face of faces) {
			const methods = face?.method.split(',').map(m => m.toLowerCase()).filter(m => methodsRouter.includes(m));
			if(!methods.length) { continue; }

			await mountHTTPFace(methods, face, maresHTTPBefore, maresHTTPAfter, facePrefix, desire);
		}



		// mount Wock interfaces
		if(wock && !wock.disable) {
			const [maresWockBefore, maresWockAfter, maresWockUpgrade, maresWockClose] = await initWockMares(desire);


			desire.wockman = new Wockman(desire.server, wock.route, {
				logger: desire.optionRaw.logger,
				maresWockUpgrade,
				maresWockClose
			});


			for(const face of faces) {
				const hasMethodWock = face?.method.split(';').map(m => m.toLowerCase()).find(m => m == 'wock');
				if(!hasMethodWock) { continue; }


				await mountWockFace(face, maresWockBefore, maresWockAfter, desire);
			}
		}


		// apply routes
		koa.use(desire.router.routes());


		return this;
	}
}
