import {
  Box,
  Button,
  Container,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { SocialIcons } from "../shared/components/SocialIcons";

// 受け取ったファイルと、そのダウンロード用Blob URLの組
type ReceivedFile = {
  file: File;
  url: string;
};

// バイト数を読みやすい単位に整形する
const formatSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
};

export function App() {
  const [receivedFiles, setReceivedFiles] = useState<ReceivedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  // クリア時に未解放のBlob URLを解放するために現在のURL一覧を保持する
  const urlsRef = useRef<string[]>([]);
  urlsRef.current = receivedFiles.map((received) => received.url);

  // アンマウント時にBlob URLをすべて解放する
  useEffect(() => {
    return () => {
      for (const url of urlsRef.current) {
        URL.revokeObjectURL(url);
      }
    };
  }, []);

  // ファイルが選択されたら、ダウンロード用リンクとして一覧へ追加する。
  // ファイル本体はサーバーへ送信せず、ブラウザーのメモリー内だけに保持する。
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files;
    if (!selected || selected.length === 0) {
      return;
    }
    const added = Array.from(selected, (file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
    setReceivedFiles((previous) => [...previous, ...added]);
    // 同じファイルを続けて選択しても change が発火するよう値をリセットする
    event.target.value = "";
  };

  // 受け取ったファイルをすべて破棄し、Blob URLを解放する
  const handleClear = () => {
    for (const received of receivedFiles) {
      URL.revokeObjectURL(received.url);
    }
    setReceivedFiles([]);
  };

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
      <SocialIcons githubURL="https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/edge-mobile-upload" />
      <Typography
        variant="h1"
        sx={{
          margin: "1rem",
          fontSize: "1.8rem",
          textAlign: "center",
        }}
      >
        Edgeモバイルアップロード用ファイル転送
      </Typography>

      <Typography sx={{ maxWidth: "720px" }}>
        Microsoft
        Edgeの「モバイルからアップロード」を使うためだけのページです。PCのEdgeでこのページを開き、「ファイルを選択」から「モバイルからアップロード」を選んでください。受け取ったファイルは、一覧の「ダウンロード」から保存できます。このページからファイルをサーバーへ送信することはなく、ページを閉じると一覧から消えます。
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button variant="contained" onClick={() => inputRef.current?.click()}>
          ファイルを選択
        </Button>
        <input
          ref={inputRef}
          hidden
          type="file"
          multiple
          onChange={handleFileChange}
        />
        <Button
          variant="outlined"
          onClick={handleClear}
          disabled={receivedFiles.length === 0}
        >
          一覧をクリア
        </Button>
      </Box>

      <Typography variant="body2" sx={{ opacity: 0.7 }}>
        使い方:
        PCとスマートフォンを同じWi-Fiに接続し、ダイアログで表示されるQRコードをスマートフォンで読み取ってファイルを選んでください（1回10ファイルまで・1ファイル1GBまで）。
      </Typography>

      {receivedFiles.length > 0 && (
        <Box sx={{ width: "100%", maxWidth: "720px" }}>
          <Typography variant="h2" sx={{ fontSize: "1.2rem" }}>
            受け取ったファイル（{receivedFiles.length}件）
          </Typography>
          <List>
            {receivedFiles.map((received) => (
              <ListItem
                key={received.url}
                sx={{
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <ListItemText
                  primary={received.file.name}
                  secondary={formatSize(received.file.size)}
                  sx={{ minWidth: 0, overflowWrap: "anywhere" }}
                />
                <Button
                  component="a"
                  href={received.url}
                  download={received.file.name}
                  variant="outlined"
                  size="small"
                >
                  ダウンロード
                </Button>
              </ListItem>
            ))}
          </List>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            保存したいファイルの「ダウンロード」を押してください。一覧をクリアしたりページを閉じたりしても、保存済みのファイルは削除されません。
          </Typography>
        </Box>
      )}
    </Container>
  );
}
