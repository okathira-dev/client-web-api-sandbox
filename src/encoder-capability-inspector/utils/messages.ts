/**
 * ワーカーと実行制御が返す失敗・警告コードを、表示用の文へ置き換える。
 *
 * コードは環境をまたいで報告・検索されるものなので、翻訳文と一緒に必ず残す。
 * 翻訳を持たないもの（デコーダーが返す生のメッセージ、タイムアウトなど）は
 * そのまま表示する。
 */

import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { getResultDetails } from "../domain/filters";
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

const collectDetailCodes = (result: UnitResult): string[] =>
  [
    result.error,
    result.warning,
    result.sustained?.error,
    result.sustained?.warning,
  ].filter((detail): detail is string => Boolean(detail));

/** 結果 1 行に表示する失敗・警告の説明。 */
export const useResultDetails = (): ((result: UnitResult) => string) => {
  const describeCode = useCodeMessage();
  return useCallback(
    (result) => collectDetailCodes(result).map(describeCode).join(" · "),
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
