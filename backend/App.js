import express from "express";
import AuthRoute from "./routes/AuthRoute.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", AuthRoute);
// app.use("/api/auth", AuthRoute);

export default app;
