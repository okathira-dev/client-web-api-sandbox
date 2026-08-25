import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useState } from "react";
import {
  encodingFixtures,
  encodingQuestionText,
} from "../../fixtures/encoding";
import { stageText } from "../locale";
import { locale } from "./locale";

/**
 * S-640 — 文字化けを元の符号化へ戻す並列問題。
 * 目的: 文字コードを推理し、表示された8枚を一つの回答欄で復号する。
 * 最初の一手: 各カードの崩れた文字列と、カードの2種類の符号化を照合する。
 * 箱ごとの成功条件: B01〜B08は対応する元文字列を正確に入力した時だけ開く。
 * 開かない操作: 符号化名の入力、別カードの文字列、部分一致では開かない。
 * API/権限: TextDecoderのlegacy encodingとGit管理fixture。権限・送信・回答保存はない。
 * cleanup/環境: 共通回答欄は入場中だけ保持する。legacy encoding対応ブラウザでH-001/H-002/H-003/H-004/H-014/H-020/H-025/H-033を確認する。
 */
function S640Stage(props: Props) {
  const [answer, setAnswer] = useState("");
  const boxIdAt = (index: number) => {
    const boxId = manifest.boxIds[index];
    if (!boxId) throw new RangeError(`No S-640 box for fixture index ${index}`);
    return boxId;
  };
  return (
    <div className="puzzle parallel-puzzle">
      <div className="problem-row problem-row--wrap">
        {encodingFixtures.map((_fixture, index) => {
          const boxId = boxIdAt(index);
          return (
            <StageProblemGiftBox
              key={boxId}
              box={props.boxes[boxId]}
              locale={props.locale}
            />
          );
        })}
      </div>
      <section className="encoding-group">
        <h2>{stageText(props.locale, locale.mojibake)}</h2>
        <div className="encoding-question-grid">
          {encodingFixtures.map((fixture, index) => {
            const boxId = boxIdAt(index);
            return (
              <article key={boxId} className="parallel-question-card">
                <strong>{boxId}</strong>
                <code>{encodingQuestionText(fixture)}</code>
              </article>
            );
          })}
        </div>
      </section>
      <label className="parallel-answer">
        {stageText(props.locale, locale.decoded)}
        <input
          value={answer}
          onChange={(event) => {
            const next = event.currentTarget.value;
            setAnswer(next);
            const index = encodingFixtures.findIndex(
              (fixture) => fixture.expectedText === next,
            );
            if (index < 0) return;
            props.boxes[boxIdAt(index)].solve();
          }}
          aria-label={stageText(props.locale, locale.sharedAnswer)}
        />
      </label>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: VisibilityOffOutlined,
      color: "#818cf8",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: VisibilityOffOutlined,
      color: "#6366f1",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: VisibilityOffOutlined,
      color: "#4f46e5",
      label: locale.B03,
    },
    [manifest.box.B04]: {
      icon: VisibilityOffOutlined,
      color: "#4338ca",
      label: locale.B04,
    },
    [manifest.box.B05]: {
      icon: VisibilityOffOutlined,
      color: "#818cf8",
      label: locale.B05,
    },
    [manifest.box.B06]: {
      icon: VisibilityOffOutlined,
      color: "#6366f1",
      label: locale.B06,
    },
    [manifest.box.B07]: {
      icon: VisibilityOffOutlined,
      color: "#4f46e5",
      label: locale.B07,
    },
    [manifest.box.B08]: {
      icon: VisibilityOffOutlined,
      color: "#4338ca",
      label: locale.B08,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "TextDecoder" in window ? "available" : "unsupported",
    ),
  Component: S640Stage,
});
