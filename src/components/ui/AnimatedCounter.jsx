import React, { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

export default function AnimatedCounter({ value, suffix = "" }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!isInView) return;
    // Parse numeric part
    const numeric = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    const prefix = String(value).match(/^[^0-9]*/)?.[0] || "";
    const valueSuffix = String(value).match(/[^0-9.]+$/)?.[0] || "";
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // ease out
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numeric * eased;
      const formatted = Number.isInteger(numeric)
        ? Math.floor(current).toLocaleString()
        : current.toFixed(1);
      setDisplay(`${prefix}${formatted}${valueSuffix}`);
      if (step >= steps) {
        setDisplay(String(value));
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
