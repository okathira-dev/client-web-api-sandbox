import PianoIcon from "@mui/icons-material/Piano";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import TuneIcon from "@mui/icons-material/Tune";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { Box } from "@mui/material";

import { Keyboard } from "./Keyboard";
import { PitchControl } from "./PitchControl";
import { RegisterSwitch } from "./RegisterSwitch";
import { VolumeControl } from "./VolumeControl";

import type { CSSProperties, ElementType, ReactNode } from "react";

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
  children: ReactNode;
};

const ComponentWithIcon = ({ Icon, children }: ComponentWithIconProps) => (
  <div style={containerStyle}>
    <div style={iconContainerStyle}>
      <Icon />
    </div>
    <div style={componentContainerStyle}>{children}</div>
  </div>
);

export const LeftHandAccordion = () => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        justifyContent: "center",
        alignItems: "center",
        width: "700px",
      }}
    >
      <ComponentWithIcon Icon={VolumeUpIcon}>
        <VolumeControl />
      </ComponentWithIcon>
      <ComponentWithIcon Icon={TuneIcon}>
        <PitchControl />
      </ComponentWithIcon>
      <ComponentWithIcon Icon={QueueMusicIcon}>
        <RegisterSwitch />
      </ComponentWithIcon>
      <ComponentWithIcon Icon={PianoIcon}>
        <Keyboard />
      </ComponentWithIcon>
    </Box>
  );
};
