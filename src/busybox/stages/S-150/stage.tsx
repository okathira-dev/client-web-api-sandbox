import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import SelectAllOutlined from "@mui/icons-material/SelectAllOutlined";
import VisibilityOffOutlined from "@mui/icons-material/VisibilityOffOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useRef } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

const selectOptions = [
  ...Array.from(
    { length: 24 },
    (_, index) => `item-${String(index + 1).padStart(2, "0")}`,
  ),
  "open busybox",
  ...Array.from(
    { length: 24 },
    (_, index) => `item-${String(index + 25).padStart(2, "0")}`,
  ),
];

/**
 * S-150 — キーボードだけで届く場所
 *
 * 目的: ポインターでクリックできない標準UIにも、ブラウザのfocus移動・selectのtypeahead・detailsの排他表示という別の操作経路があることを体験する。
 * 最初の一手: B01はTabでフォーカスを移動する。B02はselectをフォーカスしてから「open」と入力する。B03は同じnameを持つ複数のdetailsを順に開く。
 * 箱ごとの解法: B01はtrustedなfocusイベント、B02はnative selectが`open busybox`を選んだchangeイベント、B03は一つだけopenになるnative detailsの状態で開く。
 * 開かない操作: B01のポインタークリックやscriptによるfocus、B02の文字列だけの入力、B03のDOM属性を書き換えるだけの操作は成功に数えない。
 * 使用API: HTMLButtonElement、HTMLSelectElement、details/nameの標準挙動とtrusted event。
 * 権限・privacy: 権限要求・外部送信・永続保存は行わない。
 * cleanup: stageを離れるとdetailsのlistenerを解除する。
 * 対応環境: 標準HTML controlsとキーボード操作に対応するブラウザ。
 * 人手確認: H-001/H-002/H-003/H-020/H-025。
 */
function S150Stage(props: Props) {
  const focusProblem = props.boxes[manifest.box.B01];
  const selectProblem = props.boxes[manifest.box.B02];
  const detailsProblem = props.boxes[manifest.box.B03];
  const detailsRef = useRef<HTMLDivElement>(null);
  const detailToggleCount = useRef(0);

  useEffect(() => {
    const container = detailsRef.current;
    if (!container) return;
    const details = Array.from(container.querySelectorAll("details"));
    const inspect = () => {
      detailToggleCount.current += 1;
      const openCount = details.filter((item) => item.open).length;
      if (detailToggleCount.current > 1 && openCount === 1)
        detailsProblem.solve();
    };
    details.forEach((item) => {
      item.addEventListener("toggle", inspect);
    });
    return () => {
      details.forEach((item) => {
        item.removeEventListener("toggle", inspect);
      });
    };
  }, [detailsProblem.solve]);

  return (
    <div className="puzzle puzzle--centered accessibility-puzzle">
      <p className="measurement">{stageText(props.locale, locale.clue)}</p>
      <button
        type="button"
        className="stage-action accessibility-keyboard-button"
        onFocus={() => focusProblem.solve()}
        onClick={() => focusProblem.solve()}
      >
        {stageText(props.locale, locale.focusButton)}
      </button>
      <label className="accessibility-select">
        {stageText(props.locale, locale.selectLabel)}
        <select
          defaultValue=""
          onChange={(event) => {
            if (event.currentTarget.value === "open busybox")
              selectProblem.solve();
          }}
        >
          <option value="" disabled>
            {stageText(props.locale, locale.selectPlaceholder)}
          </option>
          {selectOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <div ref={detailsRef} className="accessibility-details">
        {(["A", "B", "C"] as const).map((name) => (
          <details key={name} name="busybox-exclusive-details">
            <summary>{name}</summary>
            <p>{name}</p>
          </details>
        ))}
      </div>
      <div className="problem-row">
        <StageProblemGiftBox box={focusProblem} locale={props.locale} />
        <StageProblemGiftBox box={selectProblem} locale={props.locale} />
        <StageProblemGiftBox box={detailsProblem} locale={props.locale} />
      </div>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: VisibilityOffOutlined,
      color: "#c084fc",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: SelectAllOutlined,
      color: "#a78bfa",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: AccountTreeOutlined,
      color: "#8b5cf6",
      label: locale.B03,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      "MutationObserver" in window ? "available" : "unsupported",
    ),
  Component: S150Stage,
});
