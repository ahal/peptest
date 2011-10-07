var EXPORTED_SYMBOLS = ['broker'];

var broker = new MessageBroker();

function MessageBroker() {
  this.listeners = [];
}

MessageBroker.prototype.addListener = function(observer) {
    this.listeners.push(observer);
}

MessageBroker.prototype.removeListener = function(observer) {
    for (let i = 0; i < this.listeners.length; ++i) {
        if (this.listeners[i] == listener) {
            this.listeners.splice(i, 1); // remove listener from array
        }
    }
}

MessageBroker.prototype.sendMessage = function(msgType, obj) {
  for (let i = 0; i < this.listeners.length; ++i) {
    this.listeners[i].update(msgType, obj);
  }
}

MessageBroker.prototype.log = function(obj) {
  this.sendMessage('log', obj);
}

MessageBroker.prototype.pass = function(obj) {
  this.sendMessage('pass', obj);
}

MessageBroker.prototype.fail = function(obj) {
  this.sendMessage('fail', obj);
}
