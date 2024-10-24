import { generateIdFromEntropySize } from "lucia";
import { DailyGame, GamePreset } from "wordhunt-utils/src/types/game";
import { mongo } from "..";
import { createBoard } from "wordhunt-utils/src/dictionary/board";
import { Board, GamePlayer } from "wordhunt-utils";
import { WebSocketUser } from "../socket";
import { createNewGame } from "../handlers/action";

let dailies: DailyGame[] = [];

export const playersToDailyGame = new Map<string, string>();

export const loadDailies = async () => {
    dailies = await mongo.Daily.find({}).exec();

    // sort dailies by ends_at, so the first one is the latest daily
    dailies.sort((a, b) => b.ends_at - a.ends_at);

    console.log("Loaded " + dailies.length + " dailies");
    await checkDaily();

    // create new daily after last one ends
    const currentDaily = getCurrentDaily();
    if (currentDaily) {
        const timeUntilNextDaily = currentDaily.ends_at - Date.now();

        console.log("Next daily in " + timeUntilNextDaily / 1000 + " seconds");

        setTimeout(loadDailies, timeUntilNextDaily);
    }
};

export const createNewDaily = async () => {
    const id = generateIdFromEntropySize(10);

    const board = createBoard(4);

    const newDaily = new mongo.Daily({
        _id: id,
        board: board.toJSON(),
        timer: GamePreset.Classic,
        started_at: Date.now(),
        ends_at: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        participants: [],
    });

    await newDaily.save();

    dailies.unshift(newDaily);
};

// function to check if we need to create a new daily
export const checkDaily = async () => {
    // find the latest daily
    const daily = await mongo.Daily.findOne({}).sort({ ends_at: -1 }).exec();

    if (!daily) {
        console.log("Creating new daily for " + new Date().toDateString());
        await createNewDaily();
        return;
    }

    if (daily.ends_at < Date.now()) {
        console.log("Creating new daily for " + new Date().toDateString());
        await createNewDaily();
        return;
    }

    console.log("Daily is still valid");
};

export const startDailyFor = async (userData: WebSocketUser) => {
    // create a psuedo game
    // add user to the game
    // send the game to the user

    const currentDaily = getCurrentDaily();

    if (!currentDaily) {
        return;
    }

    const id = await createNewGame(
        {
            action: "CREATE",
            data: {
                time: currentDaily.timer,
                players: [userData.id],
            },
        },
        {
            board: Board.fromJSON(currentDaily.board),
        }
    );

    if (!id) {
        console.error("Failed to create daily game for " + userData.id);
        return;
    }

    playersToDailyGame.set(userData.id, id);
};

export const reportScore = async (player: GamePlayer) => {
    const currentDaily = getCurrentDaily();

    if (!currentDaily) {
        return;
    }

    const user = currentDaily.participants.find((p) => p.id === player.id);

    if (!user) {
        currentDaily.participants.push(player);
    } else {
        if (player.score > user.score) {
            user.words = player.words;
        }

        user.score = Math.max(user.score, player.score);
    }

    await mongo.Daily.updateOne(
        { _id: currentDaily._id },
        {
            participants: currentDaily.participants,
        }
    );
};

export const getDailyLeaderboard = async () => {
    const currentDaily = getCurrentDaily();

    if (!currentDaily) {
        return [];
    }

    // sort participants by score
    currentDaily.participants.sort((a, b) => b.score - a.score);

    return currentDaily.participants;
};

export const getCurrentDaily = () => {
    return dailies[0];
};
