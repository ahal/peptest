var EXPORTED_SYMBOLS = ['PepAPI'];
var results = {}; Components.utils.import('resource://pep/results.js', results);

function PepAPI(testName) {
  this.testName = testName;
  this.resultHandler = new results.ResultHandler(this.testName);
}

PepAPI.prototype.performAction = function(actionName, func) {
  this.resultHandler.startAction(actionName);
  func();
  this.resultHandler.endAction();
}
