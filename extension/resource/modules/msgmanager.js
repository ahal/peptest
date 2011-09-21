var EXPORTED_SYMBOLS = ['msg'];

var msg = new MessageManager();

function MessageManager() {
  this.listeners = [];
}

MessageManager.prototype.addListener = function(observer) {
    this.listeners.push(observer);
}

MessageManager.prototype.removeListener = function(observer) {
    for (let i = 0; i < this.listeners.length; ++i) {
        if (this.listeners[i] == listener) {
            this.listeners.splice(i, 1); // remove listener from array
        }
    }
}

MessageManager.prototype.sendMessage = function(msgType, obj) {
  for (let i = 0; i < this.listeners.length; ++i) {
    this.listeners[i].update(msgType, obj);
  }
}

MessageManager.prototype.log = function(obj) {
  this.sendMessage('log', obj);
}

MessageManager.prototype.pass = function(obj) {
  this.sendMessage('pass', obj);
}

MessageManager.prototype.fail = function(obj) {
  this.sendMessage('fail', obj);
}
