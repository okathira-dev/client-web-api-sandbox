import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "URLの蛍光ペン", en: "Address-bar Highlighter" },
  intro: {
    ja: "アドレスバーで同じページのURLを変え、ブラウザ自身に一語だけを示させてください。",
    en: "Change this page's URL in the address bar and let the browser point to exactly one word.",
  },
  fragmentLabel: { ja: "この断片を使う", en: "Use this fragment" },
  wordLabel: { ja: "この語を使う", en: "Use this word" },
  fragmentHelp: {
    ja: "URLの末尾へ貼り付けて移動します。",
    en: "Paste it at the end of this page's URL and navigate.",
  },
  wordHelp: {
    ja: "一語だけが示されるfragmentを自分で組み立てます。",
    en: "Build a fragment that points to only this word.",
  },
  revealed: {
    ja: "ブラウザが隠れた一節を見つけました。",
    en: "The browser found a hidden passage.",
  },
  B01: { ja: "読めない断片", en: "Encoded fragment" },
  B02: { ja: "一語の断片", en: "One-word fragment" },
});
