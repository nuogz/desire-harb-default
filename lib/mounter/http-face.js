import OS from 'os';
import { posix } from 'path';

import Multer from '@koa/multer';


function HTTPFaceMounterIniter($) {
	const { C: { paths }, router, logDebug, logWarn, logError } = $;

	return function(method, face, maresBefore, maresAfter) {
		const { handle, route, upload } = face;

		if(!route) { return logWarn(`加载 [HTTP接口]{${route}}`, '缺少[路由], 已跳过'); }
		if(typeof handle !== 'function') { return logWarn(`加载 [HTTP接口]{${route}}`, '缺少可执行的[处理函数], 已跳过'); }
		if(!method) { return logWarn(`加载 [HTTP接口]{${route}}`, '缺少[请求方法], 已跳过'); }

		logDebug(`加载[接口]{${route}}`, '✔ ');

		// 文件上传
		if(upload === true) {
			$.multer = $.multer ?? Multer({ dest: paths?.temp ?? OS.tmpdir() });

			router[method](route, $.multer.any());
		}

		const routeFinal = posix.join('/', route);

		// 前置中间件
		for(const mare of maresBefore) { router[method](routeFinal, mare); }

		// 主处理函数
		router[method](routeFinal, async function(ctx, next) {
			ctx.rout = face;

			try {
				ctx.body = await handle(ctx.raw, ctx, routeFinal, $);
			}
			catch(error) {
				ctx.status == 500;

				logError(`执行 [HTTP接口]{${route}}`, error);
			}

			next();
		});

		// 后置中间件
		for(const mare of maresAfter) { router[face.method](routeFinal, mare); }
	};
}

export default HTTPFaceMounterIniter;