import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

import { ConnectorType } from "connectors";
import { DialogIdentifier } from "types";

const storage = createJSONStorage(() => sessionStorage);
export const selectedWalletAtom = atomWithStorage(
  "selected-wallet",
  ConnectorType.EMPTY,
  storage
);

export const activeDialogAtom = atom<DialogIdentifier | undefined>(undefined);
