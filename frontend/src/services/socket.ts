import { io } from "socket.io-client";
import { BASE_URL } from "../constant/constant";

export const socket = io(BASE_URL, {
  autoConnect: false,
  auth: {
    token: localStorage.getItem("token"),
  },
});
