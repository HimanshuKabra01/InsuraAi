// Corrected authMiddleware.js

import jwt from "jsonwebtoken";
import User from "../models/user.js";

const authMiddleware = async (req, res, next) => {
  let token;

  // 1. Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user and attach to request object
      // Use decoded.sub if your JWT token uses 'sub' instead of 'id' (as in your Google Sign-in token)
      const userId = decoded.id || decoded.sub; 
      req.user = await User.findById(userId).select("-password");

      // SUCCESS: move to the next middleware/route
      next();
      
    } catch (err) {
      // 2. TOKEN FAILED/EXPIRED/INVALID
      console.error("JWT Verification failed:", err.message);
      // We send the response AND return to exit the function immediately
      return res.status(401).json({ error: "Not authorized, token failed" });
    }
  } else {
    // 3. NO TOKEN
    // If we've reached here and no 'Bearer' token was found, send 401
    return res.status(401).json({ error: "Not authorized, no token" });
  }

  // NOTE: The final 'if (!token) return res.status(401)...' is now covered by the 'else' block
};

export default authMiddleware;