import express from "express";
import { syncOrders } from "../controller/orderController.js";

const router = express.Router();

router.get("/status", (req, res) => {
  //   console.log(req.app.locals.db);
  res.status(200).json({ status: "orders route ok" });
});

router.post("/syncOrders", syncOrders);

export default router;
