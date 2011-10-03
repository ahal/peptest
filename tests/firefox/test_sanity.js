Components.utils.import("resource://mozmill/driver/mozmill.js");

let controller = getBrowserController();

performAction('loadPage', function() {
  controller.open("http://ahal.ca");
  controller.waitForPageLoad();
});


let projects = findElement.Link(controller.tabs.activeTab, "Projects");
performAction('openProjects', function() {
  projects.click();
  controller.waitForPageLoad();
});
