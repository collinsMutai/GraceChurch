"use strict";

const winston = require("winston");
require("winston-daily-rotate-file");
const moment = require("moment-timezone");
require("dotenv").config();

// === Set timezone to Kenya (EAT) ===
const getTimestamp = () => moment().tz("Africa/Nairobi").format("YYYY-MM-DD HH:mm:ss");

// === Shared log format ===
const logFormat = winston.format.printf(({ level, message, timestamp, ...meta }) => {
  const details = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
  return `${timestamp} [${level.toUpperCase()}]: ${message}${details}`;
});

// === Create rotating file transport ===
const createTransport = (filename) =>
  new winston.transports.DailyRotateFile({
    filename: `logs/${filename}-%DATE%.log`,
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "10m",
    maxFiles: "7d",
  });

// === Read log level from .env (default: info) ===
const logLevel = process.env.LOG_LEVEL || "info";

// === Logger Factory ===
const createLogger = (filename) =>
  winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp({ format: getTimestamp }),
      logFormat
    ),
    transports: [
      createTransport(filename),
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(
            ({ level, message, ...meta }) =>
              `[${level}]: ${message}${Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : ""}`
          )
        ),
      }),
    ],
  });

// === Export loggers ===
const serverLogger = createLogger("server");
const mpesaLogger = createLogger("mpesa");
const liveLogger = createLogger("livecheck");

module.exports = { serverLogger, mpesaLogger, liveLogger };
