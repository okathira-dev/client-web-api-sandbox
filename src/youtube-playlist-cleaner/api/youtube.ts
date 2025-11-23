import type {
  PlaylistListResponse,
  PlaylistItemListResponse,
  VideoListResponse,
  RatingValue,
  YouTubeApiError,
} from "../types";

const API_BASE_URL = "https://www.googleapis.com/youtube/v3";

/**
 * YouTube Data API のエラーをハンドリングする
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = (await response.json()) as YouTubeApiError;
    throw new Error(
      `YouTube API Error: ${errorData.error.message} (Code: ${errorData.error.code})`,
    );
  }
  return response.json() as Promise<T>;
}

/**
 * ユーザーの再生リスト一覧を取得する
 * @param accessToken OAuth 2.0 アクセストークン
 * @param maxResults 取得する最大件数（デフォルト: 50）
 * @param pageToken ページネーション用トークン
 */
export async function fetchPlaylists(
  accessToken: string,
  maxResults = 50,
  pageToken?: string,
): Promise<PlaylistListResponse> {
  const params = new URLSearchParams({
    part: "snippet",
    mine: "true",
    maxResults: maxResults.toString(),
  });

  if (pageToken) {
    params.append("pageToken", pageToken);
  }

  const response = await fetch(`${API_BASE_URL}/playlists?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const playlistsResponse =
    await handleApiResponse<PlaylistListResponse>(response);

  // 注意: YouTube Data API v3では「後で見る」リスト（Watch Later）は
  // プライベートリストとして扱われ、API経由での取得ができません。
  // contentDetails.relatedPlaylists.watchLater は多くのアカウントで返されません。
  //
  // 代替案:
  // 1. ユーザーに「後で見る」の動画を通常の再生リストにコピーしてもらう
  // 2. 「高く評価した動画」(likes: "LL") を使用する
  // 3. Google Takeoutでエクスポートする
  //
  // このアプリでは、ユーザーが作成した通常の再生リストのみをサポートします。

  return playlistsResponse;
}

/**
 * 再生リスト内の動画一覧を取得する
 * @param accessToken OAuth 2.0 アクセストークン
 * @param playlistId 再生リストID
 * @param maxResults 取得する最大件数（デフォルト: 50）
 * @param pageToken ページネーション用トークン
 */
export async function fetchPlaylistItems(
  accessToken: string,
  playlistId: string,
  maxResults = 50,
  pageToken?: string,
): Promise<PlaylistItemListResponse> {
  const params = new URLSearchParams({
    part: "snippet,contentDetails",
    playlistId,
    maxResults: maxResults.toString(),
  });

  if (pageToken) {
    params.append("pageToken", pageToken);
  }

  const response = await fetch(`${API_BASE_URL}/playlistItems?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleApiResponse<PlaylistItemListResponse>(response);
}

/**
 * すべての再生リストアイテムを取得する（ページネーション処理込み）
 * @param accessToken OAuth 2.0 アクセストークン
 * @param playlistId 再生リストID
 */
export async function fetchAllPlaylistItems(
  accessToken: string,
  playlistId: string,
): Promise<PlaylistItemListResponse> {
  let allItems: PlaylistItemListResponse["items"] = [];
  let nextPageToken: string | undefined;
  let pageInfo: PlaylistItemListResponse["pageInfo"] | undefined;

  do {
    const response = await fetchPlaylistItems(
      accessToken,
      playlistId,
      50,
      nextPageToken,
    );
    allItems = [...allItems, ...response.items];
    nextPageToken = response.nextPageToken;
    pageInfo = response.pageInfo;
  } while (nextPageToken);

  return {
    kind: "youtube#playlistItemListResponse",
    etag: "",
    pageInfo: pageInfo || { totalResults: allItems.length, resultsPerPage: 50 },
    items: allItems,
  };
}

/**
 * 動画の詳細情報（再生時間など）を取得する
 * @param accessToken OAuth 2.0 アクセストークン
 * @param videoIds 動画IDの配列（最大50件）
 */
export async function fetchVideos(
  accessToken: string,
  videoIds: string[],
): Promise<VideoListResponse> {
  if (videoIds.length === 0) {
    return {
      kind: "youtube#videoListResponse",
      etag: "",
      pageInfo: { totalResults: 0, resultsPerPage: 0 },
      items: [],
    };
  }

  const params = new URLSearchParams({
    part: "contentDetails",
    id: videoIds.join(","),
  });

  const response = await fetch(`${API_BASE_URL}/videos?${params}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return handleApiResponse<VideoListResponse>(response);
}

/**
 * 動画の評価状態を取得する
 * @param accessToken OAuth 2.0 アクセストークン
 * @param videoIds 動画IDの配列（最大50件）
 * @returns 動画IDと評価のマップ
 */
export async function fetchVideoRatings(
  accessToken: string,
  videoIds: string[],
): Promise<Map<string, RatingValue>> {
  if (videoIds.length === 0) {
    return new Map();
  }

  const ratingsMap = new Map<string, RatingValue>();

  // 50件ずつ処理
  for (let i = 0; i < videoIds.length; i += 50) {
    const chunk = videoIds.slice(i, i + 50);
    const params = new URLSearchParams({
      id: chunk.join(","),
    });

    try {
      const response = await fetch(
        `${API_BASE_URL}/videos/getRating?${params}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        const data = (await response.json()) as {
          items?: Array<{ videoId: string; rating: string }>;
        };
        if (data.items) {
          for (const item of data.items) {
            // "like" | "dislike" | "none" に変換
            const rating: RatingValue =
              item.rating === "like" || item.rating === "dislike"
                ? item.rating
                : "none";
            ratingsMap.set(item.videoId, rating);
          }
        }
      }
    } catch (error) {
      console.warn("Failed to fetch video ratings:", error);
    }
  }

  return ratingsMap;
}

