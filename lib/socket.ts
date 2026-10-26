import { io, type Socket } from "socket.io-client";
import { tokenStorage } from "./tokenStorage";

let socket: Socket | null = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(process.env.EXPO_BASE_URL!, {
      autoConnect: false,
      transports: ["websocket"],
      auth: (cb) =>
        tokenStorage
          .get()
          .then(({ accessToken }) => cb({ token: accessToken })),
    });
  }

  return socket;
};
