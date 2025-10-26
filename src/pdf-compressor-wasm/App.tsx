import {
  Box,
  Button,
  Container,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useRef, useState } from "react";

import type { SelectChangeEvent } from "@mui/material";

type PdfSettingsPreset = "/screen" | "/ebook" | "/printer" | "/prepress";

type OptionsState = {
  compatibilityLevel: "1.3" | "1.4" | "1.5";
  preset: PdfSettingsPreset;
  downsampleColor: boolean;
  colorDpi: number;
  downsampleGray: boolean;
  grayDpi: number;
  downsampleMono: boolean;
  monoDpi: number;
  downsampleType: "/Subsample" | "/Average" | "/Bicubic";
  embedAllFonts: boolean;
  subsetFonts: boolean;
  compressFonts: boolean;
  detectDuplicateImages: boolean;
  autoRotatePages: "/None" | "/All" | "/PageByPage";
};

const defaultOptions: OptionsState = {
  compatibilityLevel: "1.4",
  preset: "/ebook",
  downsampleColor: true,
  colorDpi: 150,
  downsampleGray: true,
  grayDpi: 150,
  downsampleMono: true,
  monoDpi: 300,
  downsampleType: "/Bicubic",
  embedAllFonts: true,
  subsetFonts: true,
  compressFonts: true,
  detectDuplicateImages: true,
  autoRotatePages: "/None",
};

function buildArgs(opts: OptionsState) {
  const args = [
    "-sDEVICE=pdfwrite",
    `-dCompatibilityLevel=${opts.compatibilityLevel}`,
    `-dPDFSETTINGS=${opts.preset}`,
    "-dNOPAUSE",
    // "-dQUIET",
    "-dBATCH",
  ];

  if (opts.downsampleColor) {
    args.push("-dDownsampleColorImages=true");
    args.push(`-dColorImageResolution=${opts.colorDpi}`);
    args.push(`-dColorImageDownsampleType=${opts.downsampleType}`);
  }
  if (opts.downsampleGray) {
    args.push("-dDownsampleGrayImages=true");
    args.push(`-dGrayImageResolution=${opts.grayDpi}`);
  }
  if (opts.downsampleMono) {
    args.push("-dDownsampleMonoImages=true");
    args.push(`-dMonoImageResolution=${opts.monoDpi}`);
  }

  if (opts.embedAllFonts) args.push("-dEmbedAllFonts=true");
  if (opts.subsetFonts) args.push("-dSubsetFonts=true");
  if (opts.compressFonts) args.push("-dCompressFonts=true");
  if (opts.detectDuplicateImages) args.push("-dDetectDuplicateImages=true");
  args.push(`-dAutoRotatePages=${opts.autoRotatePages}`);

  // 入出力は固定パス
  args.push("-sOutputFile=/working/output.pdf");
  args.push("/working/input.pdf");

  return args;
}

function normalizeArgsForRun(tokens: string[]): string[] {
  if (!tokens.length) return tokens;
  const first = tokens[0] ?? "";
  if (
    first === "gs" ||
    first === "./this.program" ||
    /\bthis\.program$/.test(first)
  ) {
    return tokens.slice(1);
  }
  return tokens;
}

function formatTimestamp(d = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  const ss = pad(d.getSeconds());
  return `${yyyy}${mm}${dd}-${hh}${mi}${ss}`;
}

const PRESET_ID = "preset-selector";
const COMPAT_ID = "compatibility-selector";
const DOWN_ID = "downsample-type-selector";
const AUTO_ROTATE_ID = "auto-rotate-selector";

export function App() {
  const [options, setOptions] = useState<OptionsState>(defaultOptions);
  const [customArgs, setCustomArgs] = useState<string>("");
  const [useCustom, setUseCustom] = useState(false);
  const [inputName, setInputName] = useState<string>("");
  const [inputSize, setInputSize] = useState<number | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [log, setLog] = useState<string>("");
  const [downloadBlobUrl, setDownloadBlobUrl] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const argsForRun = useMemo(() => {
    if (useCustom && customArgs.trim()) {
      return normalizeArgsForRun(customArgs.trim().split(/\s+/));
    }
    return buildArgs(options);
  }, [useCustom, customArgs, options]);

  const displayCommand = useMemo(
    () => ["gs", ...argsForRun].join(" "),
    [argsForRun],
  );

  const handlePresetChange = (e: SelectChangeEvent) => {
    setOptions((prev) => ({
      ...prev,
      preset: e.target.value as PdfSettingsPreset,
    }));
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setInputName(f.name);
    setInputSize(f.size);
  };

  const onCopyCommand = async () => {
    await navigator.clipboard.writeText(displayCommand);
  };

  const onRun = async () => {
    if (!fileRef.current?.files?.[0]) return;
    const file = fileRef.current.files[0];
    setBusy(true);
    setOutputSize(null);
    setDownloadBlobUrl(null);
    setLog("");
    try {
      // Worker を動的 import（今はダミー実装）。本実装で置換予定。
      const { runGhostscriptWasm } = await import("./workers/gsRunner");
      const { output } = await runGhostscriptWasm(file, argsForRun, (line) =>
        setLog((prev) => (prev ? `${prev}\n${line}` : line)),
      );
      setOutputSize(output.size);
      const url = URL.createObjectURL(output);
      setDownloadBlobUrl(url);
    } catch (err) {
      setLog(String(err));
    } finally {
      setBusy(false);
    }
  };

  const onToggleCustom = (_: unknown, v: boolean) => {
    setUseCustom(v);
    if (v) {
      // 現在のGUI設定から生成されたコマンドで初期化（normalize済み）
      const current = ["gs", ...argsForRun].join(" ");
      setCustomArgs(current);
    }
  };

  const onDownload = () => {
    if (!downloadBlobUrl) return;
    const a = document.createElement("a");
    const ts = formatTimestamp();
    const base = inputName.replace(/\.pdf$/i, "");
    a.href = downloadBlobUrl;
    a.download = `${base}_compressed_${ts}.pdf`;
    a.click();
  };

  const ratio = inputSize && outputSize ? outputSize / inputSize : null;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        PDF Compressor (Ghostscript WASM)
      </Typography>

      <Stack spacing={2}>
        <Box>
          <Button variant="outlined" onClick={() => fileRef.current?.click()}>
            PDFを選択
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/pdf"
            hidden
            onChange={onPickFile}
          />
          <Typography variant="body2" sx={{ mt: 1 }}>
            {inputName
              ? `${inputName} (${((inputSize ?? 0) / 1024 / 1024).toFixed(2)} MB)`
              : "ファイル未選択"}
          </Typography>
        </Box>

        <Divider />

        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id={PRESET_ID}>プリセット</InputLabel>
            <Select
              labelId={PRESET_ID}
              label="プリセット"
              value={options.preset}
              onChange={handlePresetChange}
            >
              <MenuItem value="/screen">/screen</MenuItem>
              <MenuItem value="/ebook">/ebook</MenuItem>
              <MenuItem value="/printer">/printer</MenuItem>
              <MenuItem value="/prepress">/prepress</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id={COMPAT_ID}>互換性</InputLabel>
            <Select
              labelId={COMPAT_ID}
              label="互換性"
              value={options.compatibilityLevel}
              onChange={(e) =>
                setOptions((p) => ({
                  ...p,
                  compatibilityLevel: e.target
                    .value as OptionsState["compatibilityLevel"],
                }))
              }
            >
              <MenuItem value="1.3">1.3</MenuItem>
              <MenuItem value="1.4">1.4</MenuItem>
              <MenuItem value="1.5">1.5</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={2}>
          <FormControl size="small" sx={{ width: 180 }}>
            <TextField
              type="number"
              label="Color DPI"
              size="small"
              value={options.colorDpi}
              onChange={(e) =>
                setOptions((p) => ({ ...p, colorDpi: Number(e.target.value) }))
              }
            />
          </FormControl>
          <FormControl size="small" sx={{ width: 180 }}>
            <TextField
              type="number"
              label="Gray DPI"
              size="small"
              value={options.grayDpi}
              onChange={(e) =>
                setOptions((p) => ({ ...p, grayDpi: Number(e.target.value) }))
              }
            />
          </FormControl>
          <FormControl size="small" sx={{ width: 180 }}>
            <TextField
              type="number"
              label="Mono DPI"
              size="small"
              value={options.monoDpi}
              onChange={(e) =>
                setOptions((p) => ({ ...p, monoDpi: Number(e.target.value) }))
              }
            />
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id={DOWN_ID}>DownsampleType</InputLabel>
            <Select
              labelId={DOWN_ID}
              label="DownsampleType"
              value={options.downsampleType}
              onChange={(e) =>
                setOptions((p) => ({
                  ...p,
                  downsampleType: e.target
                    .value as OptionsState["downsampleType"],
                }))
              }
            >
              <MenuItem value="/Subsample">/Subsample</MenuItem>
              <MenuItem value="/Average">/Average</MenuItem>
              <MenuItem value="/Bicubic">/Bicubic</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack direction="row" spacing={4} alignItems="center">
          <Box>
            <Typography variant="body2">Downsample Color</Typography>
            <Switch
              checked={options.downsampleColor}
              onChange={(_, v) =>
                setOptions((p) => ({ ...p, downsampleColor: v }))
              }
            />
          </Box>
          <Box>
            <Typography variant="body2">Downsample Gray</Typography>
            <Switch
              checked={options.downsampleGray}
              onChange={(_, v) =>
                setOptions((p) => ({ ...p, downsampleGray: v }))
              }
            />
          </Box>
          <Box>
            <Typography variant="body2">Downsample Mono</Typography>
            <Switch
              checked={options.downsampleMono}
              onChange={(_, v) =>
                setOptions((p) => ({ ...p, downsampleMono: v }))
              }
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={4} alignItems="center">
          <Box>
            <Typography variant="body2">Embed All Fonts</Typography>
            <Switch
              checked={options.embedAllFonts}
              onChange={(_, v) =>
                setOptions((p) => ({ ...p, embedAllFonts: v }))
              }
            />
          </Box>
          <Box>
            <Typography variant="body2">Subset Fonts</Typography>
            <Switch
              checked={options.subsetFonts}
              onChange={(_, v) => setOptions((p) => ({ ...p, subsetFonts: v }))}
            />
          </Box>
          <Box>
            <Typography variant="body2">Compress Fonts</Typography>
            <Switch
              checked={options.compressFonts}
              onChange={(_, v) =>
                setOptions((p) => ({ ...p, compressFonts: v }))
              }
            />
          </Box>
          <Box>
            <Typography variant="body2">Detect Duplicate Images</Typography>
            <Switch
              checked={options.detectDuplicateImages}
              onChange={(_, v) =>
                setOptions((p) => ({ ...p, detectDuplicateImages: v }))
              }
            />
          </Box>
        </Stack>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id={AUTO_ROTATE_ID}>AutoRotate</InputLabel>
          <Select
            labelId={AUTO_ROTATE_ID}
            label="AutoRotate"
            value={options.autoRotatePages}
            onChange={(e) =>
              setOptions((p) => ({
                ...p,
                autoRotatePages: e.target
                  .value as OptionsState["autoRotatePages"],
              }))
            }
          >
            <MenuItem value="/None">/None</MenuItem>
            <MenuItem value="/All">/All</MenuItem>
            <MenuItem value="/PageByPage">/PageByPage</MenuItem>
          </Select>
        </FormControl>

        <Divider />

        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="subtitle1">カスタムコマンド</Typography>
          <Switch checked={useCustom} onChange={onToggleCustom} />
          <Button onClick={() => void onCopyCommand()} disabled={busy}>
            コマンドをコピー
          </Button>
        </Stack>
        <TextField
          multiline
          minRows={3}
          placeholder="gs の引数をスペース区切りで入力"
          value={useCustom ? customArgs : displayCommand}
          onChange={(e) => setCustomArgs(e.target.value)}
          slotProps={{
            input: {
              readOnly: !useCustom,
            },
          }}
          disabled={!useCustom}
          fullWidth
        />

        <Divider />

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={() => void onRun()}
            disabled={busy || !inputName}
          >
            実行
          </Button>
          <Button
            variant="outlined"
            onClick={onDownload}
            disabled={!downloadBlobUrl}
          >
            ダウンロード
          </Button>
        </Stack>

        <Box>
          <Typography variant="subtitle2">サイズ</Typography>
          <Typography variant="body2">
            入力:{" "}
            {inputSize ? `${(inputSize / 1024 / 1024).toFixed(2)} MB` : "-"} /
            出力:{" "}
            {outputSize ? `${(outputSize / 1024 / 1024).toFixed(2)} MB` : "-"}
            {ratio !== null ? `（${(ratio * 100).toFixed(1)}%）` : ""}
          </Typography>
        </Box>

        <Box>
          <Typography variant="subtitle2">ログ</Typography>
          <TextField
            multiline
            minRows={6}
            value={log}
            onChange={() => {}}
            fullWidth
          />
        </Box>
      </Stack>
    </Container>
  );
}
