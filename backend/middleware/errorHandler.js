class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Production - don't expose stack traces
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    } else {
      // Programming or unknown error - log it but don't expose details
      console.error('ERROR 💥', err);
      res.status(500).json({
        success: false,
        message: 'Something went wrong'
      });
    }
  }
};

// Handle unhandled promise rejections
const handleUnhandledRejection = (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
};

// Handle uncaught exceptions
const handleUncaughtException = (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
};

module.exports = {
  AppError,
  errorHandler,
  handleUnhandledRejection,
  handleUncaughtException
};
