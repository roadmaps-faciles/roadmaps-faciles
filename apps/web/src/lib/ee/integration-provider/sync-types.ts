/** Shared types for sync progress — importable from both server and client code */
export interface SyncProgress {
  current: number;
  phase: "inbound" | "outbound";
  /** null = still fetching data (indeterminate), number = item count known */
  total: null | number;
}
