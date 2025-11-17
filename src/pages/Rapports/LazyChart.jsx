import React from "react";
import { useInView } from "react-intersection-observer";

export default function LazyChart({ children, height = 350 }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.2, // 20% visible => charge
  });

  return (
    <div ref={ref} style={{ minHeight: height }}>
      {inView ? children : null}
    </div>
  );
}
