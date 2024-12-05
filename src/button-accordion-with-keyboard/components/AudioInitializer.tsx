import { useState } from "react";
import { initReeds } from "../audio/synth";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

export function AudioInitializer({ children }: { children: React.ReactNode }) {
  const [isAudioInitialized, setIsAudioInitialized] = useState(false);

  const handleInitialize = () => {
    initReeds();
    setIsAudioInitialized(true);
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
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <button
            onClick={handleInitialize}
            style={{
              padding: "20px 40px",
              fontSize: "1.2rem",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <PlayArrowIcon />
            Play Sounds
          </button>
        </div>
        {children}
      </>
    );
  }

  return children;
}
