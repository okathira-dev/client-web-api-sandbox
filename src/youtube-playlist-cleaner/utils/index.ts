/**
 * ISO 8601 duration format (e.g., "PT4M13S") を人間が読める形式に変換する
 * @param duration ISO 8601形式の時間文字列
 * @returns 人間が読める形式の時間文字列 (e.g., "4:13")
 */
export function formatDuration(duration: string): string {
  // PT1H2M3S のような形式をパース
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) {
    return "0:00";
  }

  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * ISO 8601 date string を日本時間でフォーマットする
 * @param isoString ISO 8601形式の日付文字列
 * @returns フォーマットされた日付文字列
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * 動画のYouTube URLを生成する
 * @param videoId 動画ID
 * @returns YouTube動画のURL
 */
export function getVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * 再生リストのYouTube URLを生成する
 * @param playlistId 再生リストID
 * @returns YouTube再生リストのURL
 */
export function getPlaylistUrl(playlistId: string): string {
  return `https://www.youtube.com/playlist?list=${playlistId}`;
}

/**
 * サムネイルURLを取得する（最も高画質のものを優先）
 * @param thumbnails サムネイルセット
 * @returns サムネイルURL
 */
export function getThumbnailUrl(thumbnails: {
  default?: { url: string };
  medium?: { url: string };
  high?: { url: string };
  standard?: { url: string };
  maxres?: { url: string };
}): string {
  return (
    thumbnails.maxres?.url ||
    thumbnails.standard?.url ||
    thumbnails.high?.url ||
    thumbnails.medium?.url ||
    thumbnails.default?.url ||
    ""
  );
}
