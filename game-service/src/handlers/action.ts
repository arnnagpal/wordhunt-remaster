import { ActiveGame, Game } from "wordhunt-utils";
import {
    createGame,
    getActiveGame,
    getRoomName,
    socketToGame,
} from "../game/game";
import { WebSocketUser } from "../socket";
import { LiveGamePlayer } from "wordhunt-utils/src/types/game-player";
import { generateIdFromEntropySize } from "lucia";
import { createBoard } from "../game/board";
import Elysia from "elysia";

export async function handleAction(server: Elysia, ws: any, message: any) {
    const userData = ws.data.store as WebSocketUser;
    const data = message;
    if (data.action) {
        switch (data.action) {
            case "CREATE": {
                // handle create game
                const gameData = data.data;

                const id = generateIdFromEntropySize(10);
                const time = gameData.time;
                const players: LiveGamePlayer[] = [];

                const playerIds = gameData.players as string[];
                for (let i in playerIds) {
                    players.push({
                        id: playerIds[i],
                        username: userData.username,
                        words: [],
                        score: 0,

                        game_id: id,
                        letters_selected: [],
                        time_left: time,
                    } as LiveGamePlayer);
                }

                const singlePlayer = players.length === 1 || time === -1;
                const board = await createBoard(4);

                const game = createGame({
                    _id: id,
                    session_type: 0,
                    players: players,
                    board: board.toJSON(),
                    timer: time,
                    created_at: Date.now(),
                    single_player: singlePlayer,
                } as ActiveGame);

                ws.send(
                    JSON.stringify({
                        action: data.action,
                        data: {
                            game_id: game._id,
                        },
                    })
                );
                break;
            }

            case "JOIN": {
                // handle join game
                const roomName = getRoomName(data.gameId, userData.id);
                ws.subscribe(roomName);
                const game = getActiveGame(data.gameId) as
                    | ActiveGame
                    | undefined;
                if (!game) {
                    console.log("Game not found");
                    return;
                }

                const player = game.players.find(
                    (player) => player.id === userData.id
                ) as LiveGamePlayer;

                socketToGame.set(ws.id, {
                    room: roomName,
                    playerIdx: game.players.findIndex(
                        (player) => player.id === userData.id
                    ),
                    game: game,
                });

                // update timer on client
                server.server?.publish(
                    roomName,
                    JSON.stringify({
                        updateType: "UPDATE_TIME",
                        data: {
                            time_left: player.time_left,
                        },
                    })
                );

                break;
            }
            default:
                console.log("Unknown action");
        }
    }
}
