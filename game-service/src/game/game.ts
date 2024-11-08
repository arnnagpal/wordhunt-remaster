import { ActiveGame, Board, Game, GamePreset } from "wordhunt-utils";
import { mongo } from "..";
import {
    GamePlayer,
    LiveGamePlayer,
} from "wordhunt-utils/src/types/game-player";
import { playersToDailyGame, reportScore } from "./daily";

const finishedGames: Game[] = [];
const activeGames: ActiveGame[] = [];

export const socketToGame = new Map<
    string,
    { room: string; playerIdx: number; game: ActiveGame }
>();

export const getAllGamesLength = () =>
    activeGames.length + finishedGames.length;
export const getOngoingGames = () => activeGames;
export const getActiveGame = (id: string) =>
    activeGames.find((game) => game._id === id);

export const getRoomName = (gameId: string, userId: string) =>
    `game:${gameId}:${userId}`;

export const getGame = (id: string): Game | ActiveGame | undefined => {
    let game = getActiveGame(id);
    if (game) {
        return game;
    }

    return finishedGames.find((game) => game._id === id);
};

export const loadGameHistory = async () => {
    const mongoGames = await mongo.Game.find().exec();

    // clear games array
    finishedGames.splice(0, finishedGames.length);

    // clear active games array
    activeGames.splice(0, activeGames.length);

    for await (const game of mongoGames) {
        let g = game;
        if (await fixGame(game.id)) {
            const temp = await mongo.Game.findOne({ _id: game._id }).exec();
            if (temp) {
                g = temp;
            }
        }
        if (g.session_type === 1) {
            finishedGames.push({
                _id: g._id,
                session_type: g.session_type,
                players: g.players as LiveGamePlayer[],
                winner: g.winner,
                board: g.board,
                timer: g.timer,
                created_at: g.created_at,
                ended_at: g.ended_at,
                single_player: g.single_player,
            });
        } else {
            activeGames.push({
                _id: g._id,
                session_type: g.session_type,
                players: g.players as LiveGamePlayer[],
                board: g.board,
                timer: g.timer,
                created_at: g.created_at,
                single_player: g.single_player,
            });
        }
    }

    console.log("Loaded games", finishedGames.length, activeGames.length);
};

export const saveGameHistory = async () => {
    for (const game of finishedGames) {
        await saveGame(game);
    }

    for (const game of activeGames) {
        await saveGame(game);
    }
};

export const fixGame = async (gameId: string) => {
    // pull document from mongo
    const game = await mongo.Game.findOne({ _id: gameId }).exec();
    // check if exists
    if (!game) {
        return;
    }

    // now check for corrupt parameters: no winner property, and no username properties on all the players
    let fixed = false;
    // checking players first
    let players = game.players as LiveGamePlayer[];
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        if (!player.username) {
            console.log(
                "Fixing game param: username missing for " +
                    player.id +
                    " in game " +
                    gameId
            );
            const user = await mongo.User.findOne({ _id: player.id }).exec();
            if (user) {
                player.username = user.username;

                fixed = true;
            }
        }
    }

    // checking winner
    if (!game.winner && (game.ended_at || game.session_type === 1)) {
        console.log("Fixing game param: winner missing for " + gameId);
        // find winner
        // check for tie first
        let tie = true;
        for (let i = 0; i < players.length; i++) {
            if (players[i].score !== players[0].score) {
                tie = false;
                break;
            }
        }

        let winner = "-";

        if (!tie) {
            let maxScore = 0;
            for (let i = 0; i < players.length; i++) {
                if (players[i].score > maxScore) {
                    maxScore = players[i].score;
                    winner = players[i].username;
                }
            }
        }

        game.winner = winner;
        fixed = true;
    }

    if (fixed) {
        console.log("Fixed game", gameId);
        await mongo.Game.updateOne(
            { _id: gameId },
            {
                players: players,
                winner: game.winner,
            }
        );
    }

    return fixed;
};

export const saveGame = async (game: Game | ActiveGame) => {
    // console.log("saveGame", JSON.stringify(game.players));

    if (game.session_type === 1) {
        console.log("Saving finished game", game._id);
        game = game as Game;
        await mongo.Game.updateOne(
            { _id: game._id },
            {
                session_type: game.session_type,
                players: game.players,
                winner: game.winner,
                board: game.board,
                timer: game.timer,
                created_at: game.created_at,
                ended_at: game.ended_at,
                single_player: game.single_player,
            },
            { upsert: true }
        );
        return;
    }

    await mongo.Game.updateOne(
        { _id: game._id },
        {
            session_type: game.session_type,
            players: game.players as LiveGamePlayer[],
            board: game.board,
            timer: game.timer,
            created_at: game.created_at,
            single_player: game.single_player,
        },
        { upsert: true }
    );

    for (let i = 0; i < game.players.length; i++) {
        const player = game.players[i];
        const user = await mongo.User.findOne({ _id: player.id }).exec();
        if (!user) {
            continue;
        }

        const games = user?.games;

        if (games.find((g) => g === game._id)) {
            continue;
        }

        games.push(game._id);

        await mongo.User.updateOne(
            { _id: player.id },
            {
                games: games,
            }
        );
    }
};

export const createGame = (game: ActiveGame) => {
    console.log("Creating game", game._id);

    activeGames.push(game);

    saveGame(game); // push game to mongo async

    return game;
};

export const getGameHistory = (
    userId: string,
    opts: {
        last: number;
        multiplayer?: boolean;
    }
) => {
    const userGames = finishedGames.filter((game) =>
        game.players.some((player) => player.id === userId)
    );

    if (opts.multiplayer) {
        return userGames
            .filter((game) => game.players.length > 1)
            .slice(0, opts.last);
    }

    return userGames.slice(0, opts.last);
};

export const finishGame = (game: ActiveGame, winner: string) => {
    console.log("Finishing game", game._id);

    let finishedG = {
        ...game,
        winner: winner,
        ended_at: Date.now(),
    } as any;

    let winnerPlayer: GamePlayer | null = null;

    finishedG.session_type = 1;

    for (const player of finishedG.players) {
        delete player.game_id;
        delete player.letters_selected;
        delete player.time_left;

        if (player.username === winner) {
            winnerPlayer = player;
        }
    }

    finishedG.players = finishedG.players as GamePlayer[];

    finishedG = finishedG as Game;

    activeGames.splice(activeGames.indexOf(game), 1);
    finishedGames.push(finishedG);

    if (winnerPlayer && playersToDailyGame.has(winnerPlayer.id)) {
        playersToDailyGame.delete(winnerPlayer.id);
        reportScore(winnerPlayer);
    }

    saveGame(finishedG); // push game to mongo async
};