/**
 * 動画に評価を設定する
 * @param accessToken OAuth 2.0 アクセストークン
 * @param videoId 動画ID
 * @param rating 評価 ("like" | "dislike" | "none")
 */
export async function rateVideo(
  accessToken: string,
  videoId: string,
  rating: RatingValue,
): Promise<void> {
  const params = new URLSearchParams({
    id: videoId,
    rating,
  });

  const response = await fetch(`${API_BASE_URL}/videos/rate?${params}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Length": "0",
    },
  });

  if (!response.ok) {
    const errorData = (await response.json()) as YouTubeApiError;
    throw new Error(
      `Failed to rate video: ${errorData.error.message} (Code: ${errorData.error.code})`,
    );
  }
}

/**
 * 再生リストから動画を削除する
 * @param accessToken OAuth 2.0 アクセストークン
 * @param playlistItemId 再生リストアイテムID（動画IDではなく、playlistItemのID）
 */
export async function deletePlaylistItem(
  accessToken: string,
  playlistItemId: string,
): Promise<void> {
  const params = new URLSearchParams({
    id: playlistItemId,
  });

  const response = await fetch(`${API_BASE_URL}/playlistItems?${params}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = (await response.json()) as YouTubeApiError;
    throw new Error(
      `Failed to delete playlist item: ${errorData.error.message} (Code: ${errorData.error.code})`,
    );
  }
}

/**
 * 複数の動画に対してバッチで評価を設定する
 * @param accessToken OAuth 2.0 アクセストークン
 * @param videoRatings 動画IDと評価のペアの配列
 * @param onProgress 進捗コールバック
 */
export async function batchRateVideos(
  accessToken: string,
  videoRatings: Array<{ videoId: string; rating: RatingValue }>,
  onProgress?: (completed: number, total: number) => void,
): Promise<{
  success: number;
  failed: Array<{ videoId: string; error: string }>;
}> {
  const results = {
    success: 0,
    failed: [] as Array<{ videoId: string; error: string }>,
  };

  for (let i = 0; i < videoRatings.length; i++) {
    const item = videoRatings[i];
    if (!item) continue;
    const { videoId, rating } = item;
    try {
      await rateVideo(accessToken, videoId, rating);
      results.success++;
    } catch (error) {
      results.failed.push({
        videoId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    onProgress?.(i + 1, videoRatings.length);
  }

  return results;
}

/**
 * 複数の動画を再生リストから削除する
 * @param accessToken OAuth 2.0 アクセストークン
 * @param playlistItemIds 再生リストアイテムIDの配列
 * @param onProgress 進捗コールバック
 */
export async function batchDeletePlaylistItems(
  accessToken: string,
  playlistItemIds: string[],
  onProgress?: (completed: number, total: number) => void,
): Promise<{ success: number; failed: Array<{ id: string; error: string }> }> {
  const results = {
    success: 0,
    failed: [] as Array<{ id: string; error: string }>,
  };

  for (let i = 0; i < playlistItemIds.length; i++) {
    const id = playlistItemIds[i];
    if (!id) continue;
    try {
      await deletePlaylistItem(accessToken, id);
      results.success++;
    } catch (error) {
      results.failed.push({
        id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
    onProgress?.(i + 1, playlistItemIds.length);
  }

  return results;
}
