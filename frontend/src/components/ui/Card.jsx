import { forwardRef } from "react";
import GlowCard from "./GlowCard";

const Card = forwardRef(function Card(
  {
    children,
    className = "",
    as: Component = "div",
    ...rest
  },
  ref
) {
  return (
    <GlowCard
      ref={ref}
      as={Component}
      className={`bg-surface border border-line rounded-2xl shadow-xs transition-colors duration-200 ${className}`}
      {...rest}
    >
      {children}
    </GlowCard>
  );
});

export default Card;
export { GlowCard };
