import { Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  getCompatibilityFrameOps,
  getSustainedFrameOps,
} from "../../domain/synthetic";
import type { TestMode } from "../../domain/types";
import {
  createNoiseTileCanvases,
  drawFrameOps,
} from "../../utils/syntheticCanvas";
import {
  PREVIEW_VIDEO_FPS,
  PREVIEW_VIDEO_HEIGHT,
  PREVIEW_VIDEO_WIDTH,
} from "./consts";
import { PatternCanvas } from "./PatternCanvas";

type VideoPatternPreviewProps = {
  readonly testMode: TestMode;
  /** 実用継続検査のパターンを動かすか。止めているあいだは先頭フレームを出す。 */
  readonly playing: boolean;
};

/**
 * 検査へ渡すのと同じ描画命令を、そのままキャンバスへ描く。
 *
 * 一括実用検査のパターンは 1 枚だけ描いて終わる。検査でも 1 枚を使い回すので、
 * 「動かないこと」自体がこのプレビューで確かめたい性質になる。
 */
export const VideoPatternPreview = ({
  testMode,
  playing,
}: VideoPatternPreviewProps) => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tilesRef = useRef<readonly CanvasImageSource[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    const context = canvasRef.current?.getContext("2d", { alpha: false });
    if (!context) return;

    try {
      tilesRef.current ??= createNoiseTileCanvases();
    } catch {
      // OffscreenCanvas が使えない環境。検査自体も動かないので、ここでは表示だけ諦める。
      setUnavailable(true);
      return;
    }
    const tiles = tilesRef.current;

    const draw = (index: number) => {
      drawFrameOps(
        context,
        testMode === "sustained"
          ? getSustainedFrameOps(
              index,
              PREVIEW_VIDEO_WIDTH,
              PREVIEW_VIDEO_HEIGHT,
            )
          : getCompatibilityFrameOps(PREVIEW_VIDEO_WIDTH, PREVIEW_VIDEO_HEIGHT),
        tiles,
      );
    };

    if (testMode !== "sustained" || !playing) {
      draw(0);
      return;
    }

    // フレーム番号は経過時間から出す。描画が間に合わなくても検査と同じ速さで進む。
    let handle = 0;
    const startedAt = performance.now();
    const tick = () => {
      draw(
        Math.floor(
          ((performance.now() - startedAt) / 1000) * PREVIEW_VIDEO_FPS,
        ),
      );
      handle = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(handle);
    };
  }, [testMode, playing]);

  if (unavailable) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t("preview.unavailable")}
      </Typography>
    );
  }

  return (
    <PatternCanvas
      ref={canvasRef}
      width={PREVIEW_VIDEO_WIDTH}
      height={PREVIEW_VIDEO_HEIGHT}
      aria-label={t(
        testMode === "sustained"
          ? "preview.sustainedVideoLabel"
          : "preview.compatibilityVideoLabel",
      )}
      sx={{ maxWidth: PREVIEW_VIDEO_WIDTH }}
    />
  );
};
