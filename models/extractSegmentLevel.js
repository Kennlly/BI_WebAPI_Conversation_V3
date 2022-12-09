import { modelLogger } from "../utils/loggerConfig.js";
import { validateStr, validateInt, validateBool, validateDate } from "../utils/dataValidationController.js";

const extractSegmentLevelData = (payload) => {
	if (!payload || payload.length === 0) {
		modelLogger.error(`Extract Segment Level Data Function occur empty payload!`);
		return {
			SegmentLevelData: [],
			SegmentSipResponseCodeData: [],
			SegmentRequestedRoutingSkillData: [],
			SegmentRequestedRoutingUserData: [],
			segmentScoredAgentData: [],
		};
	}

	let segmentLevelData = [];
	let segmentSipResponseCodeData = [];
	let segmentRequestedRoutingSkillData = [];
	let segmentRequestedRoutingUserData = [];
	let segmentScoredAgentData = [];
	try {
		payload.forEach((sessionLevelData) => {
			sessionLevelData.Segments.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = sessionLevelData.StageTime;
				obj.ConversationID = sessionLevelData.ConversationID;
				obj.SessionID = sessionLevelData.SessionID;

				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. SessionID = ${obj.SessionID}. Table: [Gen_ConversationDetail_Session_Segment_STG]`;
				obj.SegmentStartTime = validateDate(entity.segmentStart, "SegmentStartTime", primaryKeyNote);
				obj.SegmentEndTime = validateDate(entity.segmentEnd, "SegmentEndTime", primaryKeyNote);
				obj.SegmentDuration = Number.isNaN(Date.parse(obj.SegmentEndTime) - Date.parse(obj.SegmentStartTime))
					? null
					: Date.parse(obj.SegmentEndTime) - Date.parse(obj.SegmentStartTime);
				obj.SegmentType = validateStr(entity.segmentType, false, 12, "SegmentType", primaryKeyNote);
				obj.DisconnectType = validateStr(entity.disconnectType, false, 22, "DisconnectType", primaryKeyNote);
				obj.QueueID = validateStr(entity.queueId, true, 36, "QueueID", primaryKeyNote);
				obj.GroupID = validateStr(entity.groupId, true, 36, "GroupID", primaryKeyNote);
				obj.Conference = validateBool(entity.conference, "Conference", primaryKeyNote);
				obj.ErrorCode = validateStr(entity.errorCode, false, 255, "ErrorCode", primaryKeyNote);
				obj.WrapUpCode = validateStr(entity.wrapUpCode, false, 255, "WrapUpCode", primaryKeyNote);
				obj.WrapUpNote = validateStr(entity.wrapUpNote, false, 1000, "WrapUpNote", primaryKeyNote);
				obj.SourceConversationID = validateStr(entity.sourceConversationId, true, 36, "SourceConversationID", primaryKeyNote);
				obj.SourceSessionID = validateStr(entity.sourceSessionId, true, 36, "SourceSessionID", primaryKeyNote);
				obj.DestinationConversationID = validateStr(
					entity.destinationConversationId,
					true,
					36,
					"DestinationConversationID",
					primaryKeyNote
				);
				obj.DestinationSessionID = validateStr(entity.destinationSessionId, true, 36, "DestinationSessionID", primaryKeyNote);
				obj.Subject = validateStr(entity.subject, false, 500, "Subject", primaryKeyNote);
				obj.RequestedLanguageID = validateStr(entity.requestedLanguageId, true, 36, "RequestedLanguageID", primaryKeyNote);
				obj.AudioMuted = validateBool(entity.audioMuted, "AudioMuted", primaryKeyNote);
				obj.VideoMuted = validateBool(entity.videoMuted, "VideoMuted", primaryKeyNote);

				segmentLevelData.push(obj);

				//Store the sipResponseCode data for next level extraction
				if (entity.sipResponseCodes && entity.sipResponseCodes.length !== 0) {
					segmentSipResponseCodeData.push({
						StageTime: obj.StageTime,
						ConversationID: obj.ConversationID,
						SessionID: obj.SessionID,
						SegmentType: obj.SegmentType,
						SegmentSipResponseCodeData: entity.sipResponseCodes,
					});
				}

				//Save the Requested Routing SkillIds data for next level extraction
				if (entity.requestedRoutingSkillIds && entity.requestedRoutingSkillIds[0] !== "") {
					segmentRequestedRoutingSkillData.push({
						StageTime: obj.StageTime,
						ConversationID: obj.ConversationID,
						SessionID: obj.SessionID,
						SegmentType: obj.SegmentType,
						SegmentRequestedRoutingSkillData: entity.requestedRoutingSkillIds,
					});
				}

				//Save the Requested Routing UserIds data for next level extraction
				if (entity.requestedRoutingUserIds && entity.requestedRoutingUserIds[0] !== "") {
					segmentRequestedRoutingUserData.push({
						StageTime: obj.StageTime,
						ConversationID: obj.ConversationID,
						SessionID: obj.SessionID,
						SegmentType: obj.SegmentType,
						SegmentRequestedRoutingUserData: entity.requestedRoutingUserIds,
					});
				}

				//Save the Scored Agents data for next level extraction
				if (entity.scoredAgents && entity.scoredAgents.length !== 0) {
					segmentScoredAgentData.push({
						StageTime: obj.StageTime,
						ConversationID: obj.ConversationID,
						SessionID: obj.SessionID,
						SegmentType: obj.SegmentType,
						SegmentScoredAgentData: entity.scoredAgents,
					});
				}

				//Alarm WrapupTag Data
				if (entity.wrapUpTags && entity.wrapUpTags[0] !== "") {
					modelLogger.error(`Segment-Wrapup Tag has data, sessionID = ${obj.SessionID}`);
				}

				//Alarm q850ResponseCodes Data
				if (entity.q850ResponseCodes && entity.q850ResponseCodes.length !== 0) {
					modelLogger.error(`Segment-Q850 Response Codes has data, sessionID = ${obj.SessionID}`);
				}
			});
		});

		const result = {
			SegmentLevelData: segmentLevelData,
			SegmentSipResponseCodeData: segmentSipResponseCodeData,
			SegmentRequestedRoutingSkillData: segmentRequestedRoutingSkillData,
			SegmentRequestedRoutingUserData: segmentRequestedRoutingUserData,
			SegmentScoredAgentData: segmentScoredAgentData,
		};

		return result;
	} catch (err) {
		modelLogger.error(`Extract Segment Level Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const extractSipResponseCodeData = (payload) => {
	if (!payload || payload.length === 0) return [];

	let result = [];

	try {
		payload.forEach((segmentLevelData) => {
			segmentLevelData.SegmentSipResponseCodeData.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = segmentLevelData.StageTime;
				obj.ConversationID = segmentLevelData.ConversationID;
				obj.SessionID = segmentLevelData.SessionID;
				obj.SegmentType = segmentLevelData.SegmentType;
				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. SessionID = ${obj.SessionID}. SegmentType = ${obj.SegmentType}. Table: [Gen_ConversationDetail_Session_Segment_SipResponseCode_STG]`;
				obj.SipResponseCode = validateInt(entity, "SipResponseCode", primaryKeyNote);
				result.push(obj);
			});
		});

		return result;
	} catch (err) {
		modelLogger.error(`Extract Sip Response Code Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const extractRequestedRoutingSkillData = (payload) => {
	if (!payload || payload.length === 0) return [];

	let result = [];

	try {
		payload.forEach((segmentLevelData) => {
			segmentLevelData.SegmentRequestedRoutingSkillData.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = segmentLevelData.StageTime;
				obj.ConversationID = segmentLevelData.ConversationID;
				obj.SessionID = segmentLevelData.SessionID;
				obj.SegmentType = segmentLevelData.SegmentType;
				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. SessionID = ${obj.SessionID}. SegmentType = ${obj.SegmentType}. Table: [Gen_ConversationDetail_Session_Segment_RequestedRoutingSkill_STG]`;
				obj.RequestedRoutingSkillID = validateStr(entity, true, 36, "RequestedRoutingSkillID", primaryKeyNote);
				result.push(obj);
			});
		});

		return result;
	} catch (err) {
		modelLogger.error(`Extract Requested Routing Skill Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const extractRequestedRoutingUserData = (payload) => {
	if (!payload || payload.length === 0) return [];

	let result = [];

	try {
		payload.forEach((segmentLevelData) => {
			segmentLevelData.SegmentRequestedRoutingUserData.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = segmentLevelData.StageTime;
				obj.ConversationID = segmentLevelData.ConversationID;
				obj.SessionID = segmentLevelData.SessionID;
				obj.SegmentType = segmentLevelData.SegmentType;
				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. SessionID = ${obj.SessionID}. SegmentType = ${obj.SegmentType}. Table: [Gen_ConversationDetail_Session_Segment_RequestedRoutingUser_STG]`;
				obj.RequestedRoutingUserID = validateStr(entity, true, 36, "RequestedRoutingUserID", primaryKeyNote);
				result.push(obj);
			});
		});

		return result;
	} catch (err) {
		modelLogger.error(`Extract Requested Routing User Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const extractScoredAgentData = (payload) => {
	if (!payload || payload.length === 0) return [];

	let result = [];

	try {
		payload.forEach((segmentLevelData) => {
			segmentLevelData.SegmentScoredAgentData.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = segmentLevelData.StageTime;
				obj.ConversationID = segmentLevelData.ConversationID;
				obj.SessionID = segmentLevelData.SessionID;
				obj.SegmentType = segmentLevelData.SegmentType;
				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. SessionID = ${obj.SessionID}. SegmentType = ${obj.SegmentType}. Table: [Gen_ConversationDetail_Session_Segment_ScoredAgent_STG]`;
				obj.AgentScore = validateInt(entity.agentScore, "AgentScore", primaryKeyNote);
				obj.ScoredAgentID = validateStr(entity.scoredAgentId, true, 36, "ScoredAgentID", primaryKeyNote);
				result.push(obj);
			});
		});

		return result;
	} catch (err) {
		modelLogger.error(`Extract Scored Agent Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

export {
	extractSegmentLevelData,
	extractSipResponseCodeData,
	extractRequestedRoutingSkillData,
	extractRequestedRoutingUserData,
	extractScoredAgentData,
};
