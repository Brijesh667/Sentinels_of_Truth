import LightRays from "@/registry/react-bits/LightRays";

export default function Demo() {
  return (
    <div className="relative h-[600px] w-full overflow-hidden bg-black">
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1}
        lightSpread={1}
        rayLength={2}
        pulsating={false}
        followMouse={true}
        mouseInfluence={0.15}
      />
    </div>
  );
}
