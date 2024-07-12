import Chat from "../models/chat.js"
import User from "../models/user.js"

export const accessChat = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            res.status(400).json({
                success: false,
                message: "please fill all the given fields"
            });

            return;
        }

        let chat = await Chat.findOne({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user } } },
                { users: { $elemMatch: { $eq: userId } } },
            ],
        })
            .populate("users", "-password")
            .populate("latestMessage");

        chat = await User.populate(chat, {
            path: "latestMessage.sender",
            select: "name email pic"
        })

        if (chat) {
            res.status(200).json({
                success: true,
                message: "fetch chat successfully",
                chat
            });
        } else {
            const newChat = await Chat.create({
                name: "sender",
                isGroupChat: false,
                users: [userId, req.user]
            });

            let chat = await Chat.findOne({ _id: newChat._id })
                .populate("users", "-password")

            res.status(200).json({
                success: true,
                message: "access chat successfully",
                chat
            });
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: "error occur while accessing chat",
        });
    }
}

export const fetchChats = async (req, res) => {
    try {
        let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 });

        chats = await User.populate(chats, {
            path: "latestMessage.sender",
            select: "name email pic"
        });

        res.status(200).json({
            success: true,
            message: "fetch chats successfully",
            chats
        });

    } catch (error) {
        console.log(error.message)
        res.status(500).json({
            success: false,
            message: "error occur while fetching chats",
        });
    }
}

export const createGrpChat = async (req, res) => {
    try {
        const { name, users } = req.body;
        if (!name || !users.length) {
            res.status(400).json({
                success: false,
                message: "please fill all the given fields",
            });

            return;
        }

        let parsedUser = JSON.parse(users);

        if (parsedUser.length < 2) {
            res.status(400).json({
                success: false,
                message: "More than or equal to two users required",
            });

            return;
        }

        parsedUser.push(req.user);

        let grpChat = await Chat.create({
            name: name,
            isGroupChat: true,
            users: parsedUser,
            groupAdmin: req.user
        });

        let chat = await Chat.findOne({ _id: grpChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")

        res.status(200).json({
            success: true,
            message: "Creating group chat successfully",
            chat
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occur while creating group chat",
        });
    }
}

export const renameGrpChat = async (req, res) => {
    try {
        const { name, chatId } = req.body;
        if (!name || !chatId) {
            res.status(400).json({
                success: false,
                message: "please fill all the given fields",
            });

            return;
        }

        let chat = await Chat.findByIdAndUpdate(chatId, { name }, { new: true })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage");

        chat = await User.populate(chat, {
            path: "latestMessage.sender",
            select: "name email pic"
        })

        res.status(200).json({
            success: true,
            message: "renaming group chat successfully",
            chat
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occur while renaming group chat",
        });
    }
}

export const addToGrp = async (req, res) => {
    try {
        const { userId, chatId } = req.body;
        if (!userId || !chatId) {
            res.status(400).json({
                success: false,
                message: "please fill all the given fields",
            });

            return;
        }

        let chat = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage");

        chat = await User.populate(chat, {
            path: "latestMessage.sender",
            select: "name email pic"
        })

        res.status(200).json({
            success: true,
            message: "user added to group successfully",
            chat
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occur while adding user in group",
        });
    }
}

export const removeFromGrp = async (req, res) => {
    try {
        const { userId, chatId } = req.body;
        if (!userId || !chatId) {
            res.status(400).json({
                success: false,
                message: "please fill all the given fields",
            });

            return;
        }

        let chat = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage");

        chat = await User.populate(chat, {
            path: "latestMessage.sender",
            select: "name email pic"
        })

        res.status(200).json({
            success: true,
            message: "user removed from group successfully",
            chat
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occur while removing user from group",
        });
    }
}