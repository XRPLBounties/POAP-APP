import * as auth from "./auth";
import { mint, claim, getEvent, getEvents } from "./poap";
import * as user from "./user";

const API = {
  auth,
  event: {
    claim,
  },
  user,
  mint,
  getEvent,
  getEvents,
};

export default API;
