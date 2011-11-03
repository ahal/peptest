Components.utils.import('resource://mozmill/driver/mozmill.js');
let c = getBrowserController();

c.open('http://mozilla.org');
c.waitForPageLoad();

let bookmark = findElement.ID(c.window.document, "bookmarksMenu");
performAction('scroll_bookmarks', function() {
  bookmark.click();
  for (let i = 0; i < 15; ++i) {
    bookmark.keypress('VK_DOWN');
    c.sleep(10);
  }
});

let showall = findElement.ID(c.window.document, "bookmarksShowAll");
performAction('show_all_bookmarks', function() {
  showall.click();
  // Sleep so consequences of clicking show all are tested for responsiveness
  c.sleep(100);
});
