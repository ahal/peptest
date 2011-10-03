// ***** BEGIN LICENSE BLOCK *****
// Version: MPL 1.1/GPL 2.0/LGPL 2.1
// 
// The contents of this file are subject to the Mozilla Public License Version
// 1.1 (the "License"); you may not use this file except in compliance with
// the License. You may obtain a copy of the License at
// http://www.mozilla.org/MPL/
// 
// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
// for the specific language governing rights and limitations under the
// License.
// 
// The Original Code is Mozilla Corporation Code.
// 
// The Initial Developer of the Original Code is
// Mikeal Rogers.
// Portions created by the Initial Developer are Copyright (C) 2008
// the Initial Developer. All Rights Reserved.
// 
// Contributor(s):
//  Mikeal Rogers <mikeal.rogers@gmail.com>
//  Gary Kwong <nth10sd@gmail.com>
// 
// Alternatively, the contents of this file may be used under the terms of
// either the GNU General Public License Version 2 or later (the "GPL"), or
// the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
// in which case the provisions of the GPL or the LGPL are applicable instead
// of those above. If you wish to allow use of your version of this file only
// under the terms of either the GPL or the LGPL, and not to allow others to
// use your version of this file under the terms of the MPL, indicate your
// decision by deleting the provisions above and replace them with the notice
// and other provisions required by the GPL or the LGPL. If you do not delete
// the provisions above, a recipient may use your version of this file under
// the terms of any one of the MPL, the GPL or the LGPL.
// 
// ***** END LICENSE BLOCK *****

var EXPORTED_SYMBOLS = ["controller", "utils", "elementslib", "findElement", "os",
                        "getBrowserController", "newBrowserController", 
                        "getAddonsController", "getPreferencesController", 
                        "newMail3PaneController", "getMail3PaneController", 
                        "wm", "platform", "getAddrbkController", 
                        "getMsgComposeController", "getDownloadsController",
                        "Application", "cleanQuit",
                        "getPlacesController", 'isMac', 'isLinux', 'isWindows',
                        "firePythonCallback"
                       ];
                        
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

// imports
var controller = {};  Components.utils.import('resource://mozmill/driver/controller.js', controller);
var utils = {};       Components.utils.import('resource://mozmill/driver/utils.js', utils);
var elementslib = {}; Components.utils.import('resource://mozmill/driver/elementslib.js', elementslib);
var findElement = {}; Components.utils.import('resource://mozmill/driver/mozelement.js', findElement);
var msg = {}; Components.utils.import('resource://mozmill/driver/msgbroker.js', msg);
var os = {}; Components.utils.import('resource://mozmill/stdlib/os.js', os);

try {
  Components.utils.import("resource://gre/modules/AddonManager.jsm");
} catch(e) { /* Firefox 4 only */ }

// platform information
var platform = os.getPlatform();
var isMac = false;
var isWindows = false;
var isLinux = false;
if (platform == "darwin"){
  isMac = true;
}
if (platform == "winnt"){
  isWindows = true;
}
if (platform == "linux"){
  isLinux = true;
}

var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
           .getService(Components.interfaces.nsIWindowMediator);
           
var appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
               .getService(Components.interfaces.nsIXULAppInfo);

var locale = Components.classes["@mozilla.org/chrome/chrome-registry;1"]
               .getService(Components.interfaces.nsIXULChromeRegistry)
               .getSelectedLocale("global");

var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"].
    getService(Components.interfaces.nsIConsoleService);

                       
applicationDictionary = {
  "{718e30fb-e89b-41dd-9da7-e25a45638b28}": "Sunbird",    
  "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}": "SeaMonkey",
  "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}": "Firefox",
  "{3550f703-e582-4d05-9a08-453d09bdfdc6}": 'Thunderbird',
}                 
                       
var Application = applicationDictionary[appInfo.ID];

if (Application == undefined) {
  // Default to Firefox
  var Application = 'Firefox';
}

// get startup time if available
// see http://blog.mozilla.com/tglek/2011/04/26/measuring-startup-speed-correctly/
var startupInfo = {};
try {
    var _startupInfo = Components.classes["@mozilla.org/toolkit/app-startup;1"]
        .getService(Components.interfaces.nsIAppStartup).getStartupInfo();
    for (var i in _startupInfo) {
        startupInfo[i] = _startupInfo[i].getTime(); // convert from Date object to ms since epoch
    }
} catch(e) {
    startupInfo = null; 
}


