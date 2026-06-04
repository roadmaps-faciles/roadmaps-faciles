"use client";

import { createContext, type ReactNode, use, useCallback, useMemo, useState, useSyncExternalStore } from "react";

import { config } from "@/config";

import {
  buildActiveFinalities,
  clearStoredConsent,
  readStoredConsent,
  subscribeConsent,
  writeStoredConsent,
} from "./store";
import { type ConsentApi, type Finality, type FinalityConsent } from "./types";

const ACTIVE_FINALITIES = buildActiveFinalities(config.tracking.provider);

const ConsentContext = createContext<ConsentApi | null>(null);

const getSnapshot = (): FinalityConsent | undefined => readStoredConsent(ACTIVE_FINALITIES);
const getServerSnapshot = (): FinalityConsent | undefined => undefined;

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const finalityConsent = useSyncExternalStore(subscribeConsent, getSnapshot, getServerSnapshot);
  const [isManagementOpen, setManagementOpen] = useState(false);
  const [bannerSlots, setBannerSlots] = useState<readonly string[]>([]);

  const registerBannerSlot = useCallback((id: string) => {
    setBannerSlots(slots => (slots.includes(id) ? slots : [...slots, id]));
  }, []);

  const unregisterBannerSlot = useCallback((id: string) => {
    setBannerSlots(slots => slots.filter(slot => slot !== id));
  }, []);

  const activeBannerSlotId = bannerSlots.length === 0 ? null : (bannerSlots.at(-1) ?? null);

  const setConsent = useCallback(
    (finality: Finality, value: boolean) => {
      writeStoredConsent({ ...(finalityConsent ?? {}), [finality]: value });
    },
    [finalityConsent],
  );

  const acceptAll = useCallback(() => {
    const next: FinalityConsent = {};
    for (const f of ACTIVE_FINALITIES) next[f] = true;
    writeStoredConsent(next);
    setManagementOpen(false);
  }, []);

  const declineAll = useCallback(() => {
    const next: FinalityConsent = {};
    for (const f of ACTIVE_FINALITIES) next[f] = false;
    writeStoredConsent(next);
    setManagementOpen(false);
  }, []);

  const reset = useCallback(() => {
    clearStoredConsent();
    setManagementOpen(false);
  }, []);

  const openManagement = useCallback(() => setManagementOpen(true), []);
  const closeManagement = useCallback(() => setManagementOpen(false), []);

  const value = useMemo<ConsentApi>(
    () => ({
      acceptAll,
      activeBannerSlotId,
      closeManagement,
      declineAll,
      finalities: ACTIVE_FINALITIES,
      finalityConsent,
      hasDecided: ACTIVE_FINALITIES.length === 0 || finalityConsent !== undefined,
      isManagementOpen,
      openManagement,
      registerBannerSlot,
      reset,
      setConsent,
      unregisterBannerSlot,
    }),
    [
      acceptAll,
      activeBannerSlotId,
      closeManagement,
      declineAll,
      finalityConsent,
      isManagementOpen,
      openManagement,
      registerBannerSlot,
      reset,
      setConsent,
      unregisterBannerSlot,
    ],
  );

  return <ConsentContext value={value}>{children}</ConsentContext>;
};

const NOOP_CONSENT_API: ConsentApi = {
  acceptAll: () => {},
  activeBannerSlotId: null,
  closeManagement: () => {},
  declineAll: () => {},
  finalities: [],
  finalityConsent: undefined,
  hasDecided: false,
  isManagementOpen: false,
  openManagement: () => {},
  registerBannerSlot: () => {},
  reset: () => {},
  setConsent: () => {},
  unregisterBannerSlot: () => {},
};

export const useConsent = (): ConsentApi => use(ConsentContext) ?? NOOP_CONSENT_API;
