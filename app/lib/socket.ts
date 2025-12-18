"use client";

import { io } from "socket.io-client";

const URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

if (!URL) {
  console.warn("❌ NEXT_PUBLIC_BACKEND_API_URL is missing");
}

console.log("🔗 SOCKET ENV URL:", URL);

export const socket = io(URL, {
  withCredentials: true,
  transports: ["websocket"],
});
