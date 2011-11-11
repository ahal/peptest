/**
 * This test is designed to test responsiveness while performing actions
 * on various context menus in both content and chrome.
 */

// Import mozmill and initialize a controller
Components.utils.import("resource://mozmill/driver/mozmill.js")
let c = getBrowserController();

// Open mozilla.org and wait for the page to load
c.open("http://mozilla.org");
c.waitForPageLoad();

// Grab reference to element on page (this is the <body> element in this case)
let page = findElement.ID(c.tabs.activeTab, 'header');
// Perform our first action, reload.
// It is very important to only place things that we
// are interested in testing inside of a performAction call
performAction('content_reload', function() {
  page.rightClick();
  page.keypress('r');
});
c.waitForPageLoad();

c.open("http://google.com");
c.waitForPageLoad();

page = findElement.ID(c.tabs.activeTab, 'main');
// Perform our second action, go back
performAction('content_back', function() {
  page.rightClick();
  page.keypress('b');
});
// Bug 699400 - waitForPageLoad times out when pressing back button
c.sleep(10);

page = findElement.ID(c.tabs.activeTab, 'home');
// Perform our third action, scroll through context menu
performAction('content_scroll', function() {
  page.rightClick();
  for (let i = 0; i < 15; ++i) {
    page.keypress('VK_DOWN');
    // Sleep to emulate a user better
    c.sleep(10);
  }
});

// Now test context menus in chrome
let bar = findElement.ID(c.window.document, "appmenu-toolbar-button");
bar.click();
performAction('chrome_menu', function() {
  bar.rightClick();
  bar.keypress('m');
});

performAction('chrome_addon', function() {
  bar.rightClick();
  bar.keypress('a');
});

performAction('chrome_scroll', function() {
  bar.rightClick();
  for (let i = 0; i < 15; ++i) {
    page.keypress('VK_DOWN');
    // Sleep to emulate a user better
    c.sleep(10);
  }
});

