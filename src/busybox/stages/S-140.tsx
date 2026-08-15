import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { statusText } from "../ui/statusLocale";
import { stageText } from "./locale";
import { s140Locale } from "./S-140.locale";

/**
 * S-140
 *
 * Gimmick: Grow-only progress crosses devices through Google Drive appDataFolder.
 * Uses: Google Identity Services and Drive appDataFolder through StageServices.
 * Success: Complete a fresh sync, then separately observe a remote installation.
 * Privacy/Permission: Use only the app-private folder and never infer an account identity.
 * Cleanup: The Drive service owns token/request cleanup; ignore completion after stage exit.
 * Human verification: H-015, H-016, H-017, H-018, H-025
 */
/**
 * S-140
 *
 * 目的: S-140の箱が示すブラウザ固有の状態・イベント・データ受け渡しを、プレイヤーの操作で観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: このファイルが呼び出すWeb APIと、共通のProblem/Stage runtime。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
export default function S140Stage(props: StageComponentProps) {
  const backupProblem = props.problem("S-140-B01");
  const deviceProblem = props.problem("S-140-B02");
  const [status, setStatus] = useState<
    "idle" | "syncing" | "success" | "error"
  >("idle");
  const drive = props.services.drive;

  const sync = async () => {
    if (!drive?.configured) return;
    setStatus("syncing");
    // The stage consumes the fresh result instead of persistent observations so
    // reopening a cleared stage still requires a sync during this attempt.
    try {
      const result = await drive.sync();
      if (props.signal.aborted) return;
      if (!result.synced) {
        setStatus("error");
        return;
      }
      backupProblem.solve(["drive:backup"]);
      if (result.remoteDevice) {
        deviceProblem.solve(["drive:remote-device"]);
      }
      setStatus("success");
    } catch {
      if (props.signal.aborted) return;
      setStatus("error");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="cloud-clue" aria-hidden="true">
        ☁
      </div>
      <div className="problem-row">
        <ProblemGiftBox problem={backupProblem} locale={props.locale} />
        <ProblemGiftBox problem={deviceProblem} locale={props.locale} />
      </div>
      <button
        type="button"
        className="stage-action"
        disabled={!drive?.configured || status === "syncing"}
        onClick={() => void sync()}
      >
        {!drive?.configured
          ? stageText(props.locale, s140Locale.driveNotConfigured)
          : stageText(props.locale, s140Locale.connectDevices)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
    </div>
  );
}
