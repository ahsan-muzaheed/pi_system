const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ------------------
// Runtime clients
// ------------------
const clients = []; // [{ machineName, socket }]

// ------------------
// Static command map (ARRAY)
// ------------------
const commandMap = [
  { machineId: "E3DS-S1", rpiName: "rpi1", gpioCode: 2 },
  { machineId: "E3DS-S2", rpiName: "rpi1", gpioCode: 3 },
  { machineId: "E3DS-S4", rpiName: "rpi1", gpioCode: 14 },
  { machineId: "E3DS-S5", rpiName: "rpi1", gpioCode: 15 },
  { machineId: "E3DS-S6", rpiName: "rpi1", gpioCode: 17 },
  { machineId: "E3DS-S7", rpiName: "rpi1", gpioCode: 18 },
  { machineId: "E3DS-S8", rpiName: "rpi1", gpioCode: 27 },
  { machineId: "E3DS-S9", rpiName: "rpi1", gpioCode: 22 },
  { machineId: "E3DS-S10", rpiName: "rpi1", gpioCode: 23 },
  { machineId: "E3DS-S11", rpiName: "rpi1", gpioCode: 24 },
  { machineId: "E3DS-S12", rpiName: "rpi1", gpioCode: 10 },
  { machineId: "E3DS-S13", rpiName: "rpi1", gpioCode: 4 },
  { machineId: "E3DS-S14 (172.7.191.86)", rpiName: "rpi1", gpioCode: 25 },

  { machineId: "E3DS-S15", rpiName: "rpi2", gpioCode: 2 },
  { machineId: "E3DS-S16", rpiName: "rpi2", gpioCode: 3 },
  { machineId: "E3DS-S20", rpiName: "rpi2", gpioCode: 15 },
  { machineId: "E3DS-S21", rpiName: "rpi2", gpioCode: 14 },

  { machineId: "MP-09-MS-07 (172.7.191.81)", rpiName: "rpi3", gpioCode: 23 },
  { machineId: "MP-12-MS-08 (172.7.191.92)", rpiName: "rpi3", gpioCode: 10 },
  { machineId: "MP-06-MS-11 (172.7.191.76)", rpiName: "rpi3", gpioCode: 24 },
  { machineId: "E3DS-S26-build-machine(172.7.191.69)", rpiName: "rpi3", gpioCode: 15 },
  { machineId: "E3DS-AS1-N", rpiName: "rpi3", gpioCode: 18 },
  { machineId: "MP-04 (172.7.191.74)", rpiName: "rpi3", gpioCode: 22 },
  { machineId: "E3DS-S22", rpiName: "rpi3", gpioCode: 2 },
  { machineId: "E3DS-S23", rpiName: "rpi3", gpioCode: 3 },
  { machineId: "E3DS-S24", rpiName: "rpi3", gpioCode: 4 },
  { machineId: "E3DS-S25", rpiName: "rpi3", gpioCode: 14 },
  { machineId: "E3DS-S27", rpiName: "rpi3", gpioCode: 17 }
];

// ------------------
// Helpers
// ------------------
function findClientByMachineName(machineName) {
  return clients.find((c) => c.machineName === machineName) || null;
}

function findCommandByMachineId(machineId) {
  return commandMap.find((x) => x.machineId === machineId) || null;
}

// ------------------
// Socket handling
// ------------------
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("registerMachine", (machineName) => {
    console.log("Registering machine:", machineName);

    // Remove old entry if reconnecting (same machine name)
    const existingIndex = clients.findIndex((c) => c.machineName === machineName);
    if (existingIndex !== -1) {
      console.log(
        "registerMachine() same machine name found. replacing previous one with new one",
        socket.id
      );
      clients.splice(existingIndex, 1);
    }

    clients.push({ machineName, socket });
    console.log("Connected clients:", clients.length);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    const index = clients.findIndex((c) => c.socket.id === socket.id);
    if (index !== -1) {
      clients.splice(index, 1);
    }

    console.log("Connected clients:", clients.length);
  });
});

// ------------------
// REST trigger
//   - machineName in URL is the MACHINE you want to control (machineId)
//   - server will look up which RPi should do it (rpiName) and which gpioCode
//   - server will emit to that RPi client
// ------------------
app.get("/trigger/:machineName", (req, res) => {
  const machineId = req.params.machineName;

  // 1) find command config for this machine
  const command = findCommandByMachineId(machineId);
  if (!command) {
    return res.status(404).send("Machine not in commandMap");
  }

  // 2) find the connected RPi socket
  //    (RPi clients must register with machineName = "rpi1"/"rpi2"/"rpi3")
  const rpiClient = findClientByMachineName(command.rpiName);
  if (!rpiClient) {
    return res.status(404).send(`RPi not connected: ${command.rpiName}`);
  }

  // 3) emit to RPi client
  rpiClient.socket.emit("machineCommand", {
    machineId: command.machineId,
    gpioCode: command.gpioCode,
    rpiName: command.rpiName
  });

  res.send(
    `Command sent: machineId=${command.machineId} -> ${command.rpiName} gpio=${command.gpioCode}`
  );
});

// ------------------
server.listen(3000, () => {
  console.log("Server running on port 3000");
});
