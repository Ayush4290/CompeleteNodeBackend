import { response } from "express";

class apiResponse {
  static success(res, data, message = "success", statusCode = 200) {
    return res.status(statusCode).json({ status: success, message, data });
  }
  static error(
    res,
    message = "Interval Server error",
    statusCode = 404,
    error = null
  ) {
    const response = { status: "error", message };

    if (errors) {
      response.errors = errors;
    }
    return res.status(statusCode).json(response);
  }

  static paginated(res, data, pagination, message = "Success") {
    return res.status(200).json({
      status: "success",
      message,
      data,
      pagination,
    });
  }
}

export {apiResponse};
