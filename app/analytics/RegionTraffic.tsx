"use client";

import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
export default function RegionTraffic() {
  const [regions, setRegions] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/analytics/traffic/region`)
      .then((r) => r.json())
      .then((j) => setRegions(j.regions || []))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="bg-[var(--background-card)] dark:bg-[var(--bgCard)] border border-[var(--borderColor)] rounded-xl p-6">
      <h3 className="text-lg font-semibold text-[var(--textPrimary)] mb-4">Top Regions</h3>
      <ul className="space-y-2">
        {regions.slice(0, 10).map((r: any, i: number) => (
          <li key={i} className="flex justify-between items-center">
            <div>
              <div className="text-[var(--textPrimary)] font-medium">
                {r._id.country} — {r._id.region}
              </div>
              <div className="text-[var(--textSecondary)] text-sm">
                {r.visits} visits
              </div>
            </div>
            <div style={{ width: 140 }}>
              <div
                className="h-2 rounded-full bg-[var(--borderColor)]"
                style={{ position: "relative", overflow: "hidden" }}
              >
                <div
                  style={{
                    width: `${Math.min(100, (r.visits / (regions[0]?.visits || 1)) * 100)}%`,
                    height: "100%",
                    background: "linear-gradient(90deg, var(--accent-green,#1DBE6E), #16a34a)",
                  }}
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
