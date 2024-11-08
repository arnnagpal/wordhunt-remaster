import { ActiveGame, Board, UpdateType } from "wordhunt-utils";
import { WebSocketUser } from "../socket";
import { finishGame, getRoomName, socketToGame } from "../game/game";
import {
    GamePlayer,
    LiveGamePlayer,
} from "wordhunt-utils/src/types/game-player";
import { dictionary } from "wordhunt-utils/src/dictionary/dictionary";
import { getPoints } from "wordhunt-utils/src/utils";
import Elysia from "elysia";
import { updateScore } from "../game/leaderboard";

export const timerMap = new Map<string, Timer>();

export async function broadcastWinCondition(
    game: ActiveGame,
    server: Elysia,
    userPlayer: LiveGamePlayer,
    userData: WebSocketUser
) {
    // check if all players have finished
    let allFinished = true;
    for (const player of game.players) {
        if (player.time_left > 0) {
            allFinished = false;
            break;
        }
    }

    if (!allFinished) {
        // publish to all players' rooms
        for (const player of game.players) {
            server.server?.publish(
                getRoomName(game._id, player.id),
                JSON.stringify({
                    updateType: "END_GAME",
                    data: {
                        status: "WAITING_FOR_PLAYERS",
                        finisher: {
                            username: userData.username,
                            id: userData.id,
                            words: userPlayer.words,
                            score: userPlayer.score,
                        } as GamePlayer,
                        players: game.players
                            .filter((p) => p.time_left > 0) // only players who haven't finished
                            .map((p) => ({
                                id: p.id,
                            })),
                    },
                })
            );
        }

        return;
    }

    let winner = "";
    let maxScore = -1;

    for (const player of game.players) {
        if (player.score > maxScore) {
            maxScore = player.score;
            winner = player.username;
        }
    }

    // check for tie
    for (const player of game.players) {
        if (player.username !== winner && player.score === maxScore) {
            winner = "-";
            maxScore = player.score;
            break;
        }
    }

    // publish to all players' rooms
    for (const player of game.players) {
        server.server?.publish(
            getRoomName(game._id, player.id),
            JSON.stringify({
                updateType: "END_GAME",
                data: {
                    status: "GAME_OVER",
                    winner: winner,
                    players: JSON.parse(JSON.stringify(game.players)).map(
                        (p: LiveGamePlayer) => ({
                            username: p.username,
                            id: p.id,
                            score: p.score,
                            words: p.words,
                        })
                    ),
                },
            })
        );

        updateScore(player.id);

        socketToGame.delete(player.id);
    }

    // update game to finished
    finishGame(game, winner);
}

export async function handleUpdates(server: Elysia, ws: any, message: any) {
    const userData = ws.data.store as WebSocketUser;
    const data = message;

    const updateType = data.updateType as UpdateType;
    switch (updateType) {
        case "LETTER_SELECT": {
            // handle letter select
            const { row, col, letter, index } = data.data;
            const gameData = socketToGame.get(userData.id);
            if (!gameData) {
                return;
            }

            const { room, game, playerIdx } = gameData;
            const board = Board.fromJSON(game.board);
            const player = game.players[playerIdx] as LiveGamePlayer;

            if (!player) {
                return;
            }

            if (player.time_left <= 0 && player.time_left !== -1) {
                return;
            }

            if (game.session_type === 1) {
                return;
            }

            console.log("Request to select letter", row, col, letter, index);

            // check if the board has the letter
            const x = row;
            const y = col;

            if (x < 0 || x >= board.size || y < 0 || y >= board.size) {
                return;
            }

            const boardLetter = board.get_from_coords(x, y);

            if (boardLetter !== letter) {
                return;
            }

            if (typeof player.letters_selected !== "object") {
                return;
            }

            const lettersSelected: string[] = player.letters_selected;

            // insert the letter at the index using splice
            lettersSelected.splice(index, 0, letter);

            player.letters_selected = lettersSelected;
            break;
        }

        case "SUBMIT_SELEC": {
            // handle submit selection
            const gameData = socketToGame.get(userData.id);
            if (!gameData) {
                return;
            }

            const { game, playerIdx } = gameData;
            const player = game.players[playerIdx] as LiveGamePlayer;

            if (!player) {
                return;
            }

            if (player.time_left <= 0 && player.time_left !== -1) {
                return;
            }

            if (game.session_type === 1) {
                return;
            }

            const words = player.words as string[];

            if (!player.letters_selected) {
                return;
            }

            const letters = player.letters_selected as string[];
            const word = letters.join("");

            console.log(
                "Attempt",
                word,
                getPoints(word),
                player.score,
                word.length
            );

            player.letters_selected = [];

            if (words.find((w) => w === word)) {
                // word already used
                return;
            }

            // check if word is valid
            const wordToCheck = word.toUpperCase();
            const result = dictionary.hasSubString(wordToCheck, true);

            if (result) {
                console.log(words);
                console.log(player);
                words.push(word.toUpperCase());
                player.score += getPoints(word);

                console.log(word, getPoints(word), player.score, word.length);
            }

            player.words = words;
            break;
        }

        case "END_GAME": {
            // handle end game
            const data = socketToGame.get(userData.id);
            if (!data) {
                return;
            }
            const { game, playerIdx } = data;
            const player = game.players[playerIdx] as LiveGamePlayer;

            if (!player) {
                return;
            }

            if (timerMap.has(player.id)) {
                clearInterval(timerMap.get(player.id));
                timerMap.delete(player.id);
            }

            player.time_left = 0;
            broadcastWinCondition(game, server, player, userData);
            break;
        }
        default:
            console.log("Unknown update type");
    }
}
