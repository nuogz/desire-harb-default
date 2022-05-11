import CoBody from 'co-body';



const typesJSON = [
	'application/json',
	'application/json-patch+json',
	'application/vnd.api+json',
	'application/csp-report',
];

const typesForm = [
	'application/x-www-form-urlencoded',
];

const typesText = [
	'text/plain',
];

const configCoBody = {
	limit: '256mb',
	returnRawBody: true,
};


export default () => {
	return async function parseRaw(ctx_, next) {
		const ctx = ctx_;

		if('raw' in ctx) { return next(); }

		let body;
		let bodyRaw;
		if(ctx.request.is(typesJSON)) {
			({ parsed: body, raw: bodyRaw } = await CoBody.json(ctx, configCoBody));
		}
		else if(ctx.request.is(typesForm)) {
			({ parsed: body, raw: bodyRaw } = await CoBody.form(ctx, configCoBody));
		}
		else if(ctx.request.is(typesText)) {
			({ parsed: body, raw: bodyRaw } = await CoBody.text(ctx, configCoBody));
		}
		else {
			try {
				({ parsed: body, raw: bodyRaw } = await CoBody(ctx, configCoBody));
			}
			catch(error) { void 0; }
		}

		ctx.request.body = body;
		ctx.request.bodyRaw = bodyRaw;

		const raw = {};

		const keysFrom = raw._keysFrom = {};

		if(typeof ctx.query == 'object') {
			for(const key in ctx.query) {
				raw[key] = ctx.query[key];
				keysFrom[key] = key in keysFrom ? keysFrom[key] + ',query' : 'query';
			}
		}

		if(typeof body == 'object') {
			for(const key in body) {
				raw[key] = body[key];
				keysFrom[key] = key in keysFrom ? keysFrom[key] + ',body' : 'body';
			}
		}

		ctx.raw = raw;

		await next();
	};
};
