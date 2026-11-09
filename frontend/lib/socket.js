import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";


export const socket = io(URL, {
  autoConnect: false,
  transports: ["websocket"],
  reconnection: true,
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000,
});