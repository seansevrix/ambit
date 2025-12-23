import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "#020617", // slate-950
          color: "#ffffff",
        }}
      >
        {/* Top mark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#020617",
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: -1,
            }}
          >
            A
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: -1 }}>
              AMBIT
            </div>
            <div style={{ fontSize: 18, opacity: 0.8 }}>
              Gov-tech. Simple. Contractor-first.
            </div>
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            marginTop: 36,
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: -2,
            lineHeight: 1.05,
            maxWidth: 980,
          }}
        >
          Ranked government contract leads for contractors.
        </div>

        {/* Sub */}
        <div
          style={{
            marginTop: 18,
            fontSize: 24,
            opacity: 0.85,
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          Tell us your trade + service area. AMBIT finds, scores, and summarizes the best
          fits—delivered to your inbox.
        </div>

        {/* Pills */}
        <div style={{ display: "flex", gap: 12, marginTop: 30, flexWrap: "wrap" }}>
          {["Match score", "Plain-English summary", "Daily digest", "Cancel anytime"].map(
            (t) => (
              <div
                key={t}
                style={{
                  padding: "10px 14px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.10)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  fontSize: 16,
                  fontWeight: 650,
                }}
              >
                {t}
              </div>
            )
          )}
        </div>

        {/* Bottom line */}
        <div style={{ marginTop: 40, fontSize: 16, opacity: 0.7 }}>
          ambit • lead engine for the field
        </div>
      </div>
    ),
    size
  );
}
