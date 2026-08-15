import { useEffect, useRef, useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s500Locale } from "./S-500.locale";

const plain = "follow the quiet marks until busybox appears between the noise";
const cipher = plain.replace(/[a-z]/g, (letter) =>
  String.fromCharCode(((letter.charCodeAt(0) - 97 + 3) % 26) + 97),
);

/** S-500 — copy Caesar text, trusted-paste the substituted plaintext, then select busybox. H-004/H-006/H-014. */
/**
 * S-500
 *
 * 目的: S-500の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S500Stage(props: StageComponentProps) {
  const problem = props.problem("S-500-B01");
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
      if (node && targetRef.current?.contains(node))
        problem.solve(["clipboard:caesar", "selection:busybox"]);
    };
    document.addEventListener("selectionchange", inspect);
    return () => document.removeEventListener("selectionchange", inspect);
  }, [copied, pasted, problem.solve]);

  return (
    <div className="puzzle puzzle--centered">
      <ProblemGiftBox problem={problem} locale={props.locale} />
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
        {stageText(props.locale, s500Locale.returnHere)}
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
