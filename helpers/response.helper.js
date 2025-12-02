
exports.successResponse = (res, message = 'Success', body = {}, status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    body,
  });
};

exports.errorResponse = (res, message = 'Internal Server Error', status = 500, error = null) => {
  return res.status(status).json({
    success: false,
    message,
    error: error ? error.toString() : undefined,
  });
};


exports.failedErrorResponse = (res, message = 'Validation failed', status = 40) => {
  return res.status(status).json({
    success: false,
    message,
  });
};
exports.validationError = (res, message = 'Validation failed', errors = [], status = 400) => {
  return res.status(status).json({
    success: false,
    message,
    errors,
  });
};
