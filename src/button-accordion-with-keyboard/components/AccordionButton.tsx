import React from "react";

type AccordionButtonProps = {
  label: string;
  fontSize: string;
  isWhite: boolean;
  isActive: boolean;
  onMouseDown: () => void;
  onMouseUp: () => void;
};

export const AccordionButton: React.FC<AccordionButtonProps> = ({
  label,
  fontSize,
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
        lineHeight: "48px",
        padding: 0,
        borderRadius: "50%",
        backgroundColor: isWhite ? "white" : "black",
        color: isWhite ? "black" : "white",
        border: "1px solid lightgray",
        fontSize: fontSize, // テキストの長さに応じてフォントサイズを調整
        textAlign: "center",
        fontWeight: "bold",
        boxShadow: isActive ? "0px 0px 6px 2px green" : "none",
        overflow: "hidden",
        whiteSpace: "nowrap",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
    >
      {label}
    </button>
  );
};