import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useState } from "react";

import { startAudioContext } from "../../audio/audioCore";

import type { FC, ReactNode } from "react";

const disableAltKey = () => {
  document.addEventListener("keydown", (e) => {
    if (e.altKey) {
      e.preventDefault();
    }
  });
};

type AudioInitializerProps = {
  children: ReactNode;
};

export const AudioInitializer: FC<AudioInitializerProps> = ({ children }) => {
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  const handleInitialize = () => {
    disableAltKey();
    void startAudioContext().then(() => {
      setIsAudioInitialized(true);
    });
  };

  if (!isAudioInitialized) {
    return (
      <>
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            zIndex: 1000,
          }}
        >
          <Typography
            variant="body1"
            style={{
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              padding: "8px 16px",
              borderRadius: "4px",
              fontSize: "1.1rem",
              fontWeight: 500,
            }}
          >
            ブラウザの制限により、音声の再生には事前にユーザーの操作が必要です。
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<PlayArrowIcon />}
            onClick={handleInitialize}
          >
            音声を有効化
          </Button>
        </div>
        {children}
      </>
    );
  }

  return <>{children}</>;
};
