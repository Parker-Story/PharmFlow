interface PharmacyIconProps {
  className?: string;
  strokeWidth?: number;
}

export function PharmacyIcon({ className, strokeWidth = 1.5 }: PharmacyIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Mortar rim */}
      <path d="M4 10h16" />
      {/* Mortar bowl */}
      <path d="M6 10 C6 18 18 18 18 10" />
      {/* Pestle handle */}
      <line x1="15" y1="4" x2="11" y2="10" />
      {/* Pestle head */}
      <ellipse cx="15.8" cy="3.5" rx="1.8" ry="1.2" transform="rotate(-30 15.8 3.5)" />
    </svg>
  );
}
