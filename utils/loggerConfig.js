import dailyRotateFile from "winston-daily-rotate-file";
import { LOG_FILEPATH } from "./constants.js";
import { format, createLogger, transports } from "winston";
import * as path from "path";

const { timestamp, combine, printf } = format;
const logFormat = printf(({ level, message, timestamp, stack }) => {
	return `[${timestamp}][${level}]: ${stack || message}`;
});

const customizeLog = (category) => {
	const customizeDir = `${LOG_FILEPATH}${category}${path.sep}`;
	const transport = new dailyRotateFile({
		dirname: customizeDir,
		filename: "%DATE%.log",
		datePattern: "YYYY-MM-DD",
	});
	return createLogger({
		format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.errors({ stack: true }), logFormat),
		transports: [
			transport,
			new transports.Console({
				format: combine(
					format.colorize(),
					timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
					format.errors({ stack: true }),
					logFormat
				),
			}),
		],
	});
};

const generalLogger = customizeLog("General");
const modelLogger = customizeLog("Model");
const reloadJobLogger = customizeLog("ReloadJob");

export { generalLogger, modelLogger, reloadJobLogger };
