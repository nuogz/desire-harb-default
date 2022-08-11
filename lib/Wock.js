import { posix } from 'path';
import { WebSocketServer } from 'ws';

class WockConnection {
	constructor(wock, wocker, $, maresClose) {
		const { C: { wock: { ping } }, logInfo, logError, logTrace, TH } = $;

		this.TH = TH;

		this.wock = wock;
		this.wocker = wocker;

		this.maresClose = maresClose;

		this.logInfo = logInfo;
		this.logError = logError;
		this.logTrace = logTrace;

		this.onceOff = false;
		wock.on('error', error => this.handleClose(error));
		wock.on('close', (code, reason) => this.handleClose(this.TH('wock.handleClose', { code: code ?? 0, reason: reason.toString() ?? '' })));

		wock.on('message', async raw => {
			if(ping) { this.checkHeartbeat(); }

			let event = {};
			try {
				event = JSON.parse(raw.toString());
			}
			catch(error) { return; }

			const handle = this.wocker.handles[event.type];
			if(handle) {
				if(event.data instanceof Array) {
					handle(this, ...event.data);
				}
				else {
					handle(this, event.data);
				}
			}
		});

		if(ping) {
			this.clearHeartbeat();
			this.checkHeartbeat();
		}
	}


	/** send event */
	cast(type, ...data) {
		try {
			this.wock.send(JSON.stringify({ type, data }));
		}
		catch(error) {
			if(error.message.indexOf('CLOSED') == -1) {
				this.logError(this.TH('wock.castEvent', { type }), error);
			}
		}
	}

	/** wock close handle */
	handleClose(reason) {
		if(this.onceOff) { return; }
		this.onceOff = true;

		for(const func of this.maresClose) {
			if(typeof func == 'function') {
				func(reason, this);
			}
		}

		if(reason instanceof Error) {
			this.logError(this.TH('wock.closeConnection'), reason);
		}
		else {
			this.logTrace(this.TH('wock.closeConnection'), reason);
		}

		this.clearHeartbeat();
	}

	/** init heartbeat */
	checkHeartbeat(clearCount = true) {
		this.clearHeartbeat(clearCount);

		this.timeoutPing = setTimeout(() => {
			this.cast('ping');

			this.timeoutWait = setTimeout(() => {
				this.timeoutCount++;

				if(this.timeoutCount >= 4) {
					this.wock.close(4001, this.TH('heartbeatTimeout'));
				}
				else {
					this.checkHeartbeat(false);
				}
			}, 24000);
		}, 10000);
	}

	clearHeartbeat(clearCount = true) {
		clearTimeout(this.timeoutPing);
		clearTimeout(this.timeOutWait);

		this.timeoutPing = null;
		this.timeOutWait = null;

		if(clearCount) { this.timeoutCount = 0; }
	}
}

export default class Wocker {
	constructor($, maresUpgrade = [], maresClose_ = []) {
		const { C: { wock: { route } }, server } = $;

		const serverWock = this.server = new WebSocketServer({
			noServer: true,
			perMessageDeflate: {
				zlibDeflateOptions: {
					chunkSize: 1024,
					memLevel: 7,
					level: 4,
				},
				zlibInflateOptions: {
					chunkSize: 10 * 1024
				},
				clientNoContextTakeover: true,
				serverNoContextTakeover: true,
				serverMaxWindowBits: 10,
				concurrencyLimit: 10,
				threshold: 1024,
			},
		});

		this.route = posix.join('/', route ?? '/');

		// mount under HTTP
		server.on('upgrade', async (request, socket, head) => {
			if(request.url.includes(this.route)) {
				for(const mare of maresUpgrade) {
					await mare(request, socket, head, this);
				}

				serverWock.handleUpgrade(request, socket, head, ws => serverWock.emit('connection', ws, request));
			}
		});

		/** @type {Set<WockConnection>} */
		this.wockConnections = new Set();
		const maresClose = maresClose_.concat([() => (reason, wock) => this.wockConnections.delete(wock)]);


		serverWock.on('connection', wock => this.wockConnections.add(new WockConnection(wock, this, $, maresClose)));


		// events
		this.handles = { ping(wock) { wock.cast('pong'); } };
	}

	/** boardcast */
	cast(type, ...data) {
		this.wockConnections.forEach(wockConnection => {
			try {
				wockConnection.cast(type, ...data);
			}
			catch(error) { void 0; }
		});
	}


	/** add wock event */
	add(name, handle) {
		if(!name && !(typeof handle == 'function')) { return false; }

		this.handles[name] = handle;
	}
	/** delete wock event */
	del(name) {
		if(!name) { return false; }

		delete this.handles[name];
	}
	/** get wock event */
	get(name) {
		return this.handles[name];
	}
	/** run a wock event  */
	run(name, ...data) {
		this.handles[name](...data);
	}
}
