/**
 * ワーカーと実行制御が返す失敗・警告コードを、表示用の文へ置き換える。
 *
 * コードは環境をまたいで報告・検索されるものなので、翻訳文と一緒に必ず残す。
 * 翻訳を持たないもの（デコーダーが返す生のメッセージ、タイムアウトなど）は
 * そのまま表示する。
 */

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { getResultDetailCodes, getResultDetails } from "../domain/filters";
import type { UnitResult } from "../domain/types";

export type DescribeCode = (code: string) => string;

export const useCodeMessage = (): DescribeCode => {
  const { t } = useTranslation();
  return useCallback(
    (code) => {
      const message = t(`codes.${code}`, { defaultValue: "" });
      return message ? `${message} (${code})` : code;
    },
    [t],
  );
};

export type ResultDetailLines = {
  /** ワーカーが返したコードそのもの。訳を持たないものはこの行にだけ出る。 */
  readonly codes: string;
  /** コードの意味と、どの段階で止まったか。 */
  readonly explanation: string;
};

/**
 * 結果 1 行の詳細を、コードの行と解釈の行に分ける。
 *
 * 訳のあるコードは「訳 (コード)」の 1 行、訳の無い生メッセージは素のまま、と
 * 形が割れていて読みにくかった。どちらも同じ 2 行構成へ揃える。
 */
export const useResultDetailLines = (): ((
  result: UnitResult,
) => ResultDetailLines) => {
  const { t } = useTranslation();
  return useCallback(
    (result) => {
      const codes = getResultDetailCodes(result);
      const explanations = codes
        .map((code) => t(`codes.${code}`, { defaultValue: "" }))
        .filter((message) => message !== "");
      // 宣言は通ったのに実出力で落ちた場合、どの段階かが切り分けの手掛かりになる。
      if (result.declared && !result.usable) {
        explanations.push(
          t("table.declaredButFailed", { stage: result.stage }),
        );
      }
      return {
        codes: codes.join(" · "),
        explanation: explanations.join(" · "),
      };
    },
    [t],
  );
};

/** 結果 1 行に表示する失敗・警告の説明。 */
export const useResultDetails = (): ((result: UnitResult) => string) => {
  const describeCode = useCodeMessage();
  return useCallback(
    (result) => getResultDetailCodes(result).map(describeCode).join(" · "),
    [describeCode],
  );
};

/**
 * 詳細列の絞り込みが照合する文字列。
 * 表示されている訳文でも、元のコードでも引けるように両方を含める。
 */
export const useDetailsSearchText = (): ((result: UnitResult) => string) => {
  const describeDetails = useResultDetails();
  return useCallback(
    (result) => `${getResultDetails(result)} ${describeDetails(result)}`,
    [describeDetails],
  );
};
