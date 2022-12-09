import { generalLogger } from "../utils/loggerConfig.js";
import { parseJSONIntoDB } from "../utils/databaseController.js";

const insertConversationDetailsIntoDB = async (payload, dbRequest, query, conversationID) => {
	try {
		const resultKeys = Object.keys(payload);
		const resultKeysLength = resultKeys.length;
		let insertionPromise = null;

		//Insert 13 BI tables, except the Session_Contact table
		for (let i = 0; i < resultKeysLength; i++) {
			let formattedJSONFormat = null;
			let dbProcedureName = null;
			const keyName = resultKeys[i];
			if (payload[keyName].length === 0) continue;

			switch (keyName) {
				case "ConversationLevelData":
					formattedJSONFormat = JSON.stringify(payload.ConversationLevelData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Conversation_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "ConversationDivisionData":
					formattedJSONFormat = JSON.stringify(payload.ConversationDivisionData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Conversation_Division_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "ParticipantLevelData":
					formattedJSONFormat = JSON.stringify(payload.ParticipantLevelData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Participant_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SessionLevelData":
					formattedJSONFormat = JSON.stringify(payload.SessionLevelData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Session_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SessionRequestRoutingData":
					formattedJSONFormat = JSON.stringify(payload.SessionRequestRoutingData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Session_RequestedRouting_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SessionCallbackNumberData":
					formattedJSONFormat = JSON.stringify(payload.SessionCallbackNumberData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Session_CallbackNumber_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SessionActiveSkillData":
					formattedJSONFormat = JSON.stringify(payload.SessionActiveSkillData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Session_ActiveSkill_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SessionFlowData":
					formattedJSONFormat = JSON.stringify(payload.SessionFlowData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Session_Flow_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SessionMetricDataOldMethod":
					formattedJSONFormat = JSON.stringify(payload.SessionMetricDataOldMethod).replace(/'/g, "''").replace(/\n/g, " ");
					// console.log("Data", formattedJSONFormat);
					dbProcedureName = "[dbo].[sp_Insert_Session_Metric_STG_OldMethod]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SessionMetricData":
					formattedJSONFormat = JSON.stringify(payload.SessionMetricData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Session_Metric_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SegmentLevelData":
					formattedJSONFormat = JSON.stringify(payload.SegmentLevelData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Segment_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SegmentSipResponseCodeData":
					formattedJSONFormat = JSON.stringify(payload.SegmentSipResponseCodeData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Segment_SipResponseCode_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SegmentRequestedRoutingSkillData":
					formattedJSONFormat = JSON.stringify(payload.SegmentRequestedRoutingSkillData)
						.replace(/'/g, "''")
						.replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Segment_RequestedRoutingSkill_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SegmentRequestedRoutingUserData":
					formattedJSONFormat = JSON.stringify(payload.SegmentRequestedRoutingUserData)
						.replace(/'/g, "''")
						.replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Segment_RequestedRoutingUser_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				case "SegmentScoredAgentData":
					formattedJSONFormat = JSON.stringify(payload.SegmentScoredAgentData).replace(/'/g, "''").replace(/\n/g, " ");
					dbProcedureName = "[dbo].[sp_Insert_Segment_ScoredAgent_STG]";
					insertionPromise = await parseJSONIntoDB(dbRequest, dbProcedureName, formattedJSONFormat);
					break;
				default:
					generalLogger.error(`Strange Table? Object Key Name: ${keyName}`);
					break;
			}

			if (!insertionPromise) {
				generalLogger.error(`${keyName} insertion has error! Job Stop!!`);
				return false;
			}
		}

		return true;
	} catch (err) {
		generalLogger.error(`insertConversationDetailsIntoDB Function ERROR: ${err}`);
	}
};

const insertContactDetailsIntoDB = async (payload, dbRequest) => {
	const refactoredJSONFormat = JSON.stringify(payload).replace(/'/g, "''").replace(/\n/g, " ");
	const procedureName = "[dbo].[sp_Insert_Gen_ConversationDetail_Session_Contact_STG]";
	const contactTablePromise = await parseJSONIntoDB(dbRequest, procedureName, refactoredJSONFormat);
	return contactTablePromise;
};

export { insertConversationDetailsIntoDB, insertContactDetailsIntoDB };
