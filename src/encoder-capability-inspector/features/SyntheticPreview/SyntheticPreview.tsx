import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { useIsRunning } from "../../atoms/runState";
import type { TestMode } from "../../domain/types";
import { AudioPatternPreview } from "./AudioPatternPreview";
import {
  PREVIEW_SUSTAINED_AUDIO_SECONDS,
  PREVIEW_VIDEO_HEIGHT,
  PREVIEW_VIDEO_WIDTH,
} from "./consts";
import { VideoPatternPreview } from "./VideoPatternPreview";

const PatternColumn = ({
  testMode,
  playing,
  disabled,
}: {
  testMode: TestMode;
  playing: boolean;
  disabled: boolean;
}) => {
  const { t } = useTranslation();
  const isSustained = testMode === "sustained";

  return (
    <Stack spacing={1} sx={{ flex: "1 1 320px", minWidth: 280 }}>
      <Typography variant="subtitle2" component="h3">
        {t(
          isSustained
            ? "preview.sustainedHeading"
            : "preview.compatibilityHeading",
        )}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {t(isSustained ? "preview.sustainedNote" : "preview.compatibilityNote")}
      </Typography>
      <VideoPatternPreview testMode={testMode} playing={playing} />
      <AudioPatternPreview testMode={testMode} disabled={disabled} />
    </Stack>
  );
};

/**
 * 検査へ渡す合成パターンを、実物と同じ生成コードで再生してみせる。
 *
 * 既定では畳んでおく。畳んでいるあいだは中身を丸ごと外し、音声バッファの生成も
 * 波形の描画も走らせない。Accordion は既定だと畳んでも子を DOM に残すため、
 * 開いた覚えのない利用者にも負荷がかかり、再生中に畳んでも音が鳴り続けてしまう。
 *
 * 検査中は描画も再生も止め、メインスレッドを検査の進行表示へ譲る。
 */
export const SyntheticPreview = () => {
  const { t } = useTranslation();
  const running = useIsRunning();
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(true);

  const active = expanded && !running;

  return (
    <Accordion
      variant="outlined"
      expanded={expanded}
      slotProps={{ transition: { unmountOnExit: true } }}
      onChange={(_event, next) => {
        setExpanded(next);
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="subtitle1" component="h2">
          {t("preview.heading")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {t("preview.description", {
              width: PREVIEW_VIDEO_WIDTH,
              height: PREVIEW_VIDEO_HEIGHT,
              seconds: PREVIEW_SUSTAINED_AUDIO_SECONDS,
            })}
          </Typography>

          {running && <Alert severity="info">{t("preview.runningNote")}</Alert>}

          <Box>
            <Button
              size="small"
              variant="outlined"
              disabled={running}
              startIcon={playing ? <PauseIcon /> : <PlayArrowIcon />}
              onClick={() => {
                setPlaying((current) => !current);
              }}
            >
              {t(playing ? "preview.pauseVideo" : "preview.playVideo")}
            </Button>
          </Box>

          <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
            <PatternColumn
              testMode="compatibility"
              playing={active && playing}
              disabled={running}
            />
            <PatternColumn
              testMode="sustained"
              playing={active && playing}
              disabled={running}
            />
          </Stack>

          <Typography variant="caption" color="text.secondary">
            {t("preview.volumeNote")}
          </Typography>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
