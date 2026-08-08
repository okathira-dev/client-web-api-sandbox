/**
 * 実行環境の概要。結果を他環境へ一般化しないため、レポートに添えて保存する。
 * 個人を特定しうる情報やデバイス固有 ID は集めない。
 */

import type { EnvironmentInfo } from "../domain/types";

/** `navigator.userAgentData` は TS の DOM 型定義に無いので必要な部分だけ受ける。 */
type UserAgentDataLike = {
  readonly brands?: readonly { brand: string; version: string }[];
  readonly platform?: string;
};

export const collectMainEnvironment = (): Omit<
  EnvironmentInfo,
  "gpu" | "webCodecs"
> => {
  const navigatorLike = navigator as Navigator & {
    userAgentData?: UserAgentDataLike;
    deviceMemory?: number;
  };
  const brands = navigatorLike.userAgentData?.brands;

  return {
    userAgent: navigator.userAgent,
    browserBrands:
      brands && brands.length > 0
        ? brands.map((entry) => `${entry.brand} ${entry.version}`).join(", ")
        : null,
    platform: navigatorLike.userAgentData?.platform ?? null,
    hardwareConcurrency: navigator.hardwareConcurrency ?? null,
    deviceMemoryGb: navigatorLike.deviceMemory ?? null,
  };
};
