// socket.js
import { io } from 'socket.io-client';

// Enable socket connection for chat functionality
const socket = io(import.meta.env.VITE_API_BASE_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true,
});

export default socket;
