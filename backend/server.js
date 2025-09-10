import app from "./App.js"; // lowercase for convention
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const PORT = process.env.PORT || 8000;

async function startServer() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err);
  }
}

startServer();
