"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

export function DirectionAwareTabs({
  tabs = [],
  className,
  tabClassName,
  activeTabClassName,
  bubbleClassName,
  rounded,
  roundedInner,
  activeId,
  onChange,
  onTabClick,
  showContent = true,
  layoutId = "direction-aware-bubble",
}) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    activeId !== undefined ? activeId : (tabs[0]?.id ?? 0)
  );
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [ref, bounds] = useMeasure();
  const prevActiveIdRef = useRef(activeId !== undefined ? activeId : internalActiveTab);

  const activeTab = activeId !== undefined ? activeId : internalActiveTab;

  useEffect(() => {
    if (activeId !== undefined && activeId !== prevActiveIdRef.current) {
      const oldIndex = tabs.findIndex((t) => t.id === prevActiveIdRef.current);
      const newIndex = tabs.findIndex((t) => t.id === activeId);
      if (newIndex !== -1 && oldIndex !== -1) {
        setDirection(newIndex > oldIndex ? 1 : -1);
      }
      prevActiveIdRef.current = activeId;
      setInternalActiveTab(activeId);
    }
  }, [activeId, tabs]);

  const activeTabItem = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) || tabs[0],
    [activeTab, tabs]
  );

  const content = useMemo(() => {
    return activeTabItem?.content || null;
  }, [activeTabItem]);

  const handleTabClick = (newTabId) => {
    const currentId = activeId !== undefined ? activeId : internalActiveTab;
    const oldIndex = tabs.findIndex((t) => t.id === currentId);
    const newIndex = tabs.findIndex((t) => t.id === newTabId);
    const newDirection = newIndex > oldIndex ? 1 : -1;

    setDirection(newDirection);
    prevActiveIdRef.current = newTabId;
    setInternalActiveTab(newTabId);

    const targetTab = tabs.find((t) => t.id === newTabId);
    if (onTabClick) {
      onTabClick(newTabId, targetTab);
    }
    if (onChange) {
      onChange(newTabId, targetTab);
    }
  };

  const variants = {
    initial: (dir) => ({
      x: 300 * dir,
      opacity: 0,
      filter: "blur(4px)",
    }),
    active: {
      x: 0,
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: (dir) => ({
      x: -300 * dir,
      opacity: 0,
      filter: "blur(4px)",
    }),
  };

  const hasAnyContent = tabs.some((t) => t.content);

  return (
    <div className="flex flex-col items-center w-full">
      <div
        className={cn(
          "flex items-center space-x-1 rounded-full cursor-pointer p-1 bg-surface-2/80 dark:bg-neutral-800/90 border border-line/80 shadow-xs",
          className,
          rounded
        )}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={cn(
                "relative rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-colors select-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary flex gap-2 items-center cursor-pointer",
                isActive
                  ? "text-fg font-semibold dark:text-white"
                  : "text-fg-muted hover:text-fg dark:text-neutral-300/80 dark:hover:text-white",
                rounded ? roundedInner : undefined,
                tabClassName,
                isActive && activeTabClassName
              )}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {isActive && (
                <motion.span
                  layoutId={layoutId}
                  className={cn(
                    "absolute inset-0 z-0 bg-surface dark:bg-neutral-700/90 rounded-full border border-line dark:border-white/10 shadow-xs",
                    rounded ? roundedInner : "rounded-full",
                    bubbleClassName
                  )}
                  transition={{ type: "spring", bounce: 0.19, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {showContent && hasAnyContent && (
        <MotionConfig transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}>
          <motion.div
            className="relative mx-auto w-full h-full overflow-hidden"
            initial={false}
            animate={{ height: bounds.height || "auto" }}
          >
            <div className="p-1" ref={ref}>
              <AnimatePresence
                custom={direction}
                mode="popLayout"
                onExitComplete={() => setIsAnimating(false)}
              >
                <motion.div
                  key={activeTab}
                  variants={variants}
                  initial="initial"
                  animate="active"
                  exit="exit"
                  custom={direction}
                  onAnimationStart={() => setIsAnimating(true)}
                  onAnimationComplete={() => setIsAnimating(false)}
                >
                  {content}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </MotionConfig>
      )}
    </div>
  );
}

export default DirectionAwareTabs;
