var net = require('net'),
    Client = require('./client'),
    Commands = require('./commands');

function NodeNetChat(){
  this.server = net.createServer();
  this.clients = [];
  this.commands = new Commands(this);
  var self = this;

  this.server.on('connection', function(socket){
    var client = new Client(self, socket);
    self.clients.push(client);
  });

  this.server.listen(process.env.NET_CHAT_PORT || 1337, function(){
    var address = self.server.address();
    console.log('Net chat server listening at ' + address.address + ':' + address.port);
  });
}

NodeNetChat.prototype.exec_command = function(client, data){
  var string_data = data.toString().trim(),
      matches = string_data.match(/^\/(\S*)\s*(.*)$/),
      string_command = matches[1].toLowerCase(),
      args = matches[2].split(' ');

  if(this.commands.hasCommand(string_command)){
    this.commands[string_command].apply(this.commands, [client, args]);
  }
  else {
    client.socket.write('Unknown command: ' + string_command + '\n');
  }
};

var app = new NodeNetChat();
