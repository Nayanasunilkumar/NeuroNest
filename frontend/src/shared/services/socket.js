import { io } from "socket.io-client";
import { API_BASE_URL } from "../../config/env";

// In production, use your actual backend URL.
// Ensure CORS is set correctly on backend.
const SOCKET_URL = API_BASE_URL;

let socket;
let socketToken;

export const initSocket = () => {
    const token = localStorage.getItem("neuronest_token");
    if (!token) return null;

    // Recreate socket if auth identity changed.
    if (socket && socketToken && socketToken !== token) {
        socket.disconnect();
        socket = null;
        socketToken = null;
    }

    if (!socket) {
        socketToken = token;
        socket = io(SOCKET_URL, {
            query: { token },
            transports: ["websocket", "polling"],
            upgrade: true,
            rememberUpgrade: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 500,
            reconnectionDelayMax: 2000,
            timeout: 10000,
            withCredentials: true,
        });

        socket.on("connect", () => {
            console.log("SocketIO: Connected", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("SocketIO: Disconnected");
        });

        socket.on("error", (err) => {
            console.error("SocketIO Error:", err);
        });

        socket.on("connect_error", (err) => {
            console.error("SocketIO connect_error:", err?.message || err);
        });
    } else if (!socket.connected) {
        socket.connect();
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
        socketToken = null;
    }
};

export const getSocket = () => socket;
