import React, { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({ value, suffix = "" }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState("0");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    const numeric = parseFloat(String(value).replace(/[^0-9.]/g, ""));
    const isDecimal = !Number.isInteger(numeric);
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numeric * eased;
      const formatted = isDecimal
        ? current.toFixed(1)
        : Math.floor(current).toLocaleString();

      setDisplay(formatted);

      if (step >= steps) {
        setDisplay(isDecimal ? numeric.toFixed(1) : numeric.toLocaleString());
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [started, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}