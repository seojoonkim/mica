import { ImageResponse } from "next/og";

/**
 * Generated rather than shipped as a binary: the mark is two rules and a
 * wordmark, which is cheaper to draw than to store, and it stays in step with
 * the palette in globals.css.
 */
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#14171c",
          color: "#ffffff",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: "-0.04em",
        }}
      >
        <div style={{ display: "flex" }}>MI</div>
        <div style={{ display: "flex", color: "#7aa2f0" }}>CA</div>
      </div>
    ),
    size,
  );
}
