import type { ReactNode } from "react";

// Note: only use loading to enable/disable buttons
export type StepProps = {
  active: boolean;
  loading: boolean;
  eventId?: number;
  setLoading: (value: boolean) => void;
  setEventId: (value?: number) => void;
  setError: (text: string | null) => void;
  setComplete: (value: boolean) => void;
  setActions: (actions: ReactNode[]) => void;
};
