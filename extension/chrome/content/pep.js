/* -*- Mode: C++; tab-width: 20; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is tp.
 *
 * The Initial Developer of the Original Code is
 * Mozilla Corporation.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Andrew Halberstadt <halbersa@gmail.com>
 *   Alice Nodelman <anodelman@mozilla.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */
//var loader = {}; Components.utils.import("chrome://pep/content/testloader.js", loader);
Components.utils.import("resource://mozmill/modules/init.js");
Components.utils.import("resource://gre/modules/NetUtil.jsm");
var msgmanager = {}; Components.utils.import("resource://mozmill/modules/msgmanager.js", msgmanager);

// the io service
const gIOS = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
const windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
const consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
const subscriptLoader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);

var noisy = false;
var appContent;

function pepInit(args) {
  try {
    let manifest = args.manifest;
    if (args.noisy) noisy = true;
    debugLine("in pepInit()");
    debugLine("Manifest: " + manifest + "\nNoisy: " + noisy);

    let obj = loadManifest(manifest);
    let firstRun = true;
    appContent = document.getElementById('appcontent');
    if (appContent) {
      debugLine("appContent - " + appContent.localName);
      appContent.addEventListener('pageshow', function() {
        if (firstRun) {
          firstRun = false;
          runTests(obj);
          debugLine("Exiting pep");
        }
      });
    }
  } catch(e) {
    Components.utils.reportError(e);
  }
}

function runTests(tests) {
  debugLine("in runTests");
  for (let i = 0; i < tests.length; ++i) {
    runFile(tests[i].path);
  }
  debugLine("exiting runTests");
}

/**
 * Takes a path to a js file and executes it in chrome scope
 */
function runFile(path) {
  debugLine("in runFile - " + path);
  // load a test module from a file and add some candy
  let file = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
  file.initWithPath(path);
  let uri = gIOS.newFileURI(file).spec;

  try {
    subscriptLoader.loadSubScript(uri);
  } catch(e) {
    Components.utils.reportError(e);
  }
  debugLine("exiting runFile");
};

/**
 * Takes in a path to a JSON manifest and returns its contents
 */
function loadManifest(manifest) {
  debugLine("in loadManifest");

  let file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);  
  file.initWithPath(manifest);

  const fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
  const cstream = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
  
  fstream.init(file, -1, 0, 0);
  cstream.init(fstream, "UTF-8", 0, 0);
  
  let data = "";
  let (str = {}) {
    let read = 0;
    do {
      read = cstream.readString(0xffffffff, str);
      data += str.value;
    } while (read != 0);
  }
  cstream.close();  // Also closes fstream

  debugLine("exiting loadManifest - " + data);
  return JSON.parse(data);
};

function MozmillMsgListener() {}
MozmillMsgListener.prototype.update = function(msgType, obj) {
  debugLine("MOZMILL - " + msgType + " : " + JSON.stringify(obj)); 
}
msgmanager.msg.addListener(new MozmillMsgListener());

function debugLine(str) {
  if (noisy) {
    dumpLine(str);
  }
};

function dumpLine(aMessage) {
  consoleService.logStringMessage("PEP: " + aMessage);
};

