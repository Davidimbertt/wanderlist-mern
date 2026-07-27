export const notFound = (req, res, next) => {
  const error = new Error(
    `Route not found: ${req.originalUrl}`
  );

  res.status(404);
  next(error);
};

export const errorHandler = (
  err,
  req,
  res,
  next
) => {
  let statusCode =
    res.statusCode === 200
      ? 500
      : res.statusCode;

  let message = err.message;

  // Convert Mongoose schema validation errors
  // into readable 400 responses.
  if (err.name === "ValidationError") {
    statusCode = 400;

    message = Object.values(err.errors)
      .map((validationError) =>
        validationError.message
      )
      .join(", ");
  }

  // Handle invalid MongoDB document IDs.
  if (err.name === "CastError") {
    statusCode = 400;
    message = "The supplied resource ID is invalid";
  }

  // Handle duplicate unique MongoDB values.
  if (err.code === 11000) {
    statusCode = 409;

    const duplicateField =
      Object.keys(err.keyValue || {})[0] ||
      "value";

    message = `An account with that ${duplicateField} already exists`;
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack:
      process.env.NODE_ENV === "production"
        ? undefined
        : err.stack,
  });
};