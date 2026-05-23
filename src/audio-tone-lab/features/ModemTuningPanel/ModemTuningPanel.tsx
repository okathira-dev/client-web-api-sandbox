import type { SelectChangeEvent } from "@mui/material";
import {
  Box,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import { getPresetLabel } from "../../domain/modems/catalog";
import type {
  ModemCatalogEntry,
  ModemTuning,
  TuningFieldDef,
  TuningPresetId,
} from "../../domain/modems/types";

interface ModemTuningPanelProps {
  entry: ModemCatalogEntry;
  tuning: ModemTuning;
  preset: TuningPresetId;
  onPresetChange: (preset: TuningPresetId) => void;
  onTuningChange: (next: ModemTuning) => void;
  disabled?: boolean;
}

const PRESET_OPTIONS: TuningPresetId[] = [
  "default",
  "robust",
  "fast",
  "custom",
];

const MODEM_PRESET_LABEL_ID = "modem-preset-label";

function renderField(
  field: TuningFieldDef,
  tuning: ModemTuning,
  onChange: (key: string, value: number | string | boolean) => void,
  disabled: boolean,
) {
  const value = tuning[field.key];

  if (field.type === "boolean") {
    return (
      <FormControlLabel
        key={field.key}
        control={
          <Switch
            checked={Boolean(value)}
            onChange={(_, checked) => onChange(field.key, checked)}
            disabled={disabled}
          />
        }
        label={field.label}
      />
    );
  }

  if (field.type === "select") {
    return (
      <FormControl key={field.key} fullWidth size="small" disabled={disabled}>
        <InputLabel id={`tuning-${field.key}`}>{field.label}</InputLabel>
        <Select
          labelId={`tuning-${field.key}`}
          label={field.label}
          value={String(value ?? field.options?.[0]?.value ?? "")}
          onChange={(event: SelectChangeEvent) =>
            onChange(field.key, event.target.value)
          }
        >
          {(field.options ?? []).map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  const num = Number(value ?? field.min ?? 0);
  return (
    <Box key={field.key}>
      <Typography variant="caption" color="text.secondary">
        {field.label}: {num}
        {field.description ? ` — ${field.description}` : ""}
      </Typography>
      <Slider
        size="small"
        min={field.min}
        max={field.max}
        step={field.step}
        value={num}
        onChange={(_, next) => onChange(field.key, next as number)}
        disabled={disabled}
      />
    </Box>
  );
}

export function ModemTuningPanel({
  entry,
  tuning,
  preset,
  onPresetChange,
  onTuningChange,
  disabled = false,
}: ModemTuningPanelProps) {
  const updateField = (key: string, value: number | string | boolean) => {
    onPresetChange("custom");
    onTuningChange({ ...tuning, [key]: value });
  };

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1">チューニング</Typography>
        <FormControl fullWidth size="small" disabled={disabled}>
          <InputLabel id={MODEM_PRESET_LABEL_ID}>プリセット</InputLabel>
          <Select
            labelId={MODEM_PRESET_LABEL_ID}
            label="プリセット"
            value={preset}
            onChange={(event: SelectChangeEvent) =>
              onPresetChange(event.target.value as TuningPresetId)
            }
          >
            {PRESET_OPTIONS.map((id) => (
              <MenuItem key={id} value={id}>
                {getPresetLabel(id)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {entry.tuningSchema.map((field) =>
          renderField(field, tuning, updateField, disabled),
        )}
      </Stack>
    </Paper>
  );
}
