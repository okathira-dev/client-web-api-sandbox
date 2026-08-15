import type { Locale } from "../i18n";
import type { StageLocaleBundle } from "./locale";
import { s000Locale } from "./S-000.locale";
import { s010Locale } from "./S-010.locale";
import { s020Locale } from "./S-020.locale";
import { s030Locale } from "./S-030.locale";
import { s040Locale } from "./S-040.locale";
import { s050Locale } from "./S-050.locale";
import { s060Locale } from "./S-060.locale";
import { s070Locale } from "./S-070.locale";
import { s080Locale } from "./S-080.locale";
import { s090Locale } from "./S-090.locale";
import { s100Locale } from "./S-100.locale";
import { s110Locale } from "./S-110.locale";
import { s120Locale } from "./S-120.locale";
import { s130Locale } from "./S-130.locale";
import { s140Locale } from "./S-140.locale";
import { s150Locale } from "./S-150.locale";
import { s160Locale } from "./S-160.locale";
import { s170Locale } from "./S-170.locale";
import { s180Locale } from "./S-180.locale";
import { s190Locale } from "./S-190.locale";
import { s200Locale } from "./S-200.locale";
import { s210Locale } from "./S-210.locale";
import { s220Locale } from "./S-220.locale";
import { s240Locale } from "./S-240.locale";
import { s250Locale } from "./S-250.locale";
import { s260Locale } from "./S-260.locale";
import { s280Locale } from "./S-280.locale";
import { s290Locale } from "./S-290.locale";
import { s300Locale } from "./S-300.locale";
import { s310Locale } from "./S-310.locale";
import { s320Locale } from "./S-320.locale";
import { s330Locale } from "./S-330.locale";
import { s340Locale } from "./S-340.locale";
import { s350Locale } from "./S-350.locale";
import { s360Locale } from "./S-360.locale";
import { s370Locale } from "./S-370.locale";
import { s380Locale } from "./S-380.locale";
import { s390Locale } from "./S-390.locale";
import { s400Locale } from "./S-400.locale";
import { s410Locale } from "./S-410.locale";
import { s420Locale } from "./S-420.locale";
import { s430Locale } from "./S-430.locale";
import { s440Locale } from "./S-440.locale";
import { s450Locale } from "./S-450.locale";
import { s460Locale } from "./S-460.locale";
import { s480Locale } from "./S-480.locale";
import { s490Locale } from "./S-490.locale";
import { s500Locale } from "./S-500.locale";
import { s510Locale } from "./S-510.locale";
import { s520Locale } from "./S-520.locale";
import { s530Locale } from "./S-530.locale";
import { s540Locale } from "./S-540.locale";
import { s550Locale } from "./S-550.locale";
import { s560Locale } from "./S-560.locale";
import { s570Locale } from "./S-570.locale";
import { s580Locale } from "./S-580.locale";
import { s590Locale } from "./S-590.locale";
import { s600Locale } from "./S-600.locale";
import { s610Locale } from "./S-610.locale";
import { s620Locale } from "./S-620.locale";
import { s640Locale } from "./S-640.locale";
import { s650Locale } from "./S-650.locale";
import { s660Locale } from "./S-660.locale";
import { s670Locale } from "./S-670.locale";
import { s710Locale } from "./S-710.locale";
import { s720Locale } from "./S-720.locale";
import { s810Locale } from "./S-810.locale";

const stageBundles: Readonly<Record<string, StageLocaleBundle>> = {
  "S-000": s000Locale,
  "S-010": s010Locale,
  "S-020": s020Locale,
  "S-030": s030Locale,
  "S-040": s040Locale,
  "S-050": s050Locale,
  "S-060": s060Locale,
  "S-070": s070Locale,
  "S-080": s080Locale,
  "S-090": s090Locale,
  "S-100": s100Locale,
  "S-110": s110Locale,
  "S-120": s120Locale,
  "S-130": s130Locale,
  "S-140": s140Locale,
  "S-150": s150Locale,
  "S-160": s160Locale,
  "S-170": s170Locale,
  "S-180": s180Locale,
  "S-190": s190Locale,
  "S-200": s200Locale,
  "S-210": s210Locale,
  "S-220": s220Locale,
  "S-240": s240Locale,
  "S-250": s250Locale,
  "S-260": s260Locale,
  "S-280": s280Locale,
  "S-290": s290Locale,
  "S-300": s300Locale,
  "S-310": s310Locale,
  "S-320": s320Locale,
  "S-330": s330Locale,
  "S-340": s340Locale,
  "S-350": s350Locale,
  "S-360": s360Locale,
  "S-370": s370Locale,
  "S-380": s380Locale,
  "S-390": s390Locale,
  "S-400": s400Locale,
  "S-410": s410Locale,
  "S-420": s420Locale,
  "S-430": s430Locale,
  "S-440": s440Locale,
  "S-450": s450Locale,
  "S-460": s460Locale,
  "S-480": s480Locale,
  "S-490": s490Locale,
  "S-500": s500Locale,
  "S-510": s510Locale,
  "S-520": s520Locale,
  "S-530": s530Locale,
  "S-540": s540Locale,
  "S-550": s550Locale,
  "S-560": s560Locale,
  "S-570": s570Locale,
  "S-580": s580Locale,
  "S-590": s590Locale,
  "S-600": s600Locale,
  "S-610": s610Locale,
  "S-620": s620Locale,
  "S-640": s640Locale,
  "S-650": s650Locale,
  "S-660": s660Locale,
  "S-670": s670Locale,
  "S-710": s710Locale,
  "S-720": s720Locale,
  "S-810": s810Locale,
};

export function stageCopyText(
  locale: Locale,
  stageId: string,
  key: string,
): string {
  const value = stageBundles[stageId]?.[key];
  return value?.[locale] ?? stageId;
}

export function stageNameText(locale: Locale, stageId: string): string {
  return stageCopyText(locale, stageId, "stageName");
}

export function problemLabelText(locale: Locale, problemId: string): string {
  const separator = problemId.lastIndexOf("-B");
  if (separator < 0) return problemId;
  return stageCopyText(
    locale,
    problemId.slice(0, separator),
    problemId.slice(separator + 1),
  );
}
