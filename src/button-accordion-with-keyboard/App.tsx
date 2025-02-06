import { RightHandAccordion } from "./components/rightHand/Accordion";
import { AudioInitializer } from "./components/shared/AudioInitializer";

export function App() {
  return (
    <AudioInitializer>
      <RightHandAccordion />
    </AudioInitializer>
  );
}
