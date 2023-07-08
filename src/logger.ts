import winston from "winston";
import { Logger } from "./types.ts/logger";

function constructDefaultLogger(
  logPath?: string,
  errorlogPath?: string
): Logger {
  const logger = winston.createLogger({
    level: "debug",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.simple()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.simple(),
        level: "info",
      }),
    ],
  });
  if (logPath)
    logger.transports.push(
      new winston.transports.File({ filename: logPath, level: "debug" })
    );
  if (errorlogPath)
    logger.transports.push(
      new winston.transports.File({ filename: errorlogPath, level: "error" })
    );
  return logger;
}

export { constructDefaultLogger };
