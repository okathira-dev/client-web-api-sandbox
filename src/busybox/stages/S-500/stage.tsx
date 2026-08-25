import SelectAllOutlined from "@mui/icons-material/SelectAllOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useEffect, useRef, useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

const plain = "follow the quiet marks until busybox appears between the noise";
const cipher = plain.replace(/[a-z]/g, (letter) =>
  String.fromCharCode(((letter.charCodeAt(0) - 97 + 3) % 26) + 97),
);

/**
 * S-500
 *
 * 目的: 「暗号の受け渡し」で、B01「選び出す箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-500の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S500Stage(props: Props) {
  const problem = props.boxes[manifest.box.B01];
  const targetRef = useRef<HTMLParagraphElement>(null);
  const [copied, setCopied] = useState(false);
  const [pasted, setPasted] = useState(false);

  useEffect(() => {
    const inspect = () => {
      const selection = document.getSelection();
      if (
        !copied ||
        !pasted ||
        !selection ||
        selection.toString() !== "busybox"
      )
        return;
      const node = selection.anchorNode;
      if (node && targetRef.current?.contains(node)) problem.solve();
    };
    document.addEventListener("selectionchange", inspect);
    return () => document.removeEventListener("selectionchange", inspect);
  }, [copied, pasted, problem.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <StageProblemGiftBox box={problem} locale={props.locale} />
      <p
        className="cipher-text"
        onCopy={(event) => {
          event.preventDefault();
          event.clipboardData.setData("text/plain", plain);
          setCopied(true);
        }}
      >
        {cipher}
      </p>
      <label className="paste-target">
        {stageText(props.locale, locale.returnHere)}
        <input
          type="text"
          onPaste={(event) => {
            if (copied && event.clipboardData.getData("text/plain") === plain)
              setPasted(true);
          }}
        />
      </label>
      <p ref={targetRef} className="cipher-result">
        {pasted ? plain : "••••••••"}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: SelectAllOutlined,
      color: "#818cf8",
      label: locale.B01,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && "clipboard" in navigator
        ? "permission-required"
        : "unsupported",
    ),
  Component: S500Stage,
});
