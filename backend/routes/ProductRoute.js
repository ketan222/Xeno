import express from "express";
import { syncProducts } from "../controller/productController.js";
import { protect } from "../controller/userController.js";
const router = express.Router();

router.get("/status", (req, res) => {
  //   console.log(req.app.locals.db);
  res.status(200).json({ status: "products route ok" });
});

router.post("/syncProducts", protect, syncProducts);
export default router;
