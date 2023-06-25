import { heartbeat } from "./auth";
import {
  mint,
  claim,
  startVerification,
  verifyOwnership,
  getEvent,
  getEvents,
  getUser,
  updateUser,
} from "apis/poap";

const API = {
  heartbeat,
  mint,
  claim,
  startVerification,
  verifyOwnership,
  getEvent,
  getEvents,
  getUser,
  updateUser,
};

export default API;
