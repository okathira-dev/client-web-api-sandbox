/**
 * 同時に複数の検査を走らせないための排他。
 *
 * Web Locks はオリジン単位なので、同じページを複数タブで開いていても 1 つしか通らない。
 */

import { INSPECTION_LOCK_NAME } from "../consts/inspection";

export class InspectionBusyError extends Error {
  constructor() {
    super("inspection-already-running");
    this.name = "InspectionBusyError";
  }
}

export const withInspectionLock = async <T>(
  operation: () => Promise<T>,
): Promise<T> => {
  if (!navigator.locks?.request) {
    // Web Locks が無い環境では排他できないが、検査自体は動かせるので続行する。
    return operation();
  }
  return navigator.locks.request(
    INSPECTION_LOCK_NAME,
    { mode: "exclusive", ifAvailable: true },
    async (lock) => {
      if (!lock) throw new InspectionBusyError();
      return operation();
    },
  );
};
