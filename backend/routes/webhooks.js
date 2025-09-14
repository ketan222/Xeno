import express from "express";
import crypto from "crypto";

const router = express.Router();

// Webhook route
router.post("/orders/create", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const order = req.body;
    // console.log("✅ New Order Webhook:", order.id);
    const shopDomain = req.headers["x-shopify-shop-domain"]; // or order.shop_domain in payload
    const [tenant] = await db.query(
      "SELECT * FROM tenants WHERE shop_domain = ?",
      [shopDomain]
    );
    if (!tenant[0]) return res.status(400).send("Unknown tenant");
    const tenantId = tenant[0].id;

    // Insert order into your `orders` table
    await db.query(
      `
                INSERT INTO orders (
                    id ,
                    customer_id ,
                    tenant_id, 
                    customer_email ,
                    name ,
                    order_number ,
                    total_price ,
                    subtotal_price ,
                    total_tax ,
                    currency ,
                    status,
                    created_at ,
                    updated_at)
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
                ON DUPLICATE KEY UPDATE
                    id = VALUES(id),
                    customer_id = VALUES(customer_id),
                    tenant_id = VALUES(tenant_id),
                    customer_email = VALUES(customer_email),
                    name = VALUES(name),
                    order_number = VALUES(order_number),
                    total_price = VALUES(total_price),
                    subtotal_price = VALUES(subtotal_price),
                    total_tax = VALUES(total_tax),
                    currency = VALUES(currency),
                    status = VALUES(status),
                    created_at = VALUES(created_at),
                    updated_at = VALUES(updated_at)
                `,
      [
        order.id,
        order.customer.id,
        tenantId,
        order.customer.email,
        order.customer.first_name + " " + order.customer.last_name,
        order.order_number,
        order.total_price,
        order.subtotal_price,
        order.total_tax,
        order.customer?.currency || "USD",
        order.fulfillments.status,
        order.created_at,
        order.updated_at,
      ]
    );

    res.status(200).send("OK");
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server error" });
  }
});

router.post("/products/create", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const product = req.body;
    // console.log("✅ New product Webhook:", product.id);
    const shopDomain = req.headers["x-shopify-shop-domain"]; // or product.shop_domain in payload
    const [tenant] = await db.query(
      "SELECT * FROM tenants WHERE shop_domain = ?",
      [shopDomain]
    );
    if (!tenant[0]) return res.status(400).send("Unknown tenant");
    const tenantId = tenant[0].id;

    // Insert product into your `products` table
    const images = product.images;
    const response = await db.query(
      `
                INSERT INTO products (id, tenant_id, title, description, price, compare_at_price, taxable, inventory_item_id, inventory_quantity, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                id = VALUES(id),
                tenant_id = VALUES(tenant_id),
                title = VALUES(title),
                description = VALUES(description),
                price = VALUES(price),
                compare_at_price = VALUES(compare_at_price),
                taxable = VALUES(taxable),
                inventory_item_id = VALUES(inventory_item_id),
                inventory_quantity = VALUES(inventory_quantity),
                created_at = VALUES(created_at),
                updated_at = VALUES(updated_at);
                `,
      [
        product.id,
        tenantId,
        product.title,
        product.body_html,
        product.variants[0]?.price + 0.0,
        product.variants[0]?.compare_at_price + 0.0,
        product.variants[0]?.taxable || true,
        product.variants[0]?.inventory_item_id || null,
        product.variants[0]?.inventory_quantity || 0,
        product.variants[0]?.created_at || new Date(),
        product.variants[0]?.updated_at || new Date(),
      ]
    );
    for (let image of images) {
      await db.query(
        `
                    INSERT INTO pictures (ID, PRODUCT_ID, SRC, ALT, POSITION, WIDTH, HEIGHT, CREATED_AT, UPDATED_AT)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        id = VALUES(id),
                        product_id = VALUES(product_id),
                        src = VALUES(src),
                        alt = VALUES(alt),
                        position = VALUES(position),
                        width = VALUES(width),
                        height = VALUES(height),
                        created_at = VALUES(created_at),
                        updated_at = VALUES(updated_at);
                `,
        [
          image.id,
          product.id,
          image.src,
          image.alt,
          image.position,
          image.width,
          image.height,
          image.created_at,
          image.updated_at,
        ]
      );
    }

    res.status(200).send("OK");
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server error" });
  }
});

router.post("/products/update", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const product = req.body;
    // console.log("✅ New products Webhook:", product.id);
    const shopDomain = req.headers["x-shopify-shop-domain"]; // or products.shop_domain in payload
    const [tenant] = await db.query(
      "SELECT * FROM tenants WHERE shop_domain = ?",
      [shopDomain]
    );
    if (!tenant[0]) return res.status(400).send("Unknown tenant");
    const tenantId = tenant[0].id;

    // Update products into your `productss` table
    const images = product.images;
    // console.log(product);
    // console.log("+++++++++++++++++++");
    const response = await db.query(
      `
                INSERT INTO products (id, tenant_id, title, description, price, compare_at_price, taxable, inventory_item_id, inventory_quantity, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                id = VALUES(id),
                tenant_id = VALUES(tenant_id),
                title = VALUES(title),
                description = VALUES(description),
                price = VALUES(price),
                compare_at_price = VALUES(compare_at_price),
                taxable = VALUES(taxable),
                inventory_item_id = VALUES(inventory_item_id),
                inventory_quantity = VALUES(inventory_quantity),
                created_at = VALUES(created_at),
                updated_at = VALUES(updated_at);
                `,
      [
        product.id,
        tenantId,
        product.title,
        product.body_html,
        product.variants[0]?.price + 0.0,
        product.variants[0]?.compare_at_price + 0.0,
        product.variants[0]?.taxable || true,
        product.variants[0]?.inventory_item_id || null,
        product.variants[0]?.inventory_quantity || 0,
        product.variants[0]?.created_at || new Date(),
        product.variants[0]?.updated_at || new Date(),
      ]
    );
    for (let image of images) {
      await db.query(
        `
                    INSERT INTO pictures (ID, PRODUCT_ID, SRC, ALT, POSITION, WIDTH, HEIGHT, CREATED_AT, UPDATED_AT)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        id = VALUES(id),
                        product_id = VALUES(product_id),
                        src = VALUES(src),
                        alt = VALUES(alt),
                        position = VALUES(position),
                        width = VALUES(width),
                        height = VALUES(height),
                        created_at = VALUES(created_at),
                        updated_at = VALUES(updated_at);
                `,
        [
          image.id,
          product.id,
          image.src,
          image.alt,
          image.position,
          image.width,
          image.height,
          image.created_at,
          image.updated_at,
        ]
      );
    }

    res.status(200).send("OK");
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server error" });
  }
});

router.post("/products/delete", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const product = req.body;
    // console.log("✅ New product Webhook:", product.id);
    const shopDomain = req.headers["x-shopify-shop-domain"]; // or product.shop_domain in payload
    const [tenant] = await db.query(
      "SELECT * FROM tenants WHERE shop_domain = ?",
      [shopDomain]
    );
    if (!tenant[0]) return res.status(400).send("Unknown tenant");
    const tenantId = tenant[0].id;

    // Delete product from your `products` table
    const images = product.images;
    await db.query(
      `
                    DELETE FROM pictures where product_id = ?
                `,
      [product.id]
    );
    await db.query(
      `
                    DELETE FROM products where id = ?
                `,
      [product.id]
    );

    res.status(200).send("OK");
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server error" });
  }
});

router.post("/customers/create", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const customer = req.body;
    // console.log(customer);
    // console.log("✅ New customer Webhook:", customer.id);
    const shopDomain = req.headers["x-shopify-shop-domain"]; // or order.shop_domain in payload
    const [tenant] = await db.query(
      "SELECT * FROM tenants WHERE shop_domain = ?",
      [shopDomain]
    );
    if (!tenant[0]) return res.status(400).send("Unknown tenant");
    const tenantId = tenant[0].id;

    // Insert customer into your `customers` table
    await db.query(
      `
            INSERT INTO customers
            (id, email, first_name, last_name, tenant_id, total_spent, orders_count, last_order_id, phone, currency, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            email = VALUES(email),
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            tenant_id = VALUES(tenant_id),
            total_spent = VALUES(total_spent),
            orders_count = VALUES(orders_count),
            last_order_id = VALUES(last_order_id),
            phone = VALUES(phone),
            currency = VALUES(currency),
            updated_at = VALUES(updated_at)
            `,
      [
        customer.id,
        customer.email,
        customer.first_name,
        customer.last_name,
        tenantId,
        parseFloat(customer.total_spent) || 0,
        customer.orders_count || 0,
        customer.last_order_id || null,
        customer.phone || null,
        customer.currency || null,
        new Date(customer.created_at),
        new Date(customer.updated_at),
      ]
    );

    res.status(200).send("OK");
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server error" });
  }
});

router.post("/customers/update", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const customer = req.body.line_items[0];
    // console.log("✅ New customer Webhook:", customer);
    const shopDomain = req.headers["x-shopify-shop-domain"]; // or customer.shop_domain in payload
    const [tenant] = await db.query(
      "SELECT * FROM tenants WHERE shop_domain = ?",
      [shopDomain]
    );
    if (!tenant[0]) return res.status(400).send("Unknown tenant");
    const tenantId = tenant[0].id;

    // Update customer into your `customers` table
    await db.query(
      `
            INSERT INTO customers
            (id, email, first_name, last_name, tenant_id, total_spent, orders_count, last_order_id, phone, currency, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            email = VALUES(email),
            first_name = VALUES(first_name),
            last_name = VALUES(last_name),
            tenant_id = VALUES(tenant_id),
            total_spent = VALUES(total_spent),
            orders_count = VALUES(orders_count),
            last_order_id = VALUES(last_order_id),
            phone = VALUES(phone),
            currency = VALUES(currency),
            updated_at = VALUES(updated_at)
            `,
      [
        customer.id,
        customer.email,
        customer.first_name,
        customer.last_name,
        tenantId,
        parseFloat(customer.total_spent) || 0,
        customer.orders_count || 0,
        customer.last_order_id || null,
        customer.phone || null,
        customer.currency || null,
        new Date(customer.created_at),
        new Date(customer.updated_at),
      ]
    );

    res.status(200).send("OK");
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server error" });
  }
});

router.post("/customers/delete", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const customer = req.body;
    // console.log("✅ New customer Webhook:", customer.id);
    const shopDomain = req.headers["x-shopify-shop-domain"]; // or order.shop_domain in payload
    const [tenant] = await db.query(
      "SELECT * FROM tenants WHERE shop_domain = ?",
      [shopDomain]
    );
    if (!tenant[0]) return res.status(400).send("Unknown tenant");
    const tenantId = tenant[0].id;

    // Delete customer from your `customers` table
    await db.query(
      `
                DELETE FROM customers where id = ?
            `,
      [customer.id]
    );

    res.status(200).send("OK");
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server error" });
  }
});

export default router;
