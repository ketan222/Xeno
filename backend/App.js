import express from "express";
import cookieParser from "cookie-parser";
import AuthRoute from "./routes/AuthRoute.js";
import CustomerRoute from "./routes/CustomerRoute.js";
import OrdersRoute from "./routes/OrdersRoute.js";
import ProductRoute from "./routes/ProductRoute.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRoute);
app.use("/api/customer", CustomerRoute);
app.use("/api/orders", OrdersRoute);
app.use("/api/products", ProductRoute);

export default app;
