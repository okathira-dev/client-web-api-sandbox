import MusicNoteIcon from "@mui/icons-material/MusicNote";
import PianoIcon from "@mui/icons-material/Piano";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import TuneIcon from "@mui/icons-material/Tune";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import { Box } from "@mui/material";

import { Keyboard } from "./Keyboard";
import { PitchControl } from "./PitchControl";
import { ReedSwitch } from "./ReedSwitch";
import { RegisterSwitch } from "./RegisterSwitch";
import { VolumeControl } from "./VolumeControl";

import type { ElementType, ReactNode } from "react";

type ComponentWithIconProps = {
  Icon: ElementType;
  children: ReactNode;
};

export const ComponentWithIcon = ({
  Icon,
  children,
}: ComponentWithIconProps) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      width: "100%",
      position: "relative",
    }}
  >
    <Box
      sx={{
        position: "absolute",
        left: "-40px",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <Icon />
    </Box>
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {children}
    </Box>
  </Box>
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
      <ComponentWithIcon Icon={MusicNoteIcon}>
        <ReedSwitch />
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
