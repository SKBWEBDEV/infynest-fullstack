import { io } from "socket.io-client";

// ======================================================
// SOCKET SERVER URL
// ======================================================

const SOCKET_URL =
    import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(
              /\/api\/v1\/?$/,
              ""
          )
        : "http://localhost:8000";

// ======================================================
// SOCKET CONNECTION
// ======================================================

const socket = io(SOCKET_URL, {
    autoConnect: true,

    transports: ["websocket", "polling"],

    withCredentials: true,
});

export default socket;