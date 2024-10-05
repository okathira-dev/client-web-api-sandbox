import { Box, Button, Typography, Link, Container } from "@mui/material";

export function App() {
  return (
    <Container>
      <Box display="flex" flexDirection="column" gap={5}>
        <Box>
          <Typography variant="h1">keyframe dropping</Typography>
          <Typography>original sample codes: </Typography>
          <Link href="https://developer.chrome.com/docs/web-platform/best-practices/webcodecs">
            WebCodecs による動画処理 | Web Platform | Chrome for Developers
          </Link>
        </Box>

        <Box display="flex" flexDirection="column" gap={4}>
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Box>
              <canvas width="640" height="480"></canvas>
            </Box>
            <Box>
              <canvas width="640" height="480"></canvas>
            </Box>
          </Box>
          <Box display="flex" gap={2}>
            <Button variant="contained">Start</Button>
            <Button variant="contained">Stop</Button>
            <Button variant="contained">Play</Button>
            <Button variant="contained">Pause</Button>
            <Button variant="contained">Double</Button>
            <Button variant="contained">Drop</Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
