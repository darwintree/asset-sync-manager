import winston from "winston";
import { Logger } from "./types/logger";

function constructDefaultLogger(
  logPath?: string,
  errorlogPath?: string
): Logger {
  const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
      winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level}:\t${message}`;
      })
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
          winston.format.printf(({ level, message, timestamp }) => {
            return `\n${timestamp} ${level}:\t${message}`;
          })
        ),
        level: "info",
      }),
      new winston.transports.File({ filename: logPath, level: "debug" }),
      new winston.transports.File({ filename: errorlogPath, level: "error" }),
    ],
  });
  // if (logPath)
  //   logger.transports.push(
  //     new winston.transports.File({ filename: logPath, level: "debug" })
  //   );
  // if (errorlogPath)
  //   logger.transports.push(
  //     new winston.transports.File({ filename: errorlogPath, level: "error" })
  //   );
  return logger;
}

export { constructDefaultLogger };
