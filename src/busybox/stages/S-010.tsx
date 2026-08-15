/**
 * S-010
 *
 * 目的: pointerTypeの違いを、実際の入力で見分ける。
 * 最初の一手: 画面の箱を確認し、対応する入力機器で触れる。
 * 箱ごとの解法: B01〜B03を対応する入力で操作し、pointerTypeが一致した箱だけを開く。
 * 開かない操作: 他のpointerType、合成イベント、DevTools編集では開かない。
 * 使用API: Pointer Events。
 * 権限・privacy: 権限はなく、座標や入力履歴を保存・送信しない。
 * cleanup: stage離脱時にイベントlistenerを解除する。
 * 対応環境: Pointer Events対応ブラウザ。非対応時はunsupported。
 * 人手確認: H-004/H-020/H-024/H-025。
 */
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

const problemIds = {
  mouse: "S-010-B01",
  touch: "S-010-B02",
  pen: "S-010-B03",
} as const;

/**
 * S-010
 *
 * Gimmick: Pointer Events distinguish mouse, touch, and pen input.
 * Uses: Pointer Events and pointerType.
 * Success: Each pointerType opens only its matching problem box.
 * Privacy/Permission: No permission; pointer coordinates are not retained.
 * Cleanup: React removes the pointer handlers with the problem boxes.
 * Human verification: H-004, H-020, H-024, H-025
 */
/**
 * S-010
 *
 * 目的: S-010の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S010Stage(props: StageComponentProps) {
  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row" aria-live="polite">
        {Object.entries(problemIds).map(([pointerType, problemId]) => {
          const problem = props.problem(problemId);
          return (
            <ProblemGiftBox
              key={problemId}
              problem={problem}
              locale={props.locale}
              onPointerDown={(event) => {
                if (event.pointerType === pointerType) {
                  problem.solve([`pointer:${event.pointerType}`]);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
/**
 * S-010
 *
 * 目的: pointerTypeの違いを、実際の入力で見分ける。
 * 最初の一手: 画面の箱を確認し、対応する入力機器で触れる。
 * 箱ごとの解法: B01〜B03をmouse・touch・penの入力で操作し、対応するpointerTypeだけを開く。
 * 開かない操作: 他のpointerType、単なるクリック合成、DevTools編集では開かない。
 * 使用API: Pointer Events。権限はなく、座標や入力履歴は保存・送信しない。
 * 権限・privacy: 外部送信と永続保存はない。
 * cleanup: stage離脱時にイベントlistenerをReactが解除する。
 * 対応環境: Pointer Events対応ブラウザ。非対応時はstageをunsupportedとして扱う。
 * 人手確認: H-004/H-020/H-024/H-025。
 */
