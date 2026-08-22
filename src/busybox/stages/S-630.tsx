import { useState } from "react";
import type { StageComponentProps } from "../runtime/types";
import { ProblemGiftBox } from "../ui/GiftBox";
import { stageText } from "./locale";
import { s630Locale } from "./S-630.locale";

type NetworkInformationLike = EventTarget & { readonly type?: string };

const problemIdByType = {
  wifi: "S-630-B01",
  cellular: "S-630-B02",
  ethernet: "S-630-B03",
  bluetooth: "S-630-B04",
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
export default function S630Stage(props: StageComponentProps) {
  const problems = [
    props.problem("S-630-B01"),
    props.problem("S-630-B02"),
    props.problem("S-630-B03"),
    props.problem("S-630-B04"),
  ] as const;
  const [status, setStatus] = useState(() =>
    stageText(props.locale, s630Locale.idle),
  );

  const inspect = () => {
    const connection = (
      navigator as Navigator & { connection?: NetworkInformationLike }
    ).connection;
    const type = connection?.type;
    if (!type) {
      setStatus(stageText(props.locale, s630Locale.unavailable));
      return;
    }
    const problemId = problemIdByType[type as keyof typeof problemIdByType];
    if (!problemId) {
      setStatus(`${stageText(props.locale, s630Locale.ignored)} (${type})`);
      return;
    }
    props.problem(problemId).solve([`network:type:${type}`]);
    setStatus(`${stageText(props.locale, s630Locale.observed)}: ${type}`);
  };

  return (
    <div className="puzzle puzzle--centered">
      <div className="problem-row">
        {problems.map((problem) => (
          <ProblemGiftBox
            key={problem.definition.id}
            problem={problem}
            locale={props.locale}
          />
        ))}
      </div>
      <button type="button" className="stage-action" onClick={inspect}>
        {stageText(props.locale, s630Locale.inspect)}
      </button>
      <p className="stage-status" role="status" aria-live="polite">
        {status}
      </p>
    </div>
  );
}
