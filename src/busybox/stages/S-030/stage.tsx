import SelectAllOutlined from "@mui/icons-material/SelectAllOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

/**
 * S-030 — DOM Selectionそのものを回答として使う。
 * 目的: 入力欄へ入力するのではなく、文章中の指定語をnative Selectionで選ぶ。
 * 最初の一手: 角括弧内の一語をマウスまたはキーボードで選択する。
 * 箱ごとの成功条件: B01はlocalizedな対象語だけが選択範囲になった時に開く。
 * 開かない操作: 入力欄への入力、script製ハイライト、句読点を含む選択、DevTools編集では開かない。
 * API/権限: Selection APIとselectionchange。権限・保存・送信はない。
 * cleanup/環境: selectionchange listenerを離脱時に外し、選択文字列を保存しない。H-001/H-003/H-020/H-025を確認する。
 */
function S030Stage(props: Props) {
  const answer = stageText(props.locale, locale.answer);
  const problem = props.boxes[manifest.box.B01];

  useEffect(() => {
    const observeSelection = () => {
      if (document.getSelection()?.toString().trim().toLowerCase() === answer) {
        problem.solve();
      }
    };
    document.addEventListener("selectionchange", observeSelection);
    props.signal.addEventListener(
      "abort",
      () => document.removeEventListener("selectionchange", observeSelection),
      { once: true },
    );
    return () =>
      document.removeEventListener("selectionchange", observeSelection);
  }, [answer, problem.solve, props.signal]);

  return (
    <div className="puzzle puzzle--centered selection-puzzle">
      <p>
        [ <strong>{answer}</strong> ]
      </p>
      <p>{stageText(props.locale, locale.sentence)}</p>
      <div className="problem-row">
        <StageProblemGiftBox box={problem} locale={props.locale} />
      </div>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: SelectAllOutlined,
      color: "#fbbf24",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      typeof document.getSelection === "function" ? "available" : "unsupported",
    ),
  Component: S030Stage,
});
