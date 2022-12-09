import fetch from "node-fetch";
import { forceProcessSleep } from "./general.js";
import { generalLogger } from "./loggerConfig.js";
import generateValidToken from "./generateValidToken.js";
import { GENESYS_ENDPOINT_URL } from "./constants.js";
import moment from "moment";

const postConversationBulkDetails = async (queryInterval, queryPageNumber) => {
	try {
		const apiEndPoint = `${GENESYS_ENDPOINT_URL}/api/v2/analytics/conversations/details/query`;
		let responseCode = null;
		let retryCounter = 1;
		do {
			const genesysToken = await generateValidToken();
			const apiQueryBody = {
				order: "asc",
				orderBy: "conversationStart",
				interval: queryInterval,
				paging: {
					pageSize: "100",
					pageNumber: queryPageNumber,
				},
			};
			const response = await fetch(apiEndPoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `bearer ${genesysToken}`,
				},
				body: JSON.stringify(apiQueryBody),
			});
			const data = await response.json();
			if (!data.status) return data;

			responseCode = data.status;
			await forceProcessSleep(3000 * retryCounter);
			generalLogger.error(
				`postConversationBulkDetails Func - Looping ERROR. Response code = ${responseCode}. Error Msg = ${
					data.message
				}. API Query = ${JSON.stringify(apiQueryBody)}. Retrying on ${retryCounter} / 3 time.`
			);
			retryCounter++;
		} while (responseCode && responseCode !== 200 && retryCounter <= 3);

		generalLogger.error(`postConversationBulkDetails Func ERROR after 3 times retry!!!`);
		return false;
	} catch (err) {
		generalLogger.error(`postConversationBulkDetails Func ${err}`);
		return false;
	}
};

const getMethodAPICallsRegularModel = async (apiEndPoint) => {
	try {
		let responseCode = null;
		let retryCounter = 1;
		do {
			const genesysToken = await generateValidToken();
			const response = await fetch(apiEndPoint, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `bearer ${genesysToken}`,
				},
			});
			const data = await response.json();
			if (!data.status) return data;

			responseCode = data.status;
			await forceProcessSleep(3000 * retryCounter);
			generalLogger.error(
				`getMethodAPICallsRegularModel Func - Looping ERROR. Endpoint = ${apiEndPoint}. Response code = ${responseCode}. Error Msg = ${data.message}. Retrying on ${retryCounter} / 3 time.`
			);
			retryCounter++;
		} while (responseCode && responseCode !== 200 && retryCounter <= 3);

		generalLogger.error(`getMethodAPICallsRegularModel Func FAILED after 3 times retry!!!`);
		return false;
	} catch (error) {
		generalLogger.error(`getMethodAPICallsRegularModel Func ${error}`);
		return false;
	}
};

const saperateIntervalIntoSevenDays = (interval) => {
	try {
		const originalTimeArr = interval.split("/");
		const originalStartTime = moment.utc(originalTimeArr[0]);
		const originalEndTime = moment.utc(originalTimeArr[1]);
		let forwardingEndTime = originalStartTime.clone().add(7, "days");
		if (forwardingEndTime > originalEndTime) return [interval];

		let forwardingStartTime = originalStartTime.clone();

		let intervalResult = [];
		while (forwardingEndTime < originalEndTime) {
			intervalResult.push(
				`${forwardingStartTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")}/${forwardingEndTime.format(
					"YYYY-MM-DDTHH:mm:ss.SSS[Z]"
				)}`
			);
			forwardingStartTime = forwardingEndTime.clone();
			forwardingEndTime = forwardingStartTime.clone().add(7, "days");
		}
		intervalResult.push(
			`${forwardingStartTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")}/${originalEndTime.format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")}`
		);
		return intervalResult;
	} catch (err) {
		generalLogger.error(`saperateIntervalIntoSevenDays Func ${err}`);
		return false;
	}
};

const getTotalRecord = async (interval) => {
	try {
		const apiEndPoint = `${GENESYS_ENDPOINT_URL}/api/v2/analytics/conversations/details/query`;
		let responseCode = null;
		let retryCounter = 1;
		do {
			const genesysToken = await generateValidToken();
			const apiQueryBody = {
				paging: {
					pageSize: "100",
				},
				interval: interval,
			};
			const response = await fetch(apiEndPoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `bearer ${genesysToken}`,
				},
				body: JSON.stringify(apiQueryBody),
			});
			const data = await response.json();
			if (!data.status) {
				if (JSON.stringify(data) === "{}") return 0;
				return data.totalHits;
			}

			responseCode = data.status;
			await forceProcessSleep(3000 * retryCounter);
			generalLogger.error(
				`getTotalRecord Func - Looping ERROR. Response code = ${responseCode}. Error Msg = ${data.message}. Interval = ${interval}. Retrying on ${retryCounter} / 3 time.`
			);
			retryCounter++;
		} while (responseCode && responseCode !== 200 && retryCounter <= 3);

		generalLogger.error(`getTotalRecord Func ERROR after 3 times retry!!!`);
		return false;
	} catch (err) {
		generalLogger.error(`getTotalRecord Func ${err}`);
		return false;
	}
};