// keep list of installed addons to send to jsbridge for test run report
var addons = "null"; // this will be JSON parsed
if(typeof AddonManager != "undefined") {
  AddonManager.getAllAddons(function(addonList) {
      var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
          .createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
      converter.charset = 'utf-8';

      function replacer(key, value) {
          if (typeof(value) == "string") {
              try {
                  return converter.ConvertToUnicode(value);
              } catch(e) {
                  var newstring = '';
                  for (var i=0; i < value.length; i++) {
                      replacement = '';
                      if ((32 <= value.charCodeAt(i)) && (value.charCodeAt(i) < 127)) {
                          // eliminate non-convertable characters;
                          newstring += value.charAt(i);
                      } else {
                          newstring += replacement;
                      }
                  }
                  return newstring;
              }
          }
          return value;
      }

      addons = converter.ConvertToUnicode(JSON.stringify(addonList, replacer))
  });
}

function cleanQuit () {
  utils.getMethodInWindows('goQuitApplication')();
}

function addHttpResource (directory, namespace) {
  return 'http://localhost:4545/'+namespace;
}

function newBrowserController () {
  return new controller.MozMillController(utils.getMethodInWindows('OpenBrowserWindow')());
}

function getBrowserController () {
  var browserWindow = wm.getMostRecentWindow("navigator:browser");
  if (browserWindow == null) {
    return newBrowserController();
  }
  else {
    return new controller.MozMillController(browserWindow);
  }
}

function getPlacesController () {
  utils.getMethodInWindows('PlacesCommandHook').showPlacesOrganizer('AllBookmarks');
  return new controller.MozMillController(wm.getMostRecentWindow(''));
}

function getAddonsController () {
  if (Application == 'SeaMonkey') {
    utils.getMethodInWindows('toEM')();
  } else if (Application == 'Thunderbird') {
    utils.getMethodInWindows('openAddonsMgr')();
  } else if (Application == 'Sunbird') {
    utils.getMethodInWindows('goOpenAddons')();
  } else {
    utils.getMethodInWindows('BrowserOpenAddonsMgr')();
  }
  return new controller.MozMillController(wm.getMostRecentWindow(''));
}

function getDownloadsController() {
  utils.getMethodInWindows('BrowserDownloadsUI')();
  return new controller.MozMillController(wm.getMostRecentWindow(''));
}

function getPreferencesController() {
  if (Application == 'Thunderbird') {
    utils.getMethodInWindows('openOptionsDialog')();
  } else {
    utils.getMethodInWindows('openPreferences')();
  }
  return new controller.MozMillController(wm.getMostRecentWindow(''));
}

// Thunderbird functions
function newMail3PaneController () {
  return new controller.MozMillController(utils.getMethodInWindows('toMessengerWindow')());
}
 
function getMail3PaneController () {
  var mail3PaneWindow = wm.getMostRecentWindow("mail:3pane");
  if (mail3PaneWindow == null) {
    return newMail3PaneController();
  }
  else {
    return new controller.MozMillController(mail3PaneWindow);
  }
}

// Thunderbird - Address book window
function newAddrbkController () {
  utils.getMethodInWindows("toAddressBook")();
  utils.sleep(2000);
  var addyWin = wm.getMostRecentWindow("mail:addressbook");
  return new controller.MozMillController(addyWin);
}

function getAddrbkController () {
  var addrbkWindow = wm.getMostRecentWindow("mail:addressbook");
  if (addrbkWindow == null) {
    return newAddrbkController();
  }
  else {
    return new controller.MozMillController(addrbkWindow);
  }
}

function firePythonCallback (filename, method, args, kwargs) {
  obj = {'filename': filename, 'method': method};
  obj['args'] = args || [];
  obj['kwargs'] = kwargs || {};
  msg.broker.sendMessage("firePythonCallback", obj);
}

/*function timer (name) {
  this.name = name;
  this.timers = {};
  frame.timers.push(this);
  this.actions = [];
}
timer.prototype.start = function (name) {
  this.timers[name].startTime = (new Date).getTime();
} 
timer.prototype.stop = function (name) {
  var t = this.timers[name];
  t.endTime = (new Date).getTime();
  t.totalTime = (t.endTime - t.startTime);
}
timer.prototype.end = function () {
  frame.events.fireEvent("timer", this);
  frame.timers.remove(this);
}*/


