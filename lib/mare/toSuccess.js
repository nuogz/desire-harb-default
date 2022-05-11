export default () => {
	return async function toSuccess(ctx, next) {
		const { rout } = ctx;


		if(!rout?.option?.parseResult) { return await next(); }


		try {
			const body = ctx.body;

			if(body instanceof Error) {
				ctx.body = { success: false, message: body.message };
			}
			else {
				ctx.body = { success: true, data: body };
			}
			ctx.type = 'json';
		}
		catch { ctx.status = 500; }


		await next();
	};
};
