import { FC } from "react";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { PitchUnit, hzToCent, centToHz } from "../../../../audio/utils";
import {
  useBaseReedPitch,
  useSetBaseReedPitch,
  useAdaptAllReedPitches,
} from "../../atoms/reeds";

// ピッチ単位に応じたステップ値を返す
const getPitchLimits = (unit: PitchUnit) => {
  return unit === "cent" ? { step: 1 } : { step: 0.1 };
};

export const BasePitchControl: FC = () => {
  const basePitchCent = useBaseReedPitch();
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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <span style={{ flexShrink: 0 }}>基準ピッチ</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
          aria-label="基準ピッチ"
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
      </div>
    </div>
  );
};
