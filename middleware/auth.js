import { apiResponse } from "../utils/apiResponse";
import { verifyToken } from "../utils/jwt";
import User from "../models/User"; // Assuming User class is imported from a models directory

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return apiResponse.error(res, "Access token required", 401);
    }

    const token = authHeader.substring(7); // Extract token after "Bearer "
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user) {
      return apiResponse.error(res, "User not found", 401);
    }

    req.user = user; // Attach user to request object
    next();
  } catch (error) {
    return apiResponse.error(res, "Invalid or expired token", 401);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.error(res, "Authentication required", 401); // Changed status to 401 for consistency
    }

    if (!roles.includes(req.user.role)) { // Fixed typo: roles -> role
      return apiResponse.error(res, "Insufficient permissions", 403);
    }

    next();
  };
};