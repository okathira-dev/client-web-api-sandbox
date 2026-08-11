export const s710Flags = {
  dark: "DARK FRAME",
  broken: "BROKEN INPUT",
  qr: "BUSYBOX{qr_frame_message}",
  second: "SECOND PASS",
} as const;

export type S710FlagKind = keyof typeof s710Flags;

export interface S710EligibilityMessage {
  channel: "busybox-s710-tool";
  session: string;
  type: "eligibility";
  eligible: Partial<Record<S710FlagKind, boolean>>;
}
