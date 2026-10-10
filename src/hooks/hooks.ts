import { useEffect, useRef, useState } from "react";

/** Animated number that eases from 0 to target. */
export function useCountUp(target: number, decimals = 0, duration = 900): string {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setVal(target * e);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, decimals, duration]);
  return val.toFixed(decimals);
}

/** Adds .vis to .reveal elements on scroll into view. */
export function useReveal(dep: unknown = null) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const els = root.querySelectorAll(".reveal:not(.vis)");
    const io = new IntersectionObserver(
      (es) => es.forEach((x) => {
        if (x.isIntersecting) {
          x.target.classList.add("vis");
          io.unobserve(x.target);
        }
      }),
      { threshold: 0.1 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [dep]);
  return ref;
}
