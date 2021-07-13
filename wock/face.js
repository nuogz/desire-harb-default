module.exports = async function($, wockInfo = {}) {
	const { G, wockMan, nameLog, C: { wock: { mare } } } = $;

	return async function(rout) {
		const handle = rout.handle;

		if(!handle) {
			G.warn(nameLog, `加载[Wock接口]{${rout.path}}`, '缺少对应的[流程]代码');

			return;
		}
		else {
			G.debug(nameLog, `加载[Wock接口]{${rout.path}}`);
		}

		let funcArr = [
			...(wockInfo.before || []),
			handle,
			...(wockInfo.after || [])
		];

		wockMan.add(rout.path, async function(wock, raw) {
			let result = raw;

			if(result === undefined || result === null) {
				result = {};
			}

			result._rout = rout;

			try {
				for(let func of funcArr) {
					result = await func(result, wock);
				}

				wock.send(JSON.stringify({ type: rout.path, data: result }));
			}
			catch(e) {
				G.trace(`执行 [Wock接口], 错误: ${e.message}`);
			}
		});
	};
};