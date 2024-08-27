/** @type {import('../../bases.d.ts').MareIniter} */
export default function initToSuccess() {
	/** @type {import('../../bases.d.ts').ExtendedMare} */
	return async function toSuccess(ctx, next) {
		if(ctx.face?.option?.toSuccess === false) { return await next(); }


		try {
			const body = ctx.body;

			if(body instanceof Error) {
				ctx.body = { success: false, message: body.message, data: body.data };
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
