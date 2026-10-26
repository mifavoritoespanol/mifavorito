export function OgCard({ title, subtitle, eyebrow, country }: { title: string; subtitle: string; eyebrow: string; country?: string }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "62px 72px", color: "#f4f4f5", background: "radial-gradient(ellipse at 80% 15%, #3c3727 0%, #181817 36%, #090909 78%)", fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#111", background: "#d5bc73", fontSize: 23, fontWeight: 900 }}>m</div>
        <div style={{ display: "flex", fontSize: 26, fontWeight: 800, letterSpacing: -1 }}>mifavorito</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 1010 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, color: "#d5bc73", fontSize: 20, fontWeight: 700, letterSpacing: 5, textTransform: "uppercase" }}>
          {country ? <span style={{ display: "flex", color: "#f4f4f5", letterSpacing: 0 }}>{country}</span> : null}
          <span style={{ display: "flex" }}>{eyebrow}</span>
        </div>
        <div style={{ display: "flex", fontSize: title.length > 30 ? 58 : 76, lineHeight: 1.04, fontWeight: 900, letterSpacing: -3 }}>{title}</div>
        <div style={{ display: "flex", color: "#b1b1ad", fontSize: 28, lineHeight: 1.35 }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#b5a46b", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>
        <div style={{ width: 42, height: 2, display: "flex", background: "#b5a46b" }} /> EL SITIO QUE TE DA VOZ
      </div>
    </div>
  );
}
