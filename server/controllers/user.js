import User from "../models/user.js"
import { generateToken } from "../helper/token.js";

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: "please fill all the given fields"
            });

            return;
        }

        const userExist = await User.findOne({ email });
        if (userExist) {
            res.status(400).json({
                success: false,
                message: "user already exist"
            });

            return;
        }

        const user = await User.create({
            name,
            email,
            password
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: "signedUp successfully",
            user,
            token
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occur while signUp",
        })
    }
}

export const signin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "please fill all the given fields"
            });

            return;
        }

        const userExist = await User.findOne({ email });
        if (!userExist) {
            res.status(400).json({
                success: false,
                message: "invalid email or password"
            });

            return;
        }

        const matchPassword = await userExist.comparePassword(password);
        if (!matchPassword) {
            res.status(400).json({
                success: false,
                message: "invalid email or password"
            });

            return;
        }

        const token = generateToken(userExist._id);

        res.status(200).json({
            success: true,
            message: "signIn successfully",
            user: userExist,
            token
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error occur while signIn",
        })
    }
}

export const users = async (req, res) => {
    try {
        const search = req.query.search || "";
        const users = await User.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ]
        }).find({ _id: { $ne: req.user } });

        res.status(200).json({
            success: true,
            message: "getting users successfully",
            users
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "error while getting users",
        })
    }
}