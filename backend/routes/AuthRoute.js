import express from "express";
import { signup, login, protect } from "../controller/userController.js";
const router = express.Router();

router.get("/status", (req, res) => {
  console.log(req.app.locals.db);
  res.status(200).json({ status: "OK" });
});

router.post("/signup", signup);

router.post("/login", protect, login);

// router.post("/signup", (req, res) => {

// }

export default router;
