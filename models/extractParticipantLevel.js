import { modelLogger } from "../utils/loggerConfig.js";
import { validateStr } from "../utils/dataValidationController.js";

const extractParticipantLevelData = (payload) => {
	if (!payload || payload.length === 0) {
		modelLogger.error(`Extract Participant Level Data Function occur empty payload!`);
		return {
			ParticipantLevelData: [],
			TransferSessionLevelData: [],
		};
	}

	let participantLevelData = [];
	let transferSessionLevelData = [];

	try {
		payload.forEach((conversationLevelData) => {
			conversationLevelData.ParticipantLevelData.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = conversationLevelData.StageTime;
				obj.ConversationID = conversationLevelData.ConversationID;

				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. Table: [Gen_ConversationDetail_Participant_STG]`;
				obj.ParticipantID = validateStr(entity.participantId, true, 36, "ParticipantID", primaryKeyNote);
				obj.ParticipantName = validateStr(entity.participantName, false, 255, "ParticipantName", primaryKeyNote);
				obj.Purpose = validateStr(entity.purpose, false, 9, "Purpose", primaryKeyNote);
				obj.GenAgentID = validateStr(entity.userId, true, 36, "GenAgentID", primaryKeyNote);
				obj.TeamID = validateStr(entity.teamId, true, 36, "TeamID", primaryKeyNote);
				obj.ExternalContactID = validateStr(entity.externalContactId, true, 36, "ExternalContactID", primaryKeyNote);
				obj.ExternalOrganizationID = validateStr(
					entity.externalOrganizationId,
					true,
					36,
					"ExternalOrganizationID",
					primaryKeyNote
				);
				obj.FlaggedReason = validateStr(entity.flaggedReason, false, 7, "FlaggedReason", primaryKeyNote);

				participantLevelData.push(obj);

				//Store the session data for next level extraction
				if (entity.sessions && JSON.stringify(entity.sessions)[0] !== "{}") {
					transferSessionLevelData.push({
						StageTime: obj.StageTime,
						//Add ConversationID @25May
						ConversationID: obj.ConversationID,
						ParticipantID: obj.ParticipantID,
						SessionLevelData: entity.sessions,
					});
				}
			});
		});

		let result = {
			ParticipantLevelData: participantLevelData,
			TransferSessionLevelData: transferSessionLevelData,
		};
		return result;
	} catch (err) {
		modelLogger.error(`Extract Participant Level Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

export default extractParticipantLevelData;
