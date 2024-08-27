import { TT } from '@nuogz/i18n';



const { T } = TT('@nuogz/desire-harbour');



/**
 * @param {import('../../bases.d.ts').FaceOption} face
 * @param {import('../../bases.d.ts').Mare[]} maresBefore
 * @param {import('../../bases.d.ts').Mare[]} maresAfter
 * @param {import('../../bases.d.ts').DesireWithHarbour} desire
 * @returns {Promise<void>}
 */
export default async function mountWockFace(face, maresBefore = [], maresAfter = [], desire) {
	const { wockman: Wockman, logWarn, logDebug, logError } = desire;
	const { handle, route, option } = face;


	if(!route) { return logWarn(T('wock.face.init', { route }), T('wock.face.skip-init.unknown-route')); }
	if(typeof handle != 'function') { return logWarn(T('wock.face.init', { route }), T('wock.face.skip-init.unknown-handle')); }


	Wockman.add(route, async (wock, wockman, ...data) => {
		try {
			for(const mare of maresBefore) {
				data = await mare(...data, wock, wockman, route, option, desire);
			}


			data = await handle(...data, wock, wockman, route, option, desire);


			for(const mare of maresAfter) {
				data = await mare(data, wock, wockman, route, option, desire);
			}


			wock.cast(route, ...(data ?? []));
		}
		catch(errror) {
			logError(T('wock.face.exec', { route }), errror);
		}
	});

	logDebug(T('wock.face.init', { route }), '✔ ');
}
