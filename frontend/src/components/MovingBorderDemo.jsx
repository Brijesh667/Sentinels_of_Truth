"use client";
import { Button } from "@/registry/aceternity-ui/moving-border";

export default function MovingBorderDemo() {
  return (
    <Button
      duration={3000}
      containerClassName="w-44 h-14"
      className="text-sm font-medium"
    >
      Moving Border
    </Button>
  );
}
