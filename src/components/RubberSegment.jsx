import React, { useMemo, useState } from "react";
import { motion as Motion } from "motion/react";

const RubberSegment = ({
  items = [],
  defaultValue,
  onChange,
  trackColor = "#27272a",
  thumbColor = "#fafafa",
  textColor = "#fafafa",
  activeTextColor = "#18181b",
  size = "md",
  radius = 10,
  inset = 3,
  equalSlots = true,
  stretch = 100,
  squash = 3,
  speed = 1,
  glide = 75,
  draggable = true,
  disabled = false,
}) => {
  const initialIndex = Math.max(0, items.indexOf(defaultValue));
  const [selected, setSelected] = useState(initialIndex);
  const [dragging, setDragging] = useState(false);
  const height = size === "sm" ? 36 : size === "lg" ? 52 : 44;
  const slotWidth = equalSlots ? `${100 / items.length}%` : "auto";
  const thumbWidth = `calc(${100 / items.length}% - ${inset * 2}px)`;
  const label = useMemo(() => items[selected] || "", [items, selected]);

  const select = (index) => {
    if (disabled || index < 0 || index >= items.length) return;
    setSelected(index);
    onChange?.(items[index], index);
  };

  const selectFromPointer = (event) => {
    if (!dragging || !event.currentTarget) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const index = Math.round(((event.clientX - rect.left) / rect.width) * (items.length - 1));
    select(index);
  };

  return (
    <div
      className="relative flex items-center overflow-hidden"
      style={{
        width: stretch ? `${stretch}%` : "auto",
        minWidth: 240,
        height,
        padding: inset,
        borderRadius: radius,
        backgroundColor: trackColor,
        opacity: disabled ? 0.55 : 1,
      }}
      onPointerMove={selectFromPointer}
      onPointerUp={() => setDragging(false)}
      role="tablist"
      aria-label="Period selector"
    >
      <Motion.div
        className="absolute"
        style={{ top: inset, bottom: inset, width: thumbWidth, borderRadius: radius - 2, backgroundColor: thumbColor }}
        animate={{
          left: `calc(${selected * (100 / items.length)}% + ${inset}px)`,
          scaleX: dragging ? 1 + squash / 100 : 1,
        }}
        transition={{ type: "spring", stiffness: 280 * speed, damping: 22, mass: Math.max(0.35, 100 / glide) }}
      />
      {items.map((item, index) => (
        <button
          key={item}
          type="button"
          role="tab"
          aria-selected={selected === index}
          disabled={disabled}
          onClick={() => select(index)}
          onPointerDown={() => setDragging(draggable)}
          style={{ width: slotWidth, color: selected === index ? activeTextColor : textColor, zIndex: 1 }}
          className="relative h-full rounded-lg px-3 text-xs font-bold transition-colors"
        >
          {item}
        </button>
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default RubberSegment;
