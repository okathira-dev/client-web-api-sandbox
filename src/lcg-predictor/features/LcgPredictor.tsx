import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

import {
  calculateUnknownIncrement,
  calculateUnknownMultiplierAndIncrement,
  calculateUnknownParams,
  predictNextValueFromSequence,
  predictNextValueFromSequenceWithKnownParams,
  predictNextValueWithKnownParams,
} from "../calc/predictor";
import {
  LCG_PRESETS,
  type LcgParams,
  type LcgPresetName,
} from "../const/lcgPresets";

// 予測モードを定義
type PredictionMode = "all-known" | "unknown-c" | "unknown-a-c" | "all-unknown";

// プロジェクト内のLCGPredictorコンポーネント

export function LcgPredictor() {
  const [params, setParams] = useState<LcgParams>(LCG_PRESETS["Custom"]);
  const [customParams, setCustomParams] = useState<LcgParams>({
    a: 0n,
    c: 0n,
    m: 0n,
  });

  // 個別の乱数入力フィールド用の状態
  const [randValues, setRandValues] = useState<string[]>([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [knownValues, setKnownValues] = useState<bigint[]>([]);
  const [predictedValues, setPredictedValues] = useState<bigint[]>([]);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  // 予測モード（どのパラメータが未知か）
  const [predictionMode, setPredictionMode] =
    useState<PredictionMode>("all-known");

  // 計算結果のパラメータ
  const [calculatedParams, setCalculatedParams] = useState<{
    multiplier?: bigint;
    increment?: bigint;
    modulus?: bigint;
  }>({});

  // プリセット変更時の処理
  const handlePresetChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const presetName = event.target.value as LcgPresetName;
    const presetValues = LCG_PRESETS[presetName];

    // プリセットの値をカスタムパラメータにセット
    setCustomParams({ ...presetValues });

    // カスタムパラメータの値をパラメータにも反映
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

  // 乱数値入力の変更処理
  const handleRandValueChange = (index: number, value: string) => {
    const newValues = [...randValues];
    newValues[index] = value;
    setRandValues(newValues);
  };

  // 乱数入力フィールドの追加
  const addRandValueField = () => {
    setRandValues([...randValues, ""]);
  };

  // 乱数入力フィールドの削除
  const removeRandValueField = (index: number) => {
    if (randValues.length <= 2) {
      setError("少なくとも2つの入力フィールドが必要です");
      return;
    }
    const newValues = [...randValues];
    newValues.splice(index, 1);
    setRandValues(newValues);
  };

  // 入力値の解析
  const parseRandValues = () => {
    try {
      const values = randValues
        .filter((value) => value.trim() !== "")
        .map((value) => BigInt(value.trim()));

      // 必要な最小値の数をチェック
      const minRequiredValues = getMinRequiredValues();
      if (values.length < minRequiredValues) {
        setError(
          `選択した予測モードには少なくとも${minRequiredValues}つの値が必要です`,
        );
        setSuccess(false);
        return null;
      }

      setKnownValues(values);
      setError("");
      return values;
    } catch {
      setError("無効な入力：すべての値は整数である必要があります");
      setSuccess(false);
      return null;
    }
  };

  // 予測モードに応じた最小必要値数を取得
  const getMinRequiredValues = (): number => {
    switch (predictionMode) {
      case "all-known":
        return 1; // パラメーターがすべて既知の場合は1つで十分
      case "unknown-c":
        return 2; // 増分cが未知の場合は少なくとも2つ
      case "unknown-a-c":
        return 3; // 乗数aと増分cが未知の場合は少なくとも3つ
      case "all-unknown":
        return 6; // すべてのパラメータが未知の場合は少なくとも6つ
      default:
        return 6;
    }
  };

  // 線形合同法の予測
  const predictLcg = () => {
    const values = parseRandValues();
    if (!values || values.length === 0) return;

    try {
      let predictions: bigint[] = [];
      let nextValue: bigint;
      let current: bigint;
      let lastValue: bigint;
      let lastVal: bigint;
      let currentVal: bigint;
      let increment: bigint;
      let multiplier: bigint;
      let inc: bigint;
      let nextVal: bigint;
      let mult: bigint;
      let incr: bigint;
      let mod: bigint;

      // 配列のインデックス値を事前に算出
      const lastIdx = values.length - 1;
      if (lastIdx < 0) {
        throw new Error("乱数列が空です");
      }

      switch (predictionMode) {
        case "all-known":
          // すべてのパラメータが既知の場合
          // カスタムパラメータの検証
          if (params.a <= 0n || params.m <= 0n) {
            setError("無効なLCGパラメータ：aとmは正の値である必要があります");
            setSuccess(false);
            return;
          }

          // 次の値を予測
          nextValue = predictNextValueFromSequenceWithKnownParams(
            values,
            params.a,
            params.c,
            params.m,
          );
          predictions = [nextValue];

          // さらに9個の値を予測
          current = nextValue;
          for (let i = 0; i < 9; i++) {
            current = predictNextValueWithKnownParams(
              current,
              params.a,
              params.c,
              params.m,
            );
            predictions.push(current);
          }

          setCalculatedParams({
            multiplier: params.a,
            increment: params.c,
            modulus: params.m,
          });
          break;

        case "unknown-c":
          // 増分cが未知の場合
          if (params.a <= 0n || params.m <= 0n) {
            setError("無効なLCGパラメータ：aとmは正の値である必要があります");
            setSuccess(false);
            return;
          }

          // 増分cを計算
          increment = calculateUnknownIncrement(values, params.a, params.m);

          // 次の値を予測（値が存在することは前述のチェックで確認済み）
          if (values[lastIdx] === undefined) {
            throw new Error("乱数列のインデックスが無効です");
          }
          lastValue = values[lastIdx];

          // 10個の値を予測
          for (let i = 0; i < 10; i++) {
            lastValue = predictNextValueWithKnownParams(
              lastValue,
              params.a,
              increment,
              params.m,
            );
            predictions.push(lastValue);
          }

          setCalculatedParams({
            multiplier: params.a,
            increment,
            modulus: params.m,
          });
          break;

        case "unknown-a-c":
          // 乗数aと増分cが未知の場合
          if (params.m <= 0n) {
            setError("無効なLCGパラメータ：mは正の値である必要があります");
            setSuccess(false);
            return;
          }

          // 乗数aと増分cを計算
          [multiplier, inc] = calculateUnknownMultiplierAndIncrement(
            values,
            params.m,
          );

          // 次の値を予測（値が存在することは前述のチェックで確認済み）
          if (values[lastIdx] === undefined) {
            throw new Error("乱数列のインデックスが無効です");
          }
          lastVal = values[lastIdx];

          // 10個の値を予測
          for (let i = 0; i < 10; i++) {
            lastVal = predictNextValueWithKnownParams(
              lastVal,
              multiplier,
              inc,
              params.m,
            );
            predictions.push(lastVal);
          }

          setCalculatedParams({
            multiplier,
            increment: inc,
            modulus: params.m,
          });
          break;

        case "all-unknown":
          // すべてのパラメータが未知の場合
          // 次の値を予測（内部でパラメータも計算される）
          nextVal = predictNextValueFromSequence(values);
          predictions.push(nextVal);

          // パラメータを計算
          [mult, incr, mod] = calculateUnknownParams(values);

          // さらに9個の値を予測
          currentVal = nextVal;
          for (let i = 0; i < 9; i++) {
            currentVal = predictNextValueWithKnownParams(
              currentVal,
              mult,
              incr,
              mod,
            );
            predictions.push(currentVal);
          }

          setCalculatedParams({
            multiplier: mult,
            increment: incr,
            modulus: mod,
          });
          break;
      }

      setPredictedValues(predictions);
      setSuccess(true);
    } catch (e) {
      if (e instanceof Error) {
        setError(`予測中にエラーが発生しました: ${e.message}`);
      } else {
        setError("予測中に不明なエラーが発生しました");
      }
      setSuccess(false);
    }
  };

  // パラメータ編集可能かどうかを判定するヘルパー関数
  const shouldShowParams =
    predictionMode === "all-known" ||
    predictionMode === "unknown-c" ||
    predictionMode === "unknown-a-c";
  const isMultiplierUnknown =
    predictionMode === "unknown-a-c" || predictionMode === "all-unknown";
  const isIncrementUnknown =
    predictionMode === "unknown-c" ||
    predictionMode === "unknown-a-c" ||
    predictionMode === "all-unknown";
  const isModulusUnknown = predictionMode === "all-unknown";

  return (
    <Box sx={{ width: "100%", maxWidth: "800px", padding: "16px" }}>
      <Paper sx={{ padding: "16px", marginBottom: "16px" }}>
        <Typography variant="h5" gutterBottom>
          予測モード
        </Typography>
        <Box sx={{ mb: 2 }}>
          <FormControl fullWidth sx={{ mb: 1 }}>
            <InputLabel htmlFor="prediction-mode-select">予測モード</InputLabel>
            <Select
              labelId="prediction-mode-label"
              inputProps={{
                id: "prediction-mode-select",
              }}
              value={predictionMode}
              label="予測モード"
              onChange={(e) =>
                setPredictionMode(e.target.value as PredictionMode)
              }
            >
              <MenuItem value="all-known">すべてのパラメータが既知</MenuItem>
              <MenuItem value="unknown-c">増分(c)が未知</MenuItem>
              <MenuItem value="unknown-a-c">乗数(a)と増分(c)が未知</MenuItem>
              <MenuItem value="all-unknown">すべてのパラメータが未知</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            未知のパラメータによって、必要な乱数値の数が変わります
          </Typography>
          {predictionMode === "all-unknown" && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              ※
              すべてのパラメータが未知の場合、計算は確率的処理に基づくため、入力値によっては正確なパラメータを求められない場合があります。
            </Typography>
          )}
        </Box>
      </Paper>

      {shouldShowParams && (
        <Paper sx={{ padding: "16px", marginBottom: "16px" }}>
          <Typography variant="h5" gutterBottom>
            LCGパラメータ設定
          </Typography>

          <Box sx={{ marginBottom: "16px" }}>
            <FormControl fullWidth size="small">
              <InputLabel htmlFor="preset-select">
                プリセットから選択
              </InputLabel>
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
              {!isMultiplierUnknown && (
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="乗数 (a)"
                    value={customParams.a.toString()}
                    onChange={(e) =>
                      handleCustomParamChange("a", e.target.value)
                    }
                    helperText="X_{n+1} = (a * X_n + c) mod m"
                    disabled={isMultiplierUnknown}
                  />
                </Grid>
              )}
              {!isIncrementUnknown && (
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="増分 (c)"
                    value={customParams.c.toString()}
                    onChange={(e) =>
                      handleCustomParamChange("c", e.target.value)
                    }
                    disabled={isIncrementUnknown}
                  />
                </Grid>
              )}
              {!isModulusUnknown && (
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="法 (m)"
                    value={customParams.m.toString()}
                    onChange={(e) =>
                      handleCustomParamChange("m", e.target.value)
                    }
                    disabled={isModulusUnknown}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
        </Paper>
      )}

      <Paper sx={{ padding: "16px", marginBottom: "16px" }}>
        <Typography variant="h5" gutterBottom>
          既知の乱数列
        </Typography>
        <Typography variant="body2" sx={{ marginBottom: "16px" }}>
          各値を個別の入力欄に入力してください。必要に応じて入力欄を追加できます。
        </Typography>

        {randValues.map((value, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <Typography sx={{ width: "80px", flexShrink: 0 }}>
              X{index}:
            </Typography>
            <TextField
              fullWidth
              value={value}
              onChange={(e) => handleRandValueChange(index, e.target.value)}
              placeholder={`乱数値 ${index + 1}`}
              size="small"
            />
            <IconButton
              onClick={() => removeRandValueField(index)}
              disabled={randValues.length <= 2}
              size="small"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}

        <Button
          startIcon={<AddIcon />}
          onClick={addRandValueField}
          sx={{ mt: 1 }}
        >
          入力欄を追加
        </Button>

        <Typography
          variant="body2"
          sx={{ marginTop: "16px", marginBottom: "8px" }}
        >
          {predictionMode === "all-known" && "少なくとも1つの値が必要です"}
          {predictionMode === "unknown-c" &&
            "少なくとも2つの連続した値が必要です"}
          {predictionMode === "unknown-a-c" &&
            "少なくとも3つの連続した値が必要です"}
          {predictionMode === "all-unknown" &&
            "少なくとも6つの連続した値が必要です"}
        </Typography>

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

            {calculatedParams.multiplier !== undefined && (
              <Box sx={{ marginBottom: "16px" }}>
                <Typography variant="subtitle1">
                  計算されたパラメータ:
                </Typography>
                <Typography variant="body2">
                  乗数 (a): {calculatedParams.multiplier.toString()}
                  <br />
                  増分 (c): {calculatedParams.increment?.toString() || "未計算"}
                  <br />法 (m):{" "}
                  {calculatedParams.modulus?.toString() || "未計算"}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle1">入力された値:</Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{ maxHeight: "100px", overflowY: "auto" }}
              >
                {knownValues.map((v, i) => (
                  <Box
                    key={i}
                    component="span"
                    sx={{ display: "inline-block", mr: 1 }}
                  >
                    X{i}:&nbsp;
                    <span style={{ userSelect: "all" }}>{v.toString()}</span>
                  </Box>
                ))}
              </Typography>
            </Box>

            <Box sx={{ marginTop: "16px" }}>
              <Typography variant="subtitle1">予測値:</Typography>
              <Typography
                variant="body2"
                component="div"
                sx={{ maxHeight: "100px", overflowY: "auto" }}
              >
                {predictedValues.map((v, i) => (
                  <Box
                    key={i}
                    component="span"
                    sx={{ display: "inline-block", mr: 1 }}
                  >
                    X{knownValues.length + i}:&nbsp;
                    <span style={{ userSelect: "all" }}>{v.toString()}</span>
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
