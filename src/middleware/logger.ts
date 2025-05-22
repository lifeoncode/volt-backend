import { createLogger, format, transports } from "winston";

/**
 * @middleware logger
 *
 * @description
 * Logs application events.
 *
 * @param {Record<string, unknown>} - {info, format, transports}
 *
 * @returns {void}
 */
const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.colorize(),
    format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [new transports.Console()],
});

export default logger;
