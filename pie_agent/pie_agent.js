const io = require('socket.io-client');
const { exec } = require('child_process');
const os = require('os');

// Connect to the Socket.IO server
const socket = io('http://localhost:3000');

// Get the machine's hostname
const machineName = os.hostname();

// Send the machine name to the server upon connection
socket.on('connect', () => {
  console.log('Connected to server. Sending machine name...');
  socket.emit('registerMachine', machineName);
});

// Listen for the machineCommand event
socket.on('machineCommand', (data) => {
  const { action, value } = data;
  console.log(`Received command: ${action} with value: ${value}`);

  const scriptPath = '/home/yourusername/Desktop/your_script.py'; // adjust the path

  exec(`python3 ${scriptPath} ${value}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return;
    }
    console.log(`Script output: ${stdout}`);
  });
});
