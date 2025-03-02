require("dotenv").config();
const express=require("express")
const { startServer } = require("./src/server.js");
const app =express()

// Start WebSocket Server
startServer();
