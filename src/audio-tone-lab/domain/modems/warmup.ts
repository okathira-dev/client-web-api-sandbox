export interface ModemWarmupState {
  quietReady: boolean;
  ggwaveReady: boolean;
  warningMessages: string[];
}

export async function warmupModemLibraries(): Promise<ModemWarmupState> {
  const warningMessages: string[] = [];
  const quietReady = false;
  let ggwaveReady = false;

  // Quiet は WASM が重いため初回利用時に遅延ロード（ensureQuietReady）する

  try {
    const { ensureGgwaveModule } = await import("./backends/ggwave/init");
    await ensureGgwaveModule();
    ggwaveReady = true;
  } catch (error) {
    warningMessages.push(`ggwave の初期化に失敗: ${String(error)}`);
  }

  return { quietReady, ggwaveReady, warningMessages };
}
