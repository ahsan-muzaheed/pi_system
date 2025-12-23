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
	
	//machineName="MasterServer06"
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
app.get("/trigger/:machineId", (req, res) => {//  http://connector_ms6.eagle3dstreaming.com:3000/trigger/E3DS-S11
  const machineId = req.params.machineId;

  // 1) find command config for this machine
  const command = findCommandByMachineId(machineId);
  if (!command) {
	  
	  var fsgsg="Machine not in commandMap: "+machineId
	  console.log(fsgsg)
    return res.status(404).send(fsgsg);
	
   
  }

  // 2) find the connected RPi socket
  //    (RPi clients must register with machineName = "e3dspie1"/"e3dspie2"/"e3dspie3")
  const rpiClient = findClientByMachineName(command.rpiName);
  if (!rpiClient) {
	  var fsgsg=`RPi not connected: ${command.rpiName}`
	    console.log(fsgsg)
    return res.status(404).send(fsgsg);
  }

var fsgs={
    machineId: command.machineId,
    gpioCode: command.gpioCode,
    rpiName: command.rpiName
  }
  
   console.log( "sending cmd: "+rpiClient.socket.id+ " -> "+JSON.stringify(fsgs));
  // 3) emit to RPi client
  rpiClient.socket.emit("machineCommand", fsgs);

  res.send(
    `Command sent: machineId=${command.machineId} -> ${command.rpiName} gpio=${command.gpioCode}`
  );
});


function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ------------------
// Machine Controller Page (dynamic HTML)
// ------------------
app.get("/machine-controller", (req, res) => {
  const rows = commandMap
    .map((m) => {
      const machineId = escapeHtml(m.machineId);
      const rpiName = escapeHtml(m.rpiName);
      const gpioCode = escapeHtml(m.gpioCode);

      // encodeURIComponent is important because your machineId contains spaces/() sometimes
      const encodedMachineId = encodeURIComponent(m.machineId);

      return `
        <tr>
          <td class="mono">${machineId}</td>
          <td>${rpiName}</td>
          <td class="mono">${gpioCode}</td>
          <td>
            <button onclick="triggerMachine('${encodedMachineId}')">Trigger</button>
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Machine Controller</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { margin-bottom: 10px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 10px; }
    th { background: #f5f5f5; text-align: left; }
    button { padding: 8px 12px; cursor: pointer; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
    #status { margin-top: 12px; padding: 10px; border: 1px solid #ddd; background: #fafafa; }
  </style>
</head>
<body>
  <h1>Machine Controller</h1>
  <p>Click <b>Trigger</b> to call <span class="mono">/trigger/:machineId</span>.</p>

  <table>
    <thead>
      <tr>
        <th>Machine ID</th>
        <th>RPi</th>
        <th>GPIO</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div id="status">Ready.</div>

  <script>
    async function triggerMachine(encodedMachineId) {
      const status = document.getElementById("status");
      status.textContent = "Sending...";

      try {
        const resp = await fetch("/trigger/" + encodedMachineId, { method: "GET" });
        const text = await resp.text();

        if (!resp.ok) {
          status.textContent = "ERROR: " + text;
          return;
        }

        status.textContent = "OK: " + text;
      } catch (err) {
        status.textContent = "ERROR: " + (err && err.message ? err.message : String(err));
      }
    }
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

// ------------------
server.listen(3000, () => {
  console.log("Server running on port 3000");
});
