const cmdLineHandler = Cc["@mozilla.org/commandlinehandler/general-startup;1?type=pep"]
                         .getService(Ci.nsICommandLineHandler);

function startPep() {
  window.removeEventListener("load", startPep, false);
  var cmd = cmdLineHandler.wrappedJSObject;
  if (cmd.firstRun) {
    cmd.firstRun = false;
    pepInit(cmd);
  }
}

// Register load listener for command line arguments handling.
window.addEventListener("load", startPep, false);
