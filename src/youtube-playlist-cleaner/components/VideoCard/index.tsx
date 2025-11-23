import {
  OpenInNew as OpenInNewIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  RemoveCircleOutline as RemoveCircleOutlineIcon,
} from "@mui/icons-material";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip,
} from "@mui/material";

import { getVideoUrl, getThumbnailUrl, formatDuration } from "../../utils";

import type { VideoWithPlaylistInfo, RatingValue } from "../../types";

interface VideoCardProps {
  video: VideoWithPlaylistInfo;
  onToggleDelete: (videoId: string, checked: boolean) => void;
  onChangeRating: (videoId: string, rating: RatingValue) => void;
}

export const VideoCard = ({
  video,
  onToggleDelete,
  onChangeRating,
}: VideoCardProps) => {
  const videoId = video.snippet.resourceId.videoId;
  const thumbnailUrl = getThumbnailUrl(video.snippet.thumbnails);
  const videoUrl = getVideoUrl(videoId);

  const handleRatingChange = (
    _event: React.MouseEvent<HTMLElement>,
    newRating: RatingValue | null,
  ) => {
    if (newRating) {
      onChangeRating(videoId, newRating);
    }
  };

  return (
    <Card
      sx={{
        display: "flex",
        mb: 2,
        flexDirection: { xs: "column", sm: "row" },
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: { xs: "100%", sm: 160 },
          height: { xs: 200, sm: "auto" },
          flexShrink: 0,
          objectFit: "cover",
        }}
        image={thumbnailUrl}
        alt={video.snippet.title}
      />
      <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <CardContent sx={{ flex: "1 0 auto" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
            <Box sx={{ flex: 1 }}>
              <Typography component="div" variant="subtitle1">
                {video.snippet.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
              >
                {video.snippet.videoOwnerChannelTitle}
              </Typography>
              {video.duration && (
                <Typography variant="caption" color="text.secondary">
                  {formatDuration(video.duration)}
                </Typography>
              )}
            </Box>
            <Tooltip title="YouTubeで確認">
              <IconButton
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                size="small"
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Box
            sx={{
              mt: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <ToggleButtonGroup
              value={video.selectedRating || "none"}
              exclusive
              onChange={handleRatingChange}
              size="small"
            >
              <Tooltip title="高評価">
                <ToggleButton value="like" aria-label="高評価">
                  <ThumbUpIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="低評価">
                <ToggleButton value="dislike" aria-label="低評価">
                  <ThumbDownIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="評価なし">
                <ToggleButton value="none" aria-label="評価なし">
                  <RemoveCircleOutlineIcon fontSize="small" />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>

            <Tooltip title="再生リストから削除">
              <FormControlLabel
                control={
                  <Checkbox
                    checked={video.isSelectedForDeletion || false}
                    onChange={(e) => onToggleDelete(videoId, e.target.checked)}
                  />
                }
                label="削除"
              />
            </Tooltip>
          </Box>
        </CardContent>
      </Box>
    </Card>
  );
};
