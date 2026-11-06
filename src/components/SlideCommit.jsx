import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import { Check, ChevronRight, X } from "lucide-react";

const SlideCommit = ({
  label = "Slide to confirm",
  doneLabel = "Done",
  errorLabel = "Action failed",
  onConfirm,
  onDone,
  onError,
  trackColor = "#262626",
  handleColor = "#f5f5f5",
  successColor = "#22c55e",
  dangerColor = "#e5484d",
  width = 280,
  height = 56,
  radius = 28,
  speed = 50,
  returnBounce = 0.38,
  landingDip = 0.026,
  holdMs = 1500,
  outcome = "resolve",
  latency = 1200,
  disabled = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState("idle");
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const trackRef = useRef(null);

  const handleWidth = height - 8;
  const travel = Math.max(1, width - handleWidth - 8);

  useEffect(() => {
    if (phase !== "success" && phase !== "error") return undefined;
    const timer = window.setTimeout(() => {
      if (phase === "success") onDone?.();
      setPhase("idle");
      setProgress(0);
    }, holdMs);
    return () => window.clearTimeout(timer);
  }, [holdMs, onDone, phase]);

  const finish = async () => {
    if (phase !== "idle" || disabled) return;
    setDragging(false);
    setProgress(1);
    setPhase("processing");
    try {
      await new Promise((resolve) => window.setTimeout(resolve, latency));
      await onConfirm();
      setPhase("success");
    } catch (error) {
      setPhase("error");
      setProgress(0);
      onError?.(error);
    }
  };

  const updateFromPointer = (clientX) => {
    if (!dragging || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const next = Math.min(1, Math.max(0, (clientX - startX.current) / travel));
    setProgress(next);
    if (next >= 0.98) finish();
    if (rect.width <= 0) setProgress(0);
  };

  const startDrag = (event) => {
    if (phase !== "idle" || disabled) return;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    startX.current = event.clientX - progress * travel;
    setDragging(true);
  };

  const endDrag = () => {
    if (!dragging || phase !== "idle") return;
    setDragging(false);
    if (progress >= 0.72) finish();
    else setProgress(0);
  };

  const isSuccess = phase === "success" && outcome === "resolve";
  const isError = phase === "error";
  const text = isSuccess ? doneLabel : isError ? errorLabel : label;

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-label={text}
      aria-valuenow={Math.round(progress * 100)}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") finish();
      }}
      onPointerMove={(event) => updateFromPointer(event.clientX)}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{
        width,
        height,
        borderRadius: radius,
        background: isSuccess ? successColor : isError ? dangerColor : trackColor,
        opacity: disabled ? 0.55 : 1,
      }}
      className="relative select-none overflow-hidden outline-none focus:ring-2 focus:ring-emerald-400/50"
    >
      <Motion.div
        className="absolute inset-y-0 left-0"
        animate={{ width: `${Math.min(100, progress * 100)}%` }}
        transition={{ duration: dragging ? 0 : 0.2 }}
        style={{ background: isSuccess ? successColor : isError ? dangerColor : "#3f3f46" }}
      />
      <div className="absolute inset-0 flex items-center justify-center px-14">
        <AnimatePresence mode="wait" initial={false}>
          <Motion.span
            key={text}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="truncate text-sm font-bold text-white"
          >
            {text}
          </Motion.span>
        </AnimatePresence>
      </div>
      <Motion.button
        type="button"
        aria-label={text}
        disabled={disabled || phase === "processing"}
        onPointerDown={startDrag}
        onClick={() => {
          if (isError) {
            setPhase("idle");
            setProgress(0);
          }
        }}
        animate={{
          x: progress * travel,
          scale: phase === "processing" ? [1, 0.94, 1] : 1,
          y: isSuccess ? [0, -height * landingDip, 0] : 0,
        }}
        transition={{
          x: { type: "spring", stiffness: speed * 7, damping: 22, bounce: returnBounce },
          scale: { duration: 0.8, repeat: phase === "processing" ? Infinity : 0 },
          y: { duration: 0.35 },
        }}
        style={{
          width: handleWidth,
          height: handleWidth,
          left: 4,
          top: 4,
          borderRadius: radius - 4,
          background: handleColor,
          color: isSuccess ? successColor : isError ? dangerColor : "#18181b",
          touchAction: "none",
        }}
        className="absolute flex items-center justify-center shadow-lg"
      >
        {isSuccess ? <Check size={22} strokeWidth={3} /> : isError ? <X size={22} strokeWidth={3} /> : <ChevronRight size={22} strokeWidth={3} />}
      </Motion.button>
    </div>
  );
};

export default SlideCommit;
