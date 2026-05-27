export type Finality = "matomo" | "posthog";

export type FinalityConsent = Partial<Record<Finality, boolean>>;

export interface ConsentPayload {
  decidedAt: string;
  finalityConsent: FinalityConsent;
  version: number;
}

export interface ConsentApi {
  acceptAll: () => void;
  activeBannerSlotId: null | string;
  closeManagement: () => void;
  declineAll: () => void;
  finalities: readonly Finality[];
  finalityConsent: FinalityConsent | undefined;
  hasDecided: boolean;
  isManagementOpen: boolean;
  openManagement: () => void;
  registerBannerSlot: (id: string) => void;
  reset: () => void;
  setConsent: (finality: Finality, value: boolean) => void;
  unregisterBannerSlot: (id: string) => void;
}
