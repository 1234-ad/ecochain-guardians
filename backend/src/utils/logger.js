const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, '../../logs/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
];

// Create logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/exceptions.log')
    })
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../../logs/rejections.log')
    })
  ]
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Add request logging middleware
logger.requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    
    if (res.statusCode >= 400) {
      logger.error(message);
    } else {
      logger.http(message);
    }
  });
  
  next();
};

// Add structured logging methods
logger.logAction = (action, data = {}) => {
  logger.info(`ACTION: ${action}`, { action, ...data });
};

logger.logError = (error, context = {}) => {
  logger.error(`ERROR: ${error.message}`, {
    error: error.message,
    stack: error.stack,
    ...context
  });
};

logger.logTransaction = (txHash, action, data = {}) => {
  logger.info(`TRANSACTION: ${action}`, {
    txHash,
    action,
    ...data
  });
};

logger.logUserAction = (userAddress, action, data = {}) => {
  logger.info(`USER_ACTION: ${action}`, {
    userAddress,
    action,
    ...data
  });
};

logger.logContractEvent = (contractName, eventName, data = {}) => {
  logger.info(`CONTRACT_EVENT: ${contractName}.${eventName}`, {
    contract: contractName,
    event: eventName,
    ...data
  });
};

// Performance logging
logger.logPerformance = (operation, duration, data = {}) => {
  const level = duration > 1000 ? 'warn' : 'info';
  logger[level](`PERFORMANCE: ${operation} took ${duration}ms`, {
    operation,
    duration,
    ...data
  });
};

// Security logging
logger.logSecurity = (event, data = {}) => {
  logger.warn(`SECURITY: ${event}`, {
    event,
    timestamp: new Date().toISOString(),
    ...data
  });
};

// API logging
logger.logAPI = (method, endpoint, statusCode, duration, data = {}) => {
  const level = statusCode >= 400 ? 'error' : 'info';
  logger[level](`API: ${method} ${endpoint} ${statusCode} - ${duration}ms`, {
    method,
    endpoint,
    statusCode,
    duration,
    ...data
  });
};

module.exports = logger;