"use client";

import React, { useEffect, useRef, useState } from "react";

type CountryDatum = { _id: string; visits: number };

const WIDTH = 4000;
const HEIGHT = 2000;

/* SIMPLE, CLEAN WORLD MAP (fully visible) */
const LAND_PATH = `
M1772 486l-41 -39l-73 -37l-84 -12l-96 4l-82 18l-96 39l-94 29l-113 8l-121 -4l-112 -28
l-104 -48l-142 -24l-96 -8l-78 -27l-112 -66l-83 -32l-68 -48l-74 -57l-46 -59l-32 -78
l4 -69l26 -66l54 -57l89 -48l117 -39l146 -19l152 6l131 37l118 63l103 74l114 53l138 17
l131 -18l103 -44l87 -67l78 -64l76 -42l82 -21l66 -4l54 22l48 53l56 82l46 92l-6 89
l-37 84l-53 72l-58 59l-48 43l-52 28l-58 13z
`;

// Centroids
const CENTROIDS: Record<string, [number, number]> = {
  US: [39.5, -98.35],
  CA: [56.13, -106.34],
  MX: [23.63, -102.55],
  BR: [-14.24, -51.93],
  AR: [-34.61, -58.37],
  GB: [55.38, -3.44],
  FR: [46.22, 2.21],
  DE: [51.17, 10.45],
  NL: [52.13, 5.29],
  BE: [50.5, 4.47],
  ES: [40.46, -3.75],
  IT: [41.87, 12.57],
  SE: [60.13, 18.64],
  NO: [60.47, 8.47],
  RU: [61.52, 105.32],
  IN: [20.59, 78.96],
  PK: [30.37, 69.34],
  BD: [23.68, 90.35],
  CN: [35.86, 104.19],
  JP: [36.2, 138.25],
  KR: [35.91, 127.77],
  SG: [1.35, 103.82],
  ID: [-0.79, 113.92],
  MY: [4.21, 101.97],
  PH: [12.87, 121.77],
  AU: [-25.27, 133.77],
  NZ: [-40.9, 174.88],
  ZA: [-30.56, 22.94],
  EG: [26.82, 30.8],
  NG: [9.08, 8.67],
  TR: [38.96, 35.24],
  SA: [23.88, 45.08],
  AE: [23.42, 53.84],
  VN: [14.06, 108.28],
  TH: [15.87, 100.99],
  LK: [7.87, 80.77],
  IL: [31.05, 34.85],
};

export default function CountryTraffic(): React.ReactElement {
  const [data, setData] = useState<CountryDatum[]>([]);
  const [hover, setHover] = useState<any>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);

  // Project lat/lon → world x/y
  const project = (lat: number, lon: number) => {
    const x = ((lon + 180) / 360) * WIDTH;
    const y = ((90 - lat) / 180) * HEIGHT;
    return [x, y] as [number, number];
  };

  // Fetch analytics
  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/traffic/country`;
    fetch(url)
      .then((r) => r.json())
      .then((json) =>
        setData(
          (json.countries || []).map((c: any) => ({
            _id: c._id.toUpperCase(),
            visits: Number(c.visits || 0),
          }))
        )
      );
  }, []);

  // Fetch user's country
  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/geoip`;
    fetch(url)
      .then((r) => r.json())
      .then((json) => setUserCountry((json.countryCode || "").toUpperCase()));
  }, []);

  // Marker sizing
  const maxVisits = Math.max(...data.map((d) => d.visits), 1);
  const radiusFor = (v: number) => Math.max(4, Math.sqrt(v / maxVisits) * 40);

  // Compute marker coords
  const markers = data
    .map((d) => {
      if (!CENTROIDS[d._id]) return null;
      const [lat, lon] = CENTROIDS[d._id];
      const [x, y] = project(lat, lon);
      return { ...d, x, y, r: radiusFor(d.visits) };
    })
    .filter(Boolean) as any[];

  // CSS
  const css = `
  .ct-svg { background: transparent; border-radius: 12px; }
  .ct-tooltip {
    position: fixed;
    background: var(--background-card);
    border: 1px solid var(--borderColor);
    color: var(--textPrimary);
    padding: 8px 12px; border-radius: 8px;
    pointer-events: none; font-size: 13px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.4);
    z-index: 999;
  }
  .pulse {
    animation: pulse 2s infinite ease-out;
    opacity: 0.6;
  }
  @keyframes pulse {
    0% { transform: scale(0.7); opacity: 0.25; }
    70% { transform: scale(1.7); opacity: 0; }
    100% { opacity: 0; }
  }
  `;

  return (
    <div className="p-6 rounded-xl border border-[var(--borderColor)] bg-[var(--background-card)] dark:bg-[var(--bgCard)] relative">
      <style>{css}</style>

      <h3 className="text-lg font-semibold text-[var(--textPrimary)] mb-4">Global Presence</h3>

      {/* SVG MAP */}
      <svg
        className="ct-svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        style={{ width: "100%", height: 700 }}
      >
        {/* LAND */}
        <path
          d={LAND_PATH}
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={2}
        />

        {/* MARKERS */}
        {markers.map((m, i) => {
          const isUser = userCountry === m._id;

          return (
            <g key={i} transform={`translate(${m.x},${m.y})`}>
              {/* Pulses */}
              <circle r={m.r + 20} fill={isUser ? "rgba(56,189,248,0.15)" : "rgba(0,255,132,0.15)"} className="pulse" />
              <circle r={m.r + 10} fill={isUser ? "rgba(56,189,248,0.12)" : "rgba(0,255,132,0.12)"} className="pulse" style={{ animationDelay: "0.4s" }} />

              {/* Main dot */}
              <circle
                r={m.r}
                fill={isUser ? "#38bdf8" : "#1DBE6E"}
                stroke="rgba(0,0,0,0.4)"
                strokeWidth={2}
                onMouseEnter={(e) =>
                  setHover({ iso: m._id, visits: m.visits, x: e.clientX, y: e.clientY })
                }
                onMouseLeave={() => setHover(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* TOOLTIP */}
      {hover && (
        <div
          className="ct-tooltip"
          style={{ left: hover.x + 10, top: hover.y - 20 }}
        >
          <b>{hover.iso}</b>
          <div style={{ opacity: 0.7 }}>{hover.visits} visits</div>
        </div>
      )}
    </div>
  );
}
