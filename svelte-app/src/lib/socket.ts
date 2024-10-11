/* eslint-disable @typescript-eslint/no-unused-vars */
export class SocketClient {
	private socket!: WebSocket;
	private jwt: string;
	private listeners: { [key: string]: Array<(data: object) => void> } = {};

	constructor(jwt: string) {
		this.jwt = jwt;
	}

	async setupSocket(reconnectInterval?: NodeJS.Timeout): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			console.log('Setting up socket');
			this.socket = new WebSocket('ws://localhost:3000/ws', this.jwt);

			// message is received
			this.socket.addEventListener('message', (event) => {
				// console.log('Received message', event.data);
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
			this.socket.addEventListener('open', (event) => {
				if (reconnectInterval) {
					clearInterval(reconnectInterval);
					console.log('Reconnected to server');
				} else {
					console.log('Connected to server');
				}

				resolve();
			});

			// socket closed
			this.socket.addEventListener('close', (event) => {
				console.log('Disconnected from server', event.code);

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
				let count = 0;
				const interval = setInterval(() => {
					if (count === 3) {
						clearInterval(interval);
					} else {
						this.setupSocket(interval);
						count++;
					}
				}, 5000);
			});

			// error handler
			this.socket.addEventListener('error', (event) => {
				console.log('Error occurred', event);
				reject();
			});
		});
	}

	createGame(time: number, players: string[]) {
		// request to create game
		this.socket.send(
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

	startTimer() {
		// request to start timer
		this.sendMessage(
			JSON.stringify({
				updateType: 'START_TIME',
				data: {}
			})
		);
	}

	async selectLetter(letter: string, index: number, row: number, col: number): Promise<boolean> {
		return new Promise<boolean>((resolve, reject) => {
			const listenerIdx = this.onMessage((data: object) => {
				const message = JSON.parse((data as CustomEvent).detail.message);
				if (message.updateType === 'LETTER_SELECT') {
					// console.log('Received response from server', message);
					resolve(!!message.data.validWord);

					// remove listener
					this.removeListenerByIdx(listenerIdx);
				}
			});

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

	onMessage(callback: (data: object) => void): number {
		this.listeners['message'] = this.listeners['message'] || [];
		this.listeners['message'].push(callback);

		return this.listeners['message'].length - 1;
	}

	removeListener(callback: (data: object) => void) {
		this.listeners['message'] = this.listeners['message'] || [];
		const index = this.listeners['message'].indexOf(callback);
		if (index !== -1) {
			this.listeners['message'].splice(index, 1);
		}
	}

	removeListenerByIdx(index: number) {
		this.listeners['message'] = this.listeners['message'] || [];
		if (index < this.listeners['message'].length) {
			this.listeners['message'].splice(index, 1);
		}
	}

	sendMessage(message: string) {
		// console.log('Sending message', message);
		this.socket.send(message);
	}

	disconnect() {
		this.socket.close();
	}
}
