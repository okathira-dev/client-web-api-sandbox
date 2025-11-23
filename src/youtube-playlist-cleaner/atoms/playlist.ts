import { atom } from "jotai";

import {
  fetchPlaylists,
  fetchAllPlaylistItems,
  fetchVideos,
  fetchVideoRatings,
} from "../api/youtube";

import type { Playlist, VideoWithPlaylistInfo } from "../types";

// 再生リスト一覧
export const playlistsAtom = atom<Playlist[]>([]);

// 選択された再生リスト
export const selectedPlaylistAtom = atom<Playlist | null>(null);

// 選択された再生リストの動画一覧
export const playlistItemsAtom = atom<VideoWithPlaylistInfo[]>([]);

// ローディング状態
export const isLoadingPlaylistsAtom = atom(false);
export const isLoadingPlaylistItemsAtom = atom(false);

// エラー状態
export const playlistErrorAtom = atom<string | null>(null);
export const playlistItemsErrorAtom = atom<string | null>(null);

/**
 * 再生リストを読み込むアクション
 */
export const loadPlaylistsAtom = atom(
  null,
  async (get, set, accessToken: string) => {
    set(isLoadingPlaylistsAtom, true);
    set(playlistErrorAtom, null);

    try {
      const response = await fetchPlaylists(accessToken);
      set(playlistsAtom, response.items);
    } catch (err) {
      set(
        playlistErrorAtom,
        err instanceof Error ? err.message : "再生リストの取得に失敗しました",
      );
    } finally {
      set(isLoadingPlaylistsAtom, false);
    }
  },
);

/**
 * 再生リストアイテムを読み込むアクション
 */
export const loadPlaylistItemsAtom = atom(
  null,
  async (
    get,
    set,
    { accessToken, playlistId }: { accessToken: string; playlistId: string },
  ) => {
    set(isLoadingPlaylistItemsAtom, true);
    set(playlistItemsErrorAtom, null);

    try {
      // 再生リストアイテムを取得
      const itemsResponse = await fetchAllPlaylistItems(
        accessToken,
        playlistId,
      );

      // 動画IDを抽出
      const videoIds = itemsResponse.items.map(
        (item) => item.snippet.resourceId.videoId,
      );

      // 動画の詳細情報（再生時間など）を取得（50件ずつ）
      const videoDetailsPromises: Promise<void>[] = [];
      const videosMap = new Map<string, string>();

      for (let i = 0; i < videoIds.length; i += 50) {
        const chunk = videoIds.slice(i, i + 50);
        videoDetailsPromises.push(
          fetchVideos(accessToken, chunk).then((response) => {
            response.items.forEach((video) => {
              videosMap.set(video.id, video.contentDetails.duration);
            });
          }),
        );
      }

      await Promise.all(videoDetailsPromises);

      // 動画の評価状態を取得
      const ratingsMap = await fetchVideoRatings(accessToken, videoIds);

      // 動画情報をマージ
      const itemsWithDetails: VideoWithPlaylistInfo[] = itemsResponse.items.map(
        (item) => {
          const videoId = item.snippet.resourceId.videoId;
          const currentRating = ratingsMap.get(videoId) || "none";
          return {
            ...item,
            duration: videosMap.get(videoId),
            isSelectedForDeletion: false,
            selectedRating: currentRating,
          };
        },
      );

      set(playlistItemsAtom, itemsWithDetails);
    } catch (err) {
      set(
        playlistItemsErrorAtom,
        err instanceof Error ? err.message : "動画の取得に失敗しました",
      );
    } finally {
      set(isLoadingPlaylistItemsAtom, false);
    }
  },
);