/**
* Console listener which listens for error messages in the console and forwards
* them to the Mozmill reporting system for output.
*/
function ConsoleListener() {
 this.register();
}
ConsoleListener.prototype = {
 observe: function(aMessage) {
   var message = aMessage.message;
   var re = /^\[.*Error:.*(chrome|resource):\/\/.*/i;
   if (message.match(re)) {
     msg.broker.fail(aMessage);
   }
 },
 QueryInterface: function (iid) {
	if (!iid.equals(Components.interfaces.nsIConsoleListener) && !iid.equals(Components.interfaces.nsISupports)) {
		throw Components.results.NS_ERROR_NO_INTERFACE;
   }
   return this;
 },
 register: function() {
   var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"]
                              .getService(Components.interfaces.nsIConsoleService);
   aConsoleService.registerListener(this);
 },
 unregister: function() {
   var aConsoleService = Components.classes["@mozilla.org/consoleservice;1"]
                              .getService(Components.interfaces.nsIConsoleService);
   aConsoleService.unregisterListener(this);
 }
}

// start listening
var consoleListener = new ConsoleListener();

  
// Observer for new top level windows
var windowObserver = {
  observe: function(subject, topic, data) {
    attachEventListeners(subject);
  }
};
  
/**
 * Attach event listeners
 */
function attachEventListeners(window) {
  // These are the event handlers
  function pageShowHandler(event) {
    var doc = event.originalTarget;
    var tab = window.gBrowser.getBrowserForDocument(doc);

    if (tab) {
      //log("*** Loaded tab: location=" + doc.location + ", baseURI=" + doc.baseURI + "\n");
      tab.mozmillDocumentLoaded = true;
    } else {
      //log("*** Loaded HTML location=" + doc.location + ", baseURI=" + doc.baseURI + "\n");
      doc.defaultView.mozmillDocumentLoaded = true;
    }

    // We need to add/remove the unload/pagehide event listeners to preserve caching.
    window.gBrowser.addEventListener("beforeunload", beforeUnloadHandler, true);
    window.gBrowser.addEventListener("pagehide", pageHideHandler, true);
  };

  function DOMContentLoadedHandler(event) {
    var errorRegex = /about:.+(error)|(blocked)\?/;
    if (errorRegex.exec(event.target.baseURI)) {
      // Wait about 1s to be sure the DOM is ready
      mozmill.utils.sleep(1000);

      var tab = window.gBrowser.getBrowserForDocument(event.target);
      if (tab)
        tab.mozmillDocumentLoaded = true;
    
      // We need to add/remove the unload event listener to preserve caching.
      window.gBrowser.addEventListener("beforeunload", beforeUnloadHandler, true);
    }
  };
  
  // beforeunload is still needed because pagehide doesn't fire before the page is unloaded.
  // still use pagehide for cases when beforeunload doesn't get fired
  function beforeUnloadHandler(event) {
    var doc = event.originalTarget;
    var tab = window.gBrowser.getBrowserForDocument(event.target);

    if (tab) {
      //log("*** Unload tab: location=" + doc.location + ", baseURI=" + doc.baseURI + "\n");
      tab.mozmillDocumentLoaded = false;
    } else {
      //log("*** Unload HTML location=" + doc.location + ", baseURI=" + doc.baseURI + "\n");
      doc.defaultView.mozmillDocumentLoaded = false;
    }

    window.gBrowser.removeEventListener("beforeunload", beforeUnloadHandler, true);
  };

  function pageHideHandler(event) {
    // If event.persisted is false, the beforeUnloadHandler should fire
    // and there is no need for this event handler.
    if (event.persisted) {
      var doc = event.originalTarget;
      var tab = window.gBrowser.getBrowserForDocument(event.target);

      if (tab) {
        //log("*** Unload tab: location=" + doc.location + ", baseURI=" + doc.baseURI + "\n");
        tab.mozmillDocumentLoaded = false;
      } else {
        //log("*** Unload HTML location=" + doc.location + ", baseURI=" + doc.baseURI + "\n");
        doc.defaultView.mozmillDocumentLoaded = false;
      }

      window.gBrowser.removeEventListener("beforeunload", beforeUnloadHandler, true);
    }

  };

  function onWindowLoaded(event) {
    window.mozmillDocumentLoaded = true;

    if (window.gBrowser) {
      // Page is ready
      window.gBrowser.addEventListener("pageshow", pageShowHandler, true);
 
      // Note: Error pages will never fire a "load" event. For those we
      // have to wait for the "DOMContentLoaded" event. That's the final state.
      // Error pages will always have a baseURI starting with
      // "about:" followed by "error" or "blocked".
      window.gBrowser.addEventListener("DOMContentLoaded", DOMContentLoadedHandler, true);
      
      // Leave page (use caching)
      window.gBrowser.addEventListener("pagehide", pageHideHandler, true);
    }
  }
 
  // Add the event handlers to the tabbedbrowser once its window has loaded
  if (window.content) {
    onWindowLoaded();
  } else {
    window.addEventListener("load", onWindowLoaded, false);
  }
}
  
/**
 * Initialize Mozmill
 */
function initialize() {
  // Activate observer for new top level windows
  var observerService = Cc["@mozilla.org/observer-service;1"].
                        getService(Ci.nsIObserverService);
  observerService.addObserver(windowObserver, "toplevel-window-ready", false);

  // Attach event listeners to all open windows
  var enumerator = Cc["@mozilla.org/appshell/window-mediator;1"].
                   getService(Ci.nsIWindowMediator).getEnumerator("");
  while (enumerator.hasMoreElements()) {
    var win = enumerator.getNext();
    attachEventListeners(win);

    // For windows or dialogs already open we have to explicitly set the property
    // otherwise windows which load really quick never gets the property set and
    // we fail to create the controller
    win.mozmillDocumentLoaded = true;
  };
}

initialize();
