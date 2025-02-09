import { VolumeControl } from "./VolumeControl";
import { PitchControl } from "./PitchControl";
import { ReedSwitch } from "./ReedSwitch";
import { RegisterSwitch } from "./RegisterSwitch";
import { Keyboard } from "./Keyboard";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import TuneIcon from "@mui/icons-material/Tune";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PianoIcon from "@mui/icons-material/Piano";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import { CSSProperties, ElementType } from "react";

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
  Icon: ElementType;
  Component: ElementType;
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

export const RightHandAccordion = () => {
  return (
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
      <ComponentWithIcon Icon={TuneIcon} Component={PitchControl} />
      <ComponentWithIcon Icon={MusicNoteIcon} Component={ReedSwitch} />
      <ComponentWithIcon Icon={QueueMusicIcon} Component={RegisterSwitch} />
      <ComponentWithIcon Icon={PianoIcon} Component={Keyboard} />
    </div>
  );
};
