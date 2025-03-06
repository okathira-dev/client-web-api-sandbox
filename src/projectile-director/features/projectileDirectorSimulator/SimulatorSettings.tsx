import {
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Slider,
  Stack,
  Typography,
} from "@mui/material";

import {
  type FilterType,
  type TargetMotionType,
} from "./atoms/simulationAtoms";
import { useSimulationSettingsControl } from "./hooks/useSimulationSettings";

import type React from "react";

export const SimulatorSettings: React.FC = () => {
  const {
    parameters,
    handleChange,
    handleFilterTypeChange,
    handleFilterParamChange,
    handleTargetMotionTypeChange,
    handleTargetMotionParamChange,
  } = useSimulationSettingsControl();

  // フィルタータイプに応じたパラメータスライダーを表示する
  const renderFilterParams = () => {
    switch (parameters.filterType) {
      case "movingAverage":
        return (
          <Stack spacing={2}>
            <Typography>サンプル数:</Typography>
            <Slider
              value={parameters.velocityFilterLength}
              onChange={(e, value) =>
                handleChange("velocityFilterLength")(e, value)
              }
              min={2}
              max={20}
              step={1}
              valueLabelDisplay="auto"
            />
          </Stack>
        );

      case "singleExponential":
        return (
          <Stack spacing={2}>
            <Typography>平滑化係数(α):</Typography>
            <Slider
              value={parameters.filterParams.singleExponentialAlpha}
              onChange={(e, value) =>
                handleFilterParamChange("singleExponentialAlpha")(e, value)
              }
              min={0.01}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
            />
          </Stack>
        );

      case "doubleExponential":
        return (
          <Stack spacing={2}>
            <Typography>平滑化係数(α):</Typography>
            <Slider
              value={parameters.filterParams.doubleExponentialAlpha}
              onChange={(e, value) =>
                handleFilterParamChange("doubleExponentialAlpha")(e, value)
              }
              min={0.01}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
            />
            <Typography>トレンド係数(β):</Typography>
            <Slider
              value={parameters.filterParams.doubleExponentialBeta}
              onChange={(e, value) =>
                handleFilterParamChange("doubleExponentialBeta")(e, value)
              }
              min={0.01}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
            />
          </Stack>
        );

      case "kalmanFilter":
        return (
          <Stack spacing={2}>
            <Typography>プロセスノイズ:</Typography>
            <Slider
              value={parameters.filterParams.kalmanProcessNoise}
              onChange={(e, value) =>
                handleFilterParamChange("kalmanProcessNoise")(e, value)
              }
              min={0.001}
              max={0.1}
              step={0.001}
              valueLabelDisplay="auto"
            />
            <Typography>測定ノイズ:</Typography>
            <Slider
              value={parameters.filterParams.kalmanMeasurementNoise}
              onChange={(e, value) =>
                handleFilterParamChange("kalmanMeasurementNoise")(e, value)
              }
              min={0.01}
              max={1}
              step={0.01}
              valueLabelDisplay="auto"
            />
          </Stack>
        );

      default:
        return null;
    }
  };

  // ターゲットの動作モードに応じたパラメータスライダーを表示する
  const renderTargetMotionParams = () => {
    // 両方のモードで共通の中心点設定
    const commonCenterSettings = (
      <Stack spacing={2} sx={{ mb: 2 }}>
        <Typography>中心点X座標:</Typography>
        <Slider
          value={parameters.targetMotion.centerX}
          onChange={(e, value) =>
            handleTargetMotionParamChange("centerX")(e, value)
          }
          min={-300}
          max={300}
          step={5}
          valueLabelDisplay="auto"
        />
        <Typography>中心点Y座標:</Typography>
        <Slider
          value={parameters.targetMotion.centerY}
          onChange={(e, value) =>
            handleTargetMotionParamChange("centerY")(e, value)
          }
          min={-300}
          max={300}
          step={5}
          valueLabelDisplay="auto"
        />
      </Stack>
    );

    switch (parameters.targetMotion.type) {
      case "linearConstant":
        return (
          <>
            {commonCenterSettings}
            <Stack spacing={2}>
              <Typography>移動速度 (px/秒):</Typography>
              <Slider
                value={parameters.targetMotion.linearSpeed}
                onChange={(e, value) =>
                  handleTargetMotionParamChange("linearSpeed")(e, value)
                }
                min={50}
                max={500}
                step={10}
                valueLabelDisplay="auto"
              />
              <Typography>移動距離 (px):</Typography>
              <Slider
                value={parameters.targetMotion.linearLength}
                onChange={(e, value) =>
                  handleTargetMotionParamChange("linearLength")(e, value)
                }
                min={50}
                max={500}
                step={10}
                valueLabelDisplay="auto"
              />
            </Stack>
          </>
        );

      case "circularConstant":
        return (
          <>
            {commonCenterSettings}
            <Stack spacing={2}>
              <Typography>回転半径 (px):</Typography>
              <Slider
                value={parameters.targetMotion.circularRadius}
                onChange={(e, value) =>
                  handleTargetMotionParamChange("circularRadius")(e, value)
                }
                min={50}
                max={300}
                step={10}
                valueLabelDisplay="auto"
              />
              <Typography>回転速度 (ラジアン/秒):</Typography>
              <Slider
                value={parameters.targetMotion.circularSpeed}
                onChange={(e, value) =>
                  handleTargetMotionParamChange("circularSpeed")(e, value)
                }
                min={0.1}
                max={3}
                step={0.1}
                valueLabelDisplay="auto"
              />
            </Stack>
          </>
        );

      default:
        return null;
    }
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilterTypeChange(event.target.value as FilterType);
  };

  const handleTargetMotionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleTargetMotionTypeChange(event.target.value as TargetMotionType);
  };

  return (
    <Box sx={{ width: "100%", my: 2 }}>
      <Stack spacing={4}>
        <Stack spacing={2}>
          <Typography>発射体速度</Typography>
          <Slider
            value={parameters.projectileSpeed}
            onChange={(e, value) => handleChange("projectileSpeed")(e, value)}
            min={10}
            max={1000}
            step={5}
            valueLabelDisplay="auto"
          />
        </Stack>

        <Stack spacing={2}>
          <Typography>ターゲットサイズ</Typography>
          <Slider
            value={parameters.targetSize}
            onChange={(e, value) => handleChange("targetSize")(e, value)}
            min={5}
            max={50}
            step={1}
            valueLabelDisplay="auto"
          />
        </Stack>

        <Stack spacing={2}>
          <Typography>予測線の長さ</Typography>
          <Slider
            value={parameters.predictionLineLength}
            onChange={(e, value) =>
              handleChange("predictionLineLength")(e, value)
            }
            min={10}
            max={300}
            step={10}
            valueLabelDisplay="auto"
          />
        </Stack>

        <FormControl component="fieldset">
          <FormLabel component="legend">ターゲット動作モード</FormLabel>
          <RadioGroup
            value={parameters.targetMotion.type}
            onChange={handleTargetMotionChange}
            name="targetMotionType"
          >
            <FormControlLabel
              value="mouse"
              control={<Radio />}
              label="マウス追従"
            />
            <FormControlLabel
              value="linearConstant"
              control={<Radio />}
              label="等速直線運動"
            />
            <FormControlLabel
              value="circularConstant"
              control={<Radio />}
              label="等速円運動"
            />
          </RadioGroup>
        </FormControl>

        {renderTargetMotionParams()}

        <FormControl component="fieldset">
          <FormLabel component="legend">速度計算フィルター</FormLabel>
          <RadioGroup
            value={parameters.filterType}
            onChange={handleFilterChange}
            name="filterType"
          >
            <FormControlLabel
              value="none"
              control={<Radio />}
              label="フィルターなし"
            />
            <FormControlLabel
              value="movingAverage"
              control={<Radio />}
              label="移動平均"
            />
            <FormControlLabel
              value="singleExponential"
              control={<Radio />}
              label="単純指数平滑化"
            />
            <FormControlLabel
              value="doubleExponential"
              control={<Radio />}
              label="二重指数平滑化"
            />
            <FormControlLabel
              value="kalmanFilter"
              control={<Radio />}
              label="カルマンフィルター"
            />
          </RadioGroup>
        </FormControl>

        {renderFilterParams()}
      </Stack>
    </Box>
  );
};
