import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";

import {
  useStradellaRegisterValue,
  useSetStradellaRegister,
  STRADELLA_REGISTER_PRESETS,
  useAdoptStradellaRegister,
} from "../atoms/reeds";

import type { StradellaRegisterName } from "../atoms/reeds";

export const RegisterSwitch = () => {
  const selectedRegister = useStradellaRegisterValue();
  const setSelectedRegister = useSetStradellaRegister();
  const adoptStradellaRegister = useAdoptStradellaRegister();

  return (
    <div>
      <Typography variant="subtitle1" gutterBottom>
        レジスター設定
      </Typography>
      <FormControl fullWidth>
        <InputLabel>レジスター</InputLabel>
        <Select
          value={selectedRegister}
          label="レジスター"
          onChange={(e) => {
            setSelectedRegister(e.target.value as StradellaRegisterName);
            adoptStradellaRegister(e.target.value as StradellaRegisterName);
          }}
        >
          {Object.entries(STRADELLA_REGISTER_PRESETS).map(
            ([presetName, preset]) => (
              <MenuItem key={presetName} value={presetName}>
                <Typography>
                  {presetName}
                  <Typography
                    component="span"
                    color="textSecondary"
                    sx={{ ml: 1, fontSize: "0.8em" }}
                  >
                    {`(Bass: ${Object.entries(preset.bassNote)
                      .filter(([, isActive]) => isActive)
                      .map(([reed]) => reed)
                      .join(", ")} / Chord: ${Object.entries(preset.chord)
                      .filter(([, isActive]) => isActive)
                      .map(([reed]) => reed)
                      .join(", ")})`}
                  </Typography>
                </Typography>
              </MenuItem>
            ),
          )}
        </Select>
      </FormControl>
    </div>
  );
};
