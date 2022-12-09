import { modelLogger } from "../utils/loggerConfig.js";
import { extractConversationLevelData, extractDivisionData } from "../models/extractConversationLevel.js";
import extractParticipantLevelData from "../models/extractParticipantLevel.js";
import {
	extractSessionLevelData,
	extractRequestRoutingData,
	extractCallbackNumberData,
	extractActiveSkillData,
	extractFlowData,
	extractMetricData,
	extractMetricDataOldMethod,
} from "../models/extractSessionLevel.js";
import {
	extractSegmentLevelData,
	extractSipResponseCodeData,
	extractRequestedRoutingSkillData,
	extractRequestedRoutingUserData,
	extractScoredAgentData,
} from "../models/extractSegmentLevel.js";

const integrateWholeDetail = (stageTime, payload) => {
	if (payload.totalHits === 0) {
		return [];
	}

	// If something wrong when fetching genesys payload
	if (!payload || payload.length === 0) {
		modelLogger.error("No data pass to integrateWholeDetail function");
		return [];
	}

	let conversationDetails = new Object();

	//Step 1: Extract Conversation Level Data
	const { ConversationLevelData, DivisionData, TransferParticipantLevelData } = extractConversationLevelData(stageTime, payload);
	//Step 1-1: [Gen_ConversationDetail_Conversation_STG]
	conversationDetails.ConversationLevelData = ConversationLevelData;
	//Step 1-2: [Gen_ConversationDetail_Conversation_Division_STG]
	conversationDetails.ConversationDivisionData = extractDivisionData(DivisionData);

	//Step 2: Extract Participant Level Data
	const { ParticipantLevelData, TransferSessionLevelData } = extractParticipantLevelData(TransferParticipantLevelData);
	//Step 2-1: [Gen_ConversationDetail_Participant_STG]
	conversationDetails.ParticipantLevelData = ParticipantLevelData;

	//Step 3: Extract Session Level Data
	const {
		SessionLevelData,
		SessionContactListData,
		SessionRequestRoutingData,
		SessionCallbackNumberData,
		SessionActiveSkillData,
		SessionFlowData,
		SessionMetricData,
		TransferSegmentLevelData,
	} = extractSessionLevelData(TransferSessionLevelData);
	//Step 3-1: [Gen_ConversationDetail_Session_STG]
	conversationDetails.SessionLevelData = SessionLevelData;
	//Step 3-2: [Gen_ConversationDetail_Session_Contact_STG]. This table needs call another API
	const contactDetails = SessionContactListData;
	//Step 3-3: [Gen_ConversationDetail_Session_RequestedRouting_STG]
	conversationDetails.SessionRequestRoutingData = extractRequestRoutingData(SessionRequestRoutingData);
	//Step 3-4: [Gen_ConversationDetail_Session_CallbackNumber_STG]
	conversationDetails.SessionCallbackNumberData = extractCallbackNumberData(SessionCallbackNumberData);
	//Step 3-5: [Gen_ConversationDetail_Session_ActiveSkill_STG]
	conversationDetails.SessionActiveSkillData = extractActiveSkillData(SessionActiveSkillData);
	//Step 3-6: [Gen_ConversationDetail_Session_Flow_STG]
	conversationDetails.SessionFlowData = extractFlowData(SessionFlowData);
	//Step 3-7: [Gen_ConversationDetail_Session_Metric_V2_STG]. Changed table schema
	conversationDetails.SessionMetricData = extractMetricData(SessionMetricData);
	//Step 3-8: [Gen_ConversationDetail_Session_Metric_STG]. Old Schema
	conversationDetails.SessionMetricDataOldMethod = extractMetricDataOldMethod(SessionMetricData);

	//Step 4: Extract Segment Level Data
	const {
		SegmentLevelData,
		SegmentSipResponseCodeData,
		SegmentRequestedRoutingSkillData,
		SegmentRequestedRoutingUserData,
		SegmentScoredAgentData,
	} = extractSegmentLevelData(TransferSegmentLevelData);
	//Step 4-1: [Gen_ConversationDetail_Session_Segment_STG]
	conversationDetails.SegmentLevelData = SegmentLevelData;
	//Step 4-2: [Gen_ConversationDetail_Session_Segment_SipResponseCode_STG]
	conversationDetails.SegmentSipResponseCodeData = extractSipResponseCodeData(SegmentSipResponseCodeData);
	//Step 4-3: [Gen_ConversationDetail_Session_Segment_RequestedRoutingSkill_STG]
	conversationDetails.SegmentRequestedRoutingSkillData = extractRequestedRoutingSkillData(SegmentRequestedRoutingSkillData);
	//Step 4-4: [Gen_ConversationDetail_Session_Segment_RequestedRoutingUser_STG]
	conversationDetails.SegmentRequestedRoutingUserData = extractRequestedRoutingUserData(SegmentRequestedRoutingUserData);
	//Step 4-5: [Gen_ConversationDetail_Session_Segment_ScoredAgent_STG]
	conversationDetails.SegmentScoredAgentData = extractScoredAgentData(SegmentScoredAgentData);

	const result = {
		ConversationDetails: conversationDetails,
		ContactDetails: contactDetails,
	};

	return result;
};

export default integrateWholeDetail;
