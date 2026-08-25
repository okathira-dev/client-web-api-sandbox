import BluetoothOutlined from "@mui/icons-material/BluetoothOutlined";
import DevicesOutlined from "@mui/icons-material/DevicesOutlined";
import { safeCapabilityProbe } from "../../domain/stageRuntime";
import {
  defineStageModule,
  type StageComponentProps,
} from "../../runtime/stageContract";
import { StageProblemGiftBox } from "../../ui/GiftBox";
import { manifest } from "./manifest";

type Props = StageComponentProps<(typeof manifest.boxIds)[number]>;

import { useState } from "react";
import { stageText } from "../locale";
import { locale } from "./locale";

type NetworkInformationLike = EventTarget & { readonly type?: string };

const boxIdByType = {
  wifi: manifest.box.B01,
  cellular: manifest.box.B02,
  ethernet: manifest.box.B03,
  bluetooth: manifest.box.B04,
} as const;

/**
 * S-630
 *
 * 目的: Network Information APIが報告する実network routeの種類を、端末外側で切り替えて4箱へ収集する。
 * 最初の一手: Wi-Fi、携帯回線、有線、Bluetooth tetheringのいずれかへ端末側で接続し、「現在の回線を見る」を押す。
 * 箱ごとの解法: 明示buttonを押した瞬間の`navigator.connection.type`が`wifi`、`cellular`、`ethernet`、`bluetooth`のどれかなら対応するB01〜B04だけを開く。訪問をまたいだ開箱は通常進捗として累積する。
 * 開かない操作: 初期表示、`change` eventだけ、offline、`effectiveType`、downlink、RTT、Save Data、速度測定、UA推定、unknown系では開かない。
 * 使用API: Network Information APIの`Navigator.connection`と`NetworkInformation.type`。
 * 権限・privacy: 接続名、SSID、IP address、速度、時刻は取得せず、4値に一致したproblem ID以外を保存・同期・送信しない。
 * cleanup: stage固有のlistenerやwatcherは作らず、button操作時だけ同期的に値を読む。
 * 対応環境: `navigator.connection.type`を具体値として公開するAndroid / ChromeOS等のbrowser。欠損環境で推定fallbackを出さない。
 * 人手確認: H-004/H-019/H-023/H-025/H-032で4接続、対象外値、再入場、非保存を確認する。
 */
function S630Stage(props: Props) {
  const problems = [
    props.boxes[manifest.box.B01],
    props.boxes[manifest.box.B02],
    props.boxes[manifest.box.B03],
    props.boxes[manifest.box.B04],
  ] as const;
  const [status, setStatus] = useState(() =>
    stageText(props.locale, locale.idle),
  );

  const inspect = () => {
    const connection = (
      navigator as Navigator & { connection?: NetworkInformationLike }
    ).connection;
    const type = connection?.type;
    if (!type) {
      setStatus(stageText(props.locale, locale.unavailable));
      return;
    }
    const boxId = boxIdByType[type as keyof typeof boxIdByType];
    if (!boxId) {
      setStatus(`${stageText(props.locale, locale.ignored)} (${type})`);
      return;
    }
    props.boxes[boxId].solve();
    setStatus(`${stageText(props.locale, locale.observed)}: ${type}`);
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {problems.map((problem) => (
          <StageProblemGiftBox
            key={problem.id}
            box={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <button type="button" className="stage-action" onClick={inspect}>
        {stageText(props.locale, locale.inspect)}
      </button>
      <p className="stage-status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}

export const stage = defineStageModule(manifest, {
  boxes: {
    [manifest.box.B01]: {
      icon: DevicesOutlined,
      color: "#38bdf8",
      label: locale.B01,
    },
    [manifest.box.B02]: {
      icon: DevicesOutlined,
      color: "#fb7185",
      label: locale.B02,
    },
    [manifest.box.B03]: {
      icon: DevicesOutlined,
      color: "#34d399",
      label: locale.B03,
    },
    [manifest.box.B04]: {
      icon: BluetoothOutlined,
      color: "#818cf8",
      label: locale.B04,
    },
  },
  probe: () =>
    safeCapabilityProbe(() => {
      const connection = (
        navigator as Navigator & { connection?: { type?: string } }
      ).connection;
      return typeof connection?.type === "string" ? "available" : "unsupported";
    }),
  Component: S630Stage,
});
