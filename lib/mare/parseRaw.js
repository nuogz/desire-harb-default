import CoBody from 'co-body';

const jsonTypes = [
	'application/json',
	'application/json-patch+json',
	'application/vnd.api+json',
	'application/csp-report',
];

const formTypes = [
	'application/x-www-form-urlencoded',
];

const textTypes = [
	'text/plain',
];

export default function() {
	return async function parseRaw(ctx, next) {
		let body;
		let rawBody;

		const config = {
			limit: '256mb',
			returnRawBody: true,
		};

		if(ctx.request.is(jsonTypes)) {
			({ parsed: body, raw: rawBody } = await CoBody.json(ctx, config));
		}
		else if(ctx.request.is(formTypes)) {
			({ parsed: body, raw: rawBody } = await CoBody.form(ctx, config));
		}
		else if(ctx.request.is(textTypes)) {
			({ parsed: body, raw: rawBody } = await CoBody.text(ctx, config));
		}
		else {
			({ parsed: body, raw: rawBody } = await CoBody(ctx, config));
		}

		ctx.body = body;
		ctx.rawBody = rawBody;

		const raw = ctx.raw || {};

		if(typeof ctx.query == 'object') {
			for(const key in ctx.query) {
				raw[key] = ctx.query[key];
			}
		}

		if(typeof body == 'object') {
			for(const key in body) {
				raw[key] = body[key];
			}
		}

		ctx.raw = raw;

		next();
	};
}