export default function Header() {
  return (
    <div className="text-left mb-6 sm:mb-8">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-fg font-display tracking-tight">
        Check a claim
      </h1>
      <p className="text-fg-muted mt-2.5 text-sm sm:text-base max-w-xl">
        Paste a claim or a forwarded message. We check it against live sources and show the evidence.
      </p>
    </div>
  );
}
