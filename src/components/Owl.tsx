import { useSkin } from "../skin";

/** Hoot, the app's owl guide. Drawn differently for each skin. */
export function Owl({ size = 96, className }: { size?: number; className?: string }) {
  const skin = useSkin();
  if (skin === "storybook") {
    return (
      <svg width={size} height={size * 1.18} viewBox="0 0 110 130" className={`owl ${className ?? ""}`} aria-hidden="true">
        <path d="M27 38 33 14 46 32z" fill="#8A5A34" stroke="#3B2F22" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M83 38 77 14 64 32z" fill="#8A5A34" stroke="#3B2F22" strokeWidth="2.5" strokeLinejoin="round" />
        <ellipse cx="55" cy="68" rx="34" ry="38" fill="#A97142" stroke="#3B2F22" strokeWidth="2.5" />
        <ellipse cx="55" cy="80" rx="20" ry="22" fill="#F3DFC1" />
        <circle cx="42" cy="54" r="12" fill="#FFF9EC" stroke="#3B2F22" strokeWidth="2.5" />
        <circle cx="68" cy="54" r="12" fill="#FFF9EC" stroke="#3B2F22" strokeWidth="2.5" />
        <circle className="owl-pupil" cx="43" cy="55" r="5" fill="#3B2F22" />
        <circle className="owl-pupil" cx="67" cy="55" r="5" fill="#3B2F22" />
        <path d="M51 63h8l-4 7z" fill="#E8B83A" stroke="#3B2F22" strokeWidth="2" strokeLinejoin="round" />
        <path d="M26 92c10 7 48 7 58 0l-2 9c-10 6-44 6-54 0z" fill="#C8553D" stroke="#3B2F22" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M74 97l7 20-10-2-2-15" fill="#C8553D" stroke="#3B2F22" strokeWidth="2.5" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" className={`owl ${className ?? ""}`} aria-hidden="true">
      <path d="M23 32 29 11 41 27z" fill="#7C6CF0" />
      <path d="M73 32 67 11 55 27z" fill="#7C6CF0" />
      <ellipse cx="48" cy="57" rx="30" ry="32" fill="#7C6CF0" />
      <ellipse cx="48" cy="67" rx="18" ry="19" fill="#ECE8FF" />
      <circle cx="37" cy="45" r="11.5" fill="#FFFFFF" />
      <circle cx="59" cy="45" r="11.5" fill="#FFFFFF" />
      <circle className="owl-pupil" cx="38.5" cy="46" r="5.5" fill="#1F2340" />
      <circle className="owl-pupil" cx="57.5" cy="46" r="5.5" fill="#1F2340" />
      <circle cx="40" cy="44.2" r="1.8" fill="#FFFFFF" />
      <circle cx="59" cy="44.2" r="1.8" fill="#FFFFFF" />
      <path d="M44 54h8l-4 7z" fill="#FFB020" />
      <path d="M19 58q-6 12 5 22M77 58q6 12-5 22" fill="none" stroke="#5B4BD6" strokeWidth="6" strokeLinecap="round" />
      <path d="M41 88v5M55 88v5" stroke="#FFB020" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

/** The owl with a speech bubble. */
export function OwlSays({ children, size = 64, className }: { children: React.ReactNode; size?: number; className?: string }) {
  return (
    <div className={`owl-says ${className ?? ""}`}>
      <Owl size={size} />
      <div className="bubble">{children}</div>
    </div>
  );
}
