import { isValidAddress } from "xrpl";

export const shortenAddress = (address?: string, chars: number = 4): string => {
  if (!address) {
    return "";
  }
  if (address.length <= 2 * chars) {
    return address;
  }
  if (!isValidAddress(address)) {
    throw Error(`Invalid address '${address}'`);
  }
  const start = address.slice(0, chars);
  const end = address.slice(-chars);
  return `${start}...${end}`;
};
