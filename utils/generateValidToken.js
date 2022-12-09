import moment from "moment";
import { GENESYS_CLOUD_CLIENT_ID, GENESYS_CLOUD_CLIENT_SECRET } from "./constants.js";
import { readJSONFile, writeJSONFile } from "./fileController.js";
import { generalLogger } from "./loggerConfig.js";
import fetch from "node-fetch";

const generateToken = async () => {
	const params = new URLSearchParams();
	params.append("grant_type", "client_credentials");

	try {
		const response = await fetch("https://login.cac1.pure.cloud/oauth/token", {
			method: "POST",
			body: params,
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
				Authorization: `Basic ${Buffer.from(GENESYS_CLOUD_CLIENT_ID + ":" + GENESYS_CLOUD_CLIENT_SECRET).toString("base64")}`,
			},
		});

		const data = await response.json();
		return data;
	} catch (error) {
		generalLogger.error(`generateToken Func ${error}`);
		return false;
	}
};

const generateValidToken = async () => {
	try {
		const tokenInfo = await readJSONFile("genesysToken");
		const createTimestampStr = tokenInfo.createAt
			? tokenInfo.createAt
			: moment().subtract(48, "hour").format("YYYY-MM-DD HH:mm:ss.SSS");
		const createTime = moment(createTimestampStr);
		const currentTime = moment();
		const timeDiff = currentTime.diff(createTime, "hour");
		const isTokenValid = timeDiff <= 23;

		if (isTokenValid) return tokenInfo.access_token;

		const newToken = await generateToken();
		newToken.createAt = currentTime.format("YYYY-MM-DD HH:mm:ss.SSS");
		await writeJSONFile("genesysToken", newToken);
		return newToken.access_token;
	} catch (error) {
		generalLogger.error(`generateValidToken Func ${error}`);
	}
};

export default generateValidToken;
