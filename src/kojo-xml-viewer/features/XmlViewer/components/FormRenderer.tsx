/**
 * 仕様書ベースの帳票レンダラー
 */

import {
  Alert,
  Box,
  CircularProgress,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material";
import { SimpleTreeView } from "@mui/x-tree-view/SimpleTreeView";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import { useEffect, useMemo, useState } from "react";

import { buildFormData, buildFormTree } from "./formDataBuilder";
import { getMappingsByTeg } from "../../../mappings/elementMapping";
import { generateElementMappingsFromXsd } from "../../../mappings/elementMappingFromXsd";
import { AVAILABLE_TEG_CODES } from "../../../specs/getAvailableTegCodes";
import { loadGeneralElementInfo } from "../../../specs/parsers/xsdParser";

import type { FormTreeNode } from "./formDataBuilder";
import type { GeneralElementInfo } from "../../../specs/parsers/xsdParser";
import type { ElementMapping } from "../../../specs/types";
import type { XmlNode, ParsedXml } from "../../../types/xml";
import type { ReactNode, SyntheticEvent } from "react";

type AvailableTegCode = (typeof AVAILABLE_TEG_CODES)[number];

function isAvailableTegCode(
  value: string | undefined,
): value is AvailableTegCode {
  if (!value) {
    return false;
  }
  return AVAILABLE_TEG_CODES.includes(value as AvailableTegCode);
}

function formatErrorMessage(error: Error | string | undefined | null): string {
  if (error instanceof Error && typeof error.message === "string") {
    const trimmed = error.message.trim();
    return trimmed.length > 0 ? trimmed : "仕様書の読み込みに失敗しました";
  }
  if (typeof error === "string") {
    const trimmed = error.trim();
    return trimmed.length > 0 ? trimmed : "仕様書の読み込みに失敗しました";
  }
  return "仕様書の読み込みに失敗しました";
}

interface FormRendererProps {
  xmlNode: XmlNode;
  tegCode?: string;
  parsedXml?: ParsedXml;
}

/**
 * XMLノードからTEGコードを取得
 */
function extractTegCode(node: XmlNode): string | undefined {
  // ルート要素の名前がTEGコードの場合
  if (isAvailableTegCode(node.name)) {
    return node.name;
  }

  // 属性から取得を試みる
  if (node.attributes) {
    const tegAttr = node.attributes["teg"] || node.attributes["TEG"];
    if (isAvailableTegCode(tegAttr)) {
      return tegAttr;
    }
  }

  // 子要素から取得を試みる
  if (node.children) {
    for (const child of node.children) {
      const teg = extractTegCode(child);
      if (teg) {
        return teg;
      }
    }
  }

  return undefined;
}

/**
 * ルート要素の属性を表示するコンポーネント
 */
function RootAttributesSection({
  attributes,
}: {
  attributes:
    | {
        VR?: string;
        id?: string;
        page?: string;
        sakuseiDay?: string;
        sakuseiNM?: string;
        softNM?: string;
      }
    | undefined;
}) {
  if (!attributes) {
    return null;
  }
  const items = [
    { label: "バージョン（VR）", value: attributes.VR },
    { label: "ID", value: attributes.id },
    { label: "ページ", value: attributes.page },
    { label: "作成日", value: attributes.sakuseiDay },
    { label: "作成者", value: attributes.sakuseiNM },
    { label: "ソフト名", value: attributes.softNM },
  ].filter((item) => item.value);

  if (items.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
        様式ID要素の属性
      </Typography>
      <Table>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell
                sx={{
                  fontWeight: "medium",
                  width: "40%",
                  fontSize: "1rem",
                  py: 0.5,
                  px: 1,
                }}
              >
                {item.label}
              </TableCell>
              <TableCell
                sx={{
                  fontFamily: "monospace",
                  fontSize: "1rem",
                  width: "60%",
                  py: 0.5,
                  px: 1,
                }}
              >
                {item.value}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Divider sx={{ mt: 2 }} />
    </Box>
  );
}

/**
 * 仕様書ベースの帳票をレンダリング
 */
export function FormRenderer({
  xmlNode,
  tegCode: propTegCode,
  parsedXml,
}: FormRendererProps) {
  const [mappings, setMappings] = useState<ElementMapping[]>([]);
  const [generalLabels, setGeneralLabels] = useState<Map<string, string>>(
    new Map(),
  );
  const [generalInfo, setGeneralInfo] = useState<
    Map<string, GeneralElementInfo>
  >(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TEGコードを取得
  const tegCode = useMemo(() => {
    return propTegCode || extractTegCode(xmlNode);
  }, [propTegCode, xmlNode]);

  // General.xsdのラベルマッピングと値のマッピングを読み込む
  useEffect(() => {
    let cancelled = false;

    async function loadGeneralInfo(): Promise<void> {
      try {
        const loadFn = loadGeneralElementInfo as () => Promise<
          Map<string, GeneralElementInfo>
        >;
        const info = await loadFn();
        if (!cancelled) {
          setGeneralInfo(info);
          // ラベルマッピングも生成
          const labels = new Map<string, string>();
          for (const [key, value] of info.entries()) {
            labels.set(key, value.label);
          }
          setGeneralLabels(labels);
        }
      } catch (err: unknown) {
        // General.xsdの読み込みエラーは無視（gen:要素のラベルが表示されないだけ）
        if (err instanceof Error) {
          console.warn("Failed to load General.xsd info:", err.message);
        } else {
          console.warn("Failed to load General.xsd info:", String(err));
        }
      }
    }

    void loadGeneralInfo();

    return () => {
      cancelled = true;
    };
  }, []);

  // 仕様書を読み込んで要素マッピングを生成
  useEffect(() => {
    if (!tegCode) {
      setError("TEGコードが見つかりません");
      setLoading(false);
      return;
    }

    const activeTegCode = tegCode;
    let cancelled = false;

    async function loadMappings() {
      try {
        setLoading(true);
        setError(null);

        try {
          const generatedMappings =
            await generateElementMappingsFromXsd(activeTegCode);
          if (cancelled) {
            return;
          }

          if (generatedMappings.length === 0) {
            throw new Error(
              `TEGコード ${activeTegCode} に対応する要素マッピングが見つかりませんでした。` +
                `XSDファイルが存在しないか、パースに失敗した可能性があります。` +
                `現在利用可能なTEGコード: ${AVAILABLE_TEG_CODES.join(", ")}`,
            );
          }

          setMappings(generatedMappings);
        } catch (loadError: unknown) {
          if (cancelled) {
            return;
          }
          let loadErrorMessage: string;
          if (loadError instanceof Error) {
            loadErrorMessage = formatErrorMessage(loadError);
          } else if (typeof loadError === "string") {
            loadErrorMessage = formatErrorMessage(loadError);
          } else {
            loadErrorMessage = formatErrorMessage(undefined);
          }
          setError(loadErrorMessage);
          return;
        }
      } catch (err: unknown) {
        if (cancelled) {
          return;
        }
        let fallbackMessage: string;
        if (err instanceof Error) {
          fallbackMessage = formatErrorMessage(err);
        } else if (typeof err === "string") {
          fallbackMessage = formatErrorMessage(err);
        } else {
          fallbackMessage = formatErrorMessage(undefined);
        }
        setError(fallbackMessage);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadMappings();

    return () => {
      cancelled = true;
    };
  }, [tegCode]);

  const formDataItems = useMemo(() => {
    const tegMappings = tegCode
      ? getMappingsByTeg(mappings, tegCode)
      : mappings;
    return buildFormData(xmlNode, tegMappings, generalLabels, generalInfo);
  }, [xmlNode, mappings, tegCode, generalLabels, generalInfo]);

  const treeNodes = useMemo(() => {
    return buildFormTree(formDataItems);
  }, [formDataItems]);

  const defaultExpandedIds = useMemo(() => {
    const ids: string[] = [];
    collectNodeIds(treeNodes, ids);
    return ids;
  }, [treeNodes]);

  const [expandedNodes, setExpandedNodes] =
    useState<string[]>(defaultExpandedIds);

  useEffect(() => {
    setExpandedNodes(defaultExpandedIds);
  }, [defaultExpandedIds]);

  const handleExpandedChange = (
    _event: SyntheticEvent | null,
    itemIds: string[],
  ) => {
    setExpandedNodes(itemIds);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            注意: この簡易帳票は公式のフォーマットではありません。
          </Typography>
        </Alert>

        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          {tegCode ? `${tegCode} 簡易帳票` : "簡易帳票"}
        </Typography>

        {/* ルート要素の属性を表示 */}
        {parsedXml?.rootAttributes ? (
          <RootAttributesSection attributes={parsedXml.rootAttributes} />
        ) : null}

        {treeNodes.length === 0 ? (
          <Typography
            sx={{ textAlign: "center", color: "text.secondary", py: 4 }}
          >
            表示できるデータがありません
          </Typography>
        ) : (
          <SimpleTreeView
            expandedItems={expandedNodes}
            onExpandedItemsChange={handleExpandedChange}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              px: 1,
              py: 1,
            }}
          >
            {renderTreeItems(treeNodes)}
          </SimpleTreeView>
        )}
      </Paper>
    </Box>
  );
}

function collectNodeIds(nodes: FormTreeNode[], acc: string[]): void {
  nodes.forEach((node) => {
    acc.push(node.id);
    if (node.children.length > 0) {
      collectNodeIds(node.children, acc);
    }
  });
}

function renderTreeItems(
  nodes: FormTreeNode[],
  isFirstLevel: boolean = true,
): ReactNode {
  return nodes.map((node, index) => (
    <TreeItem
      key={node.id}
      itemId={node.id}
      label={<TreeItemLabel node={node} />}
      sx={{
        borderTop: isFirstLevel && index === 0 ? "none" : "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
        py: 0.5,
      }}
    >
      {node.children.length > 0 ? renderTreeItems(node.children, false) : null}
    </TreeItem>
  ));
}

function TreeItemLabel({ node }: { node: FormTreeNode }): JSX.Element {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
      <Box
        sx={{ display: "flex", flexDirection: "column", gap: 0.25, flex: 1 }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: node.children.length > 0 ? "bold" : "medium",
            fontSize: "1rem",
          }}
        >
          {node.label}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "text.secondary",
            fontFamily: "monospace",
            opacity: node.hasMapping ? 1 : 0.7,
            fontSize: "0.875rem",
          }}
        >
          {node.elementCode}
        </Typography>
      </Box>
      {node.value && (
        <Typography
          variant="body1"
          sx={{
            fontFamily: "monospace",
            fontWeight: "bold",
            fontSize: "1.25rem",
            ml: "auto",
            wordBreak: "break-all",
          }}
        >
          {node.value}
        </Typography>
      )}
    </Box>
  );
}
