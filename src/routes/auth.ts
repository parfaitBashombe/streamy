import express, { Router } from "express";
import { register } from "../controllers/auth.js";

const router: Router = express.Router();

router.post("/register", register);

export default router;
