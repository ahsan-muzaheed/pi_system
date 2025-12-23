const io = require("socket.io-client");
const { exec } = require("child_process");
const os = require("os");

// ------------------
// Config
// ------------------
const SERVER_URL = "http://connector_ms6.eagle3dstreaming.com:3000";
const PY_SCRIPT = "./pie_cmd.py";

// ------------------
// Machine identity
// ------------------
const machineName = os.hostname();

// ------------------
// Socket.IO connection
// ------------------
const socket = io(SERVER_URL, {
  reconnection: true,
  reconnectionAttempts: Infinity, // keep trying forever
  reconnectionDelay: 1000,        // start at 1s
  reconnectionDelayMax: 10000,    // cap at 10s
  timeout: 20000
});

// ------------------
// Connection events
// ------------------
socket.on("connect", () => {
  console.log(`[CONNECTED] ${socket.id}`);
  socket.emit("registerMachine", machineName);
});

socket.on("disconnect", (reason) => {
  console.warn(`[DISCONNECTED] Reason: ${reason}`);
});

socket.on("reconnect", (attempt) => {
  console.log(`[RECONNECTED] after ${attempt} attempts`);
  socket.emit("registerMachine", machineName); // 🔴 VERY IMPORTANT
});

socket.on("reconnect_attempt", (attempt) => {
  console.log(`[RECONNECTING] attempt ${attempt}`);
});

socket.on("connect_error", (err) => {
  console.error("[CONNECT ERROR]", err.message);
});

// ------------------
// Command handler
// ------------------
socket.on("machineCommand", (data) => {
  console.log("machineCommand recievd " );
  console.dir(data, { depth: null });

  const { gpioCode, machineId, rpiName } = data;

  if (typeof gpioCode !== "number") {
    console.error("Invalid gpioCode received:", data);
    return;
  }

  console.log(
    `[COMMAND] machineId=${machineId}, rpi=${rpiName}, gpio=${gpioCode}`
  );

  exec(`python3 ${PY_SCRIPT} ${gpioCode}`, (error, stdout, stderr) => {
    if (error) {
      console.error("[PY ERROR]", error.message);
      return;
    }
    if (stderr) {
      console.warn("[PY STDERR]", stderr);
    }
    if (stdout) {
      console.log("[PY STDOUT]", stdout.trim());
    }
  });
});
