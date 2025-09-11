import express from "express";
import { syncCustomers } from "../controller/customersController.js";

const router = express.Router();

router.get("/status", (req, res) => {
  //   console.log(req.app.locals.db);
  res.status(200).json({ status: "OK" });
});

router.post("/syncCustomers", syncCustomers);

export default router;
