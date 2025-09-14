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

    // Drop existing tables for a fresh start (for development purposes)
    // await db.query(`
    // DROP TABLE IF EXISTS tenants, orders, customers, pictures, products, stores, users;`);
    // console.log("Dropped existing customers table");

    // Tenants table
    await db.query(`
        CREATE TABLE IF NOT EXISTS tenants (
            id INT AUTO_INCREMENT PRIMARY KEY,
            shop_domain VARCHAR(255) UNIQUE NOT NULL, -- e.g. nehal-store.myshopify.com
            access_token TEXT DEFAULT NULL,                        -- nullable, will be filled after OAuth
            oauth_state VARCHAR(255),                 -- optional, for CSRF during OAuth
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

      `);

    // Users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id INT,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT NOW(),
        updated_at DATETIME DEFAULT NOW() ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
      );
    `);

    // Customers table
    await db.query(`
      CREATE TABLE IF NOT EXISTS customers (
      id BIGINT PRIMARY KEY,             -- Shopify customer ID
      tenant_id INT,
      email VARCHAR(255),
      first_name VARCHAR(255),
      last_name VARCHAR(255),
      total_spent DECIMAL(10,2) DEFAULT 0,
      orders_count INT DEFAULT 0,
      last_order_id BIGINT,
      phone VARCHAR(50),
      currency VARCHAR(10),
      created_at DATETIME,
      updated_at DATETIME,
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    `);

    // Products table
    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id BIGINT PRIMARY KEY,
        tenant_id INT,
        title VARCHAR(255),
        description text,
        price DECIMAL(10,2),
        compare_at_price DECIMAL(10,2),
        taxable BOOLEAN,
        inventory_item_id BIGINT,
        inventory_quantity INT,
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
      );
    `);

    // Pictures table
    await db.query(`
      CREATE TABLE IF NOT EXISTS pictures (
        id BIGINT PRIMARY KEY,             -- Shopify image ID
        product_id BIGINT,
        src VARCHAR(500),
        alt VARCHAR(255),
        position INT,
        width INT,
        height INT,
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
      );`);

    // Orders table
    await db.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id BIGINT PRIMARY KEY,
        tenant_id INT,
        customer_id BIGINT,
        customer_email VARCHAR(255),
        name VARCHAR(255),
        order_number INT,
        total_price DECIMAL(10,2),
        subtotal_price DECIMAL(10,2),
        total_tax DECIMAL(10,2),
        currency VARCHAR(10),
        status VARCHAR(50),
        created_at DATETIME,
        updated_at DATETIME,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
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
