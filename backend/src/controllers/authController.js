import User from "../models/User.js";
import {
  clearTokenCookie,
  createToken,
  setTokenCookie,
} from "../utils/token.js";

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

// POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400);
    throw new Error("Name, email, and password are required");
  }

  if (password.length < 8) {
    res.status(400);
    throw new Error("Password must contain at least 8 characters");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    res.status(409);
    throw new Error("An account with that email already exists");
  }

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
  });

  const token = createToken(user._id.toString());
  setTokenCookie(res, token);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    user: formatUser(user),
  });
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  const passwordIsCorrect =
    user && (await user.comparePassword(password));

  if (!passwordIsCorrect) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  const token = createToken(user._id.toString());
  setTokenCookie(res, token);

  res.status(200).json({
    success: true,
    message: "Login successful",
    user: formatUser(user),
  });
};

// POST /api/auth/logout
export const logoutUser = async (req, res) => {
  clearTokenCookie(res);

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
};

// GET /api/auth/me
export const getCurrentUser = async (req, res) => {
  res.status(200).json({
    success: true,
    user: formatUser(req.user),
  });
};