import jwt from "jsonwebtoken";

const COOKIE_NAME = "wanderlist_token";

const getCookieOptions = () => {
  const expirationDays = Number(process.env.COOKIE_EXPIRES_DAYS) || 7;
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: expirationDays * 24 * 60 * 60 * 1000,
    path: "/",
  };
};

export const createToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from the environment variables");
  }

  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

export const setTokenCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

export const clearTokenCookie = (res) => {
  const options = getCookieOptions();

  res.clearCookie(COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
};

export { COOKIE_NAME };