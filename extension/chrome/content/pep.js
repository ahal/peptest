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
var events = {}; Components.utils.import("chrome://pep/content/stdlib/EventUtils.js", events);
Components.utils.import("resource://gre/modules/NetUtil.jsm");

// the io service
const gIOS = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
const windowMediator = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
const consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

var noisy = false;

function pepInit(args) {
  debugLine("in pepInit()");
  try {
    var manifest = args.manifest;
    if (args.noisy) noisy = true;
    
    debugLine("Manifest: " + manifest + "\nNoisy: " + noisy);

    //var fileURI = gIOS.newURI(manifestURI, null, null);
    //debugLine("fileURI: " + fileURI);
    
    var obj = loadManifest(manifest);
    for (let i = 0; i < obj.length; ++i ) {
        gBrowser.addTab("http://localhost:8080/" + obj[i].name);
    }
  } catch(e) {
    dumpLine(e);
  }
  debugLine("Exiting pep");
}

function loadManifest(manifest) {
  debugLine("in loadManifest");

  var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);  
  file.initWithPath(manifest);


  const fstream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
  const cstream = Cc["@mozilla.org/intl/converter-input-stream;1"].createInstance(Ci.nsIConverterInputStream);
  
  fstream.init(file, -1, 0, 0);
  cstream.init(fstream, "UTF-8", 0, 0);
  
  var data = "";
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
}

function debugLine(str) {
  if (noisy) {
    dumpLine(str);
  }
}

function dumpLine(aMessage) {
  consoleService.logStringMessage("PEP: " + aMessage);
}

