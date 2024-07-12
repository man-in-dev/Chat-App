import express from "express";
import { getMessage, sendMessage } from "../controllers/message.js";
import { authenticate } from "../middlewares/authentication.js";

const router = express.Router();

router.route("/").post(authenticate, sendMessage);
router.route("/:id").get(authenticate, getMessage);

export default router;