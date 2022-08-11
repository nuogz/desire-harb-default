import Mount from 'koa-mount';
import Static from 'koa-static';



export default function HTTPFoldMounterIniter({ koa, logError, logDebug, locale, TH }) {
	return fold => {
		const { route, path, option } = fold;

		try {
			koa.use(Mount(route, Static(path, option)));
		}
		catch(error) {
			logError(TH('http.folder.init', { route, path }), error);
		}

		logDebug(TH('http.folder.init', { route, path }));
	};
}
