import Message from "../models/message.js";
import Chat from "../models/chat.js";
import User from "../models/user.js";

export const sendMessage = async (req, res) => {
    try {
        const { content, chatId } = req.body;
        if (!content || !chatId) {
            res.status(400).json({
                success: false,
                message: "please fill all the given fields",
            });

            return;
        }

        let newMessage = await Message.create({
            sender: req.user,
            content: content,
            chatId: chatId,
        });

        let message = await Message.findOne({ _id: newMessage._id })
            .populate("sender", "-password")
            .populate("chatId")

        message = await User.populate(message, {
            path: "chatId.users",
            select: "name email pic"
        });


        await Chat.findByIdAndUpdate(chatId, { latestMessage: message._id });

        res.status(200).json({
            success: true,
            message: "sending message successfully",
            msg: message
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occur while sending message",
        });
    }
}

export const getMessage = async (req, res) => {
    try {
        const chatId = req.params.id;
        if (!chatId) {
            res.status(400).json({
                success: false,
                message: "please fill all the given fields",
            });

            return;
        }

        let message = await Message.find({ chatId })
            .populate("sender", "-password")
            .populate("chatId")

        res.status(200).json({
            success: true,
            message: "getting message successfully",
            msg: message
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occur while getting message",
        });
    }
}