import express from "express";
import { accessChat, addToGrp, createGrpChat, fetchChats, removeFromGrp, renameGrpChat } from "../controllers/chat.js";
import { authenticate } from "../middlewares/authentication.js";

const router = express.Router();

router.route("/").post(authenticate, accessChat);
router.route("/").get(authenticate, fetchChats);
router.route("/create-grp").post(authenticate, createGrpChat);
router.route("/rename-grp").put(authenticate, renameGrpChat);
router.route("/add-grp").put(authenticate, addToGrp);
router.route("/remove-grp").put(authenticate, removeFromGrp);

export default router;