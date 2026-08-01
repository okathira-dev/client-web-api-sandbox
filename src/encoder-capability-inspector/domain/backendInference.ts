/**
 * `no-preference` が実際にどちらの実装で動いたのかを推し量る。
 *
 * WebCodecs には「実際に使われた実装」を返す API が無い。`isConfigSupported` が返す
 * 設定にも要求した `hardwareAcceleration` がそのまま入るだけで、実体は分からない。
 *
 * そこで、同じ codec string の `prefer-hardware` / `prefer-software` の結果と突き合わせる。
 * 合成入力は決定的なので、実装が同じなら出力バイト数とチャンク数も一致する。
 * 一致したほうを実体とみなす。これはあくまで推定で、断定はできない。
 */

import type { UnitResult, VideoUnitResult } from "./types";

export type BackendVerdict = "hardware" | "software" | "unknown";

export type BackendInference = {
  readonly verdict: BackendVerdict;
  /**
   * 何を根拠にしたか。
   * - `output-match`: 一方とだけ出力が一致した
   * - `only-one-succeeded`: 片方しか成功しておらず、消去法で寄せた（確度は低い）
   */
  readonly basis: "output-match" | "only-one-succeeded" | null;
};

const UNKNOWN: BackendInference = { verdict: "unknown", basis: null };

/**
 * 比較に使える結果か。
 *
 * 入力が違えば出力も変わるので、決定的な合成入力の一括実用検査だけを対象にする。
 * ライブ入力や継続検査の結果は候補ごとに入力が異なり、突き合わせても意味がない。
 */
const isComparable = (result: UnitResult): result is VideoUnitResult =>
  result.kind === "video" &&
  result.testMode === "compatibility" &&
  result.inputMode === "synthetic";

/** 出力の指紋。実装が違えばここが変わる。 */
const getSignature = (result: VideoUnitResult): string | null => {
  const bytes = result.performance?.outputBytes;
  if (!result.usable || bytes == null || result.encodedChunks == null) {
    return null;
  }
  return `${bytes}:${result.encodedChunks}`;
};

const infer = (
  noPreference: VideoUnitResult,
  hardware: VideoUnitResult | undefined,
  software: VideoUnitResult | undefined,
): BackendInference => {
  const target = getSignature(noPreference);
  if (!target) return UNKNOWN;

  const hardwareSignature = hardware ? getSignature(hardware) : null;
  const softwareSignature = software ? getSignature(software) : null;

  // 両方成功していて指紋が割れているなら、一致したほうが実体。
  if (
    hardwareSignature &&
    softwareSignature &&
    hardwareSignature !== softwareSignature
  ) {
    if (target === hardwareSignature) {
      return { verdict: "hardware", basis: "output-match" };
    }
    if (target === softwareSignature) {
      return { verdict: "software", basis: "output-match" };
    }
    // どちらとも一致しない。3 通りとも違う実装だったか、条件が揃っていない。
    return UNKNOWN;
  }

  // 片方しか通らなかったなら、通ったほうへ寄せる。確度は落ちる。
  if (hardwareSignature && !softwareSignature) {
    return { verdict: "hardware", basis: "only-one-succeeded" };
  }
  if (softwareSignature && !hardwareSignature) {
    return { verdict: "software", basis: "only-one-succeeded" };
  }

  // 両方が同じ指紋。方針を変えても実装が変わらなかったということで、区別できない。
  return UNKNOWN;
};

/**
 * `no-preference` の結果 ID から推定を引ける表を作る。
 * 対象外の結果は載せない（呼び出し側は見つからなければ表示しない）。
 */
export const inferNoPreferenceBackends = (
  results: readonly UnitResult[],
): ReadonlyMap<string, BackendInference> => {
  const byCandidate = new Map<string, Map<string, VideoUnitResult>>();
  for (const result of results) {
    if (!isComparable(result)) continue;
    const group =
      byCandidate.get(result.candidateId) ?? new Map<string, VideoUnitResult>();
    group.set(result.hardwareAcceleration, result);
    byCandidate.set(result.candidateId, group);
  }

  const inferences = new Map<string, BackendInference>();
  for (const group of byCandidate.values()) {
    const noPreference = group.get("no-preference");
    if (!noPreference) continue;
    inferences.set(
      noPreference.id,
      infer(
        noPreference,
        group.get("prefer-hardware"),
        group.get("prefer-software"),
      ),
    );
  }
  return inferences;
};
