import type { Context } from "z3-solver";

type Z3Module = typeof import("z3-solver");
type Z3InitResult = Awaited<ReturnType<Z3Module["init"]>>;

export const V8_CURRENT_Z3_CONTEXT_NAME = "v8-current";

let z3InitPromise: Promise<Z3InitResult> | undefined;

/**
 * `z3-solver` の WASM 初期化を solver 呼び出し間で共有する。
 */
export const getZ3 = async (): Promise<Z3InitResult> => {
  z3InitPromise ??= import("z3-solver").then((module) => module.init());
  return z3InitPromise;
};

/**
 * V8 current モデル用の Z3 Context を生成する。
 */
export const createV8CurrentZ3Context = async (): Promise<
  Context<typeof V8_CURRENT_Z3_CONTEXT_NAME>
> => {
  const { Context } = await getZ3();
  return new Context(V8_CURRENT_Z3_CONTEXT_NAME);
};
