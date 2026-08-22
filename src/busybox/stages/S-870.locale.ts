import { defineStageLocale } from "./locale";

export const s870Locale = defineStageLocale({
  stageName: { ja: "外の書庫", en: "Outside Archive" },
  intro: {
    ja: "空の使い捨てフォルダーに、3つの小さな用件を置きます。ブラウザの外で作業してから、ここへ戻ってください。",
    en: "Three small jobs will be placed in an empty disposable folder. Work outside the browser, then come back here.",
  },
  choose: { ja: "空のフォルダーを選ぶ", en: "Choose an empty folder" },
  choosing: { ja: "フォルダーを確認中…", en: "Checking folder…" },
  nonEmpty: {
    ja: "安全のため空でないフォルダーには何も書き込みません。新しい空のフォルダーを選んでください。",
    en: "For safety, nothing was written to a non-empty folder. Choose a new empty folder.",
  },
  ready: {
    ja: "3つの用件を置きました。OSのファイル操作で済ませ、ここへ戻ってください。表示中だけ1秒ごとに確認します。",
    en: "The three jobs are ready. Complete them with OS file tools, then return here. This checks once per second only while visible.",
  },
  cancelled: {
    ja: "フォルダーは選択されませんでした。",
    en: "No folder was selected.",
  },
  unsupported: {
    ja: "このブラウザはフォルダー選択を提供していません。",
    en: "This browser cannot choose folders.",
  },
  rewrite: {
    ja: "rewrite-me.txt を指定の一行へ",
    en: "Rewrite rewrite-me.txt",
  },
  remove: { ja: "delete-me.txt を削除", en: "Delete delete-me.txt" },
  create: { ja: "create-me.txt を作成", en: "Create create-me.txt" },
  rewriteInstruction: {
    ja: "内容を busybox{edited_outside_the_page} の一行だけにする",
    en: "Make its only line busybox{edited_outside_the_page}",
  },
  createInstruction: {
    ja: "空でない通常ファイルを作る",
    en: "Create a non-empty regular file",
  },
  cleanup: {
    ja: "終わったら、この使い捨てフォルダーはOS側で手動削除できます。ここから既存ファイルを削除する操作はありません。",
    en: "When finished, you may delete this disposable folder manually in your OS. This page never deletes your existing files.",
  },
  checking: { ja: "外の書庫を確認中。", en: "Checking the outside archive." },
  B01: { ja: "書き換える箱", en: "Rewrite box" },
  B02: { ja: "消す箱", en: "Delete box" },
  B03: { ja: "作る箱", en: "Create box" },
});
