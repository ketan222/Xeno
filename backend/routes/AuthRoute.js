import express from "express";
import {
  signup,
  login,
  protect,
  summary,
} from "../controller/userController.js";
const router = express.Router();

// status route
router.get("/status", (req, res) => {
  console.log(req.app.locals.db);
  res.status(200).json({ status: "OK" });
});

// Sign Up route
router.post("/signup", signup);

// Login route
router.post("/login", protect, login);

// tenant summary route
router.get("/summary", protect, summary);

export default router;
