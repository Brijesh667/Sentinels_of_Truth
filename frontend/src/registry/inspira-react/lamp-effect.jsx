import React from "react";
import { cn } from "@/lib/utils";

export function LampEffect({
  delay = 0.5,
  duration = 0.8,
  className,
  children,
  contentClassName,
}) {
  const durationStr = `${duration}s`;
  const delayStr = `${delay}s`;

  const animationStyle = (name) => ({
    animation: `${name} ease-in-out ${durationStr} forwards`,
    animationDelay: delayStr,
  });

  return (
    <div
      className={cn(
        "relative z-0 flex min-h-[500px] w-full flex-col items-center justify-start overflow-hidden bg-slate-950",
        className
      )}
    >
      <div className="relative isolate z-0 flex w-full h-80 sm:h-96 scale-y-125 items-center justify-center pointer-events-none select-none">
        {/* Conic Gradient Left */}
        <div
          style={{
            backgroundImage: `conic-gradient(var(--conic-position, from 70deg at center top), #06b6d4, transparent 65%)`,
            WebkitMaskImage:
              "linear-gradient(to top, white, transparent), linear-gradient(to right, white, transparent)",
            ...animationStyle("lamp-conic-gradient"),
          }}
          className="bg-gradient-conic absolute inset-auto right-1/2 h-56 w-60 overflow-visible from-cyan-500 via-transparent to-transparent text-white opacity-50 [--conic-position:from_70deg_at_center_top]"
        >
          <div
            style={{
              WebkitMaskImage: "linear-gradient(to top, white, transparent)",
              maskImage: "linear-gradient(to top, white, transparent)",
            }}
            className="absolute bottom-0 left-0 z-20 h-40 w-full bg-slate-950"
          />
          <div
            style={{
              WebkitMaskImage: "linear-gradient(to right, white, transparent)",
              maskImage: "linear-gradient(to right, white, transparent)",
            }}
            className="absolute bottom-0 left-0 z-20 h-full w-40 bg-slate-950"
          />
        </div>

        {/* Conic Gradient Right */}
        <div
          style={{
            backgroundImage: `conic-gradient(var(--conic-position, from 290deg at center top), transparent 35%, #06b6d4)`,
            WebkitMaskImage:
              "linear-gradient(to left, white, transparent), linear-gradient(to top, white, transparent)",
            ...animationStyle("lamp-conic-gradient"),
          }}
          className="bg-gradient-conic absolute inset-auto left-1/2 h-56 w-60 from-transparent via-transparent to-cyan-500 text-white opacity-50 [--conic-position:from_290deg_at_center_top]"
        >
          <div
            style={{
              WebkitMaskImage: "linear-gradient(to left, white, transparent)",
              maskImage: "linear-gradient(to left, white, transparent)",
            }}
            className="absolute right-0 bottom-0 z-20 h-full w-40 bg-slate-950"
          />
          <div
            style={{
              WebkitMaskImage: "linear-gradient(to top, white, transparent)",
              maskImage: "linear-gradient(to top, white, transparent)",
            }}
            className="absolute right-0 bottom-0 z-20 h-40 w-full bg-slate-950"
          />
        </div>

        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-slate-950 blur-2xl" />
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md" />

        <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-cyan-500 opacity-50 blur-3xl" />

        {/* Spotlight */}
        <div
          style={animationStyle("lamp-spotlight")}
          className="absolute inset-auto z-30 h-36 w-32 -translate-y-24 rounded-full bg-cyan-400 blur-2xl"
        />

        {/* Glowing Line */}
        <div
          style={animationStyle("lamp-glowing-line")}
          className="absolute inset-auto z-50 h-0.5 w-60 -translate-y-28 bg-cyan-400"
        />

        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-slate-950" />
      </div>

      <div
        className={cn(
          "relative z-50 flex -translate-y-36 sm:-translate-y-44 flex-col items-center px-5 w-full",
          contentClassName
        )}
      >
        {children}
      </div>

      <style>{`
        @keyframes lamp-spotlight {
          from { width: 8rem; }
          to { width: 16rem; }
        }
        @keyframes lamp-glowing-line {
          from { width: 15rem; }
          to { width: 30rem; }
        }
        @keyframes lamp-conic-gradient {
          from { opacity: 0.5; width: 15rem; }
          to { opacity: 1; width: 30rem; }
        }
      `}</style>
    </div>
  );
}

export default LampEffect;
