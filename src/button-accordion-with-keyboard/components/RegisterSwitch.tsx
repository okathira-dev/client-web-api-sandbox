import React, { useCallback, useEffect } from "react";
import Button from "@mui/material/Button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useSelectedPreset,
  useSetSelectedPreset,
  useAdoptPreset,
  useReedActivation,
  reedActivationPresets,
  usePresetOrder,
  useSetPresetOrder,
} from "../atoms/reeds";

const SortablePresetButton = ({
  position,
  presetIndex,
  isActive,
  isSelected,
  preset,
  onPresetChange,
  buttonPressedMargin,
}: {
  position: number;
  presetIndex: number;
  isActive: boolean;
  isSelected: boolean;
  preset: (typeof reedActivationPresets)[number];
  onPresetChange: (index: number) => void;
  buttonPressedMargin: string;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: presetIndex });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const commonButtonStyle = {
    width: "56px",
    minWidth: "56px",
    borderRadius: "8px",
    padding: "2px",
    fontSize: "16px",
    textAlign: "center" as const,
    lineHeight: "16px",
    fontWeight: "bold",
    boxShadow: isSelected && isActive ? "inset 0px 0px 6px 2px black" : "none",
    transform:
      isSelected && isActive ? `translateY(${buttonPressedMargin})` : "none",
    opacity: isActive ? 1 : 0.5,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "96px" }}>
      {/* 固定部分（ファンクションキー） */}
      <Button
        variant="contained"
        color={isSelected && isActive ? "primary" : "inherit"}
        style={{
          ...commonButtonStyle,
          height: "24px",
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          marginBottom: "1px",
        }}
        onClick={() => onPresetChange(presetIndex)}
      >
        <span>F{position + 1}</span>
      </Button>

      {/* ドラッグ可能部分（リードプリセット） */}
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
              top: "2px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "18px",
              fontWeight: "bold",
              color:
                isSelected && isActive
                  ? "rgba(255,255,255,0.8)"
                  : "rgba(0,0,0,0.6)",
              letterSpacing: "-1px",
            }}
          >
            ⋮⋮
          </div>
          <span
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gridTemplateRows: "repeat(3, 1fr)",
              gap: "2px",
            }}
          >
            <span>H</span>
            <span></span>
            <span>{preset.H1 && "1"}</span>
            <span></span>
            <span>M</span>
            <span>{preset.M1 && "1"}</span>
            <span>{preset.M2 && "2"}</span>
            <span>{preset.M3 && "3"}</span>
            <span>L</span>
            <span></span>
            <span>{preset.L1 && "1"}</span>
            <span></span>
          </span>
        </div>
      </div>
    </div>
  );
};

// 音色切り替えスイッチ
export const RegisterSwitch: React.FC = () => {
  const selectedPreset = useSelectedPreset();
  const setSelectedPreset = useSetSelectedPreset();
  const adaptPreset = useAdoptPreset();
  const reedActivation = useReedActivation();
  const presetOrder = usePresetOrder();
  const setPresetOrder = useSetPresetOrder();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handlePresetChange = useCallback(
    (presetIndex: number) => {
      setSelectedPreset(presetIndex);
      adaptPreset(presetIndex);
    },
    [setSelectedPreset, adaptPreset],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.startsWith("F") && !isNaN(Number(e.key.slice(1)))) {
        const position = Number(e.key.slice(1)) - 1;
        if (position >= 0 && position < 12) {
          e.preventDefault();
          const presetIndex = presetOrder[position];
          if (presetIndex !== undefined) {
            handlePresetChange(presetIndex);
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
      const oldIndex = presetOrder.indexOf(Number(active.id));
      const newIndex = presetOrder.indexOf(Number(over.id));

      setPresetOrder(arrayMove(presetOrder, oldIndex, newIndex));
    }
  };

  const buttonPressedMargin = "4px";

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={presetOrder}
        strategy={horizontalListSortingStrategy}
      >
        <div
          style={{
            display: "flex",
            gap: "2px",
            marginBottom: buttonPressedMargin,
          }}
        >
          {presetOrder.map((presetIndex, position) => {
            const preset = reedActivationPresets[presetIndex]!;
            const isActive =
              JSON.stringify(preset) === JSON.stringify(reedActivation);

            return (
              <SortablePresetButton
                key={presetIndex}
                position={position}
                presetIndex={presetIndex}
                isActive={isActive}
                isSelected={selectedPreset === presetIndex}
                preset={preset}
                onPresetChange={handlePresetChange}
                buttonPressedMargin={buttonPressedMargin}
              />
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};
