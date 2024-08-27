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



/** @type {import('../../bases.d.ts').MareIniter} */
export default function initParseRaw() {
	/** @type {import('../../bases.d.ts').ExtendedMare} */
	return async function parseRaw(ctx, next) {
		if(ctx.face?.option?.parseRaw === false) { return await next(); }

		if('raw' in ctx) { return await next(); }


		const datas = {
			query: ctx.query,
			body: null,
			formData: ctx.request.body,
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
			catch { void 0; }
		}

		ctx.bodyParsed = datas.body = body;
		ctx.bodyRaw = bodyRaw;



		const raw = ctx.raw || (ctx.raw = { $sourcesRaw: {} });
		const sourcesRaw = (raw.$sourcesRaw ?? (raw.$sourcesRaw = {}));

		for(const from in datas) {
			const data = datas[from];
			if(!data || typeof data != 'object') { continue; }


			for(const key in data) {
				if(key.startsWith('$')) { continue; }


				raw[key] = data[key];

				(sourcesRaw[key] ?? (sourcesRaw[key] = [])).join(from);
			}
		}


		if(ctx.request.files) { raw.$files = ctx.request.files; }
		else if(ctx.request.file) { raw.$files = [ctx.request.file]; }


		await next();
	};
};
