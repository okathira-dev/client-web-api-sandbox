import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Divider,
} from "@mui/material";
import { useMemo } from "react";

import {
  getLabelByElementCode,
  getMappingsByCategory,
  type ElementMapping,
} from "../../../consts/elementMapping";

import type { XmlNode } from "../../../types/xml";

interface CertificateFormProps {
  xmlNode: XmlNode;
}

/**
 * XMLノードからすべての要素コードと値を抽出
 */
function extractElementValues(
  node: XmlNode,
  values: Map<string, string>,
  path: string[] = [],
): void {
  // 現在のノードが要素コードに一致するか確認
  const label = getLabelByElementCode(node.name);
  if (label) {
    // テキスト値がある場合
    if (node.text) {
      values.set(node.name, node.text);
    }
    // 子要素からテキストを取得する場合（日付要素など）
    else if (node.children && node.children.length > 0) {
      const textValue = node.children
        .map((child) => child.text)
        .filter((text): text is string => Boolean(text))
        .join("");
      if (textValue) {
        values.set(node.name, textValue);
      }
    }
  }

  // 日付要素の処理（gen:yyyy, gen:mm, gen:dd）
  // 親要素のコードを取得
  const parentCode = path.length > 0 ? path[path.length - 1] : null;
  if (
    (node.name === "gen:yyyy" ||
      node.name === "gen:mm" ||
      node.name === "gen:dd") &&
    parentCode
  ) {
    const dateKey = `${parentCode}_${node.name}`;
    values.set(dateKey, node.text || "");
  }

  // 子要素を再帰的に処理
  if (node.children) {
    node.children.forEach((child) => {
      extractElementValues(child, values, [...path, node.name]);
    });
  }
}

/**
 * 日付要素（gen:yyyy, gen:mm, gen:dd）を結合して日付文字列を作成
 */
function combineDateValues(
  values: Map<string, string>,
  elementCode: string,
): string {
  const yyyy = values.get(`${elementCode}_gen:yyyy`);
  const mm = values.get(`${elementCode}_gen:mm`);
  const dd = values.get(`${elementCode}_gen:dd`);

  if (yyyy && mm && dd) {
    const month = mm.padStart(2, "0");
    const day = dd.padStart(2, "0");
    return `${yyyy}年${month}月${day}日`;
  }
  return "";
}

/**
 * 控除証明書を帳票形式でレンダリング
 */
export function CertificateForm({ xmlNode }: CertificateFormProps) {
  // XMLノードから要素コードと値を抽出
  const formData = useMemo(() => {
    const values = new Map<string, string>();
    extractElementValues(xmlNode, values);

    // 要素コードと値のペアを作成
    const data: Array<{ mapping: ElementMapping; value: string }> = [];
    const mappingsByCategory = getMappingsByCategory();

    // カテゴリごとに処理
    Object.entries(mappingsByCategory).forEach(([_category, mappings]) => {
      mappings.forEach((mapping) => {
        let value = values.get(mapping.elementCode) || "";

        // 日付要素の場合は結合
        if (
          values.has(`${mapping.elementCode}_gen:yyyy`) ||
          values.has(`${mapping.elementCode}_gen:mm`) ||
          values.has(`${mapping.elementCode}_gen:dd`)
        ) {
          value = combineDateValues(values, mapping.elementCode);
        }

        // 値がある場合のみ追加
        if (value) {
          data.push({ mapping, value });
        }
      });
    });

    return data;
  }, [xmlNode]);

  // カテゴリごとにデータをグループ化
  const groupedData = useMemo(() => {
    const grouped: Record<
      string,
      Array<{ mapping: ElementMapping; value: string }>
    > = {};
    formData.forEach((item) => {
      const category = item.mapping.category || "その他";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(item);
    });
    return grouped;
  }, [formData]);

  return (
    <Box sx={{ mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "warning.light",
            borderRadius: 1,
            border: "1px solid",
            borderColor: "warning.main",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "warning.dark", fontWeight: "bold" }}
          >
            注意: この簡易帳票は公式のフォーマットではありません。
            控除証明書として使用することはできません。
            参考情報としてのみご利用ください。
          </Typography>
        </Box>

        <Typography variant="h5" sx={{ mb: 3, textAlign: "center" }}>
          控除証明書（簡易表示）
        </Typography>

        {Object.keys(groupedData).length === 0 ? (
          <Typography
            sx={{ textAlign: "center", color: "text.secondary", py: 4 }}
          >
            表示できるデータがありません
          </Typography>
        ) : (
          Object.entries(groupedData).map(([category, items]) => (
            <Box key={category} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                {category}
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                      項目名
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "20%" }}>
                      要素コード
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", width: "40%" }}>
                      値
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item, index) => (
                    <TableRow key={`${item.mapping.elementCode}-${index}`}>
                      <TableCell sx={{ fontWeight: "medium" }}>
                        {item.mapping.label}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontFamily: "monospace",
                          fontSize: "0.875rem",
                          color: "text.secondary",
                        }}
                      >
                        {item.mapping.elementCode}
                      </TableCell>
                      <TableCell>{item.value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Divider sx={{ mt: 2 }} />
            </Box>
          ))
        )}
      </Paper>
    </Box>
  );
}
