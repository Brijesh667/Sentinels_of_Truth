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
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
    });
  };

  const handleMouseLeave = (e) => {
    if (onMouseLeave) onMouseLeave(e);
    if (rafId.current) cancelAnimationFrame(rafId.current);
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
