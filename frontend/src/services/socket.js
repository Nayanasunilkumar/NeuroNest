import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/env";

// In production, use your actual backend URL.
// Ensure CORS is set correctly on backend.
const SOCKET_URL = API_BASE_URL;

let socket;

export const initSocket = () => {
    const token = localStorage.getItem("neuronest_token");
    if (!token) return null;

    if (!socket) {
        socket = io(SOCKET_URL, {
            query: { token },
            transports: ["websocket"],
            reconnection: true,
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
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const getSocket = () => socket;
