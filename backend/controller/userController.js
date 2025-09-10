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

    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "Email and password are required" });
    }

    // Check if user exists
    const [existingUser] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ status: "User already exists" });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert new user
    const [result] = await db.query(
      "INSERT INTO users (email, password) VALUES (?, ?)",
      [email, hashedPassword]
    );

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
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Internal Server Error", token });
  }
};

export const login = async (req, res) => {
  try {
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
    console.log(user[0].id);
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
