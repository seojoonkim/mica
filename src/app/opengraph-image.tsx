import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

/**
 * The share card names its preview status without repeating the retired
 * demo-ranking slogan from the former page chrome.
 */
export const alt = `${SITE.name} — Consumer-agent benchmark preview`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#14171c",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              fontSize: 26,
              letterSpacing: "0.14em",
              color: "#5b626c",
            }}
          >
            <span style={{ fontWeight: 700, color: "#14171c" }}>MICA</span>
            <span>{SITE.edition.toUpperCase()}</span>
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 40,
              fontSize: 62,
              fontWeight: 700,
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
              maxWidth: 940,
            }}
          >
            {SITE.longName}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 30,
              color: "#363c45",
              maxWidth: 900,
            }}
          >
            One score per task: accuracy × speed × cost. All three raw axes
            still reported separately.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            borderTop: "4px solid #a8331a",
            paddingTop: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 700,
              color: "#a8331a",
              letterSpacing: "-0.01em",
            }}
          >
            Consumer-agent benchmark preview
          </div>
          <div style={{ display: "flex", marginTop: 12, fontSize: 24, color: "#5b626c" }}>
            Preview build · publicationEligible: false
          </div>
        </div>
      </div>
    ),
    size,
  );
}
