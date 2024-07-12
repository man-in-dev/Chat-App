import express from "express";
import dotenv from "dotenv";
import colors from "colors"
import cors from "cors";
import { createServer } from "http"
import { Server } from "socket.io";

//importing routes
import userRoute from "./routes/user.js";
import chatRoute from "./routes/chat.js";
import messageRoute from "./routes/message.js";
import connectDb from "./db/index.js";

// configure dotenv
dotenv.config();

//connect to database
connectDb()

//initialise express app
const app = express();

//socket io setup
const server = createServer(app);
const io = new Server(server, {
    pingTimeout: 60000
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`server is running at PORT ${PORT}`.yellow.bold)
});


//middlewares
app.use(express.json());
app.use(cors());

//routing
app.use("/api/v1/user", userRoute);
app.use("/api/v1/chat", chatRoute);
app.use("/api/v1/message", messageRoute);

//socket io
io.on("connection", (socket) => {

    socket.on("setup", (user) => {
        socket.join(user);
        socket.emit("connected")
    });

    socket.on("join chat", (chatRoom) => {
        socket.join(chatRoom);
    });

    socket.on("new Message", (newMessageReceived) => {
        let chat = newMessageReceived?.chatId;

        chat?.users?.forEach((user) => {
            if (user._id === newMessageReceived.sender._id) return;

            socket.in(user._id).emit("message Received", newMessageReceived);
        })
    });

    socket.on("typing", (chatRoom) => {
        socket.in(chatRoom).emit("typing")
    });

    socket.on("stop typing", (chatRoom) => {
        socket.in(chatRoom).emit("stop typing")
    })
})