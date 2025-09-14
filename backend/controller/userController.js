import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { promisify } from "node:util";

function jwtSignUser(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

export const signup = async (req, res) => {
  try {
    const db = req.app.locals.db;

    let { email, password, store_domain, access_token } = req.body;
    if (!email || !password || !store_domain || !access_token) {
      return res.status(400).json({
        status: "Email, password, store domain and access token are required",
      });
    }

    if (store_domain.startsWith("http://"))
      store_domain = store_domain.slice(7);
    if (store_domain.startsWith("https://"))
      store_domain = store_domain.slice(8);
    store_domain = store_domain.replace(/\/+$/, ""); // remove trailing slashes
    console.log(store_domain);

    // Check if user exists
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ status: "User already exists" });
    }

    if (!store_domain.endsWith(".myshopify.com")) {
      return res
        .status(400)
        .json({ status: "wrong domain-name or access-code" });
    }

    // Check if tenant exists
    let [tenant] = await db.query(
      "SELECT * FROM tenants WHERE shop_domain = ?",
      [store_domain]
    );
    if (tenant.length > 0) {
      return res.status(400).json({ status: "Tenant already exists" });
    }

    const response = await fetch(
      `https://${store_domain}/admin/api/2023-10/orders.json?status=any`,
      {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": access_token,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      return res
        .status(400)
        .json({ status: "wrong domain-name or access-code" });
    }

    // Insert new tenant
    const [tenantResult] = await db.query(
      "INSERT INTO tenants (shop_domain, access_token) VALUES (?, ?)",
      [store_domain, access_token]
    );
    const tenantId = tenantResult.insertId;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const [result] = await db.query(
      "INSERT INTO users (email, password, tenant_id) VALUES (?, ?, ?)",
      [email, hashedPassword, tenantId]
    );

    const topics = [
      "webhooks/orders/create",
      "webhooks/products/create",
      "webhooks/products/update",
      "webhooks/products/delete",
      "webhooks/customers/create",
      "webhooks/customers/update",
      "webhooks/customers/delete",
    ];

    for (const topic of topics) {
      await fetch(`https://${store_domain}/admin/api/2025-01/webhooks.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": access_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          webhook: {
            topic,
            address: `${process.env.HOST}/webhooks/${topic.replace("/", "_")}`,
            format: "json",
          },
        }),
      });
    }

    // Creating jwt token
    const token = jwtSignUser(result.insertId);

    // Set cookie options
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: false, // secure only on prod HTTPS
      sameSite: "lax", // helps with CSRF and cross-site cookie sending
    };

    // Send Cookie
    res.cookie("user-jwt", token, cookieOptions);

    res.status(201).json({
      status: "User created successfully",
      userId: result.insertId,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    // console.log("here");
    const db = req.app.locals.db;

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "Email and password are required" });
    }

    // Check if user exists
    const [user] = await db.query("select * from users where email = ?", [
      email,
    ]);

    if (user.length === 0) {
      return res.status(400).json({ status: "User does not exist" });
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user[0].password);
    if (!isPasswordValid) {
      return res.status(400).json({ status: "Invalid password" });
    }

    // Creating jwt token
    // console.log(user[0].id);
    const token = jwtSignUser(user[0].id);

    // Set cookie options
    const cookieOptions = {
      expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: false, // secure only on prod HTTPS
      sameSite: "lax", // helps with CSRF and cross-site cookie sending
    };

    // Send Cookie
    res.cookie("user-jwt", token, cookieOptions);

    // Success
    res.status(200).json({ status: "Login successful", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

export const protect = async (req, res, next) => {
  try {
    // 1. Getting token and check of it's there
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies["user-jwt"]) {
      // Access token from cookies
      token = req.cookies["user-jwt"];
    } else if (req.cookies && req.cookies["user-jwt"]) {
      token = req.cookies["user-jwt"];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in! Please login to access this route.",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Get user from token
    const db = req.app.locals.db;
    const [currentUser] = await db.query("SELECT * FROM users WHERE id = ?", [
      decoded.id,
    ]);

    // check if user exists
    if (currentUser.length === 0) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token does no longer exist.",
      });
    }

    // console.log(currentUser[0]);
    req.user = currentUser[0];
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "Internal Server Error" });
  }
};

export const summary = async (req, res, next) => {
  try {
    const db = req.app.locals.db;

    const tenantId = req.user.tenant_id;

    // calc total Revenue of tenant
    const totalRevenue = await db.query(`
        SELECT sum(total_price) as total FROM orders
      `);

    // calc total number of customers
    const totalCustomers = await db.query(
      `
        SELECT COUNT(*) as count FROM customers where tenant_id = ?
      `,
      [tenantId]
    );

    // Calc total number of orders placed
    const totalOrders = await db.query(
      `
        SELECT COUNT(*) as count FROM orders WHERE tenant_id = ?
      `,
      [tenantId]
    );

    // calc total number of products
    const totalProducts = await db.query(
      `
        SELECT COUNT(*) as count FROM products WHERE tenant_id = ?
      `,
      [tenantId]
    );

    res.status(200).json({
      status: "success",
      totalRevenue: totalRevenue[0][0].total * 1,
      totalCustomers: totalCustomers[0][0].count,
      totalOrders: totalOrders[0][0].count,
      totalProducts: totalProducts[0][0].count,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ status: "Internal server error" });
  }
};
