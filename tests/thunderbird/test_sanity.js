Components.utils.import("resource://mozmill/driver/mozmill.js");

let controller = mozmill.getMail3PaneController();
controller.window.alert('sane1');
