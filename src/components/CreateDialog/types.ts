import type { ReactNode } from "react";

// Note: only use loading to enable/disable buttons
export type StepProps = {
  active: boolean;
  loading: boolean;
  setLoading: (value: boolean) => void;
  setError: (text: string | null) => void;
  setComplete: (value: boolean) => void;
  setActions: (actions: ReactNode[]) => void;
  close: (event?: {}, reason?: string) => void;
};
