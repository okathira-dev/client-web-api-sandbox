import {
  Delete as DeleteIcon,
  RateReview as RateReviewIcon,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  LinearProgress,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useState } from "react";

import { batchRateVideos, batchDeletePlaylistItems } from "../../api/youtube";
import { accessTokenAtom } from "../../atoms/auth";
import {
  selectedPlaylistAtom,
  playlistItemsAtom,
  isLoadingPlaylistItemsAtom,
  playlistItemsErrorAtom,
  loadPlaylistItemsAtom,
} from "../../atoms/playlist";
import { VideoCard } from "../../components/VideoCard";

import type { RatingValue } from "../../types";

export const VideoManager = () => {
  const selectedPlaylist = useAtomValue(selectedPlaylistAtom);
  const [playlistItems, setPlaylistItems] = useAtom(playlistItemsAtom);
  const isLoading = useAtomValue(isLoadingPlaylistItemsAtom);
  const error = useAtomValue(playlistItemsErrorAtom);
  const accessToken = useAtomValue(accessTokenAtom);

  const loadPlaylistItems = useSetAtom(loadPlaylistItemsAtom);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [loadedPlaylistId, setLoadedPlaylistId] = useState<string | null>(null);

  // 再生リストが変更されたら自動的にロード
  if (
    selectedPlaylist &&
    accessToken &&
    selectedPlaylist.id !== loadedPlaylistId &&
    !isLoading
  ) {
    setLoadedPlaylistId(selectedPlaylist.id);
    void loadPlaylistItems({ accessToken, playlistId: selectedPlaylist.id });
  }

  const handleToggleDelete = (videoId: string, checked: boolean) => {
    setPlaylistItems((items) =>
      items.map((item) =>
        item.snippet.resourceId.videoId === videoId
          ? { ...item, isSelectedForDeletion: checked }
          : item,
      ),
    );
  };

  const handleChangeRating = (videoId: string, rating: RatingValue) => {
    setPlaylistItems((items) =>
      items.map((item) =>
        item.snippet.resourceId.videoId === videoId
          ? { ...item, selectedRating: rating }
          : item,
      ),
    );
  };

  const handleSelectAll = () => {
    setPlaylistItems((items) =>
      items.map((item) => ({ ...item, isSelectedForDeletion: true })),
    );
  };

  const handleDeselectAll = () => {
    setPlaylistItems((items) =>
      items.map((item) => ({ ...item, isSelectedForDeletion: false })),
    );
  };

  const handleExecute = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmExecute = async () => {
    if (!accessToken) return;

    setShowConfirmDialog(false);
    setIsProcessing(true);
    setProgress(0);

    try {
      // 評価を設定する動画を収集
      const videosToRate = playlistItems
        .filter((item) => item.selectedRating && item.selectedRating !== "none")
        .map((item) => ({
          videoId: item.snippet.resourceId.videoId,
          rating: item.selectedRating!,
        }));

      // 削除する動画を収集
      const itemsToDelete = playlistItems
        .filter((item) => item.isSelectedForDeletion)
        .map((item) => item.id);

      const totalOperations = videosToRate.length + itemsToDelete.length;
      let completedOperations = 0;

      // 評価を実行
      if (videosToRate.length > 0) {
        const rateResults = await batchRateVideos(
          accessToken,
          videosToRate,
          (completed, _total) => {
            completedOperations = completed;
            setProgress((completedOperations / totalOperations) * 100);
          },
        );

        if (rateResults.failed.length > 0) {
          console.warn("Failed to rate some videos:", rateResults.failed);
        }
      }

      // 削除を実行
      if (itemsToDelete.length > 0) {
        const deleteResults = await batchDeletePlaylistItems(
          accessToken,
          itemsToDelete,
          (completed, _total) => {
            completedOperations = videosToRate.length + completed;
            setProgress((completedOperations / totalOperations) * 100);
          },
        );

        if (deleteResults.failed.length > 0) {
          console.warn("Failed to delete some items:", deleteResults.failed);
        }

        // 削除された動画をリストから除外
        setPlaylistItems((items) =>
          items.filter((item) => !item.isSelectedForDeletion),
        );
      }

      // 成功メッセージ
      const messages: string[] = [];
      if (videosToRate.length > 0) {
        messages.push(`${videosToRate.length}件の動画を評価しました`);
      }
      if (itemsToDelete.length > 0) {
        messages.push(`${itemsToDelete.length}件の動画を削除しました`);
      }
      setSuccessMessage(messages.join("、"));
      setShowSuccessSnackbar(true);
    } catch (err) {
      console.error("処理中にエラーが発生しました:", err);
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleCancelExecute = () => {
    setShowConfirmDialog(false);
  };

  if (!selectedPlaylist) {
    return null;
  }

  if (isLoading) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          動画を読み込んでいます...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (playlistItems.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        この再生リストには動画がありません。
      </Alert>
    );
  }

  const selectedCount = playlistItems.filter(
    (item) => item.isSelectedForDeletion,
  ).length;

  const ratingCount = playlistItems.filter(
    (item) => item.selectedRating && item.selectedRating !== "none",
  ).length;

  const canExecute = selectedCount > 0 || ratingCount > 0;

  // 確認ダイアログ用のデータ
  const videosToLike = playlistItems.filter(
    (item) => item.selectedRating === "like",
  );
  const videosToDislike = playlistItems.filter(
    (item) => item.selectedRating === "dislike",
  );
  const videosToDelete = playlistItems.filter(
    (item) => item.isSelectedForDeletion,
  );

  return (
    <Box>
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">{selectedPlaylist.snippet.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {playlistItems.length}件の動画
            {selectedCount > 0 && ` / ${selectedCount}件選択中`}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button size="small" variant="outlined" onClick={handleSelectAll}>
            すべて選択
          </Button>
          <Button size="small" variant="outlined" onClick={handleDeselectAll}>
            選択解除
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleExecute}
            disabled={!canExecute || isProcessing}
            startIcon={ratingCount > 0 ? <RateReviewIcon /> : <DeleteIcon />}
          >
            {isProcessing
              ? "処理中..."
              : `実行 (評価: ${ratingCount}件, 削除: ${selectedCount}件)`}
          </Button>
        </Box>
        {isProcessing && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {Math.round(progress)}% 完了
            </Typography>
          </Box>
        )}
      </Paper>

      <Box>
        {playlistItems.map((item) => (
          <VideoCard
            key={item.id}
            video={item}
            onToggleDelete={handleToggleDelete}
            onChangeRating={handleChangeRating}
          />
        ))}
      </Box>

      {/* スクロール下の操作ボタン */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mt: 3,
          position: "sticky",
          bottom: 0,
          backgroundColor: "background.paper",
          zIndex: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Button size="small" variant="outlined" onClick={handleSelectAll}>
            すべて選択
          </Button>
          <Button size="small" variant="outlined" onClick={handleDeselectAll}>
            選択解除
          </Button>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            color="primary"
            onClick={handleExecute}
            disabled={!canExecute || isProcessing}
            startIcon={ratingCount > 0 ? <RateReviewIcon /> : <DeleteIcon />}
          >
            {isProcessing
              ? "処理中..."
              : `実行 (評価: ${ratingCount}件, 削除: ${selectedCount}件)`}
          </Button>
        </Box>
        {isProcessing && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {Math.round(progress)}% 完了
            </Typography>
          </Box>
        )}
      </Paper>

      {/* 確認ダイアログ */}
      <Dialog
        open={showConfirmDialog}
        onClose={handleCancelExecute}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>実行の確認</DialogTitle>
        <DialogContent>
          <DialogContentText>
            以下の操作を実行します。よろしいですか？
          </DialogContentText>

          <Box sx={{ mt: 2, maxHeight: 400, overflow: "auto" }}>
            {videosToLike.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                  高評価を設定する動画 ({videosToLike.length}件)
                </Typography>
                <List dense>
                  {videosToLike.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemText
                        primary={item.snippet.title}
                        secondary={item.snippet.videoOwnerChannelTitle}
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ mt: 1 }} />
              </Box>
            )}

            {videosToDislike.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                  低評価を設定する動画 ({videosToDislike.length}件)
                </Typography>
                <List dense>
                  {videosToDislike.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemText
                        primary={item.snippet.title}
                        secondary={item.snippet.videoOwnerChannelTitle}
                      />
                    </ListItem>
                  ))}
                </List>
                <Divider sx={{ mt: 1 }} />
              </Box>
            )}

            {videosToDelete.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
                  削除する動画 ({videosToDelete.length}件)
                </Typography>
                <List dense>
                  {videosToDelete.map((item) => (
                    <ListItem key={item.id}>
                      <ListItemText
                        primary={item.snippet.title}
                        secondary={item.snippet.videoOwnerChannelTitle}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Box>

          <DialogContentText sx={{ mt: 2 }} color="text.secondary">
            ※ 削除した動画は元に戻せません。
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelExecute}>キャンセル</Button>
          <Button
            onClick={() => void handleConfirmExecute()}
            variant="contained"
          >
            実行
          </Button>
        </DialogActions>
      </Dialog>

      {/* 成功メッセージ */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSuccessSnackbar(false)}
        message={successMessage}
      />
    </Box>
  );
};
