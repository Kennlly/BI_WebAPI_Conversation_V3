import { readJSONFile, writeJSONFile, appendFailureIntervalFile } from "../utils/fileController.js";
import { forceProcessSleep, triggerFuncTimestamp } from "../utils/general.js";
import { generalLogger, reloadJobLogger } from "../utils/loggerConfig.js";
import { defineAPIQueryInterval, postConversationBulkDetails, getTotalRecord } from "../utils/apiMethodController.js";
import integrateWholeDetail from "../models/integrateDetails.js";
import { createPool, closePool } from "../utils/databaseController.js";
import { insertConversationDetailsIntoDB, insertContactDetailsIntoDB } from "./insertDetailsIntoDB.js";
import { refactorContactData } from "../models/extractSessionLevel.js";
import { getContactDetail } from "../utils/apiMethodController.js";

const getDetailsByInterval = async (queryInterval, pageNumber) => {
	//Stored the timestamp as the function triggered
	const stageTime = triggerFuncTimestamp();
	let databasePoolName = -1;

	try {
		//Build up database connection
		const databaseConnectionObj = await createPool("ConversationDetail");
		databasePoolName = databaseConnectionObj.poolName;
		const dababasePoolInfo = databaseConnectionObj.poolInfo;

		//If param "pageNumber" provided, it must be particularly from recover request
		if (pageNumber) {
			const genesysPayload = await postConversationBulkDetails(queryInterval, pageNumber);
			if (genesysPayload.totalHits === 0) {
				reloadJobLogger.error(`There is no conversations in interval = ${queryInterval}, page number = ${pageNumber}`);
				return true;
			}
			const { ConversationDetails, ContactDetails } = integrateWholeDetail(stageTime, genesysPayload);
			const queryNote = `Interval = ${queryInterval}. Page Number = ${pageNumber}.`;
			const insertDBPromise = await insertConversationDetailsIntoDB(ConversationDetails, dababasePoolInfo, queryNote);
			if (!insertDBPromise) {
				reloadJobLogger.error(`getDetailsByInterval Func Page Number Provided - Insert Database Promise False. ${queryNote}`);
			} else {
				reloadJobLogger.info(`Database Insertion Completed: ${queryNote}`);
			}

			const contactData = refactorContactData([ContactDetails]);
			const contactDataLength = contactData.length;
			for (let i = 0; i < contactDataLength; i++) {
				const contactPayload = await getContactDetail(contactData[i].queryKey, contactData[i].queryValue, queryNote);
				const contactTablePromise = await insertContactDetailsIntoDB(contactPayload, dababasePoolInfo);

				if (!contactTablePromise) {
					reloadJobLogger.error(`Execute inserting contact table ERROR Page Number Provided for ${queryNote}`);
				} else {
					reloadJobLogger.info(
						`Execute inserting contact table ${i + 1} / ${contactDataLength} Page Number Provided COMPLETED. ${queryNote}`
					);
				}
				await forceProcessSleep(2000);
			}

			return insertDBPromise;
		}

		//If param "pageNumber" is NOT provided, it can be either from recover request or regular half-hourly call
		//Decide the interval used for POST query.
		//If param "queryInterval" is not null, it is from recovery. Else, it is from regularly half-hourly scheduled call
		let postQueryInterval = "";
		if (queryInterval) {
			postQueryInterval = queryInterval;
		} else {
			const queryStartTime = await readJSONFile("lastInterval");
			const currentTime = new Date().toISOString();
			postQueryInterval = `${queryStartTime}/${currentTime}`;
			await writeJSONFile("lastInterval", currentTime);
		}

		//Saperate the interval based on 7 days interval plus less than 100,000 records
		const genesysQueryInterval = await defineAPIQueryInterval(postQueryInterval);
		const intervalLength = genesysQueryInterval.length;

		for (let i = 0; i < intervalLength; i++) {
			//Create an array to store all the contact details within this interval
			let wholeContactDetailArr = [];

			//Get the max page number for looping the conversation API
			const recordAmount = await getTotalRecord(genesysQueryInterval[i]);

			if (recordAmount === 0) {
				generalLogger.error(`There is no conversations in interval: ${genesysQueryInterval[i]}`);
				continue;
			}

			let maxPageNumber = null;
			if (recordAmount % 100 === 0) {
				maxPageNumber = recordAmount / 100;
			} else {
				maxPageNumber = Math.ceil(recordAmount / 100);
			}

			for (let k = 1; k <= maxPageNumber; k++) {
				const genesysPayload = await postConversationBulkDetails(genesysQueryInterval[i], k);
				if (genesysPayload.totalHits === 0) {
					generalLogger.error(`There is no conversations in interval = ${genesysQueryInterval[i]}, page number = ${k}`);
					continue;
				}

				const { ConversationDetails, ContactDetails } = integrateWholeDetail(stageTime, genesysPayload);
				if (ContactDetails.size !== 0) {
					wholeContactDetailArr.push(ContactDetails);
				}

				const queryNote = `Interval = ${genesysQueryInterval[i]}. Page Number = ${k} / ${maxPageNumber}.`;

				const insertDBPromise = await insertConversationDetailsIntoDB(ConversationDetails, dababasePoolInfo, queryNote);
				if (!insertDBPromise) {
					generalLogger.error(`getDetailsByInterval Func - Insert Database Promise False. ${queryNote}`);
					await appendFailureIntervalFile(`${JSON.stringify(queryNote)}`);
				} else {
					generalLogger.info(`Database Insertion Completed: ${queryNote}`);
				}

				await forceProcessSleep(2000);
			}

			if (wholeContactDetailArr.length !== 0) {
				const queryNote = `Interval = ${genesysQueryInterval[i]}.`;
				const contactData = refactorContactData(wholeContactDetailArr);

				const contactDataLength = contactData.length;
				for (let i = 0; i < contactDataLength; i++) {
					const contactPayload = await getContactDetail(contactData[i].queryKey, contactData[i].queryValue, queryNote);

					const contactTablePromise = await insertContactDetailsIntoDB(contactPayload, dababasePoolInfo);

					if (!contactTablePromise) {
						generalLogger.error(`Execute inserting contact table error for ${queryNote}`);
					} else {
						generalLogger.info(`Execute inserting contact table ${i + 1} / ${contactDataLength} completed. ${queryNote}`);
					}
					await forceProcessSleep(2000);
				}
			}

			generalLogger.info(
				`Get conversation detail complete for interval: ${genesysQueryInterval[i]}. Total records = ${recordAmount}. Max page number = ${maxPageNumber}`
			);
		}

		return true;
	} catch (err) {
		generalLogger.error(`getDetailsByInterval Function ERROR: ${err}`);
		return false;
	} finally {
		//Close database pool
		await closePool(databasePoolName);
	}
};

export default getDetailsByInterval;
