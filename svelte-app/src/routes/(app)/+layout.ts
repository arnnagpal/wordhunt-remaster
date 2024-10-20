// import { SocketClient } from '$lib/socket';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load: LayoutLoad = (req) => {
	const { url } = req;
	const { pathname } = url;

	// if (data.session) {
	// 	// connect to the websocket
	// 	const socket = new SocketClient(data.session.jwt);

	// 	return {
	// 		pathname,
	// 		socket: socket
	// 	};
	// }

	return {
		pathname
	};
};
