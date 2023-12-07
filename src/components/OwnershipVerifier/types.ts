// Note: only use loading to enable/disable buttons
export type StepProps = {
  active: boolean;
  loading: boolean;
  ownerWalletAddress?: string;
  setLoading: (value: boolean) => void;
  setComplete: (value: boolean) => void;
  setError: (text: string | null) => void;
};
