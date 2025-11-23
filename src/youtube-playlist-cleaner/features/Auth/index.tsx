import { Login as LoginIcon, Logout as LogoutIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useSetAtom, useAtomValue } from "jotai";
import { useState, useRef } from "react";

import {
  loadGoogleIdentityServices,
  initTokenClient,
  requestAccessToken,
  revokeAccessToken,
  CLIENT_ID,
} from "../../api/auth";
import {
  setAuthStateAtom,
  clearAuthStateAtom,
  isAuthenticatedAtom,
  accessTokenAtom,
} from "../../atoms/auth";

export const Auth = () => {
  const setAuthState = useSetAtom(setAuthStateAtom);
  const clearAuthState = useSetAtom(clearAuthStateAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);
  const accessToken = useAtomValue(accessTokenAtom);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初期化とトークンクライアントをRefで管理（UIに影響しない）
  const isInitializedRef = useRef(false);
  const tokenClientRef = useRef<ReturnType<typeof initTokenClient>>(null);
  const isProcessingRef = useRef(false);

  const handleLogin = async () => {
    // 多重クリック防止
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setIsLoading(true);
      setError(null);

      // CLIENT_IDが設定されているか確認
      if (
        !CLIENT_ID ||
        CLIENT_ID === "" ||
        CLIENT_ID === "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com"
      ) {
        setError(
          "CLIENT_ID が設定されていません。.env.local ファイルに VITE_YOUTUBE_CLIENT_ID を設定してください。",
        );
        return;
      }

      // 初回のみ初期化
      if (!isInitializedRef.current) {
        await loadGoogleIdentityServices();

        const client = initTokenClient(
          (token) => {
            setAuthState({
              isAuthenticated: true,
              accessToken: token,
            });
            setError(null);
            setIsLoading(false);
            isProcessingRef.current = false;
          },
          (errorMessage) => {
            setError(errorMessage);
            setIsLoading(false);
            isProcessingRef.current = false;
          },
        );

        tokenClientRef.current = client;
        isInitializedRef.current = true;
      }

      // トークンをリクエスト
      if (tokenClientRef.current) {
        requestAccessToken(tokenClientRef.current);
      } else {
        setError("Authentication not initialized");
        setIsLoading(false);
        isProcessingRef.current = false;
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize authentication",
      );
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  };

  const handleLogout = () => {
    if (accessToken) {
      revokeAccessToken(accessToken, () => {
        clearAuthState();
      });
    } else {
      clearAuthState();
    }
  };

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        {CLIENT_ID !== "YOUR_CLIENT_ID_HERE.apps.googleusercontent.com" && (
          <Button
            variant="outlined"
            onClick={() => void handleLogin()}
            disabled={isLoading}
          >
            再試行
          </Button>
        )}
      </Paper>
    );
  }

  if (isAuthenticated) {
    return (
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">ログイン済み</Typography>
            <Typography variant="body2" color="text.secondary">
              YouTube Data API に接続しています
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            ログアウト
          </Button>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="h6" gutterBottom>
          YouTubeアカウントでログイン
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          再生リストを管理するには、YouTubeアカウントでログインしてください。
        </Typography>
        <Button
          variant="contained"
          startIcon={isLoading ? <CircularProgress size={20} /> : <LoginIcon />}
          onClick={() => void handleLogin()}
          disabled={isLoading}
        >
          {isLoading ? "認証中..." : "Googleでログイン"}
        </Button>
      </Box>
    </Paper>
  );
};
