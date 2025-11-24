import { Alert, Box, Container, Link, Typography } from "@mui/material";

import { XmlViewer } from "./features/XmlViewer";
import { SocialIcons } from "../shared/components/SocialIcons";

export function App() {
  return (
    <Container
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
        position: "relative",
        py: 4,
      }}
    >
      <SocialIcons githubURL="https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/kojo-xml-viewer" />
      <Typography
        variant="h1"
        sx={{
          margin: "1rem",
          fontSize: "1.8rem",
        }}
      >
        控除証明書XML閲覧ツール / Deduction Certificate XML Viewer
      </Typography>

      <XmlViewer />

      <Box sx={{ width: "100%", maxWidth: "1200px", mt: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold" }}>
            免責事項
          </Typography>
          <Typography
            component="div"
            variant="body2"
            sx={{ "& > *": { mb: 1 } }}
          >
            <Box>
              <strong>プライバシーとセキュリティ:</strong>{" "}
              本ツールはXMLファイルの外部送信を行いません。すべての処理はクライアントサイド（お使いの端末上）で実行され、XMLファイルの内容はサーバーに送信されることはありません。
            </Box>
            <Box>
              <strong>署名の検証:</strong>{" "}
              本ツールはXMLファイルのデジタル署名（XML
              Signature）の検証を行いません。
            </Box>
            <Box>
              <strong>簡易帳票のフォーマット:</strong>{" "}
              「XML簡易帳票」タブで表示される帳票フォーマットは、本ツール独自のものです。
            </Box>
            <Box>
              <strong>内容の保証:</strong>{" "}
              本ツール上で表示される内容について一切の保証をいたしません。
            </Box>
            <Box>
              <strong>区分値の表示:</strong>{" "}
              特例事由申出表示など、元データで値が用意されていない区分項目については、XSDスキーマに定義された区分コードがそのまま数値で表示される場合があります。区分名への変換は、XSDスキーマに区分名の定義がある場合のみ行われます。
            </Box>
            <Box>
              <strong>ソースコードの公開:</strong>{" "}
              本ツールのソースコードは公開されており、誰でも閲覧可能です。{" "}
              <Link
                href="https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/kojo-xml-viewer"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHubでソースコードを確認
              </Link>
            </Box>
            <Box>
              <strong>使用目的:</strong>{" "}
              本ツールは参考・確認目的でのみ使用してください。税務申告等の重要な用途には使用しないでください。
            </Box>
          </Typography>
        </Alert>
      </Box>
    </Container>
  );
}
