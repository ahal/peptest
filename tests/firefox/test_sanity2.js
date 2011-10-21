Components.utils.import("resource://mozmill/driver/mozmill.js");
let controller = getBrowserController();

performAction('openGoogle', function() {
  controller.open("http://google.ca");
  controller.waitForPageLoad();
});

let textbox = findElement.ID(controller.tabs.activeTab, 'lst-ib');
let button = findElement.Name(controller.tabs.activeTab, 'btnK');
performAction('enterText', function() {
  textbox.sendKeys('foobar');
  button.click();
});
