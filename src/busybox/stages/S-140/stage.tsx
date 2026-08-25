import CloudUploadOutlined from "@mui/icons-material/CloudUploadOutlined";
import DevicesOutlined from "@mui/icons-material/DevicesOutlined";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useState } from "react";
import { statusText } from "../../ui/statusLocale";
import { stageText } from "../locale";
import { locale } from "./locale";

/**
 * S-140
 *
 * 目的: 「もう一つの端末」で、B01「バックアップの箱」、B02「別端末の箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-140の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S140Stage(props: Props) {
  const backupProblem = props.boxes[manifest.box.B01];
  const deviceProblem = props.boxes[manifest.box.B02];
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
      backupProblem.solve();
      if (result.remoteDevice) {
        deviceProblem.solve();
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
        <StageProblemGiftBox box={backupProblem} locale={props.locale} />
        <StageProblemGiftBox box={deviceProblem} locale={props.locale} />
      </div>
      <button
        type="button"
        className="stage-action"
        disabled={!drive?.configured || status === "syncing"}
        onClick={() => void sync()}
      >
        {!drive?.configured
          ? stageText(props.locale, locale.driveNotConfigured)
          : stageText(props.locale, locale.connectDevices)}
      </button>
      <p className="interaction-status" role="status">
        {statusText(props.locale, status)}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: CloudUploadOutlined,
      color: "#60a5fa",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: DevicesOutlined,
      color: "#a78bfa",
      label: locale.B02,
    },
  },
  probe: () => "available",
  Component: S140Stage,
});
