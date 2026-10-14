export default function Skeleton({ className = "", ...rest }) {
  return (
    <div
      className={`animate-pulse bg-surface-2 rounded-xl ${className}`}
      aria-hidden="true"
      {...rest}
    />
  );
}
