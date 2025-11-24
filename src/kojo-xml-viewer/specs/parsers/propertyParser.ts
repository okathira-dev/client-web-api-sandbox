/**
 * Propertyファイル（CSV変換モジュールインターフェイス仕様書）のパーサー
 * kubun_CDとkubun_NMの対応付け情報を抽出
 */

import { DOMParser } from "@xmldom/xmldom";

/**
 * kubun_CDとkubun_NMの対応付け情報
 * キー: {tegCode}_{parentElementId}_{kubun_CDの値}
 * 値: kubun_NMの値
 */
export type KubunMapping = Map<string, string>;

/**
 * Propertyファイルを読み込んでDOMに変換
 */
async function loadPropertyFile(tegCode: string): Promise<Document | null> {
  // まず、最新バージョンのファイルを探す
  // TEG800_1.1_tpl.xml, TEG810_1.1_tpl.xml などの形式
  const versions = ["1.1", "1.0"]; // バージョンの優先順位

  for (const version of versions) {
    try {
      // viteの静的アセットとして扱うため、new URL(url, import.meta.url)を使用。引数に直接書く必要がある。
      const propertyPath = new URL(
        `../../kojoall/03CSV変換モジュールインターフェイス仕様書【電子的控除証明書等】/property/${tegCode}_${version}_tpl.xml`,
        import.meta.url,
      );
      const propertyUrl = propertyPath.href;

      let xmlText: string;
      let errorPath: string;

      // file://プロトコルの場合（テスト環境）はファイルシステムから読み込む
      if (propertyPath.protocol === "file:") {
        // Node.js環境: ファイルシステムから読み込む
        const { fileURLToPath } = await import("node:url");
        const { readFileSync } = await import("node:fs");
        const filePath = fileURLToPath(propertyPath);
        errorPath = filePath;
        try {
          xmlText = readFileSync(filePath, "utf-8");
        } catch (_error) {
          // ファイルが見つからない場合は次のバージョンを試す
          continue;
        }
      } else {
        // ブラウザ環境: fetchを使用
        errorPath = propertyUrl;
        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[propertyParser] Attempting to load property file: ${propertyUrl}`,
          );
        }
        const response = await fetch(propertyUrl);
        if (!response.ok) {
          if (response.status === 404) {
            // ファイルが見つからない場合は次のバージョンを試す
            if (process.env.NODE_ENV === "development") {
              console.debug(
                `[propertyParser] Property file not found (404): ${propertyUrl}`,
              );
            }
            continue;
          }
          // 404以外のエラーは警告を出すが、次のバージョンを試す
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[propertyParser] Failed to load property file: ${propertyUrl} (${response.status} ${response.statusText})`,
            );
          }
          continue;
        }
        xmlText = await response.text();
        // 読み込んだファイルが正しいXMLファイルか確認（report要素が含まれているか）
        if (!xmlText.includes("<report") && !xmlText.includes("<DatDefine")) {
          if (process.env.NODE_ENV === "development") {
            console.warn(
              `[propertyParser] Loaded file does not appear to be a valid property file: ${propertyUrl} (first 200 chars: ${xmlText.substring(0, 200)})`,
            );
          }
          continue; // 次のバージョンを試す
        }
        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[propertyParser] Successfully loaded property file: ${propertyUrl} (${xmlText.length} bytes)`,
          );
        }
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, "text/xml");

      // パースエラーのチェック
      const parseError = doc.getElementsByTagName("parsererror")[0];
      if (parseError) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[propertyParser] Failed to parse property file: ${errorPath}`,
            parseError.textContent,
          );
        }
        continue; // パースエラーの場合は次のバージョンを試す
      }

      // report要素またはDatDefine要素が存在するか確認
      const hasReport = doc.getElementsByTagName("report").length > 0;
      const hasDatDefine = doc.getElementsByTagName("DatDefine").length > 0;
      if (!hasReport && !hasDatDefine) {
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[propertyParser] Property file does not contain report or DatDefine element: ${errorPath}`,
          );
        }
        continue; // 次のバージョンを試す
      }

      return doc;
    } catch (err) {
      // エラーの場合は次のバージョンを試す
      if (process.env.NODE_ENV === "development") {
        console.debug(
          `[propertyParser] Error loading property file for ${tegCode}_${version}:`,
          err,
        );
      }
      continue;
    }
  }

  return null; // どのバージョンも見つからなかった
}

/**
 * Propertyファイルからkubun_CDとkubun_NMの対応付けを抽出
 */
export async function loadKubunMappingsFromProperty(
  tegCode: string,
): Promise<KubunMapping> {
  const mapping = new Map<string, string>();

  if (process.env.NODE_ENV === "development") {
    console.debug(`[propertyParser] Loading kubun mappings for ${tegCode}...`);
  }

  const doc = await loadPropertyFile(tegCode);
  if (!doc) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[propertyParser] Property file not found for ${tegCode}, returning empty mapping`,
      );
    }
    return mapping; // ファイルが見つからない場合は空のマッピングを返す
  }

  if (process.env.NODE_ENV === "development") {
    console.debug(
      `[propertyParser] Property file loaded successfully for ${tegCode}`,
    );
  }

  // report要素からTEGコードを取得
  const reports = doc.getElementsByTagName("report");
  if (reports.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `[propertyParser] No report element found in property file for ${tegCode}`,
      );
    }
    return mapping;
  }

  const report = reports[0];
  if (!report) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[propertyParser] Report element is null for ${tegCode}`);
    }
    return mapping;
  }

  const reportId = report.getAttribute("reportId") || tegCode;
  if (process.env.NODE_ENV === "development") {
    console.debug(
      `[propertyParser] reportId: ${reportId}, tegCode: ${tegCode}`,
    );
  }

  // すべてのitem要素を取得
  const items = doc.getElementsByTagName("item");
  if (process.env.NODE_ENV === "development") {
    console.debug(`[propertyParser] Found ${items.length} item elements`);
  }

  // kubun_CDのitem要素を探す
  // 親要素IDごとにkubun_CDのカラム番号を保存
  const kubunCdItems = new Map<string, Set<string>>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) {
      continue;
    }

    const id = item.getAttribute("id");
    const parent = item.getAttribute("parent");
    const column = item.getAttribute("column");

    if (id === "kubun_CD" && parent && column) {
      // 親要素IDごとにカラム番号を保存（複数のkubun_CDが同じ親を持つ場合がある）
      if (!kubunCdItems.has(parent)) {
        kubunCdItems.set(parent, new Set<string>());
      }
      kubunCdItems.get(parent)?.add(column);
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.debug(
      `[propertyParser] Found ${kubunCdItems.size} kubun_CD items:`,
      Array.from(kubunCdItems.entries()).map(([parent, columns]) => ({
        parent,
        columns: Array.from(columns),
      })),
    );
  }

  // kubun_NMのitem要素を探してマッピングを構築
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) {
      continue;
    }

    const id = item.getAttribute("id");
    const parent = item.getAttribute("parent");
    const refcol = item.getAttribute("refcol");
    const refval = item.getAttribute("refval");
    const value = item.getAttribute("value");

    if (
      id === "kubun_NM" &&
      parent &&
      refcol &&
      refval &&
      value &&
      kubunCdItems.has(parent)
    ) {
      // refcolがkubun_CDのカラム番号と一致するか確認
      const kubunCdColumns = kubunCdItems.get(parent);
      if (kubunCdColumns && kubunCdColumns.has(refcol)) {
        // マッピングのキー: {TEGコード}_{親要素ID}_{kubun_CDの値}
        const key = `${reportId}_${parent}_${refval}`;
        mapping.set(key, value);
        if (process.env.NODE_ENV === "development") {
          console.debug(`[propertyParser] Added mapping: ${key} => ${value}`);
        }
      } else {
        if (process.env.NODE_ENV === "development") {
          console.debug(
            `[propertyParser] Skipped kubun_NM: parent=${parent}, refcol=${refcol}, kubunCdColumns=${kubunCdColumns ? Array.from(kubunCdColumns).join(",") : "null"}`,
          );
        }
      }
    }
  }

  if (process.env.NODE_ENV === "development") {
    if (mapping.size > 0) {
      console.debug(
        `[propertyParser] Loaded ${mapping.size} kubun_CD mappings for ${tegCode}`,
        Array.from(mapping.entries()).slice(0, 10),
      );
    } else {
      console.warn(
        `[propertyParser] No kubun_CD mappings found for ${tegCode}`,
      );
    }
  }

  return mapping;
}

/**
 * 複数のTEGコードのマッピングを一度に読み込む
 */
export async function loadAllKubunMappings(
  tegCodes: string[],
): Promise<KubunMapping> {
  const allMappings = new Map<string, string>();

  for (const tegCode of tegCodes) {
    const mappings = await loadKubunMappingsFromProperty(tegCode);
    for (const [key, value] of mappings.entries()) {
      allMappings.set(key, value);
    }
  }

  return allMappings;
}
