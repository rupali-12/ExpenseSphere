import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  let token

  // Check Authorization header first (mobile/cross-domain)
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1]
  }
  // Fallback to cookie (local dev)
  else if (req.cookies.jwt) {
    token = req.cookies.jwt
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.userId).select("-password")
    next()
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token failed" })
  }
}