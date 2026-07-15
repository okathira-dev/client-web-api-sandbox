export type Locale = "ja" | "en";

export const messages = {
  ja: {
    tagline: "いつものブラウザが、パズルになる。",
    subtitle: "ブラウザそのものが鍵となる新感覚パズル。",
    stages: "箱の部屋",
    settings: "設定",
    about: "このゲームについて",
    progress: "開いた箱",
    boxes: "箱",
    planned: "準備中",
    start: "箱を見る",
    back: "一覧へ戻る",
    language: "言語",
    japanese: "日本語",
    english: "English",
    privacy:
      "権限は必要な箱を操作したときだけ求めます。カメラやマイクの生データは保存・送信しません。",
    aboutBody:
      "画面の中だけでなく、タブ、端末、権限、ファイルなども手掛かりになるパズルです。",
    unavailable: "この箱は、現在の環境ではまだ開けられません。",
    fatalTitle: "箱の部屋を開けませんでした",
    fatalBody:
      "再読み込みしても戻らない場合は、サイトデータを確認してください。",
    reload: "再読み込み",
  },
  en: {
    tagline: "Your everyday browser becomes the puzzle.",
    subtitle: "A new kind of puzzle game where the browser itself is the key.",
    stages: "Box room",
    settings: "Settings",
    about: "About this game",
    progress: "Opened boxes",
    boxes: "boxes",
    planned: "Coming soon",
    start: "Inspect box",
    back: "Back to boxes",
    language: "Language",
    japanese: "日本語",
    english: "English",
    privacy:
      "Permissions are requested only after you interact with a box that needs them. Raw camera and microphone data is never stored or sent.",
    aboutBody:
      "The clues extend beyond the page into tabs, devices, permissions, files, and the browser itself.",
    unavailable: "This box cannot be opened in the current environment yet.",
    fatalTitle: "The box room could not be opened",
    fatalBody: "If reloading does not help, check this site's stored data.",
    reload: "Reload",
  },
} as const;

export type MessageKey = keyof (typeof messages)["ja"];

export function detectLocale(language = navigator.language): Locale {
  return language.toLowerCase().startsWith("ja") ? "ja" : "en";
}
