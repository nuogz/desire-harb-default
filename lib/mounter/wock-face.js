export default function WockFaceMounterIniter($) {
	const { W, logWarn, logDebug, logError, TH } = $;

	return (face, maresBefore = [], maresAfter = []) => {
		const { handle, route, } = face;

		if(!route) { return logWarn(TH('wock.face.init', { route }), TH('wock.face.skipInit.missRoute')); }
		if(typeof handle != 'function') { return logWarn(TH('wock.face.init', { route }), TH('wock.face.skipInit.missHandle')); }

		W.add(route, async (wockConn, ...data) => {
			try {
				for(const mare of maresBefore) {
					data = await mare(...data, wockConn, route, $);
				}

				data = await handle(...data, wockConn, route, $);
				data = [data];

				for(const mare of maresAfter) {
					data = await mare(...data, wockConn, route, $);
				}

				wockConn.cast(route, ...data);
			}
			catch(errror) {
				logError(TH('wock.face.exec', { route }), errror);
			}
		});

		logDebug(TH('wock.face.init', { route }), '✔ ');
	};
}
