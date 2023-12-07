// Note: only use loading to enable/disable buttons
export type StepProps = {
  active: boolean;
  loading: boolean;
  tokenId?: string;
  setLoading: (value: boolean) => void;
  setTokenId: (value?: string) => void;
  setError: (text: string | null) => void;
  setComplete: (value: boolean) => void;
};
