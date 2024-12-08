import { VolumeControl } from "./components/VolumeControl";
import { ReedPitchControls } from "./components/ReedPitchControls";
import { ReedSwitch } from "./components/ReedSwitch";
import { RegisterSwitch } from "./components/RegisterSwitch";
import { Accordion } from "./components/Accordion";
import { Bass } from "./components/Bass";
import { AudioInitializer } from "./components/AudioInitializer";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import TuneIcon from "@mui/icons-material/Tune";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PianoIcon from "@mui/icons-material/Piano";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import { CSSProperties, useState } from "react";
import { FormControlLabel, Switch } from "@mui/material";

const containerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  width: "100%",
  position: "relative",
} as const;

const iconContainerStyle: CSSProperties = {
  position: "absolute",
  left: "-40px",
  userSelect: "none",
  WebkitUserSelect: "none",
} as const;

const componentContainerStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "center",
} as const;

type ComponentWithIconProps = {
  Icon: React.ElementType;
  Component: React.ElementType;
};

const ComponentWithIcon = ({ Icon, Component }: ComponentWithIconProps) => (
  <div style={containerStyle}>
    <div style={iconContainerStyle}>
      <Icon />
    </div>
    <div style={componentContainerStyle}>
      <Component />
    </div>
  </div>
);

export function App() {
  const [isRightHand, setIsRightHand] = useState(true);

  return (
    <AudioInitializer>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "700px",
          margin: "auto",
        }}
      >
        <ComponentWithIcon Icon={VolumeUpIcon} Component={VolumeControl} />
        <ComponentWithIcon Icon={TuneIcon} Component={ReedPitchControls} />
        <ComponentWithIcon Icon={MusicNoteIcon} Component={ReedSwitch} />
        <ComponentWithIcon Icon={QueueMusicIcon} Component={RegisterSwitch} />
        <FormControlLabel
          control={
            <Switch
              checked={isRightHand}
              onChange={(e) => setIsRightHand(e.target.checked)}
            />
          }
          label={isRightHand ? "右手側" : "左手側"}
        />
        <ComponentWithIcon
          Icon={PianoIcon}
          Component={isRightHand ? Accordion : Bass}
        />
      </div>
    </AudioInitializer>
  );
}
