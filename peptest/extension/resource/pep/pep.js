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

var EXPORTED_SYMBOLS = ['PepAPI'];
var results = {}; Components.utils.import('resource://pep/results.js', results);
var utils = {}; Components.utils.import('resource://pep/utils.js', utils);

/**
 * This is the API exposed to tests
 * Any properties of this object will be directly injected into test scope
 */
function PepAPI(testName) {
  this.testName = testName;
  this.log = new Log(this.testName);
  this.resultHandler = new results.ResultHandler(this.testName);
}
PepAPI.prototype.performAction = function(actionName, func) {
  this.resultHandler.startAction(actionName);
  func();
  this.resultHandler.endAction();
}

// Logging wrapper for tests 
function Log(testName) {
  this.testName = testName;
}
Log.prototype.debug = function(msg) {
  utils.dumpLine('DEBUG ' + this.testName + ' | ' + msg);
}
Log.prototype.info = function(msg) {
  utils.dumpLine('INFO ' + this.testName + ' | ' + msg);
}
Log.prototype.warning = function(msg) {
  utils.dumpLine('WARNING ' + this.testName + ' | ' + msg);
}
Log.prototype.error = function(msg) {
  utils.dumpLine('ERROR ' + this.testName + ' | ' + msg);
}
