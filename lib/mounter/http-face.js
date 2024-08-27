import OS from 'os';
import { posix } from 'path';

import { TT } from '@nuogz/i18n';

import { createMulter } from './multer.js';



const { T } = TT('@nuogz/desire-harbour');



/**
 * @param {string} methods
 * @param {import('../../bases.d.ts').FaceOption} face
 * @param {import('../../bases.d.ts').Mare[]} maresBefore
 * @param {import('../../bases.d.ts').Mare[]} maresAfter
 * @param {string} facePrefix
 * @param {import('../../bases.d.ts').DesireWithHarbour} desire
 */
export default async function mountHTTPFace(methods, face, maresBefore, maresAfter, facePrefix, desire) {
	const { router, logDebug, logWarn, logError, optionHarbour: { multer: optionMulter } } = desire;
	const { handle, route, upload, destUpload } = face;


	if(!route) { return logWarn(T('http.face.init', { route }), T('http.face.skip-init.unknown-route')); }
	if(typeof handle != 'function') { return logWarn(T('http.face.init', { route }), T('http.face.skip-init.unknown-handle')); }
	if(!methods || !methods.length) { return logWarn(T('http.face.init', { route }), T('http.face.skip-init.unknown-method')); }


	const routeFinal = posix.join(facePrefix ?? '/', route);


	// file upload
	if(upload === true) {
		desire.multer = desire.multer ?? createMulter(Object.assign({}, { dest: desire?.optionHarbour?.destUpload ?? destUpload ?? OS.tmpdir() }, optionMulter));

		router.register(routeFinal, methods, desire.multer.any());
	}

	router.register(routeFinal, methods, async (ctx, next) => { ctx.face = face; await next(); });


	// before mare
	for(const mare of maresBefore) { router.register(routeFinal, methods, mare); }


	// main
	router.register(routeFinal, methods, async (ctx, next) => {
		try {
			const result = await handle(ctx.raw, ctx, routeFinal, face, desire);

			if(result !== undefined) { ctx.body = result; }
		}
		catch(error) {
			ctx.body = error instanceof Error ? error : Error(error);

			logError(T('http.face.exec', { route }), ctx.body);
		}

		await next();
	});


	// after mare
	for(const mare of maresAfter) { router.register(routeFinal, methods, mare); }


	logDebug(T('http.face.init2', { methods: methods.join(','), route }), '✔ ');
}
