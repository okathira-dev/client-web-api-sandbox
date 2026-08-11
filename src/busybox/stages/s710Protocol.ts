export const s710Flags = {
  dark: "busybox{dark_frame}",
  broken: "busybox{broken_input}",
  qr: "busybox{qr_replaced}",
  second: "busybox{second_pass}",
} as const;

export type S710FlagKind = keyof typeof s710Flags;

export interface S710EligibilityMessage {
  channel: "busybox-s710-tool";
  session: string;
  type: "eligibility";
  eligible: Partial<Record<S710FlagKind, boolean>>;
}
