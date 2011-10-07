const cmdLineHandler = Cc["@mozilla.org/commandlinehandler/general-startup;1?type=pep"].getService(Ci.nsICommandLineHandler);
  
function startPep() {
  dump("in startPep()\n");
  window.removeEventListener("load", startPep, false);
  var cmd = cmdLineHandler.wrappedJSObject;
  pepInit(cmd);
}

// Register load listener for command line arguments handling.
window.addEventListener("load", startPep, false);
