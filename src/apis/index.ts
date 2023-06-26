import { heartbeat, prelogin, login, refresh, logout } from "./auth";
import {
  mint,
  claim,
  getEvent,
  getEvents,
  getUser,
  updateUser,
} from "apis/poap";

const API = {
  auth: {
    heartbeat,
    prelogin,
    login,
    refresh,
    logout,
  },
  mint,
  claim,
  getEvent,
  getEvents,
  getUser,
  updateUser,
};

export default API;
