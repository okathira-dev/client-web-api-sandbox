import { Refresh as RefreshIcon } from "@mui/icons-material";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
} from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useId } from "react";

import { accessTokenAtom, isAuthenticatedAtom } from "../../atoms/auth";
import {
  playlistsAtom,
  selectedPlaylistAtom,
  isLoadingPlaylistsAtom,
  playlistErrorAtom,
  loadPlaylistsAtom,
} from "../../atoms/playlist";

export const PlaylistSelector = () => {
  const playlists = useAtomValue(playlistsAtom);
  const [selectedPlaylist, setSelectedPlaylist] = useAtom(selectedPlaylistAtom);
  const isLoading = useAtomValue(isLoadingPlaylistsAtom);
  const error = useAtomValue(playlistErrorAtom);

  const accessToken = useAtomValue(accessTokenAtom);
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  const loadPlaylists = useSetAtom(loadPlaylistsAtom);

  const labelId = useId();
  const selectId = useId();

  const handleLoadPlaylists = () => {
    if (accessToken) {
      void loadPlaylists(accessToken);
    }
  };

  // 認証されていない場合は何も表示しない
  if (!isAuthenticated) {
    return null;
  }

  // 初回ロード：認証後に自動的にロード
  if (playlists.length === 0 && !isLoading && !error && accessToken) {
    void loadPlaylists(accessToken);
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{ mb: 3 }}
        action={
          <Button color="inherit" size="small" onClick={handleLoadPlaylists}>
            再試行
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl fullWidth>
        <InputLabel id={labelId}>再生リスト</InputLabel>
        <Select
          labelId={labelId}
          id={selectId}
          value={selectedPlaylist?.id || ""}
          label="再生リスト"
          onChange={(e) => {
            const playlist = playlists.find((p) => p.id === e.target.value);
            setSelectedPlaylist(playlist || null);
          }}
          disabled={isLoading}
          endAdornment={
            isLoading ? (
              <CircularProgress size={20} sx={{ mr: 2 }} />
            ) : (
              <Tooltip title="再生リストを再読み込み">
                <Button
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadPlaylists();
                  }}
                  sx={{ mr: 1 }}
                >
                  <RefreshIcon fontSize="small" />
                </Button>
              </Tooltip>
            )
          }
        >
          {playlists.length === 0 && !isLoading && (
            <MenuItem disabled value="">
              再生リストがありません
            </MenuItem>
          )}
          {playlists.map((playlist) => (
            <MenuItem key={playlist.id} value={playlist.id}>
              {playlist.snippet.title}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
