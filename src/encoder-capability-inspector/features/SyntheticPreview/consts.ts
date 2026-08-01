/** プレビューの描画条件。検査そのものの条件ではないので、検査用の定数とは分けて持つ。 */

/**
 * 表示解像度。ノイズタイルの枚数は画素数から決まるため、
 * 実際の検査が使う 720p 以上と覆う割合がずれない大きさにしてある。
 * `samples/` へ書き出す APNG とも同じ条件。
 */
export const PREVIEW_VIDEO_WIDTH = 640;
export const PREVIEW_VIDEO_HEIGHT = 360;
export const PREVIEW_VIDEO_FPS = 30;

export const PREVIEW_WAVEFORM_WIDTH = 640;
export const PREVIEW_WAVEFORM_HEIGHT = 120;

export const PREVIEW_AUDIO_SAMPLE_RATE = 48_000;
export const PREVIEW_AUDIO_CHANNELS = 2;
/** 検査ワーカーが `AudioEncoder` へ 1 回で渡す単位に合わせる。 */
export const PREVIEW_AUDIO_FRAMES_PER_CHUNK = 960;
export const PREVIEW_SUSTAINED_AUDIO_SECONDS = 2;
/** 一括実用検査は 1 チャンクの使い回しなので、繰り返して継ぎ目の有無を聴けるようにする。 */
export const PREVIEW_COMPATIBILITY_AUDIO_CHUNKS = 25;

/** 合成パターンはほぼフルスケールなので、そのまま鳴らすと耳に痛い。 */
export const PREVIEW_AUDIO_GAIN = 0.25;
