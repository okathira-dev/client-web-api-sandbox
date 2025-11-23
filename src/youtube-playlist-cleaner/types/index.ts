// YouTube Data API v3 の型定義

export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface ThumbnailSet {
  default?: Thumbnail;
  medium?: Thumbnail;
  high?: Thumbnail;
  standard?: Thumbnail;
  maxres?: Thumbnail;
}

export interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

// Playlist 関連
export interface PlaylistSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: ThumbnailSet;
  channelTitle: string;
  localized: {
    title: string;
    description: string;
  };
}

export interface Playlist {
  kind: "youtube#playlist";
  etag: string;
  id: string;
  snippet: PlaylistSnippet;
}

export interface PlaylistListResponse {
  kind: "youtube#playlistListResponse";
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: PageInfo;
  items: Playlist[];
}

// PlaylistItem 関連
export interface PlaylistItemSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: ThumbnailSet;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: {
    kind: string;
    videoId: string;
  };
  videoOwnerChannelTitle: string;
  videoOwnerChannelId: string;
}

export interface PlaylistItemContentDetails {
  videoId: string;
  videoPublishedAt: string;
}

export interface PlaylistItem {
  kind: "youtube#playlistItem";
  etag: string;
  id: string;
  snippet: PlaylistItemSnippet;
  contentDetails: PlaylistItemContentDetails;
}

export interface PlaylistItemListResponse {
  kind: "youtube#playlistItemListResponse";
  etag: string;
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: PageInfo;
  items: PlaylistItem[];
}

// Video 関連
export interface VideoContentDetails {
  duration: string; // ISO 8601 duration format (e.g., "PT4M13S")
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  projection: string;
}

export interface Video {
  kind: "youtube#video";
  etag: string;
  id: string;
  contentDetails: VideoContentDetails;
}

export interface VideoListResponse {
  kind: "youtube#videoListResponse";
  etag: string;
  pageInfo: PageInfo;
  items: Video[];
}

// Rating (評価) 関連
export type RatingValue = "like" | "dislike" | "none";

// アプリ内で使用する拡張型
export interface VideoWithPlaylistInfo extends PlaylistItem {
  duration?: string; // ISO 8601フォーマット
  isSelectedForDeletion?: boolean;
  selectedRating?: RatingValue;
}

// エラーレスポンス
export interface YouTubeApiError {
  error: {
    code: number;
    message: string;
    errors: Array<{
      message: string;
      domain: string;
      reason: string;
    }>;
  };
}
