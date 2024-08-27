import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import KoaRouter from '@koa/router';

import { loadI18NResource, TT } from '@nuogz/i18n';
import Wockman from '@nuogz/wock-server';

import mountHTTPFolder from './lib/mounter/http-fold.js';
import mountHTTPFace from './lib/mounter/http-face.js';
import mountWockFace from './lib/mounter/wock-face.js';



/** @typedef {import('./bases.d.ts').Mare} Mare */
/** @typedef {import('./bases.d.ts').MareIniter} MareIniter */
/** @typedef {import('./bases.d.ts').MareInitOption} MareInitOption */
/** @typedef {import('./bases.d.ts').WockMareOption} WockMareOption */
/** @typedef {import('./bases.d.ts').WockOption} WockOption */
/** @typedef {import('./bases.d.ts').MareOptionMap} MareOptionMap */
/** @typedef {import('./bases.d.ts').FolderOption} FolderOption */
/** @typedef {import('./bases.d.ts').FaceMethod} FaceMethod */
/** @typedef {import('./bases.d.ts').FaceOption} FaceOption */
/** @typedef {import('./bases.d.ts').HTTPFaceKoaContext} HTTPFaceHandleRaw */
/** @typedef {import('./bases.d.ts').HTTPFaceHandle} HTTPFaceHandle */
/** @typedef {import('./bases.d.ts').HarbourOption} HarbourOption */
/** @typedef {import('./bases.d.ts').Desire} Desire */
/** @typedef {import('./bases.d.ts').DesireExtend} DesireExtend */
/** @typedef {import('./bases.d.ts').DesireWithHarbour} DesireWithHarbour */



loadI18NResource('@nuogz/desire-harbour', resolve(dirname(fileURLToPath(import.meta.url)), 'locale'));

const { T } = TT('@nuogz/desire-harbour');



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
		await initMares(mare?.before ?? [], desire, T('http.init-mare.before')),
		await initMares(mare?.after ?? [], desire, T('http.init-mare.after')),
	];
};

/** @param {DesireWithHarbour} desire */
const initWockMares = async desire => {
	const mare = desire.optionHarbour?.wock?.mare;


	return [
		await initMares(mare?.before ?? [], desire, T('wock.init-mare.before')),
		await initMares(mare?.after ?? [], desire, T('wock.init-mare.after')),
		await initMares(mare?.upgrade ?? [], desire, T('wock.init-mare.upgrade')),
		await initMares(mare?.close ?? [], desire, T('wock.init-mare.close')),
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
		desire.router = new KoaRouter();
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
