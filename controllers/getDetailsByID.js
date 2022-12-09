import { getMethodAPICallsRegularModel } from "../utils/apiMethodController.js";
import { GENESYS_ENDPOINT_URL } from "../utils/constants.js";
import { forceProcessSleep, triggerFuncTimestamp } from "../utils/general.js";
import { reloadJobLogger } from "../utils/loggerConfig.js";
import integrateWholeDetail from "../models/integrateDetails.js";
import { createPool, closePool } from "../utils/databaseController.js";
import { insertConversationDetailsIntoDB, insertContactDetailsIntoDB } from "./insertDetailsIntoDB.js";
import { refactorContactData } from "../models/extractSessionLevel.js";
import { getContactDetail } from "../utils/apiMethodController.js";

const getDetailsByID = async (conversationID, dbRequest) => {
	const stageTime = triggerFuncTimestamp();

	try {
		//Build up database connection if necessary
		let databasePoolName = -1;
		let dababasePoolInfo = {};
		if (!dbRequest) {
			const databaseConnectionObj = await createPool("recoverConversationById");
			databasePoolName = databaseConnectionObj.poolName;
			dababasePoolInfo = databaseConnectionObj.poolInfo;
		} else {
			dababasePoolInfo = dbRequest;
		}

		//Get genesys payload
		const genesysPayload = await getMethodAPICallsRegularModel(
			`${GENESYS_ENDPOINT_URL}/api/v2/analytics/conversations/${conversationID}/details`
		);
		if (genesysPayload === false)
			return reloadJobLogger.error(`Recover Conversation for ${conversationID} Error after fetching genesysAPI.`);

		const { ConversationDetails, ContactDetails } = integrateWholeDetail(stageTime, genesysPayload);

		const queryNote = `ConversationID = ${conversationID}`;
		const insertDBPromise = await insertConversationDetailsIntoDB(ConversationDetails, dababasePoolInfo, queryNote);
		if (!insertDBPromise) {
			reloadJobLogger.error(`getDetailsByID Func - Insert Database Promise False. ${queryNote}`);
			return false;
		}

		const contactData = refactorContactData([ContactDetails]);
		const contactDataLength = contactData.length;
		for (let i = 0; i < contactDataLength; i++) {
			const contactPayload = await getContactDetail(contactData[i].queryKey, contactData[i].queryValue, queryNote);
			const contactTablePromise = await insertContactDetailsIntoDB(contactPayload, dababasePoolInfo);

			if (!contactTablePromise) {
				reloadJobLogger.error(`Execute inserting contact table ERROR ConversationID Provided for ${queryNote}`);
			} else {
				reloadJobLogger.info(
					`Execute inserting contact table ${i + 1} / ${contactDataLength} ConversationID Provided COMPLETED. ${queryNote}`
				);
			}
			await forceProcessSleep(2000);
		}

		//Close database pool if necessary
		if (!dbRequest) {
			await closePool(databasePoolName);
		}

		return true;
	} catch (err) {
		reloadJobLogger.error(`getDetailsByID Function ERROR: ${err}`);
		return false;
	}
};

export default getDetailsByID;
