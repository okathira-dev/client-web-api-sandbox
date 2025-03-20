import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";

import {
  useRelativeReedPitchesValue,
  useSetRelativeReedPitches,
} from "../../atoms/pitch";

import type { ReedName } from "../../types";
import type { FC } from "react";

export const RelativePitchControl: FC = () => {
  const { t } = useTranslation();
  const relativeReedPitches = useRelativeReedPitchesValue();
  const setRelativeReedPitches = useSetRelativeReedPitches();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
      <Typography sx={{ flexShrink: 0 }}>
        {t("accordion.pitch.relative")}
      </Typography>
      <div style={{ display: "flex", gap: "8px" }}>
        {(Object.keys(relativeReedPitches) as ReedName[]).map((reed) => (
          <div
            key={reed}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <label
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <Typography>{t(`accordion.reeds.left.${reed}`)}</Typography>
              <TextField
                type="number"
                value={relativeReedPitches[reed]}
                onChange={(e) => {
                  const newValue = parseInt(e.target.value, 10);
                  setRelativeReedPitches((prev) => ({
                    ...prev,
                    [reed]: isNaN(newValue) ? prev[reed] : newValue,
                  }));
                }}
                size="small"
                slotProps={{
                  htmlInput: {
                    step: 1,
                  },
                }}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};
