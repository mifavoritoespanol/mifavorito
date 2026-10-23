export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="mf-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fbbf24" />
          <stop offset="1" stopColor="#f43f5e" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="url(#mf-g)" />
      <path
        transform="translate(19.5 6)"
        fill="#fff"
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      />
      <rect x="11" y="40" width="12" height="14" rx="2" fill="#fff" opacity=".8" />
      <rect x="26" y="34" width="12" height="20" rx="2" fill="#fff" />
      <rect x="41" y="44" width="12" height="10" rx="2" fill="#fff" opacity=".65" />
    </svg>
  );
}
 