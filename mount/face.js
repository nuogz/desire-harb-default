module.exports = async function($) {
	const { C: { mare }, G, router, multer, nameLog } = $;
	const PA = require('path').posix;

	return async function(rout) {
		const { handle, path } = rout;

		if(!handle) {
			return G.warn(nameLog, `加载[接口]{${rout.path}}`, '缺少对应的[流程]代码, 已跳过');
		}
		else if(!path) {
			return G.warn(nameLog, `加载[接口]{${rout.path}}`, '缺少对应的[路由], 已跳过');
		}
		else {
			G.debug(nameLog, `加载[接口]{${rout.path}}`);
		}

		if(rout.upload === true) {
			router[rout.method](rout.path, multer.any());
		}

		const beforeMare = mare && mare.before ? mare.before : [];
		const afterMare = mare && mare.after ? mare.after : [];

		// 前置中间件
		for(const middleware of beforeMare) {
			router[rout.method](rout.path, middleware);
		}

		// 主函数
		router[rout.method](PA.join('/', rout.path), async function(ctx, next) {
			ctx.rout = rout;

			await next();

			try {
				ctx.body = await handle(ctx.raw, ctx);
			}
			catch(error) {
				ctx.status == 500;

				G.error(nameLog, '运行[接口]', error);
			}
		});

		// 后置中间件
		for(const middleware of afterMare) {
			router[rout.method](rout.path, middleware);
		}
	};
};