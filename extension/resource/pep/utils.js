var EXPORTED_SYMBOLS = ['readFile', 'dumpLine', 'sleep'];

const consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                 .getService(Components.interfaces.nsIConsoleService);
const hwindow = Components.classes["@mozilla.org/appshell/appShellService;1"]
                          .getService(Components.interfaces.nsIAppShellService)
                          .hiddenDOMWindow;

/**
 * Reads in the local file at filepath and returns a list
 * of all lines that were read in
 */
function readFile(filePath) {
  dumpLine("in readFile() - " + filePath);
  let file = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
  file.initWithPath(filePath);

  const fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                            .createInstance(Components.interfaces.nsIFileInputStream);
  const cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                            .createInstance(Components.interfaces.nsIConverterInputStream);
  fstream.init(file, -1, 0, 0);
  cstream.init(fstream, "UTF-8", 0, 0);
  
  let data = [];
  let (str = {}) {
    let read = 0;
    do {
      read = cstream.readString(0xffffffff, str);
      data.push(str.value);
    } while (read != 0);
  }
  cstream.close();  // Also closes fstream
  dumpLine("exiting readFile");
  return data;
};

/**
 * Sends aMessage to the console
 */
function dumpLine(aMessage) {
  dump('PEP ' + aMessage + '\n');
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
