import service from "node-windows";

const nodeService = service.Service;

const svc = new nodeService({
	name: "Genesys_BIService_WebAPI_V3_Conversation",
	description: "For WebAPI Conversation Detail Version3",
	script: "D:\\GenesysBatch\\Node.js\\BI_WebAPI_V3_Conversation\\server.js",
});

svc.on("install", () => {
	svc.start();
});

svc.install();

//Uninstall
// svc.on("uninstall", () => {
// 	console.log("Uninstall complete.");
// 	console.log("The service exists: ", svc.exists);
// });

// svc.uninstall();
