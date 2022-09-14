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


		const datas = {
			query: ctx.query,
			body: null,
			formData: ctx.request.body
		};


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

		ctx.request.bodyParsed = datas.body = body;
		ctx.request.bodyRaw = bodyRaw;


		const raw = ctx.raw = { _dataFrom: {} };
		const dataFrom = raw._dataFrom;

		for(const from in datas) {
			const data = datas[from];

			if(!data || typeof data != 'object') { continue; }

			for(const key in data) {
				raw[key] = data[key];

				dataFrom[key] = from + (dataFrom[key] ?? '');
			}
		}


		if(ctx.request.files) { raw._files = ctx.request.files; }
		if(ctx.request.file) { raw._files = [ctx.request.file]; }


		await next();
	};
};
