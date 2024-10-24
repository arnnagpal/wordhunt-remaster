/* eslint-disable @typescript-eslint/no-unused-vars */
import { PUBLIC_GAME_SERVICE_WS } from '$env/static/public';

export class SocketClient {
	public client!: WebSocket;
	private jwt: string;
	private listeners: { [key: string]: Array<(data: object) => void> } = {};

	constructor(jwt: string) {
		this.jwt = jwt;
	}

	setupSocket(reconnectInterval?: NodeJS.Timeout): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			console.log('Connecting to server', PUBLIC_GAME_SERVICE_WS);
			this.client = new WebSocket(PUBLIC_GAME_SERVICE_WS, this.jwt);

			// message is received
			this.client.addEventListener('message', (event) => {
				console.log('Received message', event.data);
				const data = {
					detail: {
						message: event.data
					}
				};

				if (this.listeners['message']) {
					this.listeners['message'].forEach((callback) => {
						callback(data);
					});
				}
			});

			// socket opened
			this.client.addEventListener('open', (__event) => {
				if (reconnectInterval) {
					clearInterval(reconnectInterval);
					console.log('Reconnected to server');
				} else {
					console.log('Connected to server');
				}

				if (this.listeners['status']) {
					this.listeners['status'].forEach((callback) => {
						callback({ status: 'open' });
					});
				}

				resolve();
			});

			// socket closed
			this.client.addEventListener('close', (event) => {
				console.log('Disconnected from server', event.code);
				if (this.listeners['status']) {
					this.listeners['status'].forEach((callback) => {
						callback({ status: 'close', code: event.code, reason: event.reason });
					});
				}

				if (reconnectInterval) {
					return;
				}

				// regular close, no need to reconnect
				if (
					event.code === 1000 ||
					event.code === 1001 ||
					event.code === 1005 ||
					event.code === 4000
				) {
					return;
				}

				console.log('Attempting to reconnect to server');
				// try to reconnect 3 times with 5 second interval
				// let count = 0;
				const interval = setInterval(() => {
					// if (count === 3) {
					// clearInterval(interval);
					// } else {
					this.setupSocket(interval);
					// count++;
					// }
				}, 5000);
			});

			// error handler
			this.client.addEventListener('error', (event) => {
				console.log('Error occurred', event);
				reject();
			});
		});
	}

	createGame(time: number, players: string[]) {
		// request to create game
		this.client.send(
			JSON.stringify({
				action: 'CREATE',
				data: {
					time,
					players
				}
			})
		);
	}

	joinGame(gameId: string) {
		// request to join game
		this.sendMessage(
			JSON.stringify({
				action: 'JOIN',
				gameId
			})
		);
	}

	queueGame() {
		// request to queue game
		this.sendMessage(
			JSON.stringify({
				action: 'QUEUE',
				data: {
					type: 'casual'
				}
			})
		);
	}

	leaveQueue() {
		// request to leave queue
		this.sendMessage(
			JSON.stringify({
				action: 'CANCEL_QUEUE'
			})
		);
	}

	startTimer() {
		// request to start timer
		this.sendMessage(
			JSON.stringify({
				updateType: 'START_TIME',
				data: {}
			})
		);
	}

	selectLetter(letter: string, index: number, row: number, col: number): Promise<boolean> {
		return new Promise<boolean>((resolve, _reject) => {
			// const listenerIdx = this.onMessage((data: object) => {
			// 	const message = JSON.parse((data as CustomEvent).detail.message);
			// 	if (message.updateType === 'LETTER_SELECT') {
			// 		console.log('Received response from server', message);
			// 		resolve(!!message.data.validWord);

			// 		// remove listener
			// 		this.removeListenerByIdx('message', listenerIdx);
			// 	}
			// });

			// request to select letter
			this.sendMessage(
				JSON.stringify({
					updateType: 'LETTER_SELECT',
					data: {
						letter: letter,
						index: index,
						row: row,
						col: col
					}
				})
			);
		});
	}

	submitWord() {
		// request to submit word
		this.sendMessage(
			JSON.stringify({
				updateType: 'SUBMIT_SELEC',
				data: {}
			})
		);
	}

	endGame() {
		// request to end game
		this.sendMessage(
			JSON.stringify({
				updateType: 'END_GAME',
				data: {}
			})
		);
	}

	subscribeChat() {
		// request to subscribe chat
		this.sendMessage(
			JSON.stringify({
				action: 'SUBSCRIBE_CHAT'
			})
		);
	}

	subscribeQueuedUsers() {
		// request to subscribe queued users
		this.sendMessage(
			JSON.stringify({
				action: 'SUBSCRIBE_QUEUE'
			})
		);
	}
	subscribeOnlineUsers() {
		// request to subscribe online users
		this.sendMessage(
			JSON.stringify({
				action: 'SUBSCRIBE_ONLINE'
			})
		);
	}

	onMessage(callback: (data: object) => void): number {
		this.listeners['message'] = this.listeners['message'] || [];
		this.listeners['message'].push(callback);

		return this.listeners['message'].length - 1;
	}

	onStatusChange(callback: (data: object) => void): number {
		this.listeners['status'] = this.listeners['status'] || [];
		this.listeners['status'].push(callback);

		return this.listeners['status'].length - 1;
	}

	removeListener(type: string, callback: (data: object) => void) {
		this.listeners[type] = this.listeners[type] || [];
		const index = this.listeners[type].indexOf(callback);
		if (index !== -1) {
			this.listeners[type].splice(index, 1);
		}
	}

	removeListenerByIdx(type: string, index: number) {
		this.listeners[type] = this.listeners[type] || [];
		if (index < this.listeners[type].length) {
			this.listeners[type].splice(index, 1);
		}
	}

	sendMessage(message: string) {
		console.log('Sending message', message);
		this.client.send(message);
	}

	disconnect() {
		this.client.close();
	}
}
