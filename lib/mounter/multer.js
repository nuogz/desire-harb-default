/**
 * Due to lack of maintenance of `@koajs/multer`, I forked its code and rewrote it using the latest standards. Theoretically the functionality is exactly the same.
 * @file @koajs/multer
 * @author DanoR
 * @version 3.0.2 2024.06.22 11 (based on `@koajs/multer@3.0.2`)
 * @requires multer
 */


import MulterRaw from 'multer';



/**
 * @param {MulterRaw.Multer} multerRaw
 * @param {string} nameFunction
 */
const promisify = (multerRaw, nameFunction) => {
	if(nameFunction in multerRaw == false) { return; }


	const functionRaw = multerRaw[nameFunction];

	multerRaw[nameFunction] = function() {
		const middleware = Reflect.apply(functionRaw, this, arguments);

		return async (ctx, next) => {
			await new Promise((resolve, rejecte) => {
				middleware(ctx.req, ctx.res, error => {
					if(error) { return rejecte(error); }

					if('request' in ctx) {
						if(ctx.req.body) {
							ctx.request.body = ctx.req.body;
							delete ctx.req.body;
						}

						if(ctx.req.file) {
							ctx.request.file = ctx.req.file;
							ctx.file = ctx.req.file;
							delete ctx.req.file;
						}

						if(ctx.req.files) {
							ctx.request.files = ctx.req.files;
							ctx.files = ctx.req.files;
							delete ctx.req.files;
						}
					}

					resolve(ctx);
				});
			});

			return next();
		};
	};

	multerRaw[nameFunction].name = nameFunction;
};


/** @param {import('@koa/multer').Options} options */
const createMulter = (options) => {
	const multerRaw = MulterRaw(options);


	promisify(multerRaw, 'any');
	promisify(multerRaw, 'array');
	promisify(multerRaw, 'fields');
	promisify(multerRaw, 'none');
	promisify(multerRaw, 'single');


	return multerRaw;
};
const diskStorage = MulterRaw.diskStorage;
const memoryStorage = MulterRaw.memoryStorage;



export { createMulter, diskStorage, memoryStorage };
