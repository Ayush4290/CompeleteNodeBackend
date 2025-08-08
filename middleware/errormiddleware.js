import { logger } from "../utils/logger";
import { apiResponse } from "../utils/apiResponse"; // Added for consistency with previous code

const errorHandler = (err, req, res, next) => {
  // Log error details
  logger.error("Error:", {
    message: err.message || "No message provided",
    stack: err.stack,
    url: req.originalUrl, // Use originalUrl for more accurate URL logging
    method: req.method,
    ip: req.ip,
  });

  // Validation Error (e.g., from express-validator or Mongoose)
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return apiResponse.error(res, "Validation Error", 400, { errors });
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    return apiResponse.error(res, "Invalid token", 401);
  }

  if (err.name === "TokenExpiredError") {
    return apiResponse.error(res, "Token expired", 401);
  }

  // Database Duplicate Entry Error (MySQL)
  if (err.code === "ER_DUP_ENTRY") {
    return apiResponse.error(res, "Duplicate entry", 400);
  }

  // Default Error
  return apiResponse.error(
    res,
    err.message || "Internal Server Error",
    err.statusCode || 500
  );
};

export default errorHandler;