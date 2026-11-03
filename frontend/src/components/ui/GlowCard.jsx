import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";

const GlowCard = forwardRef(function GlowCard(
  {
    children,
    className = "",
    as: Component = "div",
    onMouseMove,
    onMouseLeave,
    ...rest
  },
  forwardedRef
) {
  const cardRef = useRef(null);
  const rafId = useRef(null);

  useImperativeHandle(forwardedRef, () => cardRef.current);

  useEffect(() => {
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
      }
    };
  }, []);

  const handleMouseMove = (e) => {
    if (onMouseMove) onMouseMove(e);

    // Skip calculation on touch devices or if reduced motion is requested
    if (
      typeof window !== "undefined" &&
      (!window.matchMedia("(hover: hover)").matches ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    ) {
      return;
    }

    const card = cardRef.current;
    if (!card) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const percentX = (x - centerX) / (centerX || 1);
      const percentY = (y - centerY) / (centerY || 1);

      // Max 6 degrees tilt toward cursor
      const tiltX = (-percentY * 6).toFixed(2);
      const tiltY = (percentX * 6).toFixed(2);

      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
      card.style.setProperty("--tilt-x", `${tiltX}deg`);
      card.style.setProperty("--tilt-y", `${tiltY}deg`);
    });
  };

  const handleMouseLeave = (e) => {
    if (onMouseLeave) onMouseLeave(e);
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const card = cardRef.current;
    if (card) {
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
    }
  };

  return (
    <Component
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`glow-card ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
});

export default GlowCard;
