import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import MusicNoteOutlinedIcon from "@mui/icons-material/MusicNoteOutlined";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  useStradellaReedStatesValue,
  useSetStradellaRegister,
  useStradellaRegisterValue,
  useAdoptStradellaRegister,
} from "../atoms/register";
import { STRADELLA_REGISTER_PRESETS } from "../consts";

import type { StradellaRegisterName } from "../types";
import type { DragEndEvent } from "@dnd-kit/core";
import type { FC, CSSProperties } from "react";

const bassNoteIcon = <MusicNoteOutlinedIcon />;
const chordIcon = (
  <div
    style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <MusicNoteOutlinedIcon
      sx={{
        position: "absolute",
        transform: "translate(0, -0.25em)",
      }}
    />
    <MusicNoteOutlinedIcon
      sx={{
        position: "absolute",
      }}
    />
    <MusicNoteOutlinedIcon
      sx={{
        position: "absolute",
        transform: "translate(0, 0.25em)",
      }}
    />
  </div>
);

const SortablePresetButton: FC<{
  position: number;
  presetName: StradellaRegisterName;
  isActive: boolean;
  isSelected: boolean;
  preset: (typeof STRADELLA_REGISTER_PRESETS)[StradellaRegisterName];
  onPresetChange: (name: StradellaRegisterName) => void;
  buttonPressedMargin: string;
}> = ({
  position,
  presetName,
  isActive,
  isSelected,
  preset,
  onPresetChange,
  buttonPressedMargin,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: presetName });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const commonButtonStyle: CSSProperties = {
    borderRadius: "8px",
    padding: "2px",
    fontSize: "16px",
    textAlign: "center",
    lineHeight: "16px",
    fontWeight: "bold",
    boxShadow: isSelected && isActive ? "inset 0px 0px 6px 2px black" : "none",
    transform:
      isSelected && isActive ? `translateY(${buttonPressedMargin})` : "none",
    opacity: isActive ? 1 : 0.5,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "96px" }}>
      <Button
        variant="contained"
        color={isSelected && isActive ? "primary" : "inherit"}
        sx={{
          ...commonButtonStyle,
          height: "24px",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          marginBottom: "1px",
        }}
        onClick={() => onPresetChange(presetName)}
      >
        <span>F{position + 1}</span>
      </Button>

      <div
        ref={setNodeRef}
        style={{
          ...style,
          flex: 1,
          cursor: isDragging ? "grabbing" : "grab",
          transform: isDragging
            ? `${style.transform} scale(1.05)`
            : style.transform,
          zIndex: isDragging ? 1 : 0,
          transition: isDragging ? "box-shadow 0.2s ease" : style.transition,
          boxShadow: isDragging ? "0 5px 15px rgba(0,0,0,0.3)" : "none",
        }}
        {...attributes}
        {...listeners}
      >
        <div
          style={{
            ...commonButtonStyle,
            height: "70px",
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            touchAction: "none",
            backgroundColor: isSelected && isActive ? "#1976d2" : "#e0e0e0",
            color: isSelected && isActive ? "white" : "rgba(0, 0, 0, 0.87)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "50%",
              transform: "translateX(-50%)",
              color:
                isSelected && isActive
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(0,0,0,0.6)",
            }}
          >
            <DragIndicatorIcon fontSize="small" />
          </div>
          <span
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gridTemplateRows: "repeat(2, 1fr)",
              gap: "2px",
              alignItems: "center",
            }}
          >
            <span>{bassNoteIcon}</span>
            <span>{preset.bassNote.soprano && "S"}</span>
            <span>{preset.bassNote.alto && "A"}</span>
            <span>{preset.bassNote.tenor && "T"}</span>
            <span>{preset.bassNote.bass && "B"}</span>
            <span>{chordIcon}</span>
            <span>{preset.chord.soprano && "S"}</span>
            <span>{preset.chord.alto && "A"}</span>
            <span>{preset.chord.tenor && "T"}</span>
            <span>{preset.chord.bass && "B"}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export const RegisterSwitch: FC = () => {
  const { t } = useTranslation();
  const selectedPreset = useStradellaRegisterValue();
  const setSelectedPreset = useSetStradellaRegister();
  const adoptPreset = useAdoptStradellaRegister();
  const reedStates = useStradellaReedStatesValue();
  const [presetOrder, setPresetOrder] = useState<StradellaRegisterName[]>(
    Object.keys(STRADELLA_REGISTER_PRESETS) as StradellaRegisterName[],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handlePresetChange = useCallback(
    (presetName: StradellaRegisterName) => {
      setSelectedPreset(presetName);
      adoptPreset(presetName);
    },
    [setSelectedPreset, adoptPreset],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.startsWith("F") && !isNaN(Number(e.key.slice(1)))) {
        const position = Number(e.key.slice(1)) - 1;
        if (position >= 0 && position < presetOrder.length) {
          e.preventDefault();
          const presetName = presetOrder[position];
          if (presetName) {
            handlePresetChange(presetName);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handlePresetChange, presetOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = presetOrder.indexOf(active.id as StradellaRegisterName);
      const newIndex = presetOrder.indexOf(over.id as StradellaRegisterName);

      setPresetOrder(arrayMove(presetOrder, oldIndex, newIndex));
    }
  };

  const buttonPressedMargin = "4px";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      <Typography sx={{ flexShrink: 0 }}>
        {t("accordion.register.title")} {t("accordion.register.description")}
      </Typography>
      <div
        style={{
          display: "flex",
          gap: "2px",
          marginBottom: buttonPressedMargin,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={presetOrder}
            strategy={horizontalListSortingStrategy}
          >
            {presetOrder.map((presetName, position) => {
              const preset = STRADELLA_REGISTER_PRESETS[presetName];
              const isActive =
                JSON.stringify(preset) === JSON.stringify(reedStates);

              return (
                <SortablePresetButton
                  key={presetName}
                  position={position}
                  presetName={presetName}
                  isActive={isActive}
                  isSelected={selectedPreset === presetName}
                  preset={preset}
                  onPresetChange={handlePresetChange}
                  buttonPressedMargin={buttonPressedMargin}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
