/** 検査全体に関わる定数。 */

/**
 * レポート形式の版数。版が違う保存済みレポートは、設定の判断材料として使わない。
 *
 * 上げるのは、公開済みの版から意味が変わったときだけ。候補行列や結果の構造の変更に加え、
 * 合成パターンや計測方法のように値の読み方が変わる変更も対象になる。
 * まだ公開していない版での作り込みは、何度手を入れても同じ版のまま扱う。
 */
export const REPORT_VERSION = 1;

export const REPORT_DB_NAME = "encoder-capability-inspector";
export const REPORT_DB_VERSION = 1;
export const REPORT_STORE_NAME = "reports";
export const REPORT_RECORD_KEY = "latest";

/** 保存済みレポートの更新を他タブへ知らせるチャンネル名。 */
export const REPORT_CHANNEL_NAME = "encoder-capability-inspector/report";

/** 同時に複数の検査を走らせないための Web Locks 名。 */
export const INSPECTION_LOCK_NAME = "encoder-capability-inspector/inspection";

/** 候補間待機。既定は 0ms で、0 のときは待機処理を完全に省く。 */
export const DEFAULT_CANDIDATE_PAUSE_MS = 0;
export const MAX_CANDIDATE_PAUSE_MS = 2000;

/**
 * 実用継続検査の検査時間。
 *
 * 上限は設けない。長く回したいのは正当な使い方で、中断はいつでも効く。
 * ただし出力を抱えるぶんメモリは伸びるので、見積りを出して注意を促す。
 * `MAX` は打ち間違いを弾くためだけの歯止め（24 時間）。
 */
export const MIN_SUSTAINED_DURATION_SECONDS = 1;
export const MAX_SUSTAINED_DURATION_SECONDS = 86_400;
export const DEFAULT_SUSTAINED_DURATION_SECONDS = 2;

/** 保持する出力がこれを超えるなら、メモリを抱えることを伝える。 */
export const SUSTAINED_MEMORY_CAUTION_BYTES = 512 * 1024 * 1024;

/** 互換性確認に必要な最小限のフレーム数（仕様 3.2）。 */
export const COMPATIBILITY_VIDEO_FRAME_COUNT = 2;
export const COMPATIBILITY_AUDIO_FRAME_COUNT = 2;

/** AudioEncoder へ 1 回で渡すサンプル数。48kHz で 20ms 相当。 */
export const AUDIO_FRAMES_PER_CHUNK = 960;

/** エンコーダーのキューがこれを超えたら供給を止めて捌けるのを待つ。 */
export const MAX_ENCODE_QUEUE_SIZE = 24;
export const MAX_DECODE_QUEUE_SIZE = 24;

/** 各段階のタイムアウト。ハングした実装で検査全体が止まらないようにする。 */
export const SUPPORT_CHECK_TIMEOUT_MS = 10_000;
export const DECODER_FLUSH_TIMEOUT_MS = 15_000;
export const AUDIO_FLUSH_TIMEOUT_MS = 12_000;
export const MUX_START_TIMEOUT_MS = 10_000;
export const MUX_FINALIZE_TIMEOUT_MS = 15_000;
export const LIVE_FRAME_TIMEOUT_MS = 15_000;

/** encoder.flush() のタイムアウトは画素数に応じて伸ばす。 */
export const MIN_ENCODE_FLUSH_TIMEOUT_MS = 12_000;
export const MAX_ENCODE_FLUSH_TIMEOUT_MS = 45_000;

/** 多重化結果がこれ未満なら、ヘッダーだけで実体が無いとみなす。 */
export const MIN_MUXED_BYTES = 256;

/** Sustained test で、実効 FPS が要求 FPS のこの割合を下回ったら警告にする。 */
export const SUSTAINED_THROUGHPUT_WARNING_RATIO = 0.75;

/** UI 設定を localStorage へ保存するときのキー。 */
export const PREFERENCES_STORAGE_KEY =
  "encoder-capability-inspector/preferences";
