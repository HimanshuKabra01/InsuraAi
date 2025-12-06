import jwt from "jsonwebtoken";
import User from "../models/user.js";

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decoded.id || decoded.sub; 
            req.user = await User.findById(userId).select("-password");
            next();
            
        } catch (err) {
            console.error("JWT Verification failed:", err.message);
            return res.status(401).json({ error: "Not authorized, token failed" });
        }
    } else {
        return res.status(401).json({ error: "Not authorized, no token" });
    }
};

export { protect };