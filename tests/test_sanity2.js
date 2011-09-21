Components.utils.import("resource://mozmill/modules/mozmill.js");
var findElement = {}; Components.utils.import("resource://mozmill/modules/mozelement.js", findElement);

let controller = getBrowserController();
controller.open("http://google.com");
controller.waitForPageLoad();
