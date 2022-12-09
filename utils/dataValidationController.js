import { modelLogger } from "./loggerConfig.js";
import moment from "moment";

const isRequiredParam = (columnName) => {
	throw new Error(`Param is required for ${columnName}`);
};

const validateStr = (
	sourceData,
	isValidatingID = isRequiredParam("isValidatingID"),
	expectedLength = isRequiredParam("expectedLength"),
	columnName = isRequiredParam("columnName"),
	primaryKeyNote = isRequiredParam("primaryKeyNote")
) => {
	if (sourceData === undefined || sourceData === null || sourceData.length === 0) return null;

	if (isValidatingID) {
		if (sourceData.length === expectedLength) return sourceData;

		modelLogger.error(
			`Error data! Column Name = ${columnName}. Note: ${primaryKeyNote}. Problem String(NOT UUID) = ${sourceData}.`
		);
		return null;
	} else {
		if (sourceData.length === 0) return null;

		if (sourceData.length <= expectedLength) return sourceData.replace(/'/g, "''").replace(/\n/g, " ");

		modelLogger.error(`Error data! Column Name = ${columnName}. Note: ${primaryKeyNote}. Problem String = ${sourceData}.`);
		return sourceData
			.replace(/'/g, "''")
			.replace(/\n/g, " ")
			.substring(0, expectedLength - 1);
	}
};

//To confirm the interger fullfil the SQL servel INT datatype
const validateInt = (
	sourceData,
	columnName = isRequiredParam("columnName"),
	primaryKeyNote = isRequiredParam("primaryKeyNote")
) => {
	if (sourceData === undefined || sourceData === null) return null;

	if (sourceData >= 0 && sourceData <= 2147483647 && Number.isInteger(sourceData)) return sourceData;

	modelLogger.error(`Error data! Column Name = ${columnName}. Note: ${primaryKeyNote}. Problem Integer = ${sourceData}.`);
	return null;
};

const validateNumber = (
	sourceData,
	columnName = isRequiredParam("columnName"),
	primaryKeyNote = isRequiredParam("primaryKeyNote")
) => {
	if (sourceData === undefined || sourceData === null) return null;

	if (Number.isInteger(sourceData)) return sourceData;

	modelLogger.error(`Error data! Column Name = ${columnName}. Note: ${primaryKeyNote}. Problem Integer = ${sourceData}.`);
	return null;
};

const validateBool = (
	sourceData,
	columnName = isRequiredParam("columnName"),
	primaryKeyNote = isRequiredParam("primaryKeyNote")
) => {
	if (sourceData === undefined || sourceData === null) return null;

	if (typeof sourceData === "boolean") return sourceData;
	modelLogger.error(
		`Error data! Column Name = ${columnName}. Note: ${primaryKeyNote}. Problem String(NOT Boolean) = ${sourceData}.`
	);
	return null;
};

const validateDate = (
	sourceData,
	columnName = isRequiredParam("columnName"),
	primaryKeyNote = isRequiredParam("primaryKeyNote")
) => {
	if (sourceData === undefined || sourceData === null || sourceData.length === 0) return null;

	const parseMomentDateStr = moment(sourceData, "YYYY-MM-DDTHH:mm:ss.SSS[Z]");
	const isValidDateStr = parseMomentDateStr.isValid();
	if (isValidDateStr) return sourceData;

	modelLogger.error(`Error data!  Column Name = ${columnName}. Note: ${primaryKeyNote}. Problem Date String = ${sourceData}.`);
	return null;
};

export { validateStr, validateInt, validateBool, validateDate, validateNumber };
