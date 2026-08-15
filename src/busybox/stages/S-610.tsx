import { useEffect, useRef } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s610Locale } from "./S-610.locale";

/**
 * S-610 — dialogの閉じ方をブラウザ固有の3経路として見せる。
 * 目的: ×ボタン、外側クリック、Escapeが別イベントになることを体験する。
 * 最初の一手: dialogを開き、3種類の閉じ方をそれぞれ一度ずつ試す。
 * 箱ごとの成功条件: B01はdialog内ボタン、B02はnative light dismiss、B03はtrustedなEscapeのcancel→close。
 * 開かない操作: scriptのclose、単なる再描画、閉じた後の無関係なclickでは開かない。
 * API/権限: HTMLDialogElementのshowModal、close、cancel、closedby。権限・外部送信・永続保存はない。
 * cleanup/環境: 離脱時にlistenerを外し、開いたdialogを閉じる。closedby対応ブラウザで人手確認する（H-001/H-002/H-003/H-004/H-019/H-020/H-025）。
 */
/**
 * S-610
 *
 * 目的: S-610の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S610Stage(props: StageComponentProps) {
  const button = props.problem("S-610-B01");
  const lightDismiss = props.problem("S-610-B02");
  const cancel = props.problem("S-610-B03");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeKind = useRef<"button" | "dismiss" | "cancel" | undefined>(
    undefined,
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.setAttribute("closedby", "any");
    const handleCancel = () => {
      closeKind.current = "cancel";
    };
    const handleClose = () => {
      const kind = closeKind.current;
      if (kind === "button") button.solve(["dialog:button"]);
      if (kind === "dismiss") lightDismiss.solve(["dialog:light-dismiss"]);
      if (kind === "cancel") cancel.solve(["dialog:cancel"]);
      closeKind.current = undefined;
    };
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleClose);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleClose);
      if (dialog.open) dialog.close();
    };
  }, [button.solve, cancel.solve, lightDismiss.solve]);

  const open = () => dialogRef.current?.showModal();

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <ProblemGiftBox problem={button} locale={props.locale} />
        <ProblemGiftBox problem={lightDismiss} locale={props.locale} />
        <ProblemGiftBox problem={cancel} locale={props.locale} />
      </div>
      <button type="button" className="stage-action" onClick={open}>
        {stageText(props.locale, s610Locale.openDialog)}
      </button>
      <dialog
        ref={dialogRef}
        aria-label={stageText(props.locale, s610Locale.tryClose)}
        onClick={(event) => {
          if (event.target !== event.currentTarget) return;
          closeKind.current = "dismiss";
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") closeKind.current = "cancel";
        }}
      >
        <p>
          <strong>{stageText(props.locale, s610Locale.tryClose)}</strong>
        </p>
        <p>{stageText(props.locale, s610Locale.instruction)}</p>
        <button
          type="button"
          onClick={() => {
            closeKind.current = "button";
            dialogRef.current?.close();
          }}
        >
          {stageText(props.locale, s610Locale.close)}
        </button>
      </dialog>
    </div>
  );
}
