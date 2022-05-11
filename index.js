import KoaRouter from 'koa-router';

import Wocker from './lib/Wock.js';
import initMounterFold from './lib/mounter/http-fold.js';
import initMounterFace from './lib/mounter/http-face.js';
import initMounterFaceWock from './lib/mounter/wock-face.js';



/** 加载中间件 */
async function initHTTPMares($) {
	const { C: { mare }, logWarn } = $;

	const maresBefore = [];
	const maresAfter = [];

	for(const initerMare_ of mare?.before ?? []) {
		try {
			let initerMare = initerMare_;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			maresBefore.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载~[HTTP接口前置中间件]', error);
		}
	}
	for(const initerMare_ of mare?.after ?? []) {
		try {
			let initerMare = initerMare_;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			maresAfter.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载~[HTTP接口后置中间件]', error);
		}
	}

	return [maresBefore, maresAfter];
}

/** 加载Wock中间件 */
async function initWockMares($) {
	const { C: { wock }, logWarn } = $;

	const mareskBefore = [];
	const maresAfter = [];
	const maresUpgrade = [];
	const maresClose = [];

	for(const initerMare_ of wock?.mare?.before ?? []) {
		try {
			let initerMare = initerMare_;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			mareskBefore.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载~[Wock接口前置中间件]', error);
		}
	}
	for(const initerMare_ of wock?.mare?.after ?? []) {
		try {
			let initerMare = initerMare_;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			maresAfter.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载~[Wock接口后置中间件]', error);
		}
	}
	for(const initerMare_ of wock?.mare?.upgrade ?? []) {
		try {
			let initerMare = initerMare_;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			maresUpgrade.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载~[Wock协议升级中间件]', error);
		}
	}
	for(const initerMare_ of wock?.mare?.close ?? []) {
		try {
			let initerMare = initerMare_;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			maresClose.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载~[Wock连接关闭中间件]', error);
		}
	}

	return [mareskBefore, maresAfter, maresUpgrade, maresClose];
}

/**
 * #### 服务器系统默认接口（渴望）
 * @version 4.10.1-2022.05.11.02
 */
export default async function DesireDefaultHarb($_) {
	const $ = $_;

	const { C: { facePrefix, faces = [], folds = [], wock }, koa } = $;


	// 挂载文件资源
	const mountFoldHTTP = await initMounterFold($);

	for(const rout of folds) {
		await mountFoldHTTP(rout);
	}


	// 挂载HTTP接口
	const router = $.router = KoaRouter();
	const methodsRouter = router.methods.map(m => m.toLowerCase());

	const [maresHTTPBefore, maresHTTPAfter] = await initHTTPMares($);
	const mountFaceHTTP = await initMounterFace($);

	for(const rout of faces) {
		const methodsHTTP = rout?.method.split('.').map(m => m.toLowerCase()).filter(m => methodsRouter.includes(m));

		for(const method of methodsHTTP) {
			await mountFaceHTTP(method, rout, maresHTTPBefore, maresHTTPAfter, facePrefix);
		}
	}


	// 挂载Wock接口
	if(wock && !wock.disable) {
		const [maresWockBefore, maresWockAfter, maresWockUpgrade, maresWockClose] = await initWockMares($);

		$.W = new Wocker($, maresWockUpgrade, maresWockClose);

		const mountFaceWock = await initMounterFaceWock($);

		for(const rout of faces) {
			const isWockRout = rout?.method.split('.').map(m => m.toLowerCase()).find(m => m == 'wock');

			if(isWockRout) {
				await mountFaceWock(rout, maresWockBefore, maresWockAfter);
			}
		}
	}


	// 加载路由
	koa.use(router.routes());
}
