import React from "react";

export interface SkillItem {
  id: string;
  label: string;
  value: number; // בין 0 ל-maxValue
}

interface SkillPolygonChartProps {
  skills: SkillItem[];
  maxValue?: number;
  levels?: number; // מספר טבעות הרקע (למשל 5)
  size?: number; // גודל ה-SVG בפיקסלים
  fillColor?: string;
  strokeColor?: string;
}

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleIndex: number,
  total: number
) {
  // מתחילים מלמעלה (-90 מעלות) והולכים עם כיוון השעון
  const angle = -Math.PI / 2 + (2 * Math.PI * angleIndex) / total;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function pointsToString(points: { x: number; y: number }[]) {
  return points.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(" ");
}

export const SkillPolygonChart: React.FC<SkillPolygonChartProps> = ({
  skills,
  maxValue = 10,
  levels = 5,
  size = 380,
  fillColor = "rgba(255, 122, 69, 0.55)",
  strokeColor = "#ff6b35",
}) => {
  const n = skills.length;
  const cx = size / 2;
  const cy = size / 2;
  const padding = 68; // מקום לתוויות מסביב לפוליגון
  const maxRadius = Math.max(40, size / 2 - padding);

  if (n < 3) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: "grid",
          placeItems: "center",
          border: "1px dashed #cbd5e1",
          borderRadius: 16,
          padding: 16,
          textAlign: "center",
        }}
      >
        יש להזין לפחות 3 סקילים כדי ליצור פוליגון.
      </div>
    );
  }

  // נקודות עבור כל טבעת רקע מדורגת
  const gridPolygons = Array.from({ length: levels }, (_, lvlIdx) => {
    const ratio = (lvlIdx + 1) / levels;
    const r = maxRadius * ratio;
    const pts = Array.from({ length: n }, (_, i) =>
      polarToCartesian(cx, cy, r, i, n)
    );
    return {
      key: lvlIdx,
      points: pointsToString(pts),
      isOuter: lvlIdx === levels - 1,
    };
  });

  // קווים רדיאליים מהמרכז לכל קודקוד
  const axes = Array.from({ length: n }, (_, i) => {
    const outer = polarToCartesian(cx, cy, maxRadius, i, n);
    return { key: i, x2: outer.x, y2: outer.y };
  });

  // פוליגון הערכים של הדמות
  const valuePoints = skills.map((skill, i) => {
    const clamped = Math.max(0, Math.min(maxValue, skill.value));
    const ratio = maxValue > 0 ? clamped / maxValue : 0;
    return polarToCartesian(cx, cy, maxRadius * ratio, i, n);
  });

  // מיקום התוויות מעט מעבר לקודקוד החיצוני
  const labelOffset = 22;
  const labels = skills.map((skill, i) => {
    const pos = polarToCartesian(cx, cy, maxRadius + labelOffset, i, n);
    let textAnchor: "start" | "middle" | "end" = "middle";
    if (pos.x < cx - 10) textAnchor = "end";
    else if (pos.x > cx + 10) textAnchor = "start";

    return {
      id: skill.id,
      label: skill.label,
      value: skill.value,
      x: pos.x,
      y: pos.y,
      textAnchor,
    };
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ overflow: "visible", userSelect: "none" }}
    >
      {/* טבעות רקע פוליגוניות */}
      {gridPolygons.map((g) => (
        <polygon
          key={g.key}
          points={g.points}
          fill={g.isOuter ? "#f8fafc" : "none"}
          stroke="#cbd5e1"
          strokeWidth={g.isOuter ? 1.5 : 1}
          strokeDasharray={g.isOuter ? undefined : "3 3"}
        />
      ))}

      {/* צירים מהמרכז לקודקודים */}
      {axes.map((axis) => (
        <line
          key={axis.key}
          x1={cx}
          y1={cy}
          x2={axis.x2}
          y2={axis.y2}
          stroke="#cbd5e1"
          strokeWidth={1}
          strokeDasharray="4 4"
        />
      ))}

      {/* שטח היכולות של הדמות */}
      <polygon
        points={pointsToString(valuePoints)}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />

      {/* נקודות בקודקודי הערכים */}
      {valuePoints.map((pt, i) => (
        <circle
          key={skills[i].id}
          cx={pt.x}
          cy={pt.y}
          r={4.5}
          fill={strokeColor}
          stroke="#ffffff"
          strokeWidth={1.5}
        />
      ))}

      {/* תוויות הסקילים והדרגה */}
      {labels.map((lbl) => (
        <text
          key={lbl.id}
          x={lbl.x}
          y={lbl.y}
          textAnchor={lbl.textAnchor}
          dominantBaseline="central"
          fontSize={12}
          fontWeight={600}
          fill="#1e293b"
        >
          {lbl.label} ({lbl.value}/{maxValue})
        </text>
      ))}
    </svg>
  );
};