import { useState, useEffect } from "react";
import BounceCards from "../reactbits/BounceCards";
import { useTheme } from "../../theme/ThemeProvider";

import step1 from "../../assets/steps/step1.svg";
import step2 from "../../assets/steps/step2.svg";
import step3 from "../../assets/steps/step3.svg";
import step4 from "../../assets/steps/step4.svg";

const STEP_CARDS = [
  { src: step1, alt: "Step 1: Ask a question or paste a claim" },
  { src: step2, alt: "Step 2: Check verified database" },
  { src: step3, alt: "Step 3: Search web and weigh evidence" },
  { src: step4, alt: "Step 4: Store verified answer and save history" },
];

export default function HowItWorksFan() {
  const { resolvedTheme } = useTheme();
  const [dimensions, setDimensions] = useState({
    width: 480,
    height: 320,
    cardSize: 190,
    spread: 75,
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 440) {
        setDimensions({
          width: 300,
          height: 220,
          cardSize: 130,
          spread: 45,
        });
      } else if (w < 640) {
        setDimensions({
          width: 360,
          height: 250,
          cardSize: 150,
          spread: 55,
        });
      } else if (w < 1024) {
        setDimensions({
          width: 420,
          height: 290,
          cardSize: 170,
          spread: 65,
        });
      } else {
        setDimensions({
          width: 480,
          height: 330,
          cardSize: 190,
          spread: 75,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const borderColor = resolvedTheme === "dark" ? "#263046" : "#ffffff";

  return (
    <div className="flex items-center justify-center w-full py-4 overflow-hidden">
      <BounceCards
        images={STEP_CARDS}
        containerWidth={dimensions.width}
        containerHeight={dimensions.height}
        cardSize={dimensions.cardSize}
        spread={dimensions.spread}
        rotation={9}
        arc={20}
        animationDelay={0.3}
        animationStagger={0.08}
        bounciness={0.5}
        pushDistance={140}
        hoverScale={1.08}
        borderWidth={4}
        borderColor={borderColor}
        radius={24}
        shadow={true}
      />
    </div>
  );
}
