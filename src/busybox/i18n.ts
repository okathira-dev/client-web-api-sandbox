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
    available: "挑戦できる",
    partial: "一部開いた",
    solved: "開いた",
    problemNeverSolved: "一度も開いていない。リボン付き",
    problemReplayReady: "過去に開いた。今回はまだ閉じている",
    problemSolvedThisVisit: "今回開いた",
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
    storageReady: "このブラウザに進捗を保存しています。",
    storageLoading: "進捗を読み込んでいます…",
    storageUnavailable:
      "進捗を保存できません。このタブを閉じるまで一時的に遊べます。",
    storageCorrupt:
      "保存データを読み取れません。自動では上書きしていません。必要なら進捗を初期化してください。",
    storageFuture:
      "新しい版で作られた進捗です。この版では上書きせず読み取り専用にします。",
    exportProgress: "進捗を書き出す",
    resetProgress: "この端末の進捗を初期化",
    resetConfirm:
      "この端末に保存したBusyboxの進捗を削除します。元に戻せません。",
    pwa: "オフラインとインストール",
    pwaDevelopment:
      "開発モードではキャッシュせず、Service Worker機能だけを有効にしています。",
    pwaReady: "オフライン起動の準備ができています。",
    pwaRegistering: "オフライン起動を準備しています…",
    pwaUnsupported: "このブラウザはService Workerに対応していません。",
    pwaError:
      "オフライン起動を準備できませんでした。HTTPSまたは接続状態を確認してください。",
    pwaUpdate: "新しい版があります。更新する",
    drive: "Google Driveバックアップ（任意）",
    driveUnconfigured:
      "公開環境にGoogle OAuth Client IDが設定されていません。ローカル進捗には影響しません。",
    driveIdle: "アプリ専用の非表示領域だけを使います。接続と同期",
    driveMergeNotice:
      "同期時に選んだGoogleアカウントと現在のローカル進捗を統合します。別アカウントを選ぶと、そのクリア情報も混ざります。",
    driveAuthorizing: "Googleの許可画面を待っています…",
    driveSyncing: "ローカルとDriveの進捗を統合しています…",
    driveSuccess: "同期しました。両方で開いた箱を残しています。",
    driveError:
      "同期できませんでした。ローカル進捗は変更していません。もう一度試す",
    driveDisconnect: "Google Driveとの接続を解除",
    driveDeleted:
      "Driveのバックアップを削除しました。ローカル進捗は残っています。",
    driveDelete: "Driveバックアップを削除",
    driveDeleteConfirm:
      "Google Driveのアプリ専用バックアップを完全に削除します。ローカル進捗は削除しません。",
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
    available: "Ready",
    partial: "Partly open",
    solved: "Opened",
    problemNeverSolved: "Never opened. Ribbon attached",
    problemReplayReady: "Opened before. Still closed this visit",
    problemSolvedThisVisit: "Opened this visit",
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
    storageReady: "Progress is stored in this browser.",
    storageLoading: "Loading progress…",
    storageUnavailable:
      "Progress cannot be saved. You can keep playing temporarily until this tab closes.",
    storageCorrupt:
      "Stored data cannot be read and has not been overwritten. Reset progress if you want to recover.",
    storageFuture:
      "This progress was created by a newer version. It remains read-only here.",
    exportProgress: "Export progress",
    resetProgress: "Reset progress on this device",
    resetConfirm:
      "Delete Busybox progress stored on this device? This cannot be undone.",
    pwa: "Offline and installation",
    pwaDevelopment:
      "Development mode keeps Service Worker APIs active without caching files.",
    pwaReady: "Offline launch is ready.",
    pwaRegistering: "Preparing offline launch…",
    pwaUnsupported: "This browser does not support Service Workers.",
    pwaError:
      "Offline launch could not be prepared. Check HTTPS and your connection.",
    pwaUpdate: "A new version is ready. Update",
    drive: "Google Drive backup (optional)",
    driveUnconfigured:
      "No Google OAuth client ID is configured for this deployment. Local progress is unaffected.",
    driveIdle: "Only the app's hidden data folder is used. Connect and sync",
    driveMergeNotice:
      "Sync merges local progress with the Google account you select. Choosing another account mixes its cleared boxes into the same grow-only progress.",
    driveAuthorizing: "Waiting for Google authorization…",
    driveSyncing: "Merging local and Drive progress…",
    driveSuccess: "Synced. Boxes opened on both sides were kept.",
    driveError: "Sync failed. Local progress was not changed. Try again",
    driveDisconnect: "Disconnect Google Drive",
    driveDeleted: "The Drive backup was deleted. Local progress remains.",
    driveDelete: "Delete Drive backup",
    driveDeleteConfirm:
      "Permanently delete the app-only Google Drive backup? Local progress will remain.",
  },
} as const;

export type MessageKey = keyof (typeof messages)["ja"];

export function detectLocale(language = navigator.language): Locale {
  return language.toLowerCase().startsWith("ja") ? "ja" : "en";
}
