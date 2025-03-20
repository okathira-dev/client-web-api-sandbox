import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import {
  useStradellaReedStatesValue,
  useSetStradellaReedStates,
} from "../atoms/register";
import { REED_LABEL_MAP_SHORT } from "../consts";

import type {
  ReedName,
  StradellaReedStates,
  StradellaSoundType,
} from "../types";
import type { FC } from "react";

// ベース専用のリードとベース・コード共用のリードに分類
const BASS_ONLY_REEDS: ReedName[] = ["tenor", "bass"];
const SHARED_REEDS: ReedName[] = ["soprano", "alto"];

export const ReedSwitch: FC = () => {
  const { t } = useTranslation();
  const reedStates = useStradellaReedStatesValue();
  const setReedStates = useSetStradellaReedStates();

  // ベース音用のリードスイッチのハンドラー
  const handleBassReedsChange = (_: unknown, newReeds: ReedName[]) => {
    setReedStates((prev: StradellaReedStates) => ({
      ...prev,
      bassNote: {
        ...prev.bassNote,
        soprano: newReeds.includes("soprano"),
        alto: newReeds.includes("alto"),
        tenor: newReeds.includes("tenor"),
        bass: newReeds.includes("bass"),
      },
    }));
  };

  // コード用のリードスイッチのハンドラー
  const handleChordReedsChange = (_: unknown, newReeds: ReedName[]) => {
    setReedStates((prev: StradellaReedStates) => ({
      ...prev,
      chord: {
        ...prev.chord,
        soprano: newReeds.includes("soprano"),
        alto: newReeds.includes("alto"),
        tenor: newReeds.includes("tenor"),
        bass: newReeds.includes("bass"),
      },
    }));
  };

  // アクティブなリードを取得
  const getActiveReeds = (type: StradellaSoundType): ReedName[] => {
    return Object.entries(reedStates[type])
      .filter(([_, isActive]) => isActive)
      .map(([reed]) => reed as ReedName);
  };

  const activeBassReeds = getActiveReeds("bassNote");
  const activeChordReeds = getActiveReeds("chord");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Typography sx={{ flexShrink: 0, minWidth: "120px" }}>
            {t("accordion.reeds.bassOnly")}
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={activeBassReeds}
            onChange={handleBassReedsChange}
          >
            {[...BASS_ONLY_REEDS, ...SHARED_REEDS].map((reed) => (
              <ToggleButton key={reed} value={reed}>
                <Typography>{REED_LABEL_MAP_SHORT[reed]}</Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Typography sx={{ flexShrink: 0, minWidth: "120px" }}>
            {t("accordion.reeds.shared")}
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={activeChordReeds}
            onChange={handleChordReedsChange}
          >
            {[...SHARED_REEDS, ...BASS_ONLY_REEDS].map((reed) => (
              <ToggleButton key={reed} value={reed}>
                <Typography>{REED_LABEL_MAP_SHORT[reed]}</Typography>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
      </div>
    </div>
  );
};
