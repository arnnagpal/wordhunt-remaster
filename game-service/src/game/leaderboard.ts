import { LeaderboardRecord } from "wordhunt-utils";
import { getGameHistory } from "./game";
import { mongo } from "..";

let leaderboard: {
    [key: string]: LeaderboardRecord;
} = {};

export const updateScore = async (userId: string) => {
    // retrieve the user's recent games
    const recentGames = getGameHistory(userId, {
        last: 5,
        multiplayer: true,
    });

    if (recentGames.length < 5) {
        return;
    }

    let username = "N/A";

    let score = 0;
    for (const game of recentGames) {
        const gamePlayer = game.players.find((player) => player.id === userId);
        if (gamePlayer) {
            username = gamePlayer.username;
            score += gamePlayer.score;
        }
    }

    score /= recentGames.length;

    // update the user's score in the database
    await mongo.Leaderboard.updateOne(
        { _id: userId },
        { $set: { username, score } },
        { upsert: true }
    ).exec();

    // update the leaderboard
    leaderboard[userId] = {
        _id: userId,
        username: username,
        score,
    };
};

export const loadLeaderboard = async () => {
    const records = mongo.Leaderboard.find().sort({ score: -1 }).limit(100);
    leaderboard = {};
    for await (const record of records) {
        leaderboard[record._id] = {
            _id: record._id,
            username: record.username,
            score: record.score,
        };
    }

    return leaderboard;
};

export const reloadLeaderboard = async () => {
    // go through all users and put them in the leaderboard
    const users = await mongo.User.find({}).select("_id username games").exec();

    if (!users) {
        return;
    }

    if (users.length === 0) {
        return;
    }

    for (let i = 0; i < users.length; i++) {
        const user = users[i];
        if (user.games.length < 5) {
            continue;
        }

        await updateScore(user._id);
        console.log(`Updated user ${user.username}, ${i + 1}/${users.length}`);
    }
};

export const getUserScore = (userId: string) => {
    return leaderboard[userId]?.score || 0;
};

export const getLeaders = (count: number) => {
    // get values from the leaderboard
    let values = Object.values(leaderboard);
    // sort the values

    values = values.map((value, _index) => ({
        _id: value._id,
        username: value.username,
        score: Math.round(value.score),
    }));

    console.log(values);

    values.sort((a, b) => b.score - a.score);

    return values.slice(0, count);
};
