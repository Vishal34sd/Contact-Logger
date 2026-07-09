export const successResponse = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    status: 'success',
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  if (meta !== null) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

export const errorResponse = (res, statusCode = 500, message = 'Server Error', errors = null) => {
  const response = {
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
