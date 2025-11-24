/**
 * 控除証明書の要素コードと項目名の対応表
 * 仕様書: 電子的控除証明書等に係る仕様書
 * https://www.e-tax.nta.go.jp/shiyo/shiyo-kojo3.htm
 */

export interface ElementMapping {
  teg: string; // TEGコード
  elementCode: string; // 要素コード
  label: string; // 項目名（日本語）
  category?: string; // カテゴリ
}

/**
 * 要素コードと項目名の対応表
 * TEG104（給与所得の源泉徴収票）の全要素を含む
 */
export const ELEMENT_MAPPINGS: ElementMapping[] = [
  // ===== TEG104: 給与所得の源泉徴収票 =====
  // 基本情報
  {
    teg: "TEG104",
    elementCode: "ZFA00000",
    label: "表題",
    category: "基本情報",
  },
  {
    teg: "TEG104",
    elementCode: "ZFB00000",
    label: "年分（元号）",
    category: "基本情報",
  },
  {
    teg: "TEG104",
    elementCode: "ZFC00010",
    label: "支払を受ける者 住所又は居所",
    category: "基本情報",
  },
  {
    teg: "TEG104",
    elementCode: "ZFC00080",
    label: "支払を受ける者（受給者番号）",
    category: "基本情報",
  },
  {
    teg: "TEG104",
    elementCode: "ZFC00090",
    label: "支払を受ける者（役職名）",
    category: "基本情報",
  },
  {
    teg: "TEG104",
    elementCode: "ZFC00110",
    label: "支払を受ける者 氏名（フリガナ）",
    category: "基本情報",
  },
  {
    teg: "TEG104",
    elementCode: "ZFC00120",
    label: "支払を受ける者 氏名",
    category: "基本情報",
  },
  {
    teg: "TEG104",
    elementCode: "ZFD00000",
    label: "種別",
    category: "基本情報",
  },
  {
    teg: "TEG104",
    elementCode: "ZFE00010",
    label: "支払金額（内書）",
    category: "支払金額",
  },
  {
    teg: "TEG104",
    elementCode: "ZFE00020",
    label: "支払金額",
    category: "支払金額",
  },
  {
    teg: "TEG104",
    elementCode: "ZFF00000",
    label: "給与所得控除後の金額",
    category: "支払金額",
  },
  {
    teg: "TEG104",
    elementCode: "ZFG00000",
    label: "所得控除の額の合計額",
    category: "支払金額",
  },
  {
    teg: "TEG104",
    elementCode: "ZFH00010",
    label: "源泉徴収税額（内書）",
    category: "源泉徴収税額",
  },
  {
    teg: "TEG104",
    elementCode: "ZFH00020",
    label: "源泉徴収税額",
    category: "源泉徴収税額",
  },

  // 控除対象配偶者
  {
    teg: "TEG104",
    elementCode: "ZFI00010",
    label: "控除対象配偶者有区分",
    category: "控除対象配偶者",
  },
  {
    teg: "TEG104",
    elementCode: "ZFI00030",
    label: "控除対象配偶者従有区分",
    category: "控除対象配偶者",
  },
  {
    teg: "TEG104",
    elementCode: "ZFI00050",
    label: "控除対象配偶者老人区分",
    category: "控除対象配偶者",
  },
  {
    teg: "TEG104",
    elementCode: "ZFJ00000",
    label: "配偶者特別控除の額",
    category: "控除対象配偶者",
  },
  {
    teg: "TEG104",
    elementCode: "ZFF10010",
    label: "控除対象配偶者 氏名（フリガナ）",
    category: "控除対象配偶者",
  },
  {
    teg: "TEG104",
    elementCode: "ZFF10020",
    label: "控除対象配偶者 氏名",
    category: "控除対象配偶者",
  },
  {
    teg: "TEG104",
    elementCode: "ZFF10030",
    label: "控除対象配偶者 区分",
    category: "控除対象配偶者",
  },

  // 控除対象扶養親族
  {
    teg: "TEG104",
    elementCode: "ZFK00020",
    label: "控除対象扶養親族の数（特定）人",
    category: "控除対象扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFK00030",
    label: "控除対象扶養親族の数（特定）従人",
    category: "控除対象扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFK00060",
    label: "控除対象扶養親族の数（老人）内書人",
    category: "控除対象扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFK00070",
    label: "控除対象扶養親族の数（老人）人",
    category: "控除対象扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFK00080",
    label: "控除対象扶養親族の数（老人）従人",
    category: "控除対象扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFK00100",
    label: "控除対象扶養親族の数（その他）人",
    category: "控除対象扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFK00110",
    label: "控除対象扶養親族の数（その他）従人",
    category: "控除対象扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFH10010",
    label: "控除対象扶養親族 氏名（フリガナ）",
    category: "控除対象扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFH10020",
    label: "控除対象扶養親族 氏名",
    category: "控除対象扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFH10030",
    label: "控除対象扶養親族 区分",
    category: "控除対象扶養親族",
  },

  // 16歳未満扶養親族
  {
    teg: "TEG104",
    elementCode: "ZFC10000",
    label: "16歳未満扶養親族の数",
    category: "16歳未満扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFI10010",
    label: "16歳未満の扶養親族 氏名（フリガナ）",
    category: "16歳未満扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFI10020",
    label: "16歳未満の扶養親族 氏名",
    category: "16歳未満扶養親族",
  },
  {
    teg: "TEG104",
    elementCode: "ZFI10030",
    label: "16歳未満の扶養親族 区分",
    category: "16歳未満扶養親族",
  },

  // 障害者
  {
    teg: "TEG104",
    elementCode: "ZFL00020",
    label: "障害者の数（特別）内書人",
    category: "障害者",
  },
  {
    teg: "TEG104",
    elementCode: "ZFL00030",
    label: "障害者の数（特別）人",
    category: "障害者",
  },
  {
    teg: "TEG104",
    elementCode: "ZFL00040",
    label: "障害者の数（その他）",
    category: "障害者",
  },

  // その他
  {
    teg: "TEG104",
    elementCode: "ZFD10000",
    label: "非居住者である親族の数",
    category: "その他",
  },
  {
    teg: "TEG104",
    elementCode: "ZFM00010",
    label: "社会保険料等の金額（内書）",
    category: "社会保険料等",
  },
  {
    teg: "TEG104",
    elementCode: "ZFM00020",
    label: "社会保険料等の金額",
    category: "社会保険料等",
  },
  {
    teg: "TEG104",
    elementCode: "ZFN00000",
    label: "生命保険料の控除額",
    category: "保険料控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFO00000",
    label: "地震保険料の控除額",
    category: "保険料控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFP00000",
    label: "住宅借入金等特別控除の額",
    category: "住宅借入金等特別控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFQ00010",
    label: "（摘要）摘要の内容",
    category: "摘要",
  },
  {
    teg: "TEG104",
    elementCode: "ZFQ00020",
    label: "（摘要）電子交付",
    category: "摘要",
  },
  {
    teg: "TEG104",
    elementCode: "ZFR00000",
    label: "配偶者の合計所得",
    category: "その他",
  },
  {
    teg: "TEG104",
    elementCode: "ZFY00000",
    label: "新生命保険料の金額",
    category: "保険料控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFZ00000",
    label: "旧生命保険料の金額",
    category: "保険料控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFA10000",
    label: "介護医療保険料の金額",
    category: "保険料控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFB10000",
    label: "新個人年金保険料の金額",
    category: "保険料控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFS00000",
    label: "旧個人年金保険料の金額",
    category: "保険料控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFT00000",
    label: "旧長期損害保険料の金額",
    category: "保険料控除",
  },

  // 住宅借入金等特別控除の詳細
  {
    teg: "TEG104",
    elementCode: "ZFE10010",
    label: "住宅借入金等特別控除適用数",
    category: "住宅借入金等特別控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFE10020",
    label: "住宅借入金等特別控除可能額",
    category: "住宅借入金等特別控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFE10030",
    label: "居住開始年月日（１回目）",
    category: "住宅借入金等特別控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFE10040",
    label: "住宅借入金等特別控除区分（１回目）",
    category: "住宅借入金等特別控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFE10050",
    label: "住宅借入金等年末残高（１回目）",
    category: "住宅借入金等特別控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFE10060",
    label: "居住開始年月日（２回目）",
    category: "住宅借入金等特別控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFE10070",
    label: "住宅借入金等特別控除区分（２回目）",
    category: "住宅借入金等特別控除",
  },
  {
    teg: "TEG104",
    elementCode: "ZFE10080",
    label: "住宅借入金等年末残高（２回目）",
    category: "住宅借入金等特別控除",
  },

  // 本人控除内容
  {
    teg: "TEG104",
    elementCode: "ZFU00010",
    label: "未成年者",
    category: "本人控除内容",
  },
  {
    teg: "TEG104",
    elementCode: "ZFU00020",
    label: "乙欄",
    category: "本人控除内容",
  },
  {
    teg: "TEG104",
    elementCode: "ZFU00040",
    label: "本人が障害者（特別）",
    category: "本人控除内容",
  },
  {
    teg: "TEG104",
    elementCode: "ZFU00050",
    label: "本人が障害者（その他）",
    category: "本人控除内容",
  },
  {
    teg: "TEG104",
    elementCode: "ZFU00070",
    label: "寡婦（一般）",
    category: "本人控除内容",
  },
  {
    teg: "TEG104",
    elementCode: "ZFU00080",
    label: "寡婦（特別）",
    category: "本人控除内容",
  },
  {
    teg: "TEG104",
    elementCode: "ZFU00090",
    label: "寡夫",
    category: "本人控除内容",
  },
  {
    teg: "TEG104",
    elementCode: "ZFU00100",
    label: "勤労学生",
    category: "本人控除内容",
  },
  {
    teg: "TEG104",
    elementCode: "ZFU00110",
    label: "死亡退職",
    category: "本人控除内容",
  },
  {
    teg: "TEG104",
    elementCode: "ZFU00120",
    label: "災害者",
    category: "本人控除内容",
  },
  {
    teg: "TEG104",
    elementCode: "ZFU00130",
    label: "外国人",
    category: "本人控除内容",
  },

  // 中途就・退職
  {
    teg: "TEG104",
    elementCode: "ZFV00010",
    label: "就職",
    category: "中途就・退職",
  },
  {
    teg: "TEG104",
    elementCode: "ZFV00020",
    label: "退職",
    category: "中途就・退職",
  },
  {
    teg: "TEG104",
    elementCode: "ZFV00030",
    label: "中途就・退職年月日",
    category: "中途就・退職",
  },

  // 受給者生年月日
  {
    teg: "TEG104",
    elementCode: "ZFW00000",
    label: "受給者生年月日",
    category: "基本情報",
  },

  // 支払者
  {
    teg: "TEG104",
    elementCode: "ZFX00010",
    label: "支払者（住所（居所）又は所在地）",
    category: "支払者",
  },
  {
    teg: "TEG104",
    elementCode: "ZFX00020",
    label: "支払者（氏名又は名称）",
    category: "支払者",
  },
  {
    teg: "TEG104",
    elementCode: "ZFX00030",
    label: "支払者（電話番号）",
    category: "支払者",
  },

  // 国民年金保険料等
  {
    teg: "TEG104",
    elementCode: "ZFG10000",
    label: "国民年金保険料等の金額",
    category: "社会保険料等",
  },

  // 基礎控除・所得金額調整控除
  {
    teg: "TEG104",
    elementCode: "ZPJ10000",
    label: "基礎控除の額",
    category: "控除額",
  },
  {
    teg: "TEG104",
    elementCode: "ZPK10000",
    label: "所得金額調整控除額",
    category: "控除額",
  },

  // ===== TEG108: 年分 給与所得の源泉徴収票(令和5年以降用) =====
  {
    teg: "TEG108",
    elementCode: "ZPB00000",
    label: "年分（元号・年）",
    category: "基本情報",
  },
  {
    teg: "TEG108",
    elementCode: "ZPC00120",
    label: "受給者氏名",
    category: "基本情報",
  },
  {
    teg: "TEG108",
    elementCode: "ZPE00020",
    label: "支払金額",
    category: "基本情報",
  },
  {
    teg: "TEG108",
    elementCode: "ZPH00020",
    label: "源泉徴収税額",
    category: "基本情報",
  },

  // ===== TEG800: 生命保険料控除証明書 =====
  {
    teg: "TEG800",
    elementCode: "WCA00000",
    label: "生命保険会社名",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCB00000",
    label: "法人番号",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCC00000",
    label: "証明日",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCD00000",
    label: "契約者",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00000",
    label: "明細　繰り返し",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00010",
    label: "証明年",
    category: "生命保険",
  },
  { teg: "TEG800", elementCode: "WCE00020", label: "題", category: "生命保険" },
  {
    teg: "TEG800",
    elementCode: "WCE00030",
    label: "適用制度",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00040",
    label: "生命保険 証券番号",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00050",
    label: "保険種類",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00060",
    label: "契約日",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00070",
    label: "事業所（団体）コード",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00080",
    label: "被保険者",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00090",
    label: "被保険者番号",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00100",
    label: "払込方法",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00110",
    label: "受取人",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00120",
    label: "一般生命保険、または介護医療保険　保険期間",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00130",
    label: "個人年金保険",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00140",
    label: "受取人生年月日",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00150",
    label: "保険料払込期間",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00160",
    label: "年金種類",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00170",
    label: "年金支払期間",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00180",
    label: "年金支払開始日",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00190",
    label: "証明額",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00200",
    label: "証明対象保険料の月分（自）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00210",
    label: "証明対象保険料の月分（至）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00220",
    label: "旧制度",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00230",
    label: "旧制度一般",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00240",
    label: "旧制度一般 保険料",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00250",
    label: "旧制度一般 配当金",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00260",
    label: "旧制度一般 差引保険料等合計額",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00270",
    label: "旧制度年金",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00280",
    label: "旧制度年金 保険料",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00290",
    label: "旧制度年金 配当金",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00300",
    label: "旧制度年金 差引保険料等合計額",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00310",
    label: "新制度",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00320",
    label: "新制度一般",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00330",
    label: "新制度一般 保険料",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00340",
    label: "新制度一般 配当金",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00350",
    label: "新制度一般 差引保険料等合計額",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00360",
    label: "新制度介護医療",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00370",
    label: "新制度介護医療 保険料",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00380",
    label: "新制度介護医療 配当金",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00390",
    label: "新制度介護医療 差引保険料等合計額",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00400",
    label: "新制度年金",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00410",
    label: "新制度年金 保険料",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00420",
    label: "新制度年金 配当金",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00430",
    label: "新制度年金 差引保険料等合計額",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00440",
    label: "証明額（12月期想定）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00460",
    label: "証明額（12月期想定）旧制度",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00470",
    label: "証明額（12月期想定）旧制度一般",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00480",
    label: "証明額（12月期想定）旧制度一般 年間払込保険料（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00490",
    label: "証明額（12月期想定）旧制度一般 配当金（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00500",
    label: "証明額（12月期想定）旧制度一般 申告額（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00510",
    label: "証明額（12月期想定）旧制度年金",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00520",
    label: "証明額（12月期想定）旧制度年金 年間払込保険料（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00530",
    label: "証明額（12月期想定）旧制度年金 配当金（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00540",
    label: "証明額（12月期想定）旧制度年金 申告額（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00550",
    label: "証明額（12月期想定）新制度",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00560",
    label: "証明額（12月期想定）新制度一般",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00570",
    label: "証明額（12月期想定）新制度一般 年間払込保険料（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00580",
    label: "証明額（12月期想定）新制度一般 配当金（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00590",
    label: "証明額（12月期想定）新制度一般 申告額（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00600",
    label: "証明額（12月期想定）新制度介護医療",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00610",
    label: "証明額（12月期想定）新制度介護医療 年間払込保険料（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00620",
    label: "証明額（12月期想定）新制度介護医療 配当金（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00630",
    label: "証明額（12月期想定）新制度介護医療 申告額（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00640",
    label: "証明額（12月期想定）新制度年金",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00650",
    label: "証明額（12月期想定）新制度年金 年間払込保険料（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00660",
    label: "証明額（12月期想定）新制度年金 配当金（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00670",
    label: "証明額（12月期想定）新制度年金 申告額（参考）",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00680",
    label: "転換等一時払保険料",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00690",
    label: "転換等一時払保険料 一般",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00700",
    label: "転換等一時払保険料 介護医療",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00710",
    label: "転換等一時払保険料 年金",
    category: "生命保険",
  },
  {
    teg: "TEG800",
    elementCode: "WCE00720",
    label: "その他",
    category: "生命保険",
  },

  // ===== TEG810: 地震保険料控除証明書 =====
  {
    teg: "TEG810",
    elementCode: "WDE00170",
    label: "地震保険 地震保険料",
    category: "地震保険",
  },

  // ===== TEG822: 寄附金控除証明書 =====
  {
    teg: "TEG822",
    elementCode: "WLB00050",
    label: "寄附金額",
    category: "寄附金",
  },
];

/**
 * 要素コードから項目名を取得
 */
export function getLabelByElementCode(elementCode: string): string | undefined {
  const mapping = ELEMENT_MAPPINGS.find((m) => m.elementCode === elementCode);
  return mapping?.label;
}

/**
 * TEGコードから該当する要素マッピングを取得
 */
export function getMappingsByTeg(teg: string): ElementMapping[] {
  return ELEMENT_MAPPINGS.filter((m) => m.teg === teg);
}

/**
 * カテゴリごとに要素マッピングをグループ化
 */
export function getMappingsByCategory(): Record<string, ElementMapping[]> {
  const grouped: Record<string, ElementMapping[]> = {};
  ELEMENT_MAPPINGS.forEach((mapping) => {
    const category = mapping.category || "その他";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(mapping);
  });
  return grouped;
}

/**
 * 要素コードからTEGコードを取得
 */
export function getTegByElementCode(elementCode: string): string | undefined {
  const mapping = ELEMENT_MAPPINGS.find((m) => m.elementCode === elementCode);
  return mapping?.teg;
}
