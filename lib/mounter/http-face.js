import OS from 'os';
import { posix } from 'path';

import Multer from '@koa/multer';


function HTTPFaceMounterIniter($) {
	const { C: { paths }, router, logDebug, logWarn, logError } = $;

	return function(method, face, maresBefore, maresAfter, facePrefix) {
		const { handle, route, upload } = face;

		if(!route) { return logWarn(`加载 ~[HTTP接口]~{${route}}`, '缺少~[路由], 已跳过'); }
		if(typeof handle !== 'function') { return logWarn(`加载 ~[HTTP接口]~{${route}}`, '缺少可执行的~[处理函数], 已跳过'); }
		if(!method) { return logWarn(`加载 ~[HTTP接口]~{${route}}`, '缺少~[请求方法], 已跳过'); }

		const routeFinal = posix.join(facePrefix ?? '/', route);

		// 文件上传
		if(upload === true) {
			$.multer = $.multer ?? Multer({ dest: paths?.temp ?? OS.tmpdir() });

			router[method](routeFinal, $.multer.any());
		}

		router[method](routeFinal, async function(ctx, next) { ctx.rout = face; await next(); });

		// 前置中间件
		for(const mare of maresBefore) { router[method](routeFinal, mare); }

		// 主处理函数
		router[method](routeFinal, async function(ctx_, next) {
			const ctx = ctx_;

			try {
				const result = await handle(ctx.raw, ctx, routeFinal, $);

				if(result !== undefined) { ctx.body = result; }
			}
			catch(error) {
				ctx.body = error instanceof Error ? error : Error(error);

				logError(`执行 ~[HTTP接口]~{${route}}`, ctx.body);
			}

			await next();
		});

		// 后置中间件
		for(const mare of maresAfter) { router[face.method](routeFinal, mare); }

		logDebug(`加载 ~[HTTP接口]~{${method}}~{${route}}`, '✔ ');
	};
}

export default HTTPFaceMounterIniter;