import { Box, Button, Typography, Link, Container } from "@mui/material";

import { SocialIcons } from "../shared/components/SocialIcons";

export function App() {
  return (
    <Container sx={{ position: "relative" }}>
      <SocialIcons githubURL="https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/webcodecs-data-moshing-react" />
      <Typography variant="h1" sx={{ fontSize: "2rem", mt: 3, mb: 3 }}>
        WebCodecs API Data Moshing
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
