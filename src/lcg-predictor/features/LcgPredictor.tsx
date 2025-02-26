import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import {
  LCG_PRESETS,
  type LcgParams,
  type LcgPresetName,
} from "../const/lcgPresets";

// プロジェクト内のLCGPredictorコンポーネント
// TODO: パラメータが未知の場合でも予測できるようにする

export function LcgPredictor() {
  const [preset, setPreset] = useState<LcgPresetName>("C/C++ (glibc)");
  const [params, setParams] = useState<LcgParams>(LCG_PRESETS["C/C++ (glibc)"]);
  const [customParams, setCustomParams] = useState<LcgParams>({
    a: 0n,
    c: 0n,
    m: 0n,
  });

  const [sequenceInput, setSequenceInput] = useState<string>("");
  const [knownValues, setKnownValues] = useState<bigint[]>([]);
  const [predictedValues, setPredictedValues] = useState<bigint[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  // プリセット変更時の処理
  const handlePresetChange = (newPreset: LcgPresetName) => {
    setPreset(newPreset);
    if (newPreset !== "Custom") {
      setParams(LCG_PRESETS[newPreset]);
    } else {
      setParams(customParams);
    }
  };

  // カスタムパラメータ変更時の処理
  const handleCustomParamChange = (param: keyof LcgParams, value: string) => {
    try {
      const bigIntValue = BigInt(value);
      const newCustomParams = { ...customParams, [param]: bigIntValue };
      setCustomParams(newCustomParams);

      if (preset === "Custom") {
        setParams(newCustomParams);
      }
    } catch {
      // 無効な入力の場合は何もしない
    }
  };

  // 入力シーケンスの解析
  const parseSequence = () => {
    try {
      const values = sequenceInput
        .split(/[,\s]+/)
        .filter((x) => x.trim() !== "")
        .map((x) => BigInt(x.trim()));

      if (values.length < 3) {
        setError("少なくとも3つの値が必要です");
        setSuccess(false);
        return null;
      }

      setKnownValues(values);
      setError("");
      return values;
    } catch {
      setError("無効な入力：整数値をカンマか空白で区切って入力してください");
      setSuccess(false);
      return null;
    }
  };

  // LCGの次の値を計算
  const nextLcgValue = (
    prev: bigint,
    a: bigint,
    c: bigint,
    m: bigint,
  ): bigint => {
    return (a * prev + c) % m;
  };

  // 線形合同法の予測
  const predictLcg = () => {
    const values = parseSequence();
    if (!values || values.length === 0) return;

    if (preset === "Custom") {
      // カスタムパラメータの検証
      if (params.a <= 0n || params.m <= 0n) {
        setError("無効なLCGパラメータ：aとmは正の値である必要があります");
        setSuccess(false);
        return;
      }
    }

    try {
      // 既知の値から次の値を予測
      const predictions: bigint[] = [];
      let current = values[values.length - 1] as bigint;

      // 次の10個の値を予測
      for (let i = 0; i < 10; i++) {
        const next = nextLcgValue(current, params.a, params.c, params.m);
        predictions.push(next);
        current = next;
      }

      setPredictedValues(predictions);
      setSuccess(true);
    } catch {
      setError("予測中にエラーが発生しました");
      setSuccess(false);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "800px", padding: "16px" }}>
      <Alert severity="warning" sx={{ marginBottom: "16px" }}>
        この乱数予測機能は現在開発中（WIP）です。それっぽい画面なだけです。
      </Alert>

      <Paper sx={{ padding: "16px", marginBottom: "16px" }}>
        <Typography variant="h5" gutterBottom>
          LCGパラメータ設定
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>プリセット</InputLabel>
          <Select
            value={preset}
            label="プリセット"
            onChange={(e) =>
              handlePresetChange(e.target.value as LcgPresetName)
            }
          >
            {Object.keys(LCG_PRESETS).map((key) => (
              <MenuItem key={key} value={key}>
                {key}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            一般的なプログラミング言語やライブラリで使用されるLCGパラメータ
          </FormHelperText>
        </FormControl>

        {preset === "Custom" && (
          <Box sx={{ marginTop: "16px" }}>
            <Typography variant="subtitle1">カスタムパラメータ</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="乗数 (a)"
                  value={customParams.a.toString()}
                  onChange={(e) => handleCustomParamChange("a", e.target.value)}
                  helperText="X_{n+1} = (a * X_n + c) mod m"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="増分 (c)"
                  value={customParams.c.toString()}
                  onChange={(e) => handleCustomParamChange("c", e.target.value)}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="法 (m)"
                  value={customParams.m.toString()}
                  onChange={(e) => handleCustomParamChange("m", e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ marginTop: "16px" }}>
          <Typography variant="subtitle1">現在の設定</Typography>
          <Typography variant="body2">
            乗数 (a): {params.a.toString()}
            <br />
            増分 (c): {params.c.toString()}
            <br />法 (m): {params.m.toString()}
          </Typography>
        </Box>
      </Paper>

      <Paper sx={{ padding: "16px", marginBottom: "16px" }}>
        <Typography variant="h5" gutterBottom>
          既知の乱数列
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="既知の乱数値をカンマまたは空白で区切って入力（例: 42, 1804289383, 846930886）"
          value={sequenceInput}
          onChange={(e) => setSequenceInput(e.target.value)}
          helperText="少なくとも3つの連続した値を入力してください"
        />

        <Button
          variant="contained"
          sx={{ marginTop: "16px" }}
          onClick={predictLcg}
        >
          次の値を予測
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ marginBottom: "16px" }}>
          {error}
        </Alert>
      )}

      {success && predictedValues.length > 0 && (
        <Card sx={{ marginBottom: "16px" }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              予測結果
            </Typography>

            <Box sx={{ marginTop: "16px" }}>
              <Typography variant="subtitle1">入力された値:</Typography>
              <Typography variant="body2" component="div">
                {knownValues.map((v, i) => (
                  <Box key={i} component="span" sx={{ marginRight: "8px" }}>
                    {v.toString()}
                  </Box>
                ))}
              </Typography>
            </Box>

            <Box sx={{ marginTop: "16px" }}>
              <Typography variant="subtitle1">予測された次の値:</Typography>
              <Typography variant="body2" component="div">
                {predictedValues.map((v, i) => (
                  <Box
                    key={i}
                    component="span"
                    sx={{
                      marginRight: "8px",
                      fontWeight: i === 0 ? "bold" : "normal",
                    }}
                  >
                    {v.toString()}
                  </Box>
                ))}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
