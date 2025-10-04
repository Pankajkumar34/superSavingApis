
exports.successResponse = (res, message = 'Success', data = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

exports.errorResponse = (res, message = 'Internal Server Error', status = 500, error = null) => {
  return res.status(status).json({
    success: false,
    message,
    error: error ? error.toString() : undefined,
  });
};

exports.validationError = (res, message = 'Validation failed', errors = [], status = 400) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};
