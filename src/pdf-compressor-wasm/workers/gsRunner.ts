// 暫定: 実際のGhostscript WASM呼び出しの代替。MVPまでの雛形。
// 本実装では、ps-wasmで得られる Module をWorker内で起動し、
// /working/input.pdf と /working/output.pdf をFSで受け渡しする。

export async function runGhostscriptWasm(
  file: File,
  args: string[],
): Promise<{ output: Blob; logs: string }> {
  // TODO: 実装置換
  // 現状はダミー: 入力をそのまま返す
  const arrayBuffer = await file.arrayBuffer();
  const output = new Blob([arrayBuffer], { type: "application/pdf" });
  const logs = `Dummy runner\nargs: ${args.join(" ")}`;
  await new Promise((r) => setTimeout(r, 300));
  return { output, logs };
}
