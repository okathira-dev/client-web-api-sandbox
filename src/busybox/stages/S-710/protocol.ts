export const s710Flags = {
  dark: "busybox{dark_frame}",
  broken: "busybox{broken_input}",
  qr: "busybox{qr_replaced}",
  second: "busybox{second_pass}",
} as const;

export type S710FlagKind = keyof typeof s710Flags;

export interface S710LayoutMessage {
  channel: "busybox-s710-tool";
  height: number;
  session: string;
  type: "layout";
}
