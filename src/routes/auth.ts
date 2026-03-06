import express, { Router } from "express";
import {
  login,
  logout,
  refreshAccessToken,
  register,
} from "../controllers/auth.js";
import { validate } from "../middleware/validate-request.js";
import { loginSchema, registerSchema } from "../schemas/auth.js";
import { authMiddleware } from "../middleware/auth.js";

const router: Router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh", refreshAccessToken);
router.post("/logout", authMiddleware, logout);

export default router;
