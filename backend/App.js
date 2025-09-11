import express from "express";
import AuthRoute from "./routes/AuthRoute.js";
import CustomerRoute from "./routes/CustomerRoute.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRoute);
app.use("/api/customer", CustomerRoute);

export default app;
