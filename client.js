module.exports = Client;

function Client(app, socket){
  this.socket = socket;
  this.app = app;
  var self = this;

  this.socket.write('Welcome ' + this.name() + '!\n');
  this.app.commands.broadcast(this, this.name() + ' joined the chat.\n');

  this.socket.on('data', function(data){
    data = data.toString();
    if(data.trim().length){
      if(data.charAt(0) === '/'){
        self.app.exec_command(self, data);
      }
      else {
        self.app.commands.broadcast(self, self.name() + ': ' + data);
      }
    }
  });

  this.socket.on('end', function(){
    self.app.commands.broadcast(self, self.name() + ' left the chat.\n');
    self.app.clients.splice(self.app.clients.indexOf(self), 1);
  });

  this.socket.on('error', function(err){
    console.log(err);
  });
}

Client.prototype.find_by_name = function(name){
  var client;

  for(var i=0, length=this.app.clients.length; i < length; i++){
    if (name === this.app.clients[i].name()){
      client = this.app.clients[i];
      break;
    }
  }

  return client;
};

Client.prototype.name = function(){
  return this.nick || 'anonymous@' + this.socket.remoteAddress + ':' + this.socket.remotePort;
};
