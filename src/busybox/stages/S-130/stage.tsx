import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import FileUploadOutlined from "@mui/icons-material/FileUploadOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { type ChangeEvent, useState } from "react";
import { statusText } from "../../ui/statusLocale";
import { stageText } from "../locale";
import { locale } from "./locale";

async function hashToken(token: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function isKeyFile(
  value: unknown,
): value is { format: "busybox-key-v1"; token: string } {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as { format?: unknown; token?: unknown };
  return (
    candidate.format === "busybox-key-v1" && typeof candidate.token === "string"
  );
}

/**
 * S-130
 *
 * 目的: 「箱の外の鍵」で、B01「鍵を外へ出す箱」、B02「鍵を戻す箱」に対応する実際のブラウザ状態・標準UI・端末入力を観測する。
 * 最初の一手: 画面の箱と説明を確認し、表示されている標準UIまたは外部機器を使って観測を開始する。
 * 箱ごとの解法: 問題定義にある各Bxxについて、対応する実操作を行い、実APIから得た値・イベント・結果が厳密な成功条件を満たした箱だけが開く。
 * 開かない操作: 文字列の直接編集、合成イベント、DevToolsでのDOM改変、見た目だけの変更、別箱の結果の流用では開かない。
 * 使用API: S-130の判定に必要な実装内のWeb API。共通runtimeは進捗表示だけを担う。
 * 権限・privacy: 実装が必要とする権限・保存・送信は、箱の操作に必要な最小範囲へ限定する。生の入力を回答以外の目的で扱わない。
 * cleanup: stage離脱・取消・再試行時に、このstageが取得したlistener、timer、stream、worker、接続、blob URLを実装に応じて解除する。
 * 対応環境: StageHostのcapability probeがavailableまたはpermission-requiredとしたブラウザ。非対応時は操作を要求せずunsupported表示とする。
 * 人手確認: 対応するH-xxxをhuman-test-matrix.mdで確認し、権限拒否・取消・再入場も確認する。
 */
function S130Stage(props: Props) {
  const exportProblem = props.boxes[manifest.box.B01];
  const importProblem = props.boxes[manifest.box.B02];
  const [status, setStatus] = useState("");
  const [attemptKeyHash, setAttemptKeyHash] = useState<string | null>(null);

  const exportKey = async () => {
    const bytes = crypto.getRandomValues(new Uint8Array(18));
    const token = btoa(String.fromCharCode(...bytes));
    const hash = await hashToken(token);
    if (props.signal.aborted) return;
    setAttemptKeyHash(hash);
    exportProblem.solve();
    const blob = new Blob(
      [JSON.stringify({ format: "busybox-key-v1", token })],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "busybox-key.busykey";
    link.click();
    URL.revokeObjectURL(url);
  };

  const importKey = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || file.size > 4096) {
      setStatus("invalid");
      return;
    }
    try {
      const value: unknown = JSON.parse(await file.text());
      if (!isKeyFile(value)) throw new Error("invalid key file");
      const hash = await hashToken(value.token);
      if (props.signal.aborted) return;
      if (hash !== attemptKeyHash) throw new Error("different key");
      importProblem.solve();
      setStatus("matched");
    } catch {
      if (!props.signal.aborted) setStatus("invalid");
    }
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        <StageProblemGiftBox box={exportProblem} locale={props.locale} />
        <StageProblemGiftBox box={importProblem} locale={props.locale} />
      </div>
      <button
        type="button"
        className="stage-action"
        onClick={() => void exportKey()}
      >
        {stageText(props.locale, locale.sendKey)}
      </button>
      <label className="stage-action file-action">
        {stageText(props.locale, locale.returnKey)}
        <input
          type="file"
          accept=".busykey,application/json"
          onChange={(event) => void importKey(event)}
        />
      </label>
      <p role="status">{status ? statusText(props.locale, status) : null}</p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: FileUploadOutlined,
      color: "#34d399",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: FileDownloadOutlined,
      color: "#10b981",
      label: locale.B02,
    },
  },
  probe: () =>
    safeCapabilityProbe(() =>
      isSecureContext && crypto.subtle ? "available" : "unsupported",
    ),
  Component: S130Stage,
});
