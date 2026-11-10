'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export const ButtonBackgroundShine = ({
  children = "Stop",
  className,
  onClick,
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ backgroundSize: '200% 100%' }}
      className={cn(
        "inline-flex w-fit mx-auto h-10 animate-background-shine items-center justify-center rounded-xl border-2 dark:border-[#656fe2] border-[#c0c6fc] dark:bg-[linear-gradient(110deg,#1e2a78,45%,#3749be,55%,#1e2a78)] bg-[linear-gradient(110deg,#3d5af1,45%,#5471ff,55%,#3d5af1)] dark:hover:border-white px-4 font-medium text-white dark:text-white transition-colors focus:outline-hidden focus:ring-2 dark:focus:ring-neutral-400 focus:ring-offset-2 focus:ring-offset-neutral-50 cursor-pointer select-none active:scale-95 text-xs sm:text-sm gap-1.5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default ButtonBackgroundShine;
