const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ------------------
// EJS setup
// ------------------
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));

// ------------------
// Runtime clients
// ------------------
const clients = []; // [{ machineName, socket }]

// ------------------
// Static command map (ARRAY)
// ------------------
const commandMap = [
  { machineId: "E3DS-S1", rpiName: "e3dspie1", gpioCode: 2 },
  { machineId: "E3DS-S2", rpiName: "e3dspie1", gpioCode: 3 },
  { machineId: "E3DS-S4", rpiName: "e3dspie1", gpioCode: 14 },
  { machineId: "E3DS-S5", rpiName: "e3dspie1", gpioCode: 15 },
  { machineId: "E3DS-S6", rpiName: "e3dspie1", gpioCode: 17 },
  { machineId: "E3DS-S7", rpiName: "e3dspie1", gpioCode: 18 },
  { machineId: "E3DS-S8", rpiName: "e3dspie1", gpioCode: 27 },
  { machineId: "E3DS-S9", rpiName: "e3dspie1", gpioCode: 22 },
  { machineId: "E3DS-S10", rpiName: "e3dspie1", gpioCode: 23 },
  { machineId: "E3DS-S11", rpiName: "e3dspie1", gpioCode: 24 },
  { machineId: "E3DS-S12", rpiName: "e3dspie1", gpioCode: 10 },
  { machineId: "E3DS-S13", rpiName: "e3dspie1", gpioCode: 4 },
  { machineId: "E3DS-S14", rpiName: "e3dspie1", gpioCode: 25 },

  { machineId: "E3DS-S15", rpiName: "e3dspie2", gpioCode: 2 },
  { machineId: "E3DS-S16", rpiName: "e3dspie2", gpioCode: 3 },
  { machineId: "E3DS-S20", rpiName: "e3dspie2", gpioCode: 15 },
  { machineId: "E3DS-S21", rpiName: "e3dspie2", gpioCode: 14 },

  { machineId: "MP-09-MS-07 (172.7.191.81)", rpiName: "e3dspie3", gpioCode: 23 },
  { machineId: "MP-12-MS-08 (172.7.191.92)", rpiName: "e3dspie3", gpioCode: 10 },
  { machineId: "MP-06-MS-11 (172.7.191.76)", rpiName: "e3dspie3", gpioCode: 24 },
  { machineId: "E3DS-S26", rpiName: "e3dspie3", gpioCode: 15 },
  { machineId: "E3DS-AS1-N", rpiName: "e3dspie3", gpioCode: 18 },
  { machineId: "MP-04 (172.7.191.74)", rpiName: "e3dspie3", gpioCode: 22 },
  { machineId: "E3DS-S22", rpiName: "e3dspie3", gpioCode: 2 },
  { machineId: "E3DS-S23", rpiName: "e3dspie3", gpioCode: 3 },
  { machineId: "E3DS-S24", rpiName: "e3dspie3", gpioCode: 4 },
  { machineId: "E3DS-S25", rpiName: "e3dspie3", gpioCode: 14 },
  { machineId: "E3DS-S27", rpiName: "e3dspie3", gpioCode: 17 }
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

    const existingIndex = clients.findIndex((c) => c.machineName === machineName);
    if (existingIndex !== -1) {
      console.log("Same machineName found. Replacing old socket:", socket.id);
      clients.splice(existingIndex, 1);
    }

    clients.push({ machineName, socket });
    console.log("Connected clients:", clients.length);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    const index = clients.findIndex((c) => c.socket.id === socket.id);
    if (index !== -1) clients.splice(index, 1);
    console.log("Connected clients:", clients.length);
  });
});

// ------------------
// REST trigger
// ------------------
app.get("/trigger/:machineId", (req, res) => {
  const machineId = req.params.machineId;

  const command = findCommandByMachineId(machineId);
  if (!command) {
    const msg = "Machine not in commandMap: " + machineId;
    console.log(msg);
    return res.status(404).send(msg);
  }

  const rpiClient = findClientByMachineName(command.rpiName);
  if (!rpiClient) {
    const msg = `RPi not connected: ${command.rpiName}`;
    console.log(msg);
    return res.status(404).send(msg);
  }

  const payload = {
    machineId: command.machineId,
    gpioCode: command.gpioCode,
    rpiName: command.rpiName
  };

  console.log("sending cmd:", rpiClient.socket.id, payload);
  rpiClient.socket.emit("machineCommand", payload);

  res.send(`Command sent: machineId=${payload.machineId} -> ${payload.rpiName} gpio=${payload.gpioCode}`);
});

// ------------------
// EJS pages
// ------------------
app.get("/machine-controller", (req, res) => {
  res.render("machine-controller", { commandMap });
});

// Optional debug page
app.get("/clients", (req, res) => {
  const safeClients = clients.map((c) => ({
    machineName: c.machineName,
    socketId: c.socket.id
  }));
  res.render("clients", { clients: safeClients });
});

// ------------------
server.listen(3000, () => {
  console.log("Server running on port 3000");
  console.log("Open: http://localhost:3000/machine-controller");
});
