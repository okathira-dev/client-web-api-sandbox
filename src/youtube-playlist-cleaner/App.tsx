import { Container, Typography, Box } from "@mui/material";

import { Auth } from "./features/Auth";
import { PlaylistSelector } from "./features/PlaylistSelector";
import { VideoManager } from "./features/VideoManager";

export const App = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          YouTube Playlist Cleaner
        </Typography>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          color="text.secondary"
        >
          YouTube再生リスト整理ツール
        </Typography>
        <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
          YouTube再生リストから見終えた動画を効率的に削除できます。
        </Typography>

        <Auth />
        <PlaylistSelector />
        <VideoManager />
      </Box>
    </Container>
  );
};
