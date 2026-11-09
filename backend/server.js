import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";
import { PORT, CLIENT_ORIGINS } from "./src/config.js";
import { buildRoutes } from "./src/routes.js";
import { registerSocketHandlers } from "./src/socketHandlers.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: CLIENT_ORIGINS, methods: ["GET", "POST"] }));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGINS,
    methods: ["GET", "POST"],
    credentials: true,
  },

  
  pingInterval: 3000,
  pingTimeout: 3000,
});

app.use(buildRoutes(io));
registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Live Ops server running on port ${PORT}`);
  console.log(`Allowed origins: ${CLIENT_ORIGINS.join(", ")}`);
});