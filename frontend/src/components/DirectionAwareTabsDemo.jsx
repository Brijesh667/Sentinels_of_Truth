import { DirectionAwareTabs } from "@/registry/cult-ui/direction-aware-tabs";

const tabs = [
  {
    id: 0,
    label: "Design",
    content: (
      <div className="p-6 text-center text-white">
        <h3 className="text-lg font-semibold mb-2">Design System</h3>
        <p className="text-gray-400 text-sm">
          Build beautiful interfaces with our comprehensive design system. Tokens,
          components, and patterns all in one place.
        </p>
      </div>
    ),
  },
  {
    id: 1,
    label: "Develop",
    content: (
      <div className="p-6 text-center text-white">
        <h3 className="text-lg font-semibold mb-2">Developer Tools</h3>
        <p className="text-gray-400 text-sm">
          Powerful APIs and SDKs to build faster. Type-safe, well-documented, and
          ready for production use.
        </p>
      </div>
    ),
  },
  {
    id: 2,
    label: "Deploy",
    content: (
      <div className="p-6 text-center text-white">
        <h3 className="text-lg font-semibold mb-2">Deployment Pipeline</h3>
        <p className="text-gray-400 text-sm">
          Ship with confidence using our zero-config deployment infrastructure.
          Preview, stage, and produce at any scale.
        </p>
      </div>
    ),
  },
];

export default function Demo() {
  return (
    <div className="w-full max-w-md mx-auto p-6 bg-neutral-900 rounded-2xl">
      <DirectionAwareTabs tabs={tabs} />
    </div>
  );
}
