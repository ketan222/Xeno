import express from "express";
import {
  signup,
  login,
  protect,
  summary,
} from "../controller/userController.js";
const router = express.Router();
import { syncProducts } from "../controller/productController.js";
import { syncOrders } from "../controller/orderController.js";
import { syncCustomers } from "../controller/customersController.js";

// status route
router.get("/status", (req, res) => {
  // console.log(req.app.locals.db);
  res.status(200).json({ status: "OK" });
});

// Sign Up route
router.post("/signup", signup);

// Login route
router.post("/login", login);

// tenant summary route
router.get(
  "/summary",
  protect,
  syncProducts,
  syncCustomers,
  syncOrders,
  summary
);

export default router;
