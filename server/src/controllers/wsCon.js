const fs = require("fs");

const MESSAGE_FILE = "messages.json";


const loadMessages = () => {
  if (fs.existsSync(MESSAGE_FILE)) {
    return JSON.parse(fs.readFileSync(MESSAGE_FILE));
  }
  return [];
};


const saveMessage = (messageData) => {
  const messages = loadMessages();
  messages.push(messageData);
  fs.writeFileSync(MESSAGE_FILE, JSON.stringify(messages, null, 2));
};


const handleSocketEvents = (io) => {
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    
    socket.emit("history", loadMessages());

    
    socket.on("message", (msg) => {
      const msgData = {
        socketId: socket.id,
        message: msg,
        timestamp: new Date().toISOString(),
      };

      console.log("Received:", msgData);
      saveMessage(msgData);      
      io.emit("message", msgData);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = handleSocketEvents;
