/**
 * Google Identity Services を使用した OAuth 2.0 認証
 *
 * 使用方法:
 * 1. Google Cloud Console で OAuth 2.0 クライアント ID を作成
 * 2. 承認済み JavaScript 生成元を設定 (例: http://localhost:5173)
 * 3. CLIENT_ID を設定して使用
 *
 * 必要なスコープ:
 * - https://www.googleapis.com/auth/youtube
 * - https://www.googleapis.com/auth/youtube.force-ssl
 */

// Google Identity Services の型定義
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: TokenClientConfig) => TokenClient;
          revoke: (accessToken: string, callback?: () => void) => void;
        };
      };
    };
  }
}

interface TokenClientConfig {
  client_id: string;
  scope: string;
  callback: (response: TokenResponse) => void;
  error_callback?: (error: GoogleIdentityServicesError) => void;
}

interface TokenClient {
  requestAccessToken: () => void;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

interface GoogleIdentityServicesError {
  type: string;
  message: string;
}

// 環境変数から CLIENT_ID を取得
// .env.local ファイルに VITE_YOUTUBE_CLIENT_ID を設定してください
export const CLIENT_ID: string = import.meta.env.VITE_YOUTUBE_CLIENT_ID || "";

// 必要なスコープ
const SCOPES = [
  "https://www.googleapis.com/auth/youtube",
  "https://www.googleapis.com/auth/youtube.force-ssl",
].join(" ");

/**
 * Google Identity Services ライブラリを読み込む
 */
export function loadGoogleIdentityServices(): Promise<void> {
  return new Promise((resolve, reject) => {
    // すでに読み込まれている場合
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    // スクリプトタグを作成して読み込む
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));
    document.head.appendChild(script);
  });
}

/**
 * OAuth 2.0 トークンクライアントを初期化する
 */
export function initTokenClient(
  onSuccess: (accessToken: string) => void,
  onError?: (error: string) => void,
): TokenClient | null {
  if (!window.google?.accounts?.oauth2) {
    console.error("Google Identity Services is not loaded");
    return null;
  }

  console.log("[Auth Debug] Initializing token client:", {
    clientId: CLIENT_ID.substring(0, 20) + "...",
    scopes: SCOPES,
  });

  const tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: (response: TokenResponse) => {
      console.log("[Auth Debug] Token response received:", {
        hasAccessToken: !!response.access_token,
        expiresIn: response.expires_in,
        scope: response.scope,
        tokenType: response.token_type,
      });
      if (response.access_token) {
        onSuccess(response.access_token);
      } else {
        console.error("[Auth Debug] No access token in response:", response);
        onError?.("No access token received");
      }
    },
    error_callback: (error: GoogleIdentityServicesError) => {
      console.error("[Auth Debug] OAuth error:", error);
      onError?.(error.message || "Authentication failed");
    },
  });

  return tokenClient;
}

/**
 * アクセストークンを取得する（ログイン）
 */
export function requestAccessToken(tokenClient: TokenClient): void {
  tokenClient.requestAccessToken();
}

/**
 * アクセストークンを取り消す（ログアウト）
 */
export function revokeAccessToken(
  accessToken: string,
  callback?: () => void,
): void {
  if (!window.google?.accounts?.oauth2) {
    console.error("Google Identity Services is not loaded");
    return;
  }

  window.google.accounts.oauth2.revoke(accessToken, callback);
}
