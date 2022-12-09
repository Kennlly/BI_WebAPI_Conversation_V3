import { modelLogger } from "../utils/loggerConfig.js";
import { validateStr, validateDate } from "../utils/dataValidationController.js";

const extractConversationLevelData = (stageTime, payload) => {
	if (!payload || payload.length === 0) return [];

	try {
		//Step 1: Define if the payload from time iterval or single conversationID
		const isBulkLoadData = payload.conversations ? true : false;
		let flattedData = [];
		if (isBulkLoadData) {
			flattedData = payload.conversations;
		} else {
			flattedData = [payload];
		}

		let conversationLevelData = [];
		let divisionData = [];
		let transferParticipantLevelData = [];
		flattedData.forEach((entity) => {
			let obj = new Object();
			obj.StageTime = stageTime;
			obj.ConversationID = validateStr(entity.conversationId, true, 36, "ConversationID", "");

			const primaryKeyNote = `ConversationID = ${obj.ConversationID}. Table: [Gen_ConversationDetail_Conversation_STG]`;
			obj.ConversationStartTime = validateDate(entity.conversationStart, "ConversationStartTime", primaryKeyNote);
			obj.ConversationEndTime = validateDate(entity.conversationEnd, "ConversationEndTime", primaryKeyNote);
			obj.ConversationDuration = Number.isNaN(Date.parse(obj.ConversationEndTime) - Date.parse(obj.ConversationStartTime))
				? null
				: Date.parse(obj.ConversationEndTime) - Date.parse(obj.ConversationStartTime);
			obj.OriginatingDirection = validateStr(entity.originatingDirection, false, 8, "OriginatingDirection", primaryKeyNote);
			obj.ExternalTag = validateStr(entity.externalTag, false, 255, "ExternalTag", primaryKeyNote);
			obj.MediaStatsMinConversationMos = entity.mediaStatsMinConversationMos
				? Math.round(entity.mediaStatsMinConversationMos * 100) / 100
				: null;
			obj.MediaStatsMinConversationRFactor = entity.mediaStatsMinConversationRFactor
				? Math.round(entity.mediaStatsMinConversationRFactor * 100) / 100
				: null;

			conversationLevelData.push(obj);

			//Store the division data for next level extraction
			if (entity.divisionIds && entity.divisionIds[0] !== "") {
				divisionData.push({
					StageTime: obj.StageTime,
					ConversationID: obj.ConversationID,
					DivisionID: entity.divisionIds,
				});
			}

			//Store the participant data for next level extraction
			if (entity.participants && JSON.stringify(entity.participants)[0] !== "{}") {
				transferParticipantLevelData.push({
					StageTime: obj.StageTime,
					ConversationID: obj.ConversationID,
					ParticipantLevelData: entity.participants,
				});
			}
		});

		let result = {
			ConversationLevelData: conversationLevelData,
			DivisionData: divisionData,
			TransferParticipantLevelData: transferParticipantLevelData,
		};
		return result;
	} catch (err) {
		modelLogger.error(`ExtractConversationLevelData Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const extractDivisionData = (payload) => {
	if (!payload || payload.length === 0) return [];

	let result = [];
	try {
		payload.forEach((conversationLevelData) => {
			conversationLevelData.DivisionID.forEach((divisionId) => {
				let obj = new Object();
				obj.StageTime = conversationLevelData.StageTime;
				obj.ConversationID = conversationLevelData.ConversationID;

				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. Table: [Gen_ConversationDetail_Conversation_Division_STG]`;
				obj.DivisionID = validateStr(divisionId, true, 36, "DivisionID", primaryKeyNote);
				result.push(obj);
			});
		});

		return result;
	} catch (err) {
		modelLogger.error(`ExtractDivisionData Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

export { extractConversationLevelData, extractDivisionData };
