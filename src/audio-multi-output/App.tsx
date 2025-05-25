import {
  Container,
  Grid2,
  Typography,
  Alert,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useEffect, useState } from "react";

import { DeviceManager } from "./features/DeviceManager";
import { OscillatorControl } from "./features/OscillatorControl";
import { OutputController } from "./features/OutputController";
import { checkBrowserSupport } from "./utils/audioUtils";
import { SocialIcons } from "../shared/components/SocialIcons";

import type React from "react";

export const App: React.FC = () => {
  const [browserSupport, setBrowserSupport] = useState({
    webAudio: false,
    audioOutput: false,
    mediaDevices: false,
  });

  useEffect(() => {
    setBrowserSupport(checkBrowserSupport());
  }, []);

  const isSupported = browserSupport.webAudio && browserSupport.mediaDevices;

  if (!isSupported) {
    return (
      <Container maxWidth="md" sx={{ py: 3 }}>
        <SocialIcons githubURL="https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/audio-multi-output" />
        <Typography variant="h3" component="h1" sx={{ mb: 3 }}>
          Audio Multi Output
        </Typography>
        <Alert severity="error">
          <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
            ブラウザサポートエラー
          </Typography>
          <List>
            {!browserSupport.webAudio && (
              <ListItem>
                <ListItemText primary="Web Audio API がサポートされていません" />
              </ListItem>
            )}
            {!browserSupport.mediaDevices && (
              <ListItem>
                <ListItemText primary="Media Devices API がサポートされていません" />
              </ListItem>
            )}
            {!browserSupport.audioOutput && (
              <ListItem>
                <ListItemText primary="Audio Output Devices API がサポートされていません（一部機能が制限されます）" />
              </ListItem>
            )}
          </List>
          <Typography>最新のブラウザをご利用ください。</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <SocialIcons githubURL="https://github.com/okathira-dev/client-web-api-sandbox/tree/main/src/audio-multi-output" />

      <Box component="header" sx={{ mb: 4, textAlign: "center" }}>
        <Typography variant="h3" component="h1" sx={{ mb: 2 }}>
          Audio Multi Output
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          複数の音声出力デバイスから独立した波形を同時再生
        </Typography>
        {!browserSupport.audioOutput && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Audio Output Devices API
            がサポートされていないため、デバイス選択機能が制限されます。
          </Alert>
        )}
      </Box>

      <Grid2 container spacing={4} sx={{ mb: 4 }}>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <DeviceManager />
          </Paper>
        </Grid2>
        <Grid2 size={{ xs: 12, md: 6 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <OscillatorControl />
          </Paper>
        </Grid2>
      </Grid2>

      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <OutputController />
      </Paper>

      <Paper
        component="footer"
        elevation={1}
        sx={{
          p: 3,
          bgcolor: "grey.50",
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          使用方法:
        </Typography>
        <List>
          <ListItem>
            <ListItemText primary="1. 「デバイス選択権限を要求」ボタンをクリックして、音声出力デバイスへのアクセス権限を取得" />
          </ListItem>
          <ListItem>
            <ListItemText primary="2. 使用したい音声出力デバイスを選択" />
          </ListItem>
          <ListItem>
            <ListItemText primary="3. 各デバイスの波形、周波数、位相反転を設定" />
          </ListItem>
          <ListItem>
            <ListItemText primary="4. 「再生」ボタンで音声出力を開始" />
          </ListItem>
        </List>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
            制限事項:
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary={
                  <Box>
                    <Typography component="span" sx={{ fontWeight: "bold" }}>
                      位相反転機能について:
                    </Typography>{" "}
                    実装方法や出力デバイス間の環境差により（？）、位相反転はノイズキャンセリングなどのシビアな要件には期待通りに機能しない場合があります。
                  </Box>
                }
              />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Container>
  );
};
