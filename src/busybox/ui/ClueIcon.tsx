import type { ReactNode } from "react";

export type ClueIconName =
  | "click"
  | "mouse"
  | "touch"
  | "pen"
  | "resize"
  | "selection"
  | "hidden"
  | "windows"
  | "return"
  | "offline"
  | "install"
  | "notification"
  | "orientation"
  | "light"
  | "sound"
  | "export"
  | "import"
  | "backup"
  | "devices";

export function ClueIcon({ name }: { name: ClueIconName }) {
  const paths = {
    click: <path d="M12 3v5m0 8v5M3 12h5m8 0h5m-6.5-2.5L12 12l2.5 2.5" />,
    mouse: <path d="m5 3 11 10-5 .7 2.8 5-2.7 1.5-2.8-5L5 18Z" />,
    touch: (
      <path d="M9 11V6a2 2 0 0 1 4 0v4-2a2 2 0 0 1 4 0v4-1a2 2 0 0 1 4 0v3c0 4-2.5 7-7 7h-1c-2 0-3.2-.8-4.4-2L5 15.5A2 2 0 0 1 8 13l1 1" />
    ),
    pen: (
      <path d="m4 20 4.5-1 10-10-3.5-3.5-10 10Zm9-12 3.5 3.5M15 5.5 17 3.5l3.5 3.5-2 2" />
    ),
    resize: (
      <path d="M4 9V4h5M15 4h5v5M20 15v5h-5M9 20H4v-5M4 4l6 6m10-6-6 6m6 10-6-6M4 20l6-6" />
    ),
    selection: <path d="M6 4H4v4m0 8v4h2m12 0h2v-4m0-8V4h-2M8 9h8m-8 6h8" />,
    hidden: <path d="M3 12s3-5 9-5 9 5 9 5-3 5-9 5-9-5-9-5Zm2-8 14 16" />,
    windows: <path d="M3 5h11v9H3Zm7 5h11v9H10M3 8h11m-4 5h11" />,
    return: <path d="M8 7 4 11l4 4m-4-4h9a6 6 0 0 1 6 6v2" />,
    offline: (
      <path d="M4 9a12 12 0 0 1 16 0M7 13a8 8 0 0 1 10 0m-7 4a3 3 0 0 1 4 0M3 3l18 18" />
    ),
    install: <path d="M7 3h10v18H7Zm3 3h4m-4 12h4m-2-9v6m-3-3 3 3 3-3" />,
    notification: (
      <path d="M6 16h12l-1.5-2V9a4.5 4.5 0 0 0-9 0v5Zm4 3a2 2 0 0 0 4 0" />
    ),
    orientation: (
      <path d="M8 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 15h2M3 9l3-3m12 12 3-3" />
    ),
    light: (
      <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" />
    ),
    sound: (
      <path d="M3 13h3l3 4V7l-3 4H3Zm10-4a4 4 0 0 1 0 6m3-9a8 8 0 0 1 0 12" />
    ),
    export: <path d="M12 15V3m-4 4 4-4 4 4M5 12v8h14v-8" />,
    import: <path d="M12 3v12m-4-4 4 4 4-4M5 12v8h14v-8" />,
    backup: (
      <path d="M7 18H5a4 4 0 0 1 0-8 7 7 0 0 1 13-2 5 5 0 0 1 1 10h-2m-5-7v10m-4-4 4 4 4-4" />
    ),
    devices: <path d="M3 5h12v9H3Zm4 13h4m-6 0h8m4-9h4v10h-6v-5" />,
  } satisfies Record<ClueIconName, ReactNode>;

  return (
    <svg className="clue-icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}
