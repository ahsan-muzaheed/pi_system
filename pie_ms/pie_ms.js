const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Store connected clients
const clients = [];

// Command map as a JSON object keyed by machine name
const commandMap = {};

// Handle client connections
io.on('connection', (socket) => {
  console.log('A client connected.');

  // Listen for the client to send its machine name
  socket.on('registerMachine', (machineName) => {
    // Store the machine name and socket in the clients array
    clients.push({ machineName, socket });
    console.log(`Registered machine: ${machineName}`);
    
    // Initialize or update the command map for this machine
    if (!commandMap[machineName]) {
      commandMap[machineName] = {
        valueToPassToPy: 0,  // default or placeholder
        connectedToPiClone: 0 // default or placeholder
      };
    }
	
	console.dir(commandMap)
  });
});

// REST API endpoint to trigger a command
app.get('/trigger/:machineName', (req, res) => {
  const machineName = req.params.machineName;
  const command = commandMap[machineName];

  if (command) {
    const client = clients.find(c => c.machineName === machineName);

    if (client) {
      client.socket.emit('machineCommand', {
        action: machineName.includes('start') ? 'start' : 'stop',
        value: command.valueToPassToPy
      });
      res.send(`Command sent to ${machineName} with value ${command.valueToPassToPy}`);
    } else {
      res.status(404).send('Client not connected');
    }
  } else {
    res.status(404).send('Machine not found in the command map');
  }
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
