import OS from 'os';
import { posix } from 'path';

import Multer from '@koa/multer';



export default function HTTPFaceMounterIniter($) {
	const { C: { paths }, router, logDebug, logWarn, logError, TH } = $;


	return (method, face, maresBefore, maresAfter, facePrefix) => {
		const { handle, route, upload } = face;

		if(!route) { return logWarn(TH('http.face.init', { route }), TH('http.face.skipInit.missRoute')); }
		if(typeof handle != 'function') { return logWarn(TH('http.face.init', { route }), TH('http.face.skipInit.missHandle')); }
		if(!method) { return logWarn(TH('http.face.init', { route }), TH('http.face.skipInit.missMethod')); }

		const routeFinal = posix.join(facePrefix ?? '/', route);

		// file upload
		if(upload === true) {
			$.multer = $.multer ?? Multer({ dest: paths?.temp ?? OS.tmpdir() });

			router[method](routeFinal, $.multer.any());
		}

		router[method](routeFinal, async (ctx, next) => { ctx.rout = face; await next(); });

		// before mare
		for(const mare of maresBefore) { router[method](routeFinal, mare); }

		// main
		router[method](routeFinal, async (ctx, next) => {
			try {
				const result = await handle(ctx.raw, ctx, routeFinal, $);

				if(result !== undefined) { ctx.body = result; }
			}
			catch(error) {
				ctx.body = error instanceof Error ? error : Error(error);

				logError(TH('http.face.exec', { route }), ctx.body);
			}

			await next();
		});

		// after mare
		for(const mare of maresAfter) { router[face.method](routeFinal, mare); }


		logDebug(TH('http.face.init2', { method, route }), '✔ ');
	};
}
