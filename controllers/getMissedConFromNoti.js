import { forceProcessSleep, triggerFuncTimestamp } from "../utils/general.js";
import { reloadJobLogger } from "../utils/loggerConfig.js";
import getDetailsByID from "./getDetailsByID.js";
import { createPool, closePool, basicDBQuery } from "../utils/databaseController.js";
import { APP_RUNNING_ENV } from "../utils/constants.js";

const getMissedConFromNoti = async () => {
	//Stored the timestamp as the function triggered
	const stageTime = triggerFuncTimestamp();
	const reloadStartTime = Date.parse(stageTime);
	let databasePoolName = "";

	try {
		//Build up database connection
		const databaseConnectionObj = await createPool("GetMissedConversationFromNotification");
		databasePoolName = databaseConnectionObj.poolName;
		const databasePoolInfo = databaseConnectionObj.poolInfo;

		const query = "SELECT DISTINCT COUNT(*) AS [total] FROM [dbo].[GenConverID_Call_Update_STG]";
		const dbResult = await basicDBQuery(databasePoolInfo, query);
		const totalCnt = dbResult.recordset[0].total;
		if (totalCnt === 0) {
			reloadJobLogger.error(`No Conversations missed from Notification need to be reloaded for ${stageTime}`);
			return;
		}

		const coverAmount = Math.ceil(totalCnt * 0.6);

		// Defined the recordResult based on IP Address
		let recordsQuery = "";
		if (APP_RUNNING_ENV === "VM1" || APP_RUNNING_ENV === "Local") {
			recordsQuery = `SELECT DISTINCT TOP(${coverAmount}) * FROM [dbo].[GenConverID_Call_Update_STG] ORDER BY [ConversationID] ASC`;
		} else if (APP_RUNNING_ENV === "VM2") {
			recordsQuery = `SELECT DISTINCT TOP(${coverAmount}) * FROM [dbo].[GenConverID_Call_Update_STG] ORDER BY [ConversationID] DESC`;
		} else {
			reloadJobLogger.error(`GetMissedConversationFromNotification for ${stageTime} ERROR: Unknown running environment!`);
			return;
		}

		let recordsFromDB = await basicDBQuery(databasePoolInfo, recordsQuery);
		const reloadingConversationIDs = recordsFromDB.recordset.map((record) => record.ConversationID);
		const length = reloadingConversationIDs.length;

		for (let i = 0; i < length; i++) {
			const loopTimestamp = Date.now();
			const oneDayPeriod = 24 * 60 * 60 * 1000;
			if (loopTimestamp - reloadStartTime === oneDayPeriod) break;

			const conversationID = reloadingConversationIDs[i];
			const checkIDExistQuery = `SELECT * FROM [dbo].[GenConverID_Call_Update_STG] WHERE [ConversationID] = '${conversationID}'`;
			const checkIDExistResult = await basicDBQuery(databasePoolInfo, checkIDExistQuery);
			if (checkIDExistResult.recordset.length === 0) continue;
			reloadJobLogger.info(
				`GetMissedConversationFromNotification for ${stageTime} Looping. Total = ${length}, working on ${
					i + 1
				}. ConversationID = ${conversationID}`
			);

			const promise = await getDetailsByID(conversationID, databasePoolInfo);

			if (promise) {
				const insertArchiveQuery = `INSERT INTO [dbo].[GenConverID_Call_Update_Archive] VALUES ('${conversationID}','${stageTime}')`;
				const insertArchiveResult = await basicDBQuery(databasePoolInfo, insertArchiveQuery);
				if (insertArchiveResult && insertArchiveResult.rowsAffected && insertArchiveResult.rowsAffected[0] === 1) {
					const deleteSTGQuery = `DELETE FROM [dbo].[GenConverID_Call_Update_STG] WHERE [ConversationID] = '${conversationID}'`;
					await basicDBQuery(databasePoolInfo, deleteSTGQuery);
				}
			} else {
				reloadJobLogger.error(
					`GetMissedConversationFromNotification Error for ${stageTime} Looping. ConversationID: ${conversationID}`
				);
			}

			await forceProcessSleep(2000);
		}
	} catch (err) {
		reloadJobLogger.error(`GetMissedConversationFromNotification for ${stageTime} ERROR: ${err}`);
		return false;
	} finally {
		await closePool(databasePoolName);
		reloadJobLogger.info(`GetMissedConversationFromNotification for ${stageTime} Completed`);
	}
};

export default getMissedConFromNoti;
