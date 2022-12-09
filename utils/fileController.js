import { promises as fs } from "fs";
import { generalLogger } from "./loggerConfig.js";
import { JSON_FILEPATH, LOG_FILEPATH } from "./constants.js";

const isFileExist = async (filePath) => {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
};

const readJSONFile = async (fileName) => {
	const filePath = `${JSON_FILEPATH}${fileName}.json`;
	try {
		const isJSONFileExist = await isFileExist(filePath);
		if (!isJSONFileExist) {
			generalLogger.error(`File ${filePath} is NOT exist!`);
			await writeJSONFile(fileName, {});
		}

		const data = await fs.readFile(filePath, "utf-8");
		try {
			return JSON.parse(data);
		} catch (err) {
			generalLogger.error(`Converting ${fileName}.json ${err}`);
		}
	} catch (err) {
		generalLogger.error(`readJSONFile Func reading ${filePath} ${err}`);
		return false;
	}
};

const writeJSONFile = async (fileName, content) => {
	const filePath = `${JSON_FILEPATH}${fileName}.json`;
	try {
		await fs.writeFile(filePath, JSON.stringify(content, null, 2));
		generalLogger.info(`Writing ${fileName}.json SUCCEED!`);
		return true;
	} catch (err) {
		generalLogger.error(`Writing ${fileName}.json ${err}. Content = ${JSON.stringify(content)}`);
		return false;
	}
};

const appendFailureIntervalFile = async (content) => {
	const filePath = `${LOG_FILEPATH}failureIntervals.txt`;
	try {
		await fs.appendFile(filePath, `${content}\n`);
		return true;
	} catch (err) {
		generalLogger.error(`appendFailureIntervalFile Func ${err}. Content = ${content}`);
		return false;
	}
};

export { readJSONFile, writeJSONFile, appendFailureIntervalFile };
