import React from "react";

type AccordionButtonProps = {
  label: string;
  isWhite: boolean;
  isActive: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
};

export const AccordionButton: React.FC<AccordionButtonProps> = ({
  label,
  isWhite,
  isActive,
  onMouseDown,
  onMouseUp,
}) => {
  return (
    <button
      style={{
        width: "48px",
        height: "48px",
        padding: 0,
        borderRadius: "50%",
        backgroundColor: isWhite ? "white" : "black",
        color: isWhite ? "black" : "white",
        border: "1px solid lightgray",
        fontSize: "20px",
        textAlign: "center",
        lineHeight: "48px",
        fontWeight: "bold",
        boxShadow: isActive ? "0px 0px 6px 2px green" : "none",
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {label}
    </button>
  );
};