const defineAPIQueryInterval = async (query) => {
	let result = [];

	try {
		//Step 1: Genesys requires the interval MUST BE within 7 days
		const sevenDaysResult = saperateIntervalIntoSevenDays(query);
		const sevenDaysResultLength = sevenDaysResult.length;
		//Step 2: Genesys rule CANNOT exceed 100,000 records
		//Database may not fail to handle 10,000 records per insertion (this needs to be handle next level)
		//Saperate the interval into capturing 100,000 record(<=1000 pages)
		for (let i = 0; i < sevenDaysResultLength; i++) {
			const initalRecordAmount = await getTotalRecord(sevenDaysResult[i]);
			if (initalRecordAmount <= 99999) {
				result.push(sevenDaysResult[i]);
				continue;
			}
			const initialQueryInterval = sevenDaysResult[i].split("/");
			const initialStartTime = initialQueryInterval[0];
			const initialEndTime = initialQueryInterval[1];
			const initialPeriod = Date.parse(initialEndTime) - Date.parse(initialStartTime);
			let forwardStartTime = initialStartTime;
			let adjustingPeriod = initialPeriod / 2;
			while (Date.parse(forwardStartTime) + adjustingPeriod <= Date.parse(initialEndTime)) {
				let adjustingEndTime = new Date(Date.parse(forwardStartTime) + adjustingPeriod).toISOString();
				let adjustingInterval = `${forwardStartTime}/${adjustingEndTime}`;
				let adjustingRecordAmount = await getTotalRecord(adjustingInterval);
				if (adjustingRecordAmount <= 99999) {
					result.push(adjustingInterval);
					forwardStartTime = adjustingEndTime;
					adjustingPeriod = Date.parse(initialEndTime) - Date.parse(forwardStartTime);
					if (Date.parse(forwardStartTime) === Date.parse(initialEndTime)) break;
				} else {
					while (adjustingRecordAmount > 99999) {
						adjustingPeriod /= 2;
						adjustingEndTime = new Date(Date.parse(forwardStartTime) + adjustingPeriod).toISOString();
						adjustingInterval = `${forwardStartTime}/${adjustingEndTime}`;
						adjustingRecordAmount = await getTotalRecord(adjustingInterval);
						await forceProcessSleep(2000);
					}
					result.push(adjustingInterval);
					forwardStartTime = adjustingEndTime;
				}

				await forceProcessSleep(2000);
			}
			await forceProcessSleep(2000);
		}

		return result;
	} catch (err) {
		generalLogger.error(`DefineAPIQueryInterval Func ERROR: ${err}`);
	}
};

const getContactDetail = async (contactListID, contactIDArr, queryNote) => {
	try {
		const apiEndPoint = `${GENESYS_ENDPOINT_URL}/api/v2/outbound/contactlists/${contactListID}/contacts/bulk`;
		let responseCode = null;
		let retryCounter = 1;
		do {
			const genesysToken = await generateValidToken();
			const response = await fetch(apiEndPoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `bearer ${genesysToken}`,
				},
				body: JSON.stringify(contactIDArr),
			});
			const data = await response.json();
			if (!data.status) return data;

			responseCode = data.status;
			await forceProcessSleep(3000 * retryCounter);
			generalLogger.error(
				`getContactDetail Func - Looping ERROR. Query Note = ${queryNote}. Response code = ${responseCode}. Error Msg = ${data.message}. Retrying on ${retryCounter} / 3 time.`
			);
			retryCounter++;
		} while (responseCode && responseCode !== 200 && retryCounter <= 3);

		generalLogger.error(`getContactDetail Func ERROR after 3 times retry!!!`);
		return false;
	} catch (err) {
		generalLogger.error(`getContactDetail Func ${err}. Query Note = ${queryNote}.`);
		return false;
	}
};

export { postConversationBulkDetails, getMethodAPICallsRegularModel, getTotalRecord, defineAPIQueryInterval, getContactDetail };
