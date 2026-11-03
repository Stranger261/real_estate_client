import { io, type Socket } from "socket.io-client";
import { tokenStorage } from "./tokenStorage";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.EXPO_PUBLIC_API_URL!, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      auth: (cb) =>
        tokenStorage
          .get()
          .then(({ accessToken }) => cb({ token: accessToken })),
    });
  }

  return socket;
};
