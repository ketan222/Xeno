import express from "express";
import {
  syncOrders,
  getOrders,
  getByDate,
} from "../controller/orderController.js";
import { protect } from "../controller/userController.js";
const router = express.Router();

router.get("/status", (req, res) => {
  //   console.log(req.app.locals.db);
  res.status(200).json({ status: "orders route ok" });
});

router.post("/syncOrders", protect, syncOrders);
router.get("/getOrders", protect, getOrders);
router.post("/getByDate", protect, getByDate);
export default router;
