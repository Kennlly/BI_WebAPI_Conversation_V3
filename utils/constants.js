import dotenv from "dotenv";
import ip from "ip";

const defineEnv = () => {
	const localIPAddress = ip.address();
	switch (localIPAddress) {
		case "10.77.156.152":
		case "10.77.155.5":
		case "10.77.25.50":
			return "VM1";
		case "10.248.156.152":
		case "10.248.155.5":
			return "VM2";
		default:
			return "Local";
	}
};
const APP_RUNNING_ENV = defineEnv();

const getFilePathByEnv = (winPath, macPath) => {
	if (APP_RUNNING_ENV === "Local") return macPath;
	return winPath;
};

const getEnvFileFields = () => {
	const envFilePath = getFilePathByEnv(
		"D:\\GenesysBatch\\Node.js\\BI_WebAPI_V3_Conversation\\.env",
		"/Volumes/ITSP/COMPLETE_PROJECTS/BI_WebAPI_Conversation/.env"
	);
	dotenv.config({ path: envFilePath });
	return process.env;
};

const JSON_FILEPATH = getFilePathByEnv(
	"D:\\GenesysBatch\\Node.js\\BI_WebAPI_V3_Conversation\\jsonFiles\\",
	"/Volumes/ITSP/COMPLETE_PROJECTS/BI_WebAPI_Conversation/jsonFiles/"
);

const LOG_FILEPATH = getFilePathByEnv(
	"D:\\GenesysBatch\\Node.js\\BI_WebAPI_V3_Conversation\\logFiles\\",
	"/Volumes/ITSP/COMPLETE_PROJECTS/BI_WebAPI_Conversation/logFiles/"
);

const GENESYS_ENDPOINT_URL = getEnvFileFields().GENESYS_ENDPOINT_URL;
const GENESYS_CLOUD_CLIENT_ID = getEnvFileFields().GENESYS_CLOUD_CLIENT_ID;
const GENESYS_CLOUD_CLIENT_SECRET = getEnvFileFields().GENESYS_CLOUD_CLIENT_SECRET;
const SQL_USER = getEnvFileFields().SQL_USER;
const SQL_PASSWORD = getEnvFileFields().SQL_PASSWORD;
const SQL_DATABASE = getEnvFileFields().SQL_DATABASE;
const SQL_SERVER = getEnvFileFields().SQL_SERVER;

export {
	APP_RUNNING_ENV,
	JSON_FILEPATH,
	LOG_FILEPATH,
	GENESYS_ENDPOINT_URL,
	GENESYS_CLOUD_CLIENT_ID,
	GENESYS_CLOUD_CLIENT_SECRET,
	SQL_USER,
	SQL_PASSWORD,
	SQL_DATABASE,
	SQL_SERVER,
};
