import { defineStageLocale } from "../locale";

export const locale = defineStageLocale({
  stageName: { ja: "四つの回線", en: "Four network routes" },
  B01: { ja: "Wi-Fiの箱", en: "Wi-Fi box" },
  B02: { ja: "携帯回線の箱", en: "Cellular box" },
  B03: { ja: "有線の箱", en: "Ethernet box" },
  B04: { ja: "Bluetoothの箱", en: "Bluetooth box" },
  inspect: { ja: "現在の回線を見る", en: "Inspect current route" },
  idle: {
    ja: "端末側で回線を切り替えてから、その都度観測します。",
    en: "Switch routes outside the page, then inspect each one.",
  },
  observed: { ja: "観測した回線", en: "Observed route" },
  ignored: {
    ja: "この回線種別は四つの箱に含まれません。",
    en: "This route type is not one of the four boxes.",
  },
  unavailable: {
    ja: "browserは回線種別を公開していません。",
    en: "The browser does not expose the network route type.",
  },
});
