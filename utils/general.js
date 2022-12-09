import moment from "moment";

const forceProcessSleep = (ms) => {
	return new Promise((resolve) => setTimeout(() => resolve(), ms));
};

const triggerFuncTimestamp = () => {
	return moment().format("YYYY-MM-DD HH:mm:ss");
};

export { forceProcessSleep, triggerFuncTimestamp };
