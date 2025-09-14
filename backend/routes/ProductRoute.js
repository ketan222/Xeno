import express from "express";
import { syncProducts, getProducts } from "../controller/productController.js";
import { protect } from "../controller/userController.js";
const router = express.Router();

// Status Route
router.get("/status", (req, res) => {
  //   console.log(req.app.locals.db);
  res.status(200).json({ status: "products route ok" });
});

// Inserting and updating the products
// router.post("/syncProducts", protect, syncProducts);

// Fetching all the products
router.get("/getProducts", protect, getProducts);

export default router;
