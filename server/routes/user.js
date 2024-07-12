import express from "express";
import { signin, signup, users } from "../controllers/user.js";
import { authenticate } from "../middlewares/authentication.js";

const router = express.Router();

router.route("/signup").post(signup)
router.route("/signin").post(signin)
router.route("/").get(authenticate, users)

export default router;