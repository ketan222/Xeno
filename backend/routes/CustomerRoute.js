import express from "express";
import {
  syncCustomers,
  getCustomers,
  getTop5CustomersByMoneySpent,
} from "../controller/customersController.js";
import { protect } from "../controller/userController.js";
const router = express.Router();

// status route
router.get("/status", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// // Inserting and Updating the customers
// router.post("/syncCustomers", protect, syncCustomers);

// route for fetching all the customers that have placed order with current tenant
router.get("/getCustomers", protect, getCustomers);

// route for fetching the top 5 customers by money spending
router.get(
  "/getTop5CustomersByMoneySpent",
  protect,
  getTop5CustomersByMoneySpent
);
export default router;
