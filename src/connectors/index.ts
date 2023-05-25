import { Connector } from "./connector";
import { empty } from "./empty";
import { gem } from "./gem";
import { xumm } from "./xumm";

export enum ConnectorType {
  EMPTY = "EMPTY",
  XUMM = "XUMM",
  GEM = "GEM",
}

export const CONNECTORS = [empty, xumm, gem];

export function getConnector(c: Connector | ConnectorType) {
  if (c instanceof Connector) {
    const connector = CONNECTORS.find((x) => x === c)
    if (!connector) {
      throw Error("Unsupported connector");
    }
    return connector
  } else {
    switch (c) {
      case ConnectorType.EMPTY:
        return empty;
      case ConnectorType.XUMM:
        return xumm;
      case ConnectorType.GEM:
        return gem;
    }
  }
}


