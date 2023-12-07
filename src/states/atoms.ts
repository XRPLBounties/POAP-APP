import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

import config from "config";
import { ConnectorType, DialogIdentifier } from "types";

const storage = createJSONStorage(() => config.storage);

export const selectedWalletAtom = atomWithStorage(
  "selected-wallet",
  ConnectorType.EMPTY,
  storage
);

type ActiveDialogAtom = {
  type?: DialogIdentifier;
  data?: Record<string, any>;
};

export const activeDialogAtom = atom<ActiveDialogAtom>({});
