import SelectAllOutlined from "@mui/icons-material/SelectAllOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useState } from "react";
import { unicodeExpressionText, unicodeFixtures } from "../../fixtures/unicode";
import { stageText } from "../locale";
import { locale } from "./locale";

/**
 * S-620 — Unicode数字を読んで、共通の十進入力へ戻す。
 * 目的: 見た目の違う数字が同じ位置表記を持つことを体験する。
 * 最初の一手: 各カードの数字を読み、カードごとに十進値を考える。
 * 箱ごとの成功条件: B01〜B17は対応するASCII十進文字列だけで開く。
 * 開かない操作: 数字の貼り付け、他カードの値、空欄、入力イベントの偽装では開かない。
 * API/権限: Unicode code point、固定fixture、FontFace。権限・外部送信・回答保存はない。
 * cleanup/環境: font失敗はUIへ隔離し、入力値は入場中だけ保持する。H-001/H-002/H-003/H-004/H-014/H-020/H-025を確認する。
 */
function S620Stage(props: Props) {
  const [answer, setAnswer] = useState("");
  const [fontReady, setFontReady] = useState(false);
  const [fontStatus, setFontStatus] = useState<"loading" | "unavailable" | "">(
    "loading",
  );

  useEffect(() => {
    let active = true;
    const faces = [
      new FontFace(
        "BusyboxUnicode",
        `url(${
          new URL(
            "../../fixtures/unicode/fonts/unifont-17.0.05-bmp-subset.woff2",
            import.meta.url,
          ).href
        })`,
      ),
      new FontFace(
        "BusyboxUnicode",
        `url(${
          new URL(
            "../../fixtures/unicode/fonts/unifont-17.0.05-upper-subset.woff2",
            import.meta.url,
          ).href
        })`,
      ),
    ];
    void Promise.all(faces.map((face) => face.load()))
      .then((loaded) => {
        if (!active) return;
        loaded.forEach((face) => {
          document.fonts.add(face);
        });
        setFontReady(true);
        setFontStatus("");
      })
      .catch(() => {
        if (active) setFontStatus("unavailable");
      });
    return () => {
      active = false;
      faces.forEach((face) => {
        document.fonts.delete(face);
      });
    };
  }, []);

  return (
    <div className="puzzle">
      <div className="problem-row problem-row--wrap">
        {unicodeFixtures.map((fixture) => {
          const boxId = fixture.id as (typeof manifest.boxIds)[number];
          const problem = props.boxes[boxId];
          return (
            <StageProblemGiftBox
              key={boxId}
              box={problem}
              locale={props.locale}
            />
          );
        })}
      </div>
      <div
        className="encoding-question-grid"
        style={{ fontFamily: '"BusyboxUnicode", sans-serif' }}
      >
        {unicodeFixtures.map((fixture) => {
          const boxId = fixture.id as (typeof manifest.boxIds)[number];
          return (
            <article key={boxId} className="parallel-question-card">
              <strong>{boxId}</strong>
              <span>{unicodeExpressionText(fixture)}</span>
            </article>
          );
        })}
      </div>
      <label className="parallel-answer">
        {stageText(props.locale, locale.answer)}
        <input
          inputMode="numeric"
          value={answer}
          onChange={(event) => {
            const next = event.currentTarget.value;
            setAnswer(next);
            const fixture = unicodeFixtures.find(
              (candidate) => String(candidate.answer) === next,
            );
            if (!fixture) return;
            const boxId = fixture.id as (typeof manifest.boxIds)[number];
            props.boxes[boxId].solve();
          }}
          disabled={!fontReady}
          aria-label={stageText(props.locale, locale.sharedAnswer)}
        />
      </label>
      <p className="interaction-status" role="status">
        {fontStatus === "loading"
          ? stageText(props.locale, locale.loadingFont)
          : fontStatus === "unavailable"
            ? stageText(props.locale, locale.unavailableFont)
            : null}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: SelectAllOutlined,
      color: "#38bdf8",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: SelectAllOutlined,
      color: "#22d3ee",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: SelectAllOutlined,
      color: "#2dd4bf",
      label: locale.B03,
    },
    [manifest.box.B04]: {
      icon: SelectAllOutlined,
      color: "#34d399",
      label: locale.B04,
    },
    [manifest.box.B05]: {
      icon: SelectAllOutlined,
      color: "#4ade80",
      label: locale.B05,
    },
    [manifest.box.B06]: {
      icon: SelectAllOutlined,
      color: "#38bdf8",
      label: locale.B06,
    },
    [manifest.box.B07]: {
      icon: SelectAllOutlined,
      color: "#22d3ee",
      label: locale.B07,
    },
    [manifest.box.B08]: {
      icon: SelectAllOutlined,
      color: "#2dd4bf",
      label: locale.B08,
    },
    [manifest.box.B09]: {
      icon: SelectAllOutlined,
      color: "#34d399",
      label: locale.B09,
    },
    [manifest.box.B10]: {
      icon: SelectAllOutlined,
      color: "#4ade80",
      label: locale.B10,
    },
    [manifest.box.B11]: {
      icon: SelectAllOutlined,
      color: "#38bdf8",
      label: locale.B11,
    },
    [manifest.box.B12]: {
      icon: SelectAllOutlined,
      color: "#22d3ee",
      label: locale.B12,
    },
    [manifest.box.B13]: {
      icon: SelectAllOutlined,
      color: "#2dd4bf",
      label: locale.B13,
    },
    [manifest.box.B14]: {
      icon: SelectAllOutlined,
      color: "#34d399",
      label: locale.B14,
    },
    [manifest.box.B15]: {
      icon: SelectAllOutlined,
      color: "#4ade80",
      label: locale.B15,
    },
    [manifest.box.B16]: {
      icon: SelectAllOutlined,
      color: "#38bdf8",
      label: locale.B16,
    },
    [manifest.box.B17]: {
      icon: SelectAllOutlined,
      color: "#22d3ee",
      label: locale.B17,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "FontFace" in window && "CSS" in window ? "available" : "unsupported",
    ),
  Component: S620Stage,
});
