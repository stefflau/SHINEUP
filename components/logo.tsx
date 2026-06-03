// src/components/Logo.tsx
// Usage : <Logo /> ou <Logo size="sm" /> ou <Logo size="lg" /> ou <Logo textOnly />

type LogoProps = {
  size?: "sm" | "md" | "lg";
  textOnly?: boolean;
  className?: string;
};

export default function Logo({ size = "md", textOnly = false, className }: LogoProps) {
 const sizes = {
  sm: { icon: 28, fontSize: 16, sub: 7, total: 200 },
  md: { icon: 36, fontSize: 20, sub: 9, total: 240 },
  lg: { icon: 60, fontSize: 32, sub: 13, total: 340 }, // ← ajoute ça
};
  const s = sizes[size];
  const iconR = s.icon / 2;

  if (textOnly) {
    return (
      <span
        className={className}
        style={{
          fontFamily: "'Arial Black', 'Helvetica Neue', sans-serif",
          fontWeight: 900,
          fontSize: s.fontSize,
          color: "#F5C842",
          letterSpacing: "3px",
        }}
      >
        SHINEUP
      </span>
    );
  }

  return (
    <svg
      width={s.total}
      height={s.icon + 16}
      viewBox={`0 0 ${s.total} ${s.icon + 16}`}
      className={className}
      aria-label="SHINEUP Coach"
    >
      {/* Cercle fond doré */}
      <circle cx={iconR} cy={iconR} r={iconR} fill="#F5C842" opacity="0.12" />

      {/* Rayons soleil */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const r1 = iconR + 4;
        const r2 = iconR + 8;
        return (
          <line
            key={i}
            x1={iconR + Math.cos(rad) * r1}
            y1={iconR + Math.sin(rad) * r1}
            x2={iconR + Math.cos(rad) * r2}
            y2={iconR + Math.sin(rad) * r2}
            stroke="#F5C842"
            strokeWidth={i % 2 === 0 ? 2 : 1.5}
            strokeLinecap="round"
          />
        );
      })}

      {/* Cercle principal */}
      <circle cx={iconR} cy={iconR} r={iconR - 4} fill="none" stroke="#F5C842" strokeWidth="2" />

      {/* Lettre S */}
      <text
        x={iconR}
        y={iconR + s.fontSize * 0.36}
        textAnchor="middle"
        fontFamily="Arial Black, sans-serif"
        fontSize={s.fontSize * 0.8}
        fontWeight="900"
        fill="#F5C842"
      >
        S
      </text>

      {/* HINEUP */}
      <text
        x={s.icon + 8}
        y={iconR + s.fontSize * 0.38}
        fontFamily="Arial Black, Helvetica Neue, sans-serif"
        fontSize={s.fontSize}
        fontWeight="900"
        fill="currentColor"
        letterSpacing="2"
      >
        HINEUP
      </text>

      {/* Sous-ligne */}
      <text
        x={s.icon + 8}
        y={s.icon + 12}
        fontFamily="Arial, sans-serif"
        fontSize={s.sub}
        fill="#888"
        letterSpacing="2"
      >
        COACH REMISE EN FORME
      </text>
    </svg>
    
  );
}
