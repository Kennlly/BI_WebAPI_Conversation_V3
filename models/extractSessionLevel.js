import { modelLogger } from "../utils/loggerConfig.js";
import { validateStr, validateInt, validateBool, validateDate, validateNumber } from "../utils/dataValidationController.js";

const extractSessionLevelData = (payload) => {
	if (!payload || payload.length === 0) {
		modelLogger.error(`Extract Session Level Data Function occur empty payload!`);
		return {
			SessionLevelData: [],
			SessionContactListData: [],
			SessionRequestRoutingData: [],
			SessionCallbackNumberData: [],
			SessionActiveSkillData: [],
			SessionFlowData: [],
			SessionMetricData: [],
			TransferSegmentLevelData: [],
		};
	}

	let sessionLevelData = [];
	let sessionContactListData = new Map();
	let sessionRequestRoutingData = [];
	let sessionCallbackNumberData = [];
	let sessionActiveSkillData = [];
	let sessionFlowData = [];
	let sessionMetricData = [];
	let transferSegmentLevelData = [];
	try {
		payload.forEach((participantLevelData) => {
			participantLevelData.SessionLevelData.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = participantLevelData.StageTime;
				obj.ConversationID = participantLevelData.ConversationID;
				obj.ParticipantID = participantLevelData.ParticipantID;

				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. ParticipantID = ${obj.ParticipantID}. Table: [Gen_ConversationDetail_Session_STG]`;
				obj.SessionID = validateStr(entity.sessionId, true, 36, "SessionID", primaryKeyNote);
				obj.SessionStartTime = entity.segments
					? validateDate(entity.segments[0].segmentStart, "SessionStartTime", primaryKeyNote)
					: null;
				obj.ANI = validateStr(entity.ani, false, 255, "ANI", primaryKeyNote);
				obj.Direction = validateStr(entity.direction, false, 8, "Direction", primaryKeyNote);
				obj.EdgeID = validateStr(entity.edgeId, true, 36, "EdgeID", primaryKeyNote);
				obj.MediaType = validateStr(entity.mediaType, false, 11, "MediaType", primaryKeyNote);
				obj.Provider = validateStr(entity.provider, false, 255, "Provider", primaryKeyNote);
				obj.DNIS = validateStr(entity.dnis, false, 255, "DNIS", primaryKeyNote);
				obj.SessionDNIS = validateStr(entity.sessionDnis, false, 255, "SessionDNIS", primaryKeyNote);
				obj.PeerID = validateStr(entity.peerId, true, 36, "PeerID", primaryKeyNote);
				obj.ScriptID = validateStr(entity.scriptId, true, 36, "ScriptID", primaryKeyNote);
				obj.OutboundCampaignID = validateStr(entity.outboundCampaignId, true, 36, "OutboundCampaignID", primaryKeyNote);
				obj.OutboundContactID = validateStr(entity.outboundContactId, false, 255, "OutboundContactID", primaryKeyNote);
				obj.OutboundContactListID = validateStr(
					entity.outboundContactListId,
					true,
					36,
					"OutboundContactListID",
					primaryKeyNote
				);
				obj.Remote = validateStr(entity.remote, false, 255, "Remote", primaryKeyNote);
				obj.RemoteNameDisplayable = validateStr(
					entity.remoteNameDisplayable,
					false,
					255,
					"RemoteNameDisplayable",
					primaryKeyNote
				);
				obj.AddressFrom = validateStr(entity.addressFrom, false, 255, "AddressFrom", primaryKeyNote);
				obj.AddressTo = validateStr(entity.addressTo, false, 255, "AddressTo", primaryKeyNote);
				obj.AddressSelf = validateStr(entity.addressSelf, false, 255, "AddressSelf", primaryKeyNote);
				obj.AddressOther = validateStr(entity.addressOther, false, 255, "AddressOther", primaryKeyNote);
				obj.JourneyActionID = validateStr(entity.journeyActionId, true, 36, "JourneyActionID", primaryKeyNote);
				obj.JourneyActionMapID = validateStr(entity.journeyActionMapId, true, 36, "JourneyActionMapID", primaryKeyNote);
				obj.JourneyActionMapVersion = validateInt(entity.journeyActionMapVersion, "JourneyActionMapVersion", primaryKeyNote);
				obj.JourneyCustomerID = validateStr(entity.journeyCustomerId, true, 36, "JourneyCustomerID", primaryKeyNote);
				obj.JourneyCustomerIDType = validateStr(
					entity.journeyCustomerIdType,
					false,
					255,
					"JourneyCustomerIDType",
					primaryKeyNote
				);
				obj.JourneyCustomerSessionID = validateStr(
					entity.journeyCustomerSessionId,
					true,
					36,
					"JourneyCustomerSessionID",
					primaryKeyNote
				);
				obj.JourneyCustomerSessionIDType = validateStr(
					entity.journeyCustomerSessionIdType,
					false,
					255,
					"JourneyCustomerSessionIDType",
					primaryKeyNote
				);
				obj.SharingScreen = validateBool(entity.sharingScreen, "SharingScreen", primaryKeyNote);
				obj.ScreenShareRoomID = validateStr(entity.screenShareRoomId, true, 36, "ScreenShareRoomID", primaryKeyNote);
				obj.ScreenShareAddressSelf = validateStr(
					entity.screenShareAddressSelf,
					false,
					255,
					"ScreenShareAddressSelf",
					primaryKeyNote
				);
				obj.FlowInType = validateStr(entity.flowInType, false, 255, "FlowInType", primaryKeyNote);
				obj.FlowOutType = validateStr(entity.flowOutType, false, 255, "FlowOutType", primaryKeyNote);
				obj.CobrowseRole = validateStr(entity.cobrowseRole, false, 255, "CobrowseRole", primaryKeyNote);
				obj.CobrowseRoomID = validateStr(entity.cobrowseRoomId, true, 36, "CobrowseRoomID", primaryKeyNote);
				obj.DispositionAnalyzer = validateStr(entity.dispositionAnalyzer, false, 255, "DispositionAnalyzer", primaryKeyNote);
				obj.DispositionName = validateStr(entity.dispositionName, false, 255, "DispositionName", primaryKeyNote);
				obj.VideoRoomID = validateStr(entity.videoRoomId, true, 36, "VideoRoomID", primaryKeyNote);
				obj.VideoAddressSelf = validateStr(entity.videoAddressSelf, false, 255, "VideoAddressSelf", primaryKeyNote);
				obj.ACWSkipped = validateBool(entity.acwSkipped, "ACWSkipped", primaryKeyNote);
				obj.SkipEnabled = validateBool(entity.skipEnabled, "SkipEnabled", primaryKeyNote);
				obj.SelectedAgentID = validateStr(entity.selectedAgentId, true, 36, "SelectedAgentID", primaryKeyNote);
				obj.SelectedAgentRank = validateInt(entity.selectedAgentRank, "SelectedAgentRank", primaryKeyNote);
				obj.MediaBridgeID = validateStr(entity.mediaBridgeId, true, 36, "MediaBridgeID", primaryKeyNote);
				obj.MediaCount = validateInt(entity.mediaCount, "MediaCount", primaryKeyNote);
				obj.MessageType = validateStr(entity.messageType, false, 255, "MessageType", primaryKeyNote);
				obj.TimeoutSeconds = validateInt(entity.timeoutSeconds, "TimeoutSeconds", primaryKeyNote);
				obj.ProtocolCallID = validateStr(entity.protocolCallId, false, 255, "ProtocolCallID", primaryKeyNote);
				obj.Authenticated = validateBool(entity.authenticated, "Authenticated", primaryKeyNote);
				obj.Recording = validateBool(entity.recording, "Recording", primaryKeyNote);
				obj.RoomID = validateStr(entity.roomId, true, 36, "RoomID", primaryKeyNote);
				obj.AgentAssistantID = validateStr(entity.agentAssistantId, true, 36, "AgentAssistantID", primaryKeyNote);
				obj.AssignerID = validateStr(entity.assignerId, true, 36, "AssignerID", primaryKeyNote);
				obj.MonitoredParticipantID = validateStr(
					entity.monitoredParticipantId,
					true,
					36,
					"MonitoredParticipantID",
					primaryKeyNote
				);
				obj.AgentOwned = validateBool(entity.agentOwned, "AgentOwned", primaryKeyNote);
				obj.RoutingRing = validateInt(entity.routingRing, "RoutingRing", primaryKeyNote);
				obj.AgentBullseyeRing = validateInt(entity.agentBullseyeRing, "AgentBullseyeRing", primaryKeyNote);

				sessionLevelData.push(obj);

				//Store the ContactList Data for next level extraction
				if (obj.OutboundContactListID) {
					if (sessionContactListData.has(obj.OutboundContactListID)) {
						let storedResult = sessionContactListData.get(obj.OutboundContactListID);
						if (storedResult.indexOf(obj.OutboundContactID) === -1) {
							storedResult.push(obj.OutboundContactID);
							sessionContactListData.set(obj.OutboundContactListID, storedResult);
						}
					} else {
						sessionContactListData.set(obj.OutboundContactListID, [obj.OutboundContactID]);
					}
				}

				//Store the RequestedRouting Data for next level extraction
				if (entity.requestedRoutings && entity.requestedRoutings[0] !== "") {
					sessionRequestRoutingData.push({
						StageTime: obj.StageTime,
						ConversationID: obj.ConversationID,
						SessionID: obj.SessionID,
						RequestedRoutings: entity.requestedRoutings,
						UsedRouting: entity.usedRouting,
					});
				}

				//Store the Callback Data for next level extraction
				if (entity.callbackNumbers && entity.callbackNumbers[0] !== "") {
					sessionCallbackNumberData.push({
						StageTime: obj.StageTime,
						ConversationID: obj.ConversationID,
						SessionID: obj.SessionID,
						CallbackNumbers: entity.callbackNumbers,
						CallbackScheduledTime: entity.callbackScheduledTime,
						CallbackUserName: entity.callbackUserName,
					});
				}

				//Store the ActiveSkill Data for next level extraction
				if (entity.activeSkillIds && entity.activeSkillIds[0] !== "") {
					sessionActiveSkillData.push({
						StageTime: obj.StageTime,
						ConversationID: obj.ConversationID,
						SessionID: obj.SessionID,
						ActiveSkills: entity.activeSkillIds,
					});
				}

				//Store the Flow Data for next level extraction
				if (entity.flow && JSON.stringify(entity.flow) !== "{}") {
					sessionFlowData.push({
						StageTime: obj.StageTime,
						ConversationID: obj.ConversationID,
						SessionID: obj.SessionID,
						Flows: entity.flow,
					});
				}

				//Store the Metric Data for next level extraction
				if (entity.metrics && JSON.stringify(entity.metrics[0]) !== "{}") {
					sessionMetricData.push({
						StageTime: obj.StageTime,
						ConversationID: obj.ConversationID,
						SessionID: obj.SessionID,
						Metrics: entity.metrics,
					});
				}

				//Store the Segment Data for next level extraction
				if (entity.segments && JSON.stringify(entity.segments[0]) !== "{}") {
					transferSegmentLevelData.push({
						StageTime: obj.StageTime,
						ConversationID: obj.ConversationID,
						SessionID: obj.SessionID,
						Segments: entity.segments,
					});
				}

				//Alarm Removed Skill has data
				if (entity.removedSkillIds || entity.removedSkillId) {
					modelLogger.error(`Session-Removed Skills has data, sessionID = ${obj.SessionID}`);
				}

				//Alarm Proposed Agent has data
				if (entity.proposedAgents) {
					modelLogger.error(`Session-Proposed Agent has data, sessionID = ${obj.SessionID}`);
				}
			});
		});

		let result = {
			SessionLevelData: sessionLevelData,
			SessionContactListData: sessionContactListData,
			SessionRequestRoutingData: sessionRequestRoutingData,
			SessionCallbackNumberData: sessionCallbackNumberData,
			SessionActiveSkillData: sessionActiveSkillData,
			SessionFlowData: sessionFlowData,
			SessionMetricData: sessionMetricData,
			TransferSegmentLevelData: transferSegmentLevelData,
		};

		return result;
	} catch (err) {
		modelLogger.error(`Extract Session Level Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const extractRequestRoutingData = (payload) => {
	if (!payload || payload.length === 0) return [];

	let result = [];

	try {
		payload.forEach((sessionLevelData) => {
			sessionLevelData.RequestedRoutings.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = sessionLevelData.StageTime;
				obj.ConversationID = sessionLevelData.ConversationID;
				obj.SessionID = sessionLevelData.SessionID;

				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. SessionID = ${obj.SessionID}. Table: [Gen_ConversationDetail_Session_RequestedRouting_STG]`;
				obj.RequestedRouting = validateStr(entity, false, 10, "RequestedRouting", primaryKeyNote);
				obj.UsedRouting = validateStr(sessionLevelData.UsedRouting, false, 10, "UsedRouting", primaryKeyNote);
				result.push(obj);
			});
		});

		return result;
	} catch (err) {
		modelLogger.error(`Extract Request Routing Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const extractCallbackNumberData = (payload) => {
	if (!payload || payload.length === 0) return [];

	let result = [];

	try {
		payload.forEach((sessionLevelData) => {
			sessionLevelData.CallbackNumbers.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = sessionLevelData.StageTime;
				obj.ConversationID = sessionLevelData.ConversationID;
				obj.SessionID = sessionLevelData.SessionID;

				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. SessionID = ${obj.SessionID}. Table: [Gen_ConversationDetail_Session_CallbackNumber_STG]`;
				obj.CallbackNumber = validateStr(entity, false, 255, "CallbackNumber", primaryKeyNote);
				obj.CallbackScheduledTime = validateDate(
					sessionLevelData.CallbackScheduledTime,
					"CallbackScheduledTime",
					primaryKeyNote
				);
				obj.CallbackUserName = validateStr(sessionLevelData.CallbackUserName, false, 255, "CallbackUserName", primaryKeyNote);
				result.push(obj);
			});
		});

		return result;
	} catch (err) {
		modelLogger.error(`Extract Callback Number Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const extractActiveSkillData = (payload) => {
	if (!payload || payload.length === 0) return [];

	let result = [];

	try {
		payload.forEach((sessionLevelData) => {
			sessionLevelData.ActiveSkills.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = sessionLevelData.StageTime;
				obj.ConversationID = sessionLevelData.ConversationID;
				obj.SessionID = sessionLevelData.SessionID;
				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. SessionID = ${obj.SessionID}. Table: [Gen_ConversationDetail_Session_ActiveSkill_STG]`;
				obj.ActiveSkill = validateStr(entity, true, 36, "ActiveSkill", primaryKeyNote);
				result.push(obj);
			});
		});

		return result;
	} catch (err) {
		modelLogger.error(`Extract Active Skill Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const extractFlowData = (payload) => {
	if (!payload || payload.length === 0) return [];

	let result = [];

	try {
		payload.forEach((sessionLevelData) => {
			let obj = new Object();
			const flowData = sessionLevelData.Flows;
			obj.StageTime = sessionLevelData.StageTime;
			obj.ConversationID = sessionLevelData.ConversationID;
			obj.SessionID = sessionLevelData.SessionID;

			const primaryKeyNote = `ConversationID = ${obj.ConversationID}. SessionID = ${obj.SessionID}. Table: [Gen_ConversationDetail_Session_Flow_STG]`;
			obj.FlowID = validateStr(flowData.flowId, true, 36, "FlowID", primaryKeyNote);
			obj.FlowName = validateStr(flowData.flowName, false, 255, "FlowName", primaryKeyNote);
			obj.FlowType = validateStr(flowData.flowType, false, 21, "FlowType", primaryKeyNote);
			obj.FlowVersion = flowData.flowVersion ? flowData.flowVersion : null;
			obj.StartingLanguage = validateStr(flowData.startingLanguage, false, 255, "StartingLanguage", primaryKeyNote);
			obj.EndingLanguage = validateStr(flowData.endingLanguage, false, 255, "EndingLanguage", primaryKeyNote);
			obj.EntryReason = validateStr(flowData.entryReason, false, 255, "EntryReason", primaryKeyNote);
			obj.ExitReason = validateStr(flowData.exitReason, false, 255, "ExitReason", primaryKeyNote);
			obj.EntryType = validateStr(flowData.entryType, false, 8, "EntryType", primaryKeyNote);
			obj.IssuedCallback = validateBool(flowData.issuedCallback, "IssuedCallback", primaryKeyNote);
			obj.RecognitionFailureReason = validateStr(
				flowData.recognitionFailureReason,
				false,
				255,
				"RecognitionFailureReason",
				primaryKeyNote
			);
			obj.TransferTargetAddress = validateStr(
				flowData.transferTargetAddress,
				false,
				255,
				"TransferTargetAddress",
				primaryKeyNote
			);
			obj.TransferTargetName = validateStr(flowData.transferTargetName, false, 255, "TransferTargetName", primaryKeyNote);
			obj.TransferType = validateStr(flowData.transferType, false, 255, "TransferType", primaryKeyNote);
			obj.FlowOutcome = flowData
				? flowData.outcomes
					? flowData.outcomes.length !== 0
						? flowData.outcomes
						: null
					: null
				: null;
			obj.FlowOutcomeID = null;
			obj.FlowOutcomeStartTime = null;
			obj.FlowOutcomeEndTime = null;
			obj.FlowOutcomeValue = null;

			if (obj.FlowOutcome && obj.FlowOutcome.length !== 0) {
				obj.FlowOutcome.forEach((entity) => {
					let newObj = Object.assign({}, obj);
					newObj.FlowOutcome = validateStr(entity.flowOutcome, false, 255, "FlowOutcome", primaryKeyNote);
					newObj.FlowOutcomeID = validateStr(entity.flowOutcomeId, true, 36, "FlowOutcomeID", primaryKeyNote);
					newObj.FlowOutcomeStartTime = validateDate(
						entity.flowOutcomeStartTimestamp,
						"FlowOutcomeStartTime",
						primaryKeyNote
					);
					newObj.FlowOutcomeEndTime = validateDate(entity.flowOutcomeEndTimestamp, "FlowOutcomeEndTime", primaryKeyNote);
					newObj.FlowOutcomeValue = validateStr(entity.flowOutcomeValue, false, 255, "FlowOutcomeValue", primaryKeyNote);
					result.push(newObj);
				});
			} else {
				result.push(obj);
			}
		});

		return result;
	} catch (err) {
		modelLogger.error(`Extract Flow Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const extractMetricData = (payload) => {
	if (!payload || payload.length === 0) return [];

	let result = [];

	try {
		payload.forEach((sessionLevelData) => {
			sessionLevelData.Metrics.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = sessionLevelData.StageTime;
				obj.ConversationID = sessionLevelData.ConversationID;
				obj.SessionID = sessionLevelData.SessionID;

				const primaryKeyNote = `ConversationID = ${obj.ConversationID}. SessionID = ${obj.SessionID}. Table: [Gen_ConversationDetail_Session_Metric_STG]`;
				obj.EmitDate = validateDate(entity.emitDate, "EmitDate", primaryKeyNote);
				obj.MetricKey = validateStr(entity.name, false, 255, "MetricKey", primaryKeyNote);
				obj.MetricValue = validateNumber(entity.value, "MetricValue", primaryKeyNote);
				result.push(obj);
			});
		});
		return result;
	} catch (err) {
		modelLogger.error(`Extract Metric Data Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const extractMetricDataOldMethod = (payload) => {
	if (!payload || payload.length === 0) return [];

	let result = [];

	try {
		payload.forEach((sessionLevelData) => {
			sessionLevelData.Metrics.forEach((entity) => {
				let obj = new Object();
				obj.StageTime = sessionLevelData.StageTime;
				obj.ConversationID = sessionLevelData.ConversationID;
				obj.SessionID = sessionLevelData.SessionID;
				obj.OExternalMediaCount = null;
				obj.OMediaCount = null;
				obj.OServiceLevel = null;
				obj.OServiceTarget = null;
				obj.OFlowMilestone = null;
				obj.NBlindTransferred = null;
				obj.NCobrowseSessions = null;
				obj.NConnected = null;
				obj.NConsult = null;
				obj.NConsultTransferred = null;
				obj.NError = null;
				obj.NOffered = null;
				obj.NOutbound = null;
				obj.NOutboundAbandoned = null;
				obj.NOutboundAttempted = null;
				obj.NOutboundConnected = null;
				obj.NOverSla = null;
				obj.NStateTransitionError = null;
				obj.NTransferred = null;
				obj.NFlow = null;
				obj.NFlowMilestone = null;
				obj.NFlowOutcome = null;
				obj.NFlowOutcomeFailed = null;
				obj.TAbandon = null;
				obj.TAcd = null;
				obj.TAcw = null;
				obj.TAgentResponseTime = null;
				obj.TAlert = null;
				obj.TAnswered = null;
				obj.TCallback = null;
				obj.TCallbackComplete = null;
				obj.TContacting = null;
				obj.TDialing = null;
				obj.TFlowOut = null;
				obj.THandle = null;
				obj.THeld = null;
				obj.THeldComplete = null;
				obj.TIvr = null;
				obj.TMonitoring = null;
				obj.TNotResponding = null;
				obj.TShortAbandon = null;
				obj.TTalk = null;
				obj.TTalkComplete = null;
				obj.TUserResponseTime = null;
				obj.TVoicemail = null;
				obj.TWait = null;
				obj.TFlow = null;
				obj.TFlowDisconnect = null;
				obj.TFlowExit = null;
				obj.TFlowOutcome = null;

				let metricMap = new Map();
				sessionLevelData.Metrics.forEach((metric) => {
					if (metricMap.has(metric.name)) {
						metricMap.set(metric.name, metricMap.get(metric.name) + metric.value);
					} else {
						metricMap.set(metric.name, metric.value);
					}
				});
				for (let [key, value] of metricMap) {
					const propertyName = key[0].toUpperCase() + key.substr(1);
					if (propertyName[0] === "O") {
						value = Math.round(value * 100) / 100;
					}
					if (obj.hasOwnProperty(propertyName)) {
						obj[propertyName] = value;
					}
				}
				result.push(obj);
			});
		});
		return result;
	} catch (err) {
		modelLogger.error(`Extract Metric Data Old Method Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

const refactorContactData = (payload) => {
	if (!payload || payload.length === 0) return [];

	let integrateContactData = new Map();

	try {
		payload.forEach((entity) => {
			for (const [key, value] of entity) {
				if (integrateContactData.has(key)) {
					const originalArr = integrateContactData.get(key);
					originalArr.push(...value);
					const deduArr = [...new Set(originalArr)];
					integrateContactData.set(key, deduArr);
				} else {
					integrateContactData.set(key, value);
				}
			}
		});

		let result = [];
		for (const [key, value] of integrateContactData) {
			if (value.length <= 50) {
				result.push({ queryKey: key, queryValue: value });
			} else {
				let tempIDArr = [];
				for (let i = 1; i <= value.length; i++) {
					tempIDArr.push(value[i - 1]);
					if (i % 50 === 0) {
						result.push({ queryKey: key, queryValue: tempIDArr });
						tempIDArr = [];
					}
					if (i % 50 !== 0 && i === value.length) {
						result.push({ queryKey: key, queryValue: tempIDArr });
					}
				}
			}
		}

		return result;
	} catch (err) {
		modelLogger.error(`refactorContactData Function ERROR: ${err}. Payload = ${JSON.stringify(payload)}`);
	}
};

export {
	extractSessionLevelData,
	extractRequestRoutingData,
	extractCallbackNumberData,
	extractActiveSkillData,
	extractFlowData,
	extractMetricData,
	refactorContactData,
	extractMetricDataOldMethod,
};
