import KoaMount from 'koa-mount';
import KoaStatic from 'koa-static';

import { TT } from '@nuogz/i18n';



const { T } = TT('@nuogz/desire-harbour');



/**
 * @param {import('../../bases.d.ts').FolderOption} fold
 * @param {import('../../bases.d.ts').DesireWithHarbour} desire
 */
export default async function mountHTTPFolder(fold, desire) {
	const { prefix, location, option } = fold;
	const { koa, logError, logDebug } = desire;


	try {
		koa.use(KoaMount(prefix, KoaStatic(location, option)));

		logDebug(T('http.folder.init', { route: prefix, location }), '✔ ');
	}
	catch(error) {
		logError(T('http.folder.init', { route: prefix, location }), error);
	}
}
