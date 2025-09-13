import express from "express";
import cookieParser from "cookie-parser";
import AuthRoute from "./routes/AuthRoute.js";
import CustomerRoute from "./routes/CustomerRoute.js";
import OrdersRoute from "./routes/OrdersRoute.js";
import ProductRoute from "./routes/ProductRoute.js";
import WebhookRoute from "./routes/webhooks.js"; // <-- add this

const app = express();

// For webhooks: raw body is needed for HMAC verification
app.use(
  "/webhooks",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    req.rawBody = req.body; // for HMAC
    try {
      req.body = JSON.parse(req.body.toString("utf8")); // <-- parse the buffer
    } catch (err) {
      return res.status(400).send("Invalid JSON");
    }
    next();
  }
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRoute);
app.use("/api/customer", CustomerRoute);
app.use("/api/orders", OrdersRoute);
app.use("/api/products", ProductRoute);
app.use("/webhooks", WebhookRoute); // <-- mount webhook route

export default app;
