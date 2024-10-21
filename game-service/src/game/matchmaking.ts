import { setInterval as setIntervalPromise } from "node:timers/promises";
import { setInterval } from "node:timers";
import { getGameHistory } from "./game";
import { connectedUsers, WebSocketUser } from "../socket";
import { Game, GamePreset } from "wordhunt-utils";
import { createNewGame } from "../handlers/action";

let in_queue: WebSocketUser[] = [];

let match_queue: WebSocketUser[][] = [];

const check_per_second = 2;

export const setupMatchmaking = () => {
    setInterval(async () => {
        for (let i = 0; i < match_queue.length; i++) {
            let match = match_queue[i];
            console.log(
                "Creating game for",
                match[0].username,
                "and",
                match[1].username
            );
            // create game
            createNewGame({
                action: "CREATE",
                data: {
                    time: GamePreset.Classic,
                    players: [match[0].id, match[1].id],
                },
            });

            // remove from match queue
            match_queue = match_queue.filter((m) => m !== match);
        }
    }, 1000 / check_per_second);
};

export const findMatch = async (user: WebSocketUser): Promise<void> => {
    return new Promise(async (resolve, reject) => {
        if (in_queue.find((u) => u.id === user.id)) {
            return reject("User already in queue");
        }

        let score_threshold = 3;
        let last_threshold_change = Date.now();
        let matches = getGameHistory(user.id);

        in_queue.push(user);
        console.log("Finding match for", user.username);

        for await (const _ of setIntervalPromise(1000 / check_per_second)) {
            // double check if user is still in queue
            if (!in_queue.find((u) => u.id === user.id)) {
                break;
            }

            for (let i = 0; i < in_queue.length; i++) {
                let queue_user = in_queue[i];
                if (queue_user.id === user.id) {
                    continue;
                }

                let queue_matches = getGameHistory(queue_user.id);
                let score = 0;

                score += Math.abs(queue_user.rating - user.rating) * 0.5;
                console.log("Rating difference", score);

                // check if they have matched before recently
                for (let match of matches) {
                    if (queue_matches.includes(match)) {
                        score += 1;
                        console.log("Matched before", score);
                    }
                }

                console.log(
                    "Final score",
                    score,
                    "for",
                    queue_user.username,
                    "-- threshold",
                    score_threshold
                );

                if (score < score_threshold) {
                    // found a match, queue game creation
                    console.log(
                        "Found match for",
                        user.username,
                        "and",
                        queue_user.username
                    );
                    in_queue = in_queue.filter((u) => u.id !== user.id);
                    in_queue = in_queue.filter((u) => u.id !== queue_user.id);

                    if (match_queue.find((m) => m.includes(user))) {
                        match_queue = match_queue.filter((m) =>
                            m.includes(user)
                        );
                    }

                    match_queue.push([user, queue_user]);
                    return resolve();
                }
            }

            if (Date.now() - last_threshold_change > 1000 * 3) {
                // increase threshold after 3 seconds
                score_threshold += 1;
                console.log("Increasing threshold to", score_threshold);
                last_threshold_change = Date.now();
            }
        }

        return reject("No match found");
    });
};

export const addToQueue = (user: WebSocketUser) => {
    in_queue.push(user);
};

export const removeFromQueue = (user: WebSocketUser) => {
    in_queue = in_queue.filter((u) => u.id !== user.id);
};

export const getQueue = () => {
    return in_queue;
};

export const getQueueSize = () => {
    return in_queue.length;
};
