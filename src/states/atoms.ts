import { atomWithStorage, createJSONStorage } from "jotai/utils";

import { ConnectorType } from "connectors";

const storage = createJSONStorage(() => sessionStorage);
export const selectedWalletAtom = atomWithStorage("selected-wallet", ConnectorType.EMPTY, storage);
