import express from "express";
import schedule from "node-schedule";
import getDetailsByInterval from "./controllers/getDetailsByInterval.js";
import getMissedConFromNoti from "./controllers/getMissedConFromNoti.js";
import { generalLogger } from "./utils/loggerConfig.js";
import { APP_RUNNING_ENV } from "./utils/constants.js";
import { readJSONFile, writeJSONFile } from "./utils/fileController.js";
import moment from "moment";

const app = express();
app.use(express.json());

//Schedule jobs based on running environment
if (APP_RUNNING_ENV === "VM1" || APP_RUNNING_ENV === "Local") {
	schedule.scheduleJob("5,35 * * * *", () => {
		getDetailsByInterval();
	});
	schedule.scheduleJob("0 2 * * *", () => {
		getMissedConFromNoti();
	});
} else if (APP_RUNNING_ENV === "VM2") {
	schedule.scheduleJob("20,50 * * * *", () => {
		getDetailsByInterval();
	});
	schedule.scheduleJob("5 2 * * *", () => {
		getMissedConFromNoti();
	});
}

generalLogger.info("The BI_WebAPI_V3_Conversation Service STARTS");

const localIntervalResult = await readJSONFile("lastInterval");
if (JSON.stringify(localIntervalResult) === "{}") {
	const backwardHalfHourTime = moment.utc().subtract(30, "minute").format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");
	await writeJSONFile("lastInterval", backwardHalfHourTime);
}

// getDetailsByInterval();
// getMissedConFromNoti();
