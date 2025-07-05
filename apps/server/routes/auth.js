const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const refreshToken = require("../models/refreshToken");
require("dotenv").config();
const router = express.Router();
const { verifyToken } = require("../middleware/verify");
const {
  registerUserSchema,
  loginUserSchema,
} = require("zod-schemas/dist/schema");

function generateAccessToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    avatarUrl: user.avatarUrl || null,
    username: user.username,
  };
  return jwt.sign(payload, process.env.JWT_SECRET_ACCESS_TOKEN, {
    expiresIn: "15m",
  });
}

function generateRefreshToken(user) {
  const payload = {
    userId: user.id,
    email: user.email,
    avatarUrl: user.avatarUrl || null,
    username: user.username,
  };
  return jwt.sign(payload, process.env.JWT_SECRET_REFRESH_TOKEN, {
    expiresIn: "7d",
  });
}
const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none",
  maxAge: 1000 * 60 * 60 * 24 * 7, // 5 days
};

async function findRefreshToken(email, token, operation) {
  if (!email) return;

  const userTokenDoc = await refreshToken.findOne({ email }).exec();

  switch (operation) {
    case "findToken":
      return userTokenDoc && userTokenDoc.token === token;

    case "removeToken":
      if (userTokenDoc) {
        await refreshToken.deleteOne({ email });
        return true;
      }
      return false;

    case "upsertToken":
      if (userTokenDoc) {
        userTokenDoc.token = token;
        await userTokenDoc.save();
      } else {
        const newToken = new refreshToken({ email, token });
        await newToken.save();
      }
      return true;

    default:
      throw new Error("Invalid operation");
  }
}

router.post("/signup", async (req, res) => {
  // console.log(req.body);
  const { username, email, password } = req.body;
  // Validate input
  const result = registerUserSchema.safeParse(req.body);
  // console.log(result);
  if (!result.success) {
    return res
      .status(400)
      .json({ message: "Invalid input", errors: result.error.errors });
  }
  try {
    const findUser = await user.findOne({ email });
    // console.log(findUser);
    if (findUser) {
      return res.status(409).json({ message: "User already exist" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new user({
      username,
      email,
      password: hashedPassword,
      provider: "Email",
    });
    const newCreatedUser = await newUser.save();
    // console.log(d);

    // Generate JWT Token
    const accessToken = generateAccessToken(newCreatedUser);
    const refreshToken = generateRefreshToken(newCreatedUser);
    await findRefreshToken(newCreatedUser.email, refreshToken, "upsertToken");
    // console.log(token);
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({ message: "User registered successfully!", accessToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // console.log(req.body);
  // Validate input
  const result = loginUserSchema.safeParse(req.body);
  if (!result.success)
    return res
      .status(400)
      .json({ message: "Invalid input", errors: result.error.errors });

  try {
    const findUser = await user.findOne({ email });
    if (!findUser) return res.status(400).json({ message: "User not found" });
    if (findUser && findUser.provider === "Google") {
      return res.status(400).json({
        message: "User logged in through Google, please use Google login",
      });
    }

    const isMatch = await bcrypt.compare(password, findUser.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const accessToken = generateAccessToken(findUser);
    const refreshToken = generateRefreshToken(findUser);
    await findRefreshToken(email, refreshToken, "upsertToken");
    res.cookie("refreshToken", refreshToken, cookieOptions);

    res.json({ message: "User logged in successfully!", accessToken });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  // console.log(req.user);
  const { userId } = req.user;
  const existingUser = await user.findById(userId).exec();
  // console.log(existingUser);
  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }
  const { password, ...userData } = existingUser._doc;
  res.json(userData);
});

router.post("/refresh-token", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_REFRESH_TOKEN);
    if (!(await findRefreshToken(decoded.email, token, "findToken"))) {
      return res
        .status(403)
        .json({ message: "Invalid or reused refresh token" });
    }
    const userData = await user.findById(decoded.userId).exec();
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    // Generate new access token
    const accessToken = generateAccessToken(userData);
    res.json({ accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

router.post("/logout", verifyToken, async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized access not" });
  }
  const { email } = req.user;

  if (!(await findRefreshToken(email, token, "findToken"))) {
    return res.status(401).json({ message: "Unauthorized access" });
  }

  try {
    await findRefreshToken(email, token, "removeToken");
    res.clearCookie("refreshToken");
    res.json({ message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error during logout" });
  }
});

module.exports = router;
