import { defineStageLocale } from "./locale";

export const s690Locale = defineStageLocale({
  stageName: { ja: "断片の道標", en: "Fragment Trail" },
  intro: {
    ja: "矢印を辿って、ブラウザが示す一節のそばにある4つの語を集めてください。",
    en: "Follow the arrows and collect the four words beside the passages your browser indicates.",
  },
  start: { ja: "最初の一節へ", en: "Go to the first passage" },
  next: { ja: "次の一節へ", en: "Next passage" },
  answerLabel: { ja: "集めた合言葉", en: "Collected passphrase" },
  answerPlaceholder: {
    ja: "busybox{...}",
    en: "busybox{...}",
  },
  answerHint: {
    ja: "4つの語を見つけた順に、_ でつないでください。",
    en: "Join the four words in discovery order with _. ",
  },
  answerWrong: {
    ja: "まだ道標が足りないようです。",
    en: "It looks like a signpost is still missing.",
  },
  answerCorrect: { ja: "道がつながりました。", en: "The trail is complete." },
  B01: { ja: "断片の道標", en: "Fragment trail" },
});
