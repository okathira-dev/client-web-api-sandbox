import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { getModemLabel } from "../../domain/modems/catalog";
import type { TransferResult } from "../../domain/modems/types";
import { formatBps, formatBytes, formatSeconds } from "../../utils/format";

interface ResultsDashboardProps {
  results: TransferResult[];
}

function downloadReceivedFile(result: TransferResult) {
  if (!result.decodedFile) return;
  const safeBytes = Uint8Array.from(result.decodedFile.bytes);
  const blob = new Blob([safeBytes.buffer], {
    type: result.decodedFile.mimeType,
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `received-${result.modemId}-${result.decodedFile.fileName}`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function ResultsDashboard({ results }: ResultsDashboardProps) {
  if (results.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          比較結果
        </Typography>
        <Typography variant="body2" color="text.secondary">
          まだ実行結果がありません。
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Typography variant="h6">比較結果</Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>モデム</TableCell>
                <TableCell>役割</TableCell>
                <TableCell>messageId</TableCell>
                <TableCell align="right">Size</TableCell>
                <TableCell align="right">推定</TableCell>
                <TableCell align="right">実測</TableCell>
                <TableCell align="right">Throughput</TableCell>
                <TableCell>状態</TableCell>
                <TableCell>受信データ</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => (
                <TableRow
                  key={`${result.modemId ?? "unknown"}-${result.startedAt}`}
                >
                  <TableCell>{getModemLabel(result.modemId)}</TableCell>
                  <TableCell>{result.role}</TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {result.messageId}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {formatBytes(result.payloadSizeBytes)}
                  </TableCell>
                  <TableCell align="right">
                    {formatSeconds(result.expectedSeconds)}
                  </TableCell>
                  <TableCell align="right">
                    {formatSeconds(result.actualSeconds)}
                  </TableCell>
                  <TableCell align="right">
                    {formatBps(result.throughputBps)}
                  </TableCell>
                  <TableCell>
                    {result.success ? "成功" : (result.errorMessage ?? "失敗")}
                  </TableCell>
                  <TableCell>
                    {result.decodedText && (
                      <Typography
                        variant="caption"
                        sx={{ wordBreak: "break-all" }}
                      >
                        {result.decodedText.slice(0, 120)}
                        {result.decodedText.length > 120 ? "…" : ""}
                      </Typography>
                    )}
                    {result.decodedFile && (
                      <Box>
                        <Typography variant="caption">
                          {result.decodedFile.fileName} (
                          {formatBytes(result.decodedFile.bytes.length)})
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => downloadReceivedFile(result)}
                        >
                          ダウンロード
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Paper>
  );
}
