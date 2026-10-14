import { forwardRef } from "react";

const Textarea = forwardRef(function Textarea(
  {
    className = "",
    disabled = false,
    bordered = false,
    ...rest
  },
  ref
) {
  const borderClasses = bordered
    ? "border border-line bg-surface p-3.5 rounded-xl focus:border-fg-muted/40 focus:ring-0 focus:outline-none"
    : "";

  return (
    <textarea
      ref={ref}
      rows={rows}
      disabled={disabled}
      className={`w-full bg-transparent text-fg text-base placeholder:text-fg-muted/70 outline-none focus:outline-none focus:ring-0 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed resize-none leading-relaxed transition-colors ${borderClasses} ${className}`}
      style={{ fontSize: "16px" }}
      {...rest}
    />
  );
});

export default Textarea;
