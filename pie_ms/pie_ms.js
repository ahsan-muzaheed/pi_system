const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ------------------
// Runtime clients
// ------------------
const clients = [];

// ------------------
// Static command map (YOU fill this manually)
// ------------------
const commandMap = {
  // "DESKTOP-ABC123": { valueToPassToPy: 42, piClone: 1 }
};

// ------------------
// Socket handling
// ------------------
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("registerMachine", (machineName) => {
    console.log("Registering machine:", machineName);

    // Remove old entry if reconnecting
    const existingIndex = clients.findIndex(
      (c) => c.machineName === machineName
    );
    if (existingIndex !== -1) {
		
		 console.log("registerMachine() same machine name found. repalcing previous on with new one ", socket.id);
      clients.splice(existingIndex, 1);
    }

    clients.push({ machineName, socket });
	
	console.dir(clients.length)
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    const index = clients.findIndex((c) => c.socket.id === socket.id);
    if (index !== -1) {
      clients.splice(index, 1);
    }
	
	console.dir(clients.length)
  });
});

// ------------------
// REST trigger
// ------------------
app.get("/trigger/:machineName", (req, res) => {
  const { machineName } = req.params;

  const command = commandMap[machineName];
  if (!command) {
    return res.status(404).send("Machine not in commandMap");
  }

  const client = clients.find((c) => c.machineName === machineName);
  if (!client) {
    return res.status(404).send("Machine not connected");
  }

  client.socket.emit("machineCommand", {
    value: command.valueToPassToPy,
    piClone: command.piClone
  });

  res.send(`Command sent to ${machineName}`);
});

// ------------------
server.listen(3000, () => {
  console.log("Server running on port 3000");
});
