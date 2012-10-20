module.exports = Commands;

function Commands(app){
  this.app = app;
}

// Identifies whether a command has been implemented
Commands.prototype.hasCommand = function(command){
  var result = false;
  for(var property in this){
    if(property === command && typeof this[property] === 'function'){
      result = true;
      break;
    }
  }
  return result;
};

// Send message to all users.  This is the default behavior if anything is entered
Commands.prototype.broadcast = function(client, data){
  var cleanup = [];

  for(var i=0, length=this.app.clients.length; i < length; i++){
    if(client !== this.app.clients[i]){
      if(this.app.clients[i].socket.writable){
        this.app.clients[i].socket.write(data);
      }
      else {
        cleanup.push(this.app.clients[i]);
        this.app.clients[i].socket.destroy(); // Ensure that no more I/O activity happens on this socket
      }
    }
  }

  // Cleanup any unwritable clients
  for(i=0, length=cleanup.length; i < length; i++){
    this.app.clients.splice(this.app.clients.indexOf(cleanup[i]), 1);
  }
};

// Change the nickname by which you (client) are known
// usage: /nick new_nickname
Commands.prototype.nick = function(client, args){
  var old_name = client.name();
  client.nick = args[0];  // TODO: ensure unique, length limit
  this.broadcast(client, old_name + ' is now known as ' + client.nick + '\n');
};

// Show the names of all connected clients
// usage: /names
Commands.prototype.names = function(client, args){
  var names = [];
  for(var i=0, length=this.app.clients.length; i < length; i++){
    names.push(this.app.clients[i].name());
  }
  client.socket.write(names.join(' ') + '\n');
};

// Send a private message to an individual client
// usage: /msg nickname message
Commands.prototype.msg = function(client, args){
  var target_name = args.shift(),
      message = args.join(' '),
      target_client = client.find_by_name(target_name);

  if(target_client && target_client !== 'undefined'){
    target_client.socket.write('*' + client.name() + '*: ' + message + '\n');
  }
  else {
    client.socket.write(target_name + ' could not be found\n');
  }
};

// For more commands to implement --> http://en.wikipedia.org/wiki/List_of_Internet_Relay_Chat_commands
