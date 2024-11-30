import { VolumeControl } from "./components/VolumeControl";
import { ReedPitchControls } from "./components/ReedPitchControls";
import { ReedSwitch } from "./components/ReedSwitch";
import { RegisterSwitch } from "./components/RegisterSwitch";
import { Accordion } from "./components/Accordion";
import { AudioInitializer } from "./components/AudioInitializer";

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
        }}
      >
        <VolumeControl />
        <ReedPitchControls />
        <ReedSwitch />
        <RegisterSwitch />
        <Accordion />
      </div>
    </AudioInitializer>
  );
}
