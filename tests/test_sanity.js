Components.utils.import("resource://mozmill/modules/mozmill.js");
var findElement = {}; Components.utils.import("resource://mozmill/modules/mozelement.js", findElement);

let controller = getBrowserController();
controller.open("http://ahal.ca");
controller.waitForPageLoad();

let projects = findElement.Link(controller.tabs.activeTab, "Projects");
projects.click();
controller.waitForPageLoad();
controller.sleep(1000);
