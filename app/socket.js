import { io } from "socket.io-client";

export const socket = io("https://talkchat-backend-c03o.onrender.com", {
  transports: ["websocket"], // reliable connection
});