import { ActiveGame, Game, GamePreset } from "wordhunt-utils";
import {
    createGame,
    getActiveGame,
    getRoomName,
    socketToGame,
} from "../game/game";
import { connectedUsers, WebSocketUser } from "../socket";
import { LiveGamePlayer } from "wordhunt-utils/src/types/game-player";
import { generateIdFromEntropySize } from "lucia";
import { createBoard } from "wordhunt-utils/src/dictionary/board";
import Elysia from "elysia";
import { find_match, remove_from_queue } from "../game/matchmaking";

export async function handleAction(server: Elysia, ws: any, message: any) {
    const userData = ws.data.store as WebSocketUser;
    const data = message;
    if (data.action) {
        switch (data.action) {
            case "CREATE": {
                // handle create game
                await createNewGame(data);
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

                socketToGame.set(player.id, {
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

            case "QUEUE": {
                // handle queue game

                try {
                    await find_match(userData);
                } catch (e) {
                    console.log(e);

                    ws.send(
                        JSON.stringify({
                            action: "QUEUE",
                            data: {
                                error: "No opponent found",
                            },
                        })
                    );

                    return;
                }

                break;
            }

            case "CANCEL_QUEUE": {
                // handle cancel queue
                remove_from_queue(userData);

                ws.send(JSON.stringify({ action: "CANCEL_QUEUE" }));
                break;
            }
            default:
                console.log("Unknown action");
        }
    }
}

export async function createNewGame(data: any) {
    const gameData = data.data;

    const id = generateIdFromEntropySize(10);
    const time = gameData.time;
    const players: LiveGamePlayer[] = [];

    const playerIds = gameData.players as string[];

    let users = [];
    for (let i = 0; i < playerIds.length; i++) {
        console.log("Finding user", playerIds[i]);

        const userData = connectedUsers[playerIds[i]];

        console.log(userData);
        if (!userData) {
            console.log("User not found", playerIds[i]);
            return;
        }

        users.push(userData);
    }

    for (let i = 0; i < users.length; i++) {
        const userData = users[i];
        if (!userData) {
            console.log("User not found");
            return;
        }

        console.log("Creating game for", userData.username);

        players.push({
            id: userData.id,
            username: userData.username,
            words: [],
            score: 0,

            game_id: id,
            letters_selected: [],
            time_left: time,
        } as LiveGamePlayer);
    }

    const singlePlayer = players.length === 1 || time === -1;
    const board = createBoard(4);

    const game = createGame({
        _id: id,
        session_type: 0,
        players: players,
        board: board.toJSON(),
        timer: time,
        created_at: Date.now(),
        single_player: singlePlayer,
    } as ActiveGame);

    for (let i = 0; i < users.length; i++) {
        const ws = users[i] as any;

        if (!ws) {
            console.log("Websocket not found");
            continue;
        }

        console.log("Pushing game", game._id, "to", ws.data.store.username);

        ws.send(
            JSON.stringify({
                action: data.action,
                data: {
                    game_id: game._id,
                },
            })
        );
    }
}
