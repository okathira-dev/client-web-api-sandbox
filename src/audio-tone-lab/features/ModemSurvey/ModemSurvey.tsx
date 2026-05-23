import {
  Chip,
  Link,
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

import { listModemCatalogEntries } from "../../domain/modems/catalog";
import type { ModemId } from "../../domain/modems/types";

interface ModemSurveyProps {
  selectedModemId: ModemId;
}

function robustnessLabel(value: string) {
  switch (value) {
    case "high":
      return "高";
    case "medium":
      return "中";
    default:
      return "低";
  }
}

export function ModemSurvey({ selectedModemId }: ModemSurveyProps) {
  const entries = listModemCatalogEntries();

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={1.5}>
        <Typography variant="h6">モデム比較・参考文献</Typography>
        <Typography variant="body2" color="text.secondary">
          Quiet.js / ggwave / 自前 Web Audio の 6 モデムを比較します。実用系は
          Quiet・ggwave、実験的高速は自前 FSK です。
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>モデム</TableCell>
                <TableCell>バックエンド</TableCell>
                <TableCell>帯域</TableCell>
                <TableCell>堅牢</TableCell>
                <TableCell>速度</TableCell>
                <TableCell>参考</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Typography variant="body2">{entry.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.shortDescription}
                      </Typography>
                      {selectedModemId === entry.id && (
                        <Chip size="small" color="primary" label="選択中" />
                      )}
                      {entry.capabilities.experimental && (
                        <Chip size="small" label="実験" />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>{entry.backend}</TableCell>
                  <TableCell>{entry.bandDescription}</TableCell>
                  <TableCell>
                    {robustnessLabel(entry.capabilities.robustness)}
                  </TableCell>
                  <TableCell>
                    {robustnessLabel(entry.capabilities.speed)}
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5}>
                      {entry.references.map((ref) => (
                        <Link
                          key={ref.url}
                          href={ref.url}
                          target="_blank"
                          rel="noreferrer"
                          variant="caption"
                        >
                          {ref.title}
                        </Link>
                      ))}
                      {entry.capabilities.browserNotes && (
                        <Typography variant="caption" color="text.secondary">
                          {entry.capabilities.browserNotes}
                        </Typography>
                      )}
                    </Stack>
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
