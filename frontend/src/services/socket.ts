import { io } from "socket.io-client";
import { SOCKET_BASE_URL } from "../constant/constant";

export const socket = io(SOCKET_BASE_URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("token"),
  },
});
