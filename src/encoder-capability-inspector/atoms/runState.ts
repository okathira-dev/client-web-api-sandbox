/** 実行中かどうかと、直近の失敗理由。 */

import { atom, useAtomValue, useSetAtom } from "jotai";

/** 実行中の種別。UI のどのボタンを止めるかを決めるのに使う。 */
export type RunKind = "full" | "sustained";

const runKindAtom = atom<RunKind | null>(null);
const runningAtom = atom((get) => get(runKindAtom) !== null);
const errorAtom = atom<string | null>(null);

export const useRunKind = () => useAtomValue(runKindAtom);
export const useSetRunKind = () => useSetAtom(runKindAtom);
export const useIsRunning = () => useAtomValue(runningAtom);
export const useRunError = () => useAtomValue(errorAtom);
export const useSetRunError = () => useSetAtom(errorAtom);
