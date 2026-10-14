export default function Card({
  children,
  className = "",
  as: Component = "div",
  ...rest
}) {
  return (
    <Component
      className={`bg-surface border border-line rounded-2xl shadow-xs transition-colors duration-200 ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}
