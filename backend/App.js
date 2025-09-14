import express from "express";
import cookieParser from "cookie-parser";
import AuthRoute from "./routes/AuthRoute.js";
import CustomerRoute from "./routes/CustomerRoute.js";
import OrdersRoute from "./routes/OrdersRoute.js";
import ProductRoute from "./routes/ProductRoute.js";
import WebhookRoute from "./routes/webhooks.js";
import cors from "cors";
import { sendOTP } from "./mail.js";

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

app.use(
  cors({
    origin: `${process.env.FRONTEND}`, // Vite dev server
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use("/api/auth", AuthRoute);
app.use("/api/customer", CustomerRoute);
app.use("/api/orders", OrdersRoute);
app.use("/api/products", ProductRoute);
app.use("/webhooks", WebhookRoute); // <-- mount webhook route
app.post("/sendMail", async (req, res) => {
  try {
    const email = req.body.email;
    const otp = await sendOTP(email);
    res.status(200).json({ otp });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

export default app;
