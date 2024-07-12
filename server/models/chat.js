import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
    },
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    users: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    latestMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    }
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);