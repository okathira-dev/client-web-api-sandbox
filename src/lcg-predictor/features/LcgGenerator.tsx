import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { LCG } from "../calc/lcg";
import {
  LCG_PRESETS,
  type LcgParams,
  type LcgPresetName,
} from "../const/lcgPresets";

export function LcgGenerator() {
  // 状態管理
  const [params, setParams] = useState<LcgParams>(LCG_PRESETS["Custom"]);
  const [customParams, setCustomParams] = useState<LcgParams>({
    a: 0n,
    c: 0n,
    m: 0n,
  });
  const [seed, setSeed] = useState<string>("42");
  const [count, setCount] = useState<string>("10");
  const [generatedValues, setGeneratedValues] = useState<bigint[]>([]);
  const [error, setError] = useState<string>("");

  // プリセット変更時の処理
  const handlePresetChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const presetName = event.target.value as LcgPresetName;
    const presetValues = LCG_PRESETS[presetName];

    // プリセットの値をカスタムパラメータにセット
    setCustomParams({ ...presetValues });

    // カスタムパラメータの値をパラメータにセット
    setParams({ ...presetValues });
  };

  // カスタムパラメータ変更時の処理
  const handleCustomParamChange = (param: keyof LcgParams, value: string) => {
    try {
      const bigIntValue = BigInt(value);
      const newCustomParams = { ...customParams, [param]: bigIntValue };
      setCustomParams(newCustomParams);

      // 入力値をパラメータにも反映
      setParams(newCustomParams);
    } catch {
      // 無効な入力の場合は何もしない
    }
  };

  // シード値の検証
  const validateSeed = (): bigint | null => {
    try {
      return BigInt(seed);
    } catch {
      setError("シード値は整数である必要があります");
      return null;
    }
  };

  // 生成数の検証
  const validateCount = (): number | null => {
    const countNum = parseInt(count, 10);
    if (isNaN(countNum) || countNum <= 0) {
      setError("生成数は正の整数である必要があります");
      return null;
    }
    return countNum;
  };

  // パラメータの検証
  const validateParams = (): boolean => {
    if (params.a <= 0n) {
      setError("乗数(a)は正の値である必要があります");
      return false;
    }
    if (params.m <= 0n) {
      setError("法(m)は正の値である必要があります");
      return false;
    }
    return true;
  };

  // 乱数生成ボタンクリック時の処理
  const handleGenerate = () => {
    setError("");

    // 入力値の検証
    const seedValue = validateSeed();
    if (seedValue === null) return;

    const countValue = validateCount();
    if (countValue === null) return;

    if (!validateParams()) return;

    try {
      // LCGインスタンスを作成
      const lcg = new LCG(seedValue, params.a, params.c, params.m);

      // 乱数を生成
      const values: bigint[] = [];
      for (let i = 0; i < countValue; i++) {
        values.push(lcg.next());
      }

      setGeneratedValues(values);
    } catch (e) {
      if (e instanceof Error) {
        setError(`乱数生成エラー: ${e.message}`);
      } else {
        setError("乱数生成中に不明なエラーが発生しました");
      }
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "800px", padding: "16px" }}>
      <Paper sx={{ padding: "16px", marginBottom: "16px" }}>
        <Typography variant="h5" gutterBottom>
          LCGパラメータ設定
        </Typography>

        <Box sx={{ marginBottom: "16px" }}>
          <FormControl fullWidth size="small">
            <InputLabel htmlFor="preset-select">プリセットから選択</InputLabel>
            <Select
              labelId="preset-select-label"
              inputProps={{
                id: "preset-select",
              }}
              label="プリセットから選択"
              defaultValue=""
              onChange={(e) =>
                handlePresetChange(e as React.ChangeEvent<{ value: unknown }>)
              }
            >
              {Object.keys(LCG_PRESETS).map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 0.5 }}
          >
            ※
            プリセットの名前と値は例示的なものであり、実際のシステムの正確なパラメータではない場合があります。
          </Typography>
        </Box>

        <Box sx={{ marginTop: "16px" }}>
          <Typography variant="subtitle1">パラメータ設定</Typography>
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
      </Paper>

      <Paper sx={{ padding: "16px", marginBottom: "16px" }}>
        <Typography variant="h5" gutterBottom>
          乱数生成
        </Typography>

        <Grid container spacing={2} sx={{ marginBottom: "16px" }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="シード値"
              value={seed}
              onChange={(e) => setSeed(e.target.value)}
              helperText="初期値X_0"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="生成数"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              helperText="生成する乱数の数"
              type="number"
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={handleGenerate}
          sx={{ marginTop: "8px" }}
        >
          乱数生成
        </Button>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ marginBottom: "16px" }}>
          {error}
        </Alert>
      )}

      {generatedValues.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              生成結果
            </Typography>
            <Typography
              variant="body2"
              component="div"
              sx={{ overflowWrap: "break-word" }}
            >
              <Box sx={{ fontWeight: "bold", marginBottom: "8px" }}>
                シード値: {seed}
              </Box>
              {generatedValues.map((value, index) => (
                <Box key={index} sx={{ marginBottom: "4px" }}>
                  #{index + 1}: {value.toString()}
                </Box>
              ))}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
