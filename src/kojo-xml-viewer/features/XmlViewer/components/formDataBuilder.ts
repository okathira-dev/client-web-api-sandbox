import type { ElementMapping } from "../../../specs/types";
import type { XmlNode } from "../../../types/xml";

export function extractElementValues(
  node: XmlNode | undefined,
  values: Map<string, string>,
  path: string[] = [],
): void {
  if (!node?.name) {
    return;
  }

  const currentPath = [...path, node.name];
  const trimmedText =
    typeof node.text === "string" ? node.text.trim() : undefined;

  if (node.name.startsWith("TEG")) {
    node.children?.forEach((child) =>
      extractElementValues(child, values, [node.name]),
    );
    return;
  }

  if (node.name.includes(":")) {
    const parentCode = path[path.length - 1];
    if (
      parentCode &&
      trimmedText &&
      !values.has(`${parentCode}_${node.name}`)
    ) {
      values.set(`${parentCode}_${node.name}`, trimmedText);
    }
    node.children?.forEach((child) =>
      extractElementValues(child, values, currentPath),
    );
    return;
  }

  if (trimmedText && !values.has(node.name)) {
    values.set(node.name, trimmedText);
  }

  node.children?.forEach((child) =>
    extractElementValues(child, values, currentPath),
  );
}

export function combineDateValues(
  values: Map<string, string>,
  elementCode: string,
): string {
  const yyyy = values.get(`${elementCode}_gen:yyyy`);
  const mm = values.get(`${elementCode}_gen:mm`);
  const dd = values.get(`${elementCode}_gen:dd`);

  if (yyyy && mm && dd) {
    return `${yyyy}年${mm.padStart(2, "0")}月${dd.padStart(2, "0")}日`;
  }

  if (yyyy && mm) {
    return `${yyyy}年${mm.padStart(2, "0")}月`;
  }

  if (yyyy) {
    return `${yyyy}年`;
  }

  return "";
}

export interface FormDataItem {
  mapping: ElementMapping | undefined;
  elementCode: string;
  label: string;
  value: string;
  depth: number;
  path: string[];
}

export interface FormTreeNode {
  id: string;
  elementCode: string;
  label: string;
  value: string;
  path: string[];
  children: FormTreeNode[];
  hasMapping: boolean; // 仕様に存在するかどうか
}

/**
 * XMLノードを順に走査し、すべての要素をFormDataItemとして生成する
 * 値がない要素も含めて、XMLの階層構造をそのままツリーで表現する
 */
export function buildFormData(
  xmlNode: XmlNode,
  mappings: ElementMapping[],
  generalLabels?: Map<string, string>,
): FormDataItem[] {
  const mappingByCode = new Map<string, ElementMapping>();
  mappings.forEach((mapping) => {
    mappingByCode.set(mapping.elementCode, mapping);
  });

  const items: FormDataItem[] = [];

  /**
   * gen:要素のラベルを取得
   */
  function getGenLabel(elementName: string): string | undefined {
    if (!generalLabels) {
      return undefined;
    }
    // gen:プレフィックスを除去
    if (elementName.includes(":")) {
      const nameWithoutPrefix = elementName.split(":").pop();
      if (nameWithoutPrefix) {
        return generalLabels.get(nameWithoutPrefix);
      }
    }
    return undefined;
  }

  /**
   * XMLノードを再帰的に走査し、すべての要素を収集する
   */
  function traverseNode(node: XmlNode, xmlPath: string[] = []): void {
    if (!node.name) {
      return;
    }

    // TEGルート要素はスキップ（pathには含めない）
    if (node.name.startsWith("TEG")) {
      node.children?.forEach((child) => {
        traverseNode(child, []);
      });
      return;
    }

    const currentXmlPath = [...xmlPath, node.name];
    const trimmedText =
      typeof node.text === "string" ? node.text.trim() : undefined;

    // すべての要素を表示（値がない要素も含む）
    const mapping = mappingByCode.get(node.name);
    const value = trimmedText || "";

    // ラベルの決定: マッピング → gen:ラベル → 要素コード
    let label: string;
    if (mapping?.label) {
      label = mapping.label;
    } else if (node.name.includes(":")) {
      // gen:要素の場合はGeneral.xsdからラベルを取得
      const genLabel = getGenLabel(node.name);
      label = genLabel || node.name;
    } else {
      label = node.name;
    }

    // XMLの階層構造に基づいてpathを構築
    const itemPath = currentXmlPath;

    // depthはXMLの階層構造に基づいて計算（TEGルートを除く）
    const depth = currentXmlPath.length - 1;

    items.push({
      mapping,
      elementCode: node.name,
      label,
      value,
      depth,
      path: itemPath,
    });

    // 子要素を再帰的に処理
    node.children?.forEach((child) => {
      traverseNode(child, currentXmlPath);
    });
  }

  // XMLノードを走査
  traverseNode(xmlNode);

  return items;
}

/**
 * XMLの階層構造をそのままツリーとして構築する
 * pathに基づいて親子関係を構築する
 */
export function buildFormTree(items: FormDataItem[]): FormTreeNode[] {
  const nodeMap = new Map<string, FormTreeNode>();

  // 各アイテムからノードを作成
  items.forEach((item) => {
    const nodeId = item.path.join("/");
    nodeMap.set(nodeId, {
      id: nodeId,
      elementCode: item.elementCode,
      label: item.label,
      value: item.value,
      path: item.path,
      children: [],
      hasMapping: item.mapping !== undefined,
    });
  });

  // pathに基づいて親子関係を構築
  const rootNodes: FormTreeNode[] = [];
  const seen = new Set<string>();

  items.forEach((item) => {
    const nodeId = item.path.join("/");
    const node = nodeMap.get(nodeId);
    if (!node || seen.has(nodeId)) {
      return;
    }
    seen.add(nodeId);

    // 親ノードを探す（pathの最後の要素を除いたpath）
    if (item.path.length > 1) {
      const parentPath = item.path.slice(0, -1);
      const parentId = parentPath.join("/");
      const parentNode = nodeMap.get(parentId);

      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // 親ノードが見つからない場合はルートノードとして追加
        rootNodes.push(node);
      }
    } else {
      // pathが1要素のみの場合はルートノード
      rootNodes.push(node);
    }
  });

  return rootNodes;
}
