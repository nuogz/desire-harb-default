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
			let initerMare;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			maresBefore.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载[接口前置中间件]', error);
		}
	}
	for(const initerMare_ of mare?.after ?? []) {
		try {
			let initerMare;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			maresAfter.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载[接口后置中间件]', error);
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
			let initerMare;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			mareskBefore.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载[接口前置中间件]', error);
		}
	}
	for(const initerMare_ of wock?.mare?.after ?? []) {
		try {
			let initerMare;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			maresAfter.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载[接口后置中间件]', error);
		}
	}
	for(const initerMare_ of wock?.mare?.upgrade ?? []) {
		try {
			let initerMare;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			maresUpgrade.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载[接口后置中间件]', error);
		}
	}
	for(const initerMare_ of wock?.mare?.close ?? []) {
		try {
			let initerMare;

			if(typeof initerMare_ == 'string') {
				initerMare = (await import(`./lib/mare/${initerMare_}.js`)).default;
			}

			maresClose.push(await initerMare($));
		}
		catch(error) {
			logWarn('加载[接口后置中间件]', error);
		}
	}

	return [mareskBefore, maresAfter, maresUpgrade, maresClose];
}

/**
 * #### 服务器系统默认港湾（渴望）
 * @version 4.5.1-2021.07.16.01
 */
async function DesireDefaultHarb($) {
	const { C: { faces, folds, wock } } = $;

	// 挂载文件资源
	const mountFoldHTTP = await initMounterFold($);

	for(const rout of folds) {
		await mountFoldHTTP(rout);
	}


	// 是否启用Wock
	const isWock = wock && !wock.disable;


	// 挂载HTTP接口
	const [maresHTTPBefore, maresHTTPAfter] = await initHTTPMares($);
	const mountFaceHTTP = await initMounterFace($);

	for(const rout of faces) {
		if(!isWock || rout.wock !== 'only') {
			await mountFaceHTTP(rout, maresHTTPBefore, maresHTTPAfter);
		}
	}


	// 挂载Wock接口
	if(isWock) {
		const [maresWockBefore, maresWockAfter, maresWockUpgrade, maresWockClose] = await initWockMares($);

		$.W = new Wocker($, maresWockUpgrade, maresWockClose);

		const mountFaceWock = await initMounterFaceWock($);
		for(const rout of faces) {
			if(rout.wock) {
				await mountFaceWock(rout, maresWockBefore, maresWockAfter);
			}
		}
	}
}

export default DesireDefaultHarb;