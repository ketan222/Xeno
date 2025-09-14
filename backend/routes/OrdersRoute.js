import express from "express";
import {
  syncOrders,
  getOrders,
  getByDate,
} from "../controller/orderController.js";
import { protect } from "../controller/userController.js";
const router = express.Router();

// Status route
router.get("/status", (req, res) => {
  res.status(200).json({ status: "orders route ok" });
});

// Inserting and updating the orders
// router.post("/syncOrders", protect, syncOrders);

// Fetching all the orders
// router.get("/getOrders", protect, syncOrders, getOrders);
router.get("/getOrders", protect, getOrders);

// Fetching all the order between 2 dates
router.post("/getByDate", protect, getByDate);

export default router;
