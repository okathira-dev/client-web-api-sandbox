import React from "react";
import Button from "@mui/material/Button";
import { useReedActivation, useSetReedActivation } from "../atoms/reeds";
import { ReedName, reedNames } from "../audio/synth";

export const ReedSwitch: React.FC = () => {
  const reedActivation = useReedActivation();
  const setReedActivation = useSetReedActivation();

  const toggleReed = (reed: ReedName) => {
    setReedActivation((prev) => ({
      ...prev,
      [reed]: !prev[reed],
    }));
  };

  const buttonPressedMargin = "4px";

  return (
    <div
      style={{ display: "flex", gap: "8px", marginBottom: buttonPressedMargin }}
    >
      {reedNames.map((reed) => (
        <Button
          key={reed}
          onClick={() => toggleReed(reed)}
          variant="contained"
          color={reedActivation[reed] ? "success" : "inherit"}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            fontSize: "20px",
            textAlign: "center",
            lineHeight: "48px",
            fontWeight: "bold",
            boxShadow: reedActivation[reed]
              ? "inset 0px 0px 6px 2px black"
              : "none",
            transform: reedActivation[reed]
              ? `translateY(${buttonPressedMargin})`
              : "none",
          }}
        >
          {reed}
        </Button>
      ))}
    </div>
  );
};
