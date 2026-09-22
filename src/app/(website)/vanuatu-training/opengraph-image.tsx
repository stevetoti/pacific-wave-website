import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { initialCohort as c, feeLabel,monthLabel,dayMonth } from "@/lib/training/config";
export const runtime = "nodejs";
export const alt =
  "Pacific Wave Digital — Build Your Online Business in 30 Days. Vanuatu October 2026.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), "public/images/training/pwd-logo.png"),
  );
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 60,
          background: "#F8F9FC",
          color: "#233C6F",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{display:'flex',alignItems:'center',gap:22}}><img
          src={`data:image/png;base64,${logo.toString("base64")}`}
          width={100}
          height={100}
          style={{ objectFit: "contain", objectPosition: "left" }}
          alt="Pacific Wave Digital"
        /><span style={{fontSize:30,fontWeight:700}}>PACIFIC WAVE DIGITAL</span></div>
        <div
          style={{
            display: "flex",
            color: "#b73d19",
            fontSize: 22,
            marginTop: 24,
            letterSpacing: 3,
          }}
        >
          VANUATU • {monthLabel(c,true).toUpperCase()}
        </div>
        <div
          style={{
            display: "flex",
            fontWeight: 800,
            fontSize: 66,
            lineHeight: 1.07,
            marginTop: 22,
            maxWidth: 1050,
          }}
        >
          Build Your Online Business in 30 Days
        </div>
        <div style={{ display: "flex", fontSize: 23, marginTop: 30 }}>
          Starts {dayMonth(c.start)} · In person + online · {c.timeLabel}
        </div>
        <div
          style={{
            display: "flex",
            background: "#EF5E33",
            padding: "16px 24px",
            fontSize: 29,
            fontWeight: 700,
            marginTop: 28,
            alignSelf: "flex-start",
            borderRadius: 10,
          }}
        >
          Course fee: {feeLabel(c)} · {c.softwareMonths} months free Digi Assist
          AI Pro
        </div>
      </div>
    ),
    size,
  );
}
