import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { hzToCent, centToHz } from "../../../../audio/utils";
import {
  useBaseReedPitchValue,
  useSetBaseReedPitch,
  useAdaptAllReedPitches,
} from "../../atoms/reeds";

import type { PitchUnit } from "../../../../audio/utils";
import type { FC } from "react";

// ピッチ単位に応じたステップ値を返す
const getPitchLimits = (unit: PitchUnit) => {
  return unit === "cent" ? { step: 1 } : { step: 0.1 };
};

export const BasePitchControl: FC = () => {
  const basePitchCent = useBaseReedPitchValue();
  const setBasePitch = useSetBaseReedPitch();
  const [pitchUnit, setPitchUnit] = useState<PitchUnit>("cent");
  const [inputValue, setInputValue] = useState<string>(
    basePitchCent.toString(),
  );

  const adaptAllReedPitches = useAdaptAllReedPitches();
  adaptAllReedPitches(); // CHECK: ピッチの更新

  const limits = getPitchLimits(pitchUnit);

  // 単位変更時のハンドラー
  const handleUnitChange = (newUnit: PitchUnit) => {
    setPitchUnit(newUnit);
    setInputValue(
      newUnit === "cent"
        ? basePitchCent.toString()
        : centToHz(basePitchCent).toString(),
    );
  };

  // ピッチ値変更時のハンドラー
  const handlePitchChange = (value: string) => {
    setInputValue(value);
    const numValue = parseFloat(value);

    if (!isNaN(numValue)) {
      if (pitchUnit === "hz") {
        const targetHz = numValue;
        const newCentValue = hzToCent(targetHz);
        setBasePitch(newCentValue);
      } else {
        setBasePitch(numValue);
      }
    }
  };

  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <Typography sx={{ flexShrink: 0 }}>基準ピッチ</Typography>
      <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <TextField
          type="number"
          value={inputValue}
          onChange={(e) => handlePitchChange(e.target.value)}
          size="small"
          slotProps={{
            htmlInput: {
              step: limits.step,
            },
          }}
        />
        <FormControl size="small" style={{ minWidth: 80 }}>
          <Select
            value={pitchUnit}
            onChange={(e) => handleUnitChange(e.target.value as PitchUnit)}
          >
            <MenuItem value="cent">cent</MenuItem>
            <MenuItem value="hz">Hz</MenuItem>
          </Select>
        </FormControl>
      </span>
    </label>
  );
};
