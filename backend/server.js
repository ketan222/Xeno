import app from "./App.js";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const db = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    app.locals.db = db; // <-- This is where we attach the DB to the app

    console.log("Database connected");

    await db.query(`
    DROP TABLE IF EXISTS orders, customers`);

    console.log("Dropped existing customers table");

    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT NOW(),
        updated_at DATETIME DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Stores table
    await db.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        store_name VARCHAR(255),
        shopify_url VARCHAR(255),
        shopify_token VARCHAR(255),
        created_at DATETIME DEFAULT NOW(),
        updated_at DATETIME DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP
      );
    `);

    // Customers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
      id BIGINT PRIMARY KEY,             -- Shopify customer ID
      email VARCHAR(255),
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      total_spent DECIMAL(10,2) DEFAULT 0,
      orders_count INT DEFAULT 0,
      last_order_id BIGINT,
      phone VARCHAR(50),
      currency VARCHAR(10),
      created_at DATETIME,
      updated_at DATETIME
    );

    `);

    // Products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id BIGINT PRIMARY KEY,
        store_id INT,
        title VARCHAR(255),
        price DECIMAL(10,2),
        inventory_quantity INT,
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
      );
    `);

    // Orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT PRIMARY KEY,
        store_id INT,
        customer_id BIGINT,
        total_price DECIMAL(10,2),
        status VARCHAR(50),
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL
      );
    `);

    app.listen(PORT, () => {
      console.log(`Server running on PORT ${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err);
  }
}

startServer();
