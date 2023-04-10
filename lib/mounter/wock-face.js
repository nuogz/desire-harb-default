import { TT } from '@nuogz/i18n';



const T = TT('@nuogz/desire-harbour');



/**
 * @param {import('../../index.js').FaceOption} face
 * @param {import('../../index.js').Mare[]} maresBefore
 * @param {import('../../index.js').Mare[]} maresAfter
 * @param {import('../../index.js').DesireWithHarbour} desire
 * @returns {Promise<void>}
 */
export default async function mountWockFace(face, maresBefore = [], maresAfter = [], desire) {
	const { wockman, logWarn, logDebug, logError } = desire;
	const { handle, route } = face;


	if(!route) { return logWarn(T('wock.face.init', { route }), T('wock.face.skipInit.missRoute')); }
	if(typeof handle != 'function') { return logWarn(T('wock.face.init', { route }), T('wock.face.skipInit.missHandle')); }


	wockman.add(route, async (wockConnection, ...data) => {
		try {
			for(const mare of maresBefore) {
				data = await mare(...data, wockConnection, wockman, route, desire);
			}


			data = await handle(...data, wockConnection, wockman, route, desire);


			for(const mare of maresAfter) {
				data = await mare(data, wockConnection, wockman, route, desire);
			}


			wockConnection.cast(route, ...data);
		}
		catch(errror) {
			logError(T('wock.face.exec', { route }), errror);
		}
	});

	logDebug(T('wock.face.init', { route }), '✔ ');
}
