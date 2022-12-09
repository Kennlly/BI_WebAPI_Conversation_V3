import getDetailsByID from "./controllers/getDetailsByID.js";
import getDetailsByInterval from "./controllers/getDetailsByInterval.js";
import { reloadJobLogger } from "./utils/loggerConfig.js";

// Interval: node startRecovery.js 2022-03-19T04:00:00.000Z/2022-03-19T08:00:00.000Z

const startRecovery = async () => {
	try {
		const category = process.argv[2];
		const pageNumber = process.argv[3];

		let recoverPromise = null;
		if (category.length === 36) {
			//The param is ConversationID
			recoverPromise = await getDetailsByID(category);
		} else {
			//The param is time interval
			recoverPromise = await getDetailsByInterval(category, pageNumber);
		}

		if (recoverPromise) {
			reloadJobLogger.info(`Recovery for ${category} COMPLETE`);
		} else {
			reloadJobLogger.error(`Recovery for ${category} COMPLETE FAIL`);
		}
	} catch (err) {
		reloadJobLogger.error(`startRecovery Func ERROR: ${err}`);
	} finally {
		process.exit();
	}
};

startRecovery();
