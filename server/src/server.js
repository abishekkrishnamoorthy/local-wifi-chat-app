require("dotenv").config({ path: "./config/.env" });
const http = require("http");
const { Server } = require("socket.io");
const os=require('os')
const handleSocketEvents = require("./controllers/wsCon");
const PORT = process.env.PORT || 8080;
let isServerRunning = false;
let server, io;

const getLocalIPv4 = () => {
  const interfaces = os.networkInterfaces();
  let wifiIP = "127.0.0.1"; // Fallback if no valid IP is found

  for (const iface in interfaces) {
    for (const info of interfaces[iface]) {
      if (
        info.family === "IPv4" && 
        !info.internal && 
        !info.address.startsWith("169.") && // Ignore auto-assigned IPs
        !info.address.startsWith("192.168.56.") // Ignore VirtualBox network
      ) {
        wifiIP = info.address; // Assign correct Wi-Fi adapter IP
      }
    }
  }
  return wifiIP;
};
const HOST= getLocalIPv4()
const startServer = () => {
  if (isServerRunning) {
    console.log("⚠️ WebSocket Server is already running!");
    return;
  }

  console.log("🟢 Starting WebSocket Server...");

  server = http.createServer();
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  handleSocketEvents(io);

  server.listen(PORT, HOST, () => {
    console.log(`🔗 WebSocket Server running at ws://${HOST}:${PORT}`);
    isServerRunning = true;
  });

  server.on("error", (error) => {
    console.error("❌ Server Error:", error.message);
  });

  process.on("uncaughtException", (err) => {
    console.error("🚨 Uncaught Exception:", err);
  });

  process.on("unhandledRejection", (reason, promise) => {
    console.error("🚨 Unhandled Rejection at:", promise, "reason:", reason);
  });
};

const stopServer = () => {
  if (!isServerRunning) {
    console.log("⚠️ WebSocket Server is not running!");
    return;
  }

  console.log("🔴 Stopping WebSocket Server...");
  
  io.close(() => console.log("🛑 WebSocket Server stopped."));
  server.close(() => {
    console.log("🛑 HTTP Server stopped.");
    isServerRunning = false;
  });
};
// Handle process termination
process.on("SIGINT", () => {
  console.log("Shutting down WebSocket server...");
  stopServer();
  process.exit();
});

module.exports = { startServer, stopServer };
