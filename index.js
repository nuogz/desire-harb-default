import KoaRouter from 'koa-router';

import { TT } from './lib/i18n.js';

import Wocker from './lib/Wock.js';

import initMounterFold from './lib/mounter/http-fold.js';
import initMounterFace from './lib/mounter/http-face.js';
import initMounterFaceWock from './lib/mounter/wock-face.js';



const initAllMares = async (initsMare, $, textAction) => {
	const mares = [];

	for(const initMareRaw of initsMare) {
		try {
			const initMare = typeof initMareRaw == 'string'
				? (await import(`./lib/mare/${initMareRaw}.js`)).default
				: initMareRaw;


			mares.push(await initMare($));
		}
		catch(error) {
			$.logWarn(textAction, error);
		}
	}

	return mares;
};


const initHTTPMares = async $ => {
	const { C: { mare: configMare }, TH } = $;

	return [
		await initAllMares(configMare?.before ?? [], $, TH('http.initMare.before')),
		await initAllMares(configMare?.after ?? [], $, TH('http.initMare.after')),
	];
};

const initWockMares = async $ => {
	const { C: { wock: configWock }, TH } = $;
	const configMare = configWock?.mare;


	return [
		await initAllMares(configMare?.before ?? [], $, TH('wock.initMare.before')),
		await initAllMares(configMare?.after ?? [], $, TH('wock.initMare.after')),
		await initAllMares(configMare?.upgrade ?? [], $, TH('wock.initMare.upgrade')),
		await initAllMares(configMare?.close ?? [], $, TH('wock.initMare.close')),
	];
};


export default async function DesireDefaultHarb($) {
	const { C: { facePrefix, faces = [], folds = [], wock }, koa } = $;

	$.TH = TT($.locale);


	// mount folders
	const mountFoldHTTP = await initMounterFold($);

	for(const rout of folds) {
		await mountFoldHTTP(rout);
	}


	// mount HTTP interfaces
	const router = $.router = KoaRouter();
	const methodsRouter = router.methods.map(m => m.toLowerCase());

	const [maresHTTPBefore, maresHTTPAfter] = await initHTTPMares($);
	const mountFaceHTTP = await initMounterFace($);

	for(const rout of faces) {
		const methodsHTTP = rout?.method.split(';').map(m => m.toLowerCase()).filter(m => methodsRouter.includes(m));

		for(const method of methodsHTTP) {
			await mountFaceHTTP(method, rout, maresHTTPBefore, maresHTTPAfter, facePrefix);
		}
	}


	// mount Wock interfaces
	if(wock && !wock.disable) {
		const [maresWockBefore, maresWockAfter, maresWockUpgrade, maresWockClose] = await initWockMares($);

		$.W = new Wocker($, maresWockUpgrade, maresWockClose);

		const mountFaceWock = await initMounterFaceWock($);

		for(const rout of faces) {
			const isWockRout = rout?.method.split(';').map(m => m.toLowerCase()).find(m => m == 'wock');

			if(isWockRout) {
				await mountFaceWock(rout, maresWockBefore, maresWockAfter);
			}
		}
	}


	// apply routes
	koa.use(router.routes());
}
