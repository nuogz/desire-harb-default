function WockFaceMounterIniter($) {
	const { W, logWarn, logError } = $;

	return function(face, maresBefore = [], maresAfter = []) {
		const { handle, route, } = face;

		if(!route) { return logWarn(`加载 [Wock接口]{${route}}`, '缺少[路由], 已跳过'); }
		if(typeof handle !== 'function') { return logWarn(`加载 [Wock接口]{${route}}`, '缺少可执行的[处理函数], 已跳过'); }

		W.add(route, async function(wockConn, ...data) {
			try {
				for(const mare of maresBefore) {
					data = await mare(...data, wockConn, route);
				}

				data = await handle(...data, wockConn, route);
				data = [data];

				for(const mare of maresAfter) {
					data = await mare(...data, wockConn, route);
				}

				wockConn.cast(route, ...data);
			}
			catch(errror) {
				logError(`执行 [Wock接口]{${route}}`, errror);
			}
		});
	};
}

export default WockFaceMounterIniter;