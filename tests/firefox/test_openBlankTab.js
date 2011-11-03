// Initialize mozmill
Components.utils.import('resource://mozmill/driver/mozmill.js');
let c = getBrowserController();

c.open('http://mozilla.org');
c.waitForPageLoad();

// Only put things you want to test for responsiveness inside a perfom action call
let page = findElement.ID(c.tabs.activeTab, "home");
performAction('open_blank_tab', function() {
  page.keypress('t', {'ctrlKey': true});
  // Sleep so that the consequences of pushing new tab get tested for responsiveness
  c.sleep(100);
});

performAction('close_blank_tab', function() {
  page.keypress('w', {'ctrlKey': true});
  c.sleep(100);
});
