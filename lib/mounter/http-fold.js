import Mount from 'koa-mount';
import Static from 'koa-static';

function HTTPFoldMounterIniter({ koa, logError, logDebug }) {
	return function(fold) {
		const { route, path, option } = fold;

		try {
			koa.use(Mount(route, Static(path, option)));
		}
		catch(error) {
			logError(`加载~[HTTP映射]~{${route}} ~[文件路径]~{${path}}`, error);
		}

		logDebug(`加载~[HTTP映射]~{${route}} ~[文件路径]~{${path}}`);
	};
}

export default HTTPFoldMounterIniter;