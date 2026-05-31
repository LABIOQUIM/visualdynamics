import type { CSSProperties } from "react";

const splashStyle: CSSProperties = {
  alignItems: "center",
  background:
    "radial-gradient(circle at top left, rgba(34, 139, 230, 0.18), transparent 30%), linear-gradient(180deg, #f7fbff 0%, #ffffff 58%, #eef7fb 100%)",
  color: "#092f4a",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  inset: 0,
  justifyContent: "center",
  minHeight: "100dvh",
  padding: "24px",
  position: "fixed",
  textAlign: "center",
  zIndex: 2147483647,
};

const brandStyle: CSSProperties = {
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "clamp(2.35rem, 7vw, 4rem)",
  fontWeight: 800,
  lineHeight: 1,
};

const messageStyle: CSSProperties = {
  color: "#0f5c82",
  fontFamily: "Inter, system-ui, sans-serif",
  fontSize: "1rem",
  fontWeight: 700,
};

const barsStyle: CSSProperties = {
  alignItems: "center",
  display: "flex",
  gap: "8px",
  height: "24px",
  justifyContent: "center",
};

const barStyle: CSSProperties = {
  animation: "visualdynamics-first-load-pulse 0.8s ease-in-out infinite alternate",
  backgroundColor: "#228be6",
  borderRadius: "999px",
  display: "block",
  height: "20px",
  width: "8px",
};

export function FirstLoadShell() {
  return (
    <div aria-hidden style={splashStyle}>
      <style>
        {`@keyframes visualdynamics-first-load-pulse{from{opacity:.35;transform:scaleY(.45)}to{opacity:1;transform:scaleY(1)}}`}
      </style>
      <div style={brandStyle}>Visual Dynamics</div>
      <div style={messageStyle}>Preparing workspace...</div>
      <div style={barsStyle}>
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            style={{
              ...barStyle,
              animationDelay: `${index * 0.14}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
