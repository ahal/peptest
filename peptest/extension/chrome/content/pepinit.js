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
 * The Original Code is peptest. 
 * 
 * The Initial Developer of the Original Code is 
 *   Mozilla Corporation. 
 * Portions created by the Initial Developer are Copyright (C) 2011. 
 * the Initial Developer. All Rights Reserved. 
 * 
 * Contributor(s):
 *   Andrew Halberstadt <halbersa@gmail.com> 
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
 ***** END LICENSE BLOCK ***** */ 

Components.utils.import('resource://gre/modules/NetUtil.jsm');
var msg = {}; Components.utils.import('resource://mozmill/driver/msgbroker.js', msg);
var pep = {}; Components.utils.import('resource://pep/pep.js', pep);
var utils = {}; Components.utils.import('resource://pep/utils.js', utils);

// the io service
const gIOS = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
const subscriptLoader = Cc['@mozilla.org/moz/jssubscript-loader;1']
                        .getService(Components.interfaces.mozIJSSubScriptLoader);

var appContent;

function pepInit(args) {
  try {
    let manifest = args.manifest;
    let obj = loadManifest(manifest);
    let firstRun = true;
    appContent = document.getElementById('appcontent');
    appContent.addEventListener('pageshow', function() {
      if (firstRun) {
        firstRun = false;
        runTests(obj.tests);
      }
    });
  } catch(e) {
    utils.dumpLine('ERROR ' + e.toString());
  }
}

function runTests(tests) {
  for (let i = 0; i < tests.length; ++i) {
    runFile(tests[i]);
    // Sleep for a second because tests will interfere with each other if loaded too quickly
    // TODO Figure out why they interfere with each other
    utils.sleep(1000);
  }
  utils.dumpLine('FINISHED');
  // quit the application
  subscriptLoader.loadSubScript('resource://pep/quit.js')
  goQuitApplication();
}

/**
 * Takes a path to a js file and executes it in chrome scope
 */
function runFile(test) {
  // load a test module from a file and pass in pep API as scope
  let file = Components.classes['@mozilla.org/file/local;1']
                       .createInstance(Components.interfaces.nsILocalFile);
  file.initWithPath(test.path);
  let uri = gIOS.newFileURI(file).spec;
 
  try {
    // initialize test scope
    let testScope = new pep.PepAPI(test.name);
    
    utils.dumpLine('TEST-START ' + test.name);
    let startTime = Date.now();
    subscriptLoader.loadSubScript(uri, testScope);
    let runTime = Date.now() - startTime;
    utils.dumpLine('TEST-END ' + test.name + ' ' + runTime);
  } catch (e) {
      utils.dumpLine('ERROR ' + test.name + ' | ' + e);
  }

};

/**
 * Takes in a path to a JSON manifest and returns its contents
 */
function loadManifest(manifest) {
  let data = utils.readFile(manifest);
  let json = data.join(' '); 
  return JSON.parse(json);
};

function MozmillMsgListener() {}
MozmillMsgListener.prototype.update = function(msgType, obj) {
  utils.dumpLine('MOZMILL ' + msgType + ' ' + JSON.stringify(obj) + '\n'); 
}
msg.broker.addListener(new MozmillMsgListener());
