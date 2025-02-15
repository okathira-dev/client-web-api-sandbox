import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";

import {
  useStradellaReedStatesValue,
  useSetStradellaReedStates,
} from "../atoms/register";
import { REED_LABEL_MAP } from "../consts";

import type { ReedName, StradellaSoundType } from "../types";
import type { FC, MouseEvent } from "react";

const SOUND_TYPES: StradellaSoundType[] = ["chord", "bassNote"];

export const ReedSwitch: FC = () => {
  const stradellaReedStates = useStradellaReedStatesValue();
  const setStradellaReedStates = useSetStradellaReedStates();

  const handleReedChange = (
    soundType: StradellaSoundType,
    _event: MouseEvent<HTMLElement>,
    newReedActivation: readonly ReedName[],
  ) => {
    setStradellaReedStates((prev) => ({
      ...prev,
      [soundType]: {
        ...prev[soundType],
        soprano: newReedActivation.includes("soprano"),
        alto: newReedActivation.includes("alto"),
        tenor: newReedActivation.includes("tenor"),
        bass: newReedActivation.includes("bass"),
      },
    }));
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        width: "100%",
      }}
    >
      {SOUND_TYPES.map((soundType) => (
        <div
          key={soundType}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            width: "100%",
          }}
        >
          <Typography sx={{ flexShrink: 0 }}>
            {soundType === "chord" ? "コード" : "ベース音"}のリード
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={Object.entries(stradellaReedStates[soundType])
              .filter(([_reed, isActive]) => isActive)
              .map(([reed]) => reed)}
            onChange={(_event, newValue) =>
              handleReedChange(
                soundType,
                _event,
                newValue as readonly ReedName[],
              )
            }
          >
            {Object.entries(REED_LABEL_MAP).map(([reed, label]) => (
              <ToggleButton key={reed} value={reed}>
                <Typography>{label}</Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
      ))}
    </div>
  );
};
