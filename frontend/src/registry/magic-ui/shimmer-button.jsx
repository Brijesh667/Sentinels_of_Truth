"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const ShimmerButton = React.forwardRef(
  (
    {
      shimmerColor = "#ffffff",
      shimmerSize = "2px",
      shimmerDuration = "3s",
      borderRadius = "0.75rem",
      background = "rgba(0, 0, 0, 1)",
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        style={{
          borderRadius: borderRadius,
          padding: shimmerSize,
        }}
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden transition-all duration-300 active:scale-95 cursor-pointer shadow-md select-none",
          disabled ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:shadow-white/20",
          className
        )}
        {...props}
      >
        {/* Shimmer rotating beam */}
        <span
          className="absolute inset-[-150%] animate-shimmer-spin pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0 320deg, ${shimmerColor} 360deg)`,
            animationDuration: shimmerDuration,
          }}
        />

        {/* Center Button Body */}
        <span
          className="relative z-10 flex h-full w-full items-center justify-center px-5 py-2 font-semibold text-white transition-all duration-200 group-hover:brightness-110"
          style={{
            borderRadius: `calc(${borderRadius} - ${shimmerSize})`,
            backgroundColor: background,
          }}
        >
          {children}
        </span>

        <style>{`
          @keyframes shimmer-spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          .animate-shimmer-spin {
            animation: shimmer-spin linear infinite;
          }
        `}</style>
      </button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export default ShimmerButton;
