import { RightHandVolumeControl } from "./components/rightHand/RightHandVolumeControl";
import { RightHandReedPitchControls } from "./components/rightHand/RightHandReedPitchControls";
import { RightHandReedSwitch } from "./components/rightHand/RightHandReedSwitch";
import { RightHandRegisterSwitch } from "./components/rightHand/RightHandRegisterSwitch";
import { RightHandAccordion } from "./components/rightHand/RightHandAccordion";
import { AudioInitializer } from "./components/shared/AudioInitializer";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import TuneIcon from "@mui/icons-material/Tune";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PianoIcon from "@mui/icons-material/Piano";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import { CSSProperties } from "react";

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
        <ComponentWithIcon
          Icon={VolumeUpIcon}
          Component={RightHandVolumeControl}
        />
        <ComponentWithIcon
          Icon={TuneIcon}
          Component={RightHandReedPitchControls}
        />
        <ComponentWithIcon
          Icon={MusicNoteIcon}
          Component={RightHandReedSwitch}
        />
        <ComponentWithIcon
          Icon={QueueMusicIcon}
          Component={RightHandRegisterSwitch}
        />
        <ComponentWithIcon Icon={PianoIcon} Component={RightHandAccordion} />
      </div>
    </AudioInitializer>
  );
}
