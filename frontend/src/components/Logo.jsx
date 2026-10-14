import logoImg from "../assets/sentinels_logo.png";
import siteConfig from "../config/site";

export default function Logo({ className = "", showName = true }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <img
        src={logoImg}
        alt={`${siteConfig.name} logo`}
        width={36}
        height={36}
        className="w-8 h-8 md:w-9 md:h-9 rounded-xl object-contain shadow-xs flex-shrink-0"
      />
      {showName && (
        <span className="font-display font-bold text-fg text-base md:text-lg tracking-tight">
          {siteConfig.name}
        </span>
      )}
    </div>
  );
}
