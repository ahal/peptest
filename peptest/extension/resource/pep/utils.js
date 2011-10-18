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

var EXPORTED_SYMBOLS = ['readFile', 'dumpLine', 'sleep'];

const consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
const hwindow = Components.classes["@mozilla.org/appshell/appShellService;1"]
                          .getService(Components.interfaces.nsIAppShellService)
                          .hiddenDOMWindow;


var wFile = Components.classes["@mozilla.org/file/local;1"]
                     .createInstance(Components.interfaces.nsILocalFile);
wFile.initWithPath('/home/ahal/git/peptest/peptest/peptest.log');

// Note: Due to the nature of peptest, all file IO must be synchronous, otherwise
//       it could affect user responsivness, which would skew results

                          
/**
 * Reads in the local file at filepath and returns a list
 * of all lines that were read in
 */
function readFile(filepath) {
  let file = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
  file.initWithPath(filepath);

  // open an input stream from file  
  var istream = Components.classes["@mozilla.org/network/file-input-stream;1"].  
                createInstance(Components.interfaces.nsIFileInputStream);  
  istream.init(file, 0x01, 0444, 0);  
  istream.QueryInterface(Components.interfaces.nsILineInputStream);  
  
  // read lines into array  
  var line = {}, lines = [], hasmore;  
  do {  
    hasmore = istream.readLine(line);  
    lines.push(line.value);   
  } while(hasmore);  
  
  istream.close();
  return lines;
};

function writeFile(message) {
  // file is nsIFile, data is a string  
  var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].  
                 createInstance(Components.interfaces.nsIFileOutputStream);  
    
  // use 0x02 | 0x10 to open file for appending.  
  foStream.init(wFile, 0x02 | 0x10 , 0666, 0);   
    
  // if you are sure there will never ever be any non-ascii text in data you can   
  // also call foStream.writeData directly  
  var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"].  
                  createInstance(Components.interfaces.nsIConverterOutputStream);  
  converter.init(foStream, "UTF-8", 0, 0);  
  converter.writeString(message);  
  converter.close(); // this closes foStream  
}

/**
 * Sends aMessage to the console
 */
function dumpLine(aMessage) {
  writeFile('PEP ' + aMessage + '\n');
};

/**
 * Sleep for the given amount of milliseconds
 *
 * @param {number} milliseconds
 * Sleeps the given number of milliseconds
 */
function sleep(milliseconds) {
  // We basically just call this once after the specified number of milliseconds
  var timeup = false;
  function wait() { timeup = true; }
  hwindow.setTimeout(wait, milliseconds);

  var thread = Components.classes["@mozilla.org/thread-manager;1"].
               getService().currentThread;
  while(!timeup) {
    thread.processNextEvent(true);
  }
};
