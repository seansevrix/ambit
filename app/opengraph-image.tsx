// app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

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
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#070B18",
          position: "relative",
          overflow: "hidden",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial',
        }}
      >
        {/* Background glows */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 600px at 20% 0%, rgba(26,79,163,0.35), transparent 60%), radial-gradient(800px 520px at 80% 25%, rgba(52,211,153,0.22), transparent 55%), radial-gradient(900px 600px at 75% 100%, rgba(26,79,163,0.22), transparent 60%)",
          }}
        />

        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.08,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Logo mark (simple + clean) */}
          <div
            style={{
              width: 170,
              height: 170,
              borderRadius: 40,
              background: "rgba(255,255,255,0.06)",
              border: "2px solid rgba(255,255,255,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 24px 90px rgba(0,0,0,0.45)",
            }}
          >
            <div
              style={{
                width: 112,
                height: 112,
                borderRadius: 999,
                background: "rgba(0,0,0,0.35)",
                border: "2px solid rgba(255,255,255,0.14)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 64,
                  fontWeight: 900,
                  color: "rgba(255,255,255,0.95)",
                  lineHeight: 1,
                }}
              >
                A
              </div>
            </div>
          </div>

          {/* Text */}
          <div
            style={{
              marginTop: 26,
              fontSize: 64,
              fontWeight: 900,
              color: "rgba(255,255,255,0.93)",
              letterSpacing: "-0.02em",
            }}
          >
            Gain More Leads
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
