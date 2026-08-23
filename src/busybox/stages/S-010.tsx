import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";

const problemIds = {
  mouse: "S-010-B01",
  touch: "S-010-B02",
  pen: "S-010-B03",
} as const;

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
