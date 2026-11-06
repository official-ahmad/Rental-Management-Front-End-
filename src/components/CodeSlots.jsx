import React, { useRef } from "react";
import { AnimatePresence, motion as Motion } from "motion/react";
import { Check, X } from "lucide-react";

const CodeSlots = ({
  length = 6,
  value = "",
  status = "idle",
  onChange,
  onComplete,
  accentColor = "#f5f5f5",
  inkColor = "#f5f5f5",
  slotColor = "#27272a",
  digitColor = "#18181b",
  dangerColor = "#ff3b30",
  slotSize = 44,
  gap = 8,
  radius = 12,
  bounce = 0.2,
  settle = 0.3,
  rise = 8,
  cascade = 20,
  mask = false,
  caret = true,
  outcome = "accept",
  disabled = false,
}) => {
  const digits = value.slice(0, length).split("");
  const refs = useRef([]);

  const update = (next) => {
    const code = next.join("");
    onChange(code);
    if (code.length === length && next.every(Boolean)) onComplete(code);
  };

  const handleChange = (index, input) => {
    const digit = input.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    update(next);
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleResultKeyDown = (event) => {
    if (event.key === "Backspace" || event.key === "Escape") {
      onChange("");
      refs.current[0]?.focus();
    }
  };

  const isAccepted = status === "success" && outcome === "accept";

  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    event.preventDefault();
    const next = pasted.split("");
    update(next);
    refs.current[Math.min(next.length, length) - 1]?.focus();
  };

  return (
    <div
      className="flex justify-center"
      style={{ gap }}
      onPaste={handlePaste}
      role="group"
      aria-label="One-time password"
    >
      {status === "success" || status === "error" ? (
        <Motion.button
          type="button"
          onClick={() => {
            onChange("");
            refs.current[0]?.focus();
          }}
          onKeyDown={handleResultKeyDown}
          initial={{ opacity: 0, scale: 0.88, y: rise }}
          animate={{
            opacity: 1,
            scale: [0.96, 1.03, 1],
            x: status === "error" ? [0, -6, 6, -4, 4, 0] : 0,
          }}
          transition={{
            opacity: { duration: settle },
            scale: { duration: 0.45, ease: "easeOut" },
            x: status === "error" ? { duration: 0.38 } : { duration: settle },
          }}
          style={{
            minWidth: slotSize * length + gap * (length - 1),
            height: slotSize,
            borderRadius: radius,
            backgroundColor: isAccepted ? "#f5f5f5" : "#3f1d24",
            color: isAccepted ? digitColor : dangerColor,
            boxShadow: `0 0 0 2px ${
              isAccepted ? accentColor : dangerColor
            }66`,
          }}
          className="flex items-center justify-center border border-transparent outline-none focus:ring-2 focus:ring-emerald-400/50"
          aria-label={isAccepted ? "OTP accepted" : "OTP rejected, retry"}
        >
          <Motion.span
            initial={{ pathLength: 0, opacity: 0, scale: 0.6 }}
            animate={{ pathLength: 1, opacity: 1, scale: 1 }}
            transition={{ delay: 0.12, duration: 0.35, type: "spring", bounce: 0.25 }}
            className="flex items-center justify-center"
          >
            {isAccepted ? (
              <Check className="h-7 w-7" strokeWidth={3} />
            ) : (
              <X className="h-7 w-7" strokeWidth={3} />
            )}
          </Motion.span>
        </Motion.button>
      ) : Array.from({ length }, (_, index) => (
        <Motion.div
          key={index}
          initial={{ opacity: 0, y: rise, scale: 0.86 }}
          style={{ width: slotSize, height: slotSize, borderRadius: radius, color: digitColor }}
          className={`relative flex items-center justify-center border outline-none ${
            status === "error"
              ? "border-red-400"
              : status === "success"
                ? "border-emerald-400"
                : "border-zinc-700"
          }`}
          whileHover={disabled ? undefined : { y: -2, scale: 1.04 }}
          whileTap={disabled ? undefined : { scale: 0.96 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            x: status === "error" ? [0, -5, 5, -4, 4, 0] : 0,
            backgroundColor: status === "error" ? "#3f1d24" : status === "success" ? "#123b31" : slotColor,
            boxShadow:
              status === "error"
                ? `0 0 0 2px ${dangerColor}55`
                : status === "success"
                  ? `0 0 0 2px ${accentColor}66`
                  : `0 0 0 0px ${accentColor}00`,
          }}
          transition={{
            opacity: { duration: settle },
            y: { type: "spring", stiffness: 420, damping: 22, bounce, delay: index * (cascade / 1000) },
            scale: { type: "spring", stiffness: 420, damping: 22, bounce, delay: index * (cascade / 1000) },
            x: status === "error" ? { duration: 0.36 } : { duration: settle },
            backgroundColor: { duration: settle },
            boxShadow: { duration: settle },
          }}
        >
          <input
            ref={(element) => { refs.current[index] = element; }}
            value={digits[index] || ""}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            inputMode="numeric"
            maxLength={1}
            aria-label={`OTP digit ${index + 1}`}
            disabled={disabled}
            className="absolute inset-0 z-10 h-full w-full cursor-text rounded-[inherit] border-0 bg-transparent text-center text-lg font-bold outline-none"
            style={{ color: "transparent", caretColor: "transparent" }}
          />
          <AnimatePresence mode="popLayout" initial={false}>
            {digits[index] && (
              <Motion.span
                key={`${index}-${digits[index]}`}
                initial={{ opacity: 0, y: rise, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -rise, scale: 0.5 }}
                transition={{ type: "spring", stiffness: 500, damping: 20, bounce: bounce + 0.1 }}
                className="pointer-events-none relative z-0 text-lg font-bold"
                style={{ color: status === "error" ? dangerColor : status === "success" ? accentColor : inkColor }}
              >
                {mask ? "•" : digits[index]}
              </Motion.span>
            )}
          </AnimatePresence>
          {caret && !digits[index] && index === digits.findIndex((digit) => !digit) && !disabled && (
            <Motion.span
              aria-hidden="true"
              className="pointer-events-none absolute h-5 w-0.5"
              style={{ backgroundColor: accentColor }}
              animate={{ opacity: [0.2, 1, 0.2] }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </Motion.div>
      ))}
    </div>
  );
};

export default CodeSlots;
