import { VolumeControl } from "./components/VolumeControl";
import { ReedPitchControls } from "./components/ReedPitchControls";
import { ReedSwitch } from "./components/ReedSwitch";
import { VoicePresetSwitch } from "./components/VoicePresetSwitch";
import { Accordion } from "./components/Accordion";

export function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <VolumeControl />
      <ReedPitchControls />
      <ReedSwitch />
      <VoicePresetSwitch />
      <Accordion />
    </div>
  );
}
