Components.utils.import("resource://mozmill/driver/mozmill.js");
let controller = getBrowserController();

let win = findElement.ID(controller.window.document, 'main-window');
performAction("open_window", function() {
  win.keypress("n", {"ctrlKey":true});
  controller.sleep(1000);
});
