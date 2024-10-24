import { Message, MongoMessage } from "wordhunt-utils/src/types/message";
import { mongo } from "..";
import { getUserScore } from "./leaderboard";
import mongoose from "mongoose";

let messages: MongoMessage[] = [];

export async function loadMessages() {
    // fetch messages from mongo
    messages = await mongo.Chat.find({})
        .sort({ created_at: -1 })
        .limit(50)
        .exec();

    console.log("Loaded " + messages.length + " messages");
}

export async function getMessages(last: number) {
    return messages.slice(0, last);
}

export async function addMessage(server: any, message: any) {
    const newMessage = new mongo.Chat({
        _id: new mongoose.Types.ObjectId(),
        user_id: message.user_id,
        username: message.username,
        message: message.message,
        created_at: Date.now(),
    });

    newMessage.save();

    messages.unshift(newMessage);

    if (messages.length > 50) {
        messages.pop();
    }

    const publishMessage: Message = {
        username: newMessage.username,
        message: newMessage.message,
        created_at: newMessage.created_at,
        avg_score: getUserScore(message.user_id),
    };

    server.server?.publish(
        "chat",
        JSON.stringify({
            action: "MESSAGE",
            data: {
                ...publishMessage,
            },
        })
    );
}
