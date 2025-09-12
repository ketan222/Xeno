import express from "express";
import { syncCustomers } from "../controller/customersController.js";
import { protect } from "../controller/userController.js";
const router = express.Router();

router.get("/status", (req, res) => {
  //   console.log(req.app.locals.db);
  res.status(200).json({ status: "OK" });
});

router.post("/syncCustomers", protect, syncCustomers);

export default router;
