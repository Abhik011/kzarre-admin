/*
  land-path.js
  -----------------
  Exports an async function `getLandPath(width, height)` that returns a medium-detail
  SVG path string (the world's land outline) using the TopoJSON files from the
  world-atlas package (derived from Natural Earth). This avoids embedding an enormous
  single `d` string in source control and gives you a ready-to-use `LAND_PATH` at runtime.

  Usage (browser / client-side):
    import { getLandPath } from './land-path';
    const pathString = await getLandPath(1200, 600); // returns an SVG "d" string for the land outline

  Notes:
  - This fetches a TopoJSON file from a CDN (jsDelivr / unpkg): world-atlas land-50m.json
  - It depends on `d3-geo` and `topojson-client` being available in your bundle.
    Install with: npm i d3-geo topojson-client

  Sources: world-atlas (pre-built TopoJSON from Natural Earth)
*/

import { geoPath, geoNaturalEarth1 } from 'd3-geo';
import { feature } from 'topojson-client';

// CDN URL for medium-detail (50m) land topology (derived from Natural Earth):
const LAND_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/land-50m.json';

/**
 * Fetches the world land topology and returns an SVG path `d` string for the whole land mass.
 * @param {number} width - target SVG width (used to fit the projection)
 * @param {number} height - target SVG height (used to fit the projection)
 * @returns {Promise<string>} - SVG path 'd' string representing land polygons
 */
export async function getLandPath(width = 1200, height = 600) {
  // Fetch TopoJSON (land-50m.json from world-atlas)
  const res = await fetch(LAND_TOPO_URL);
  if (!res.ok) throw new Error(`Failed to fetch land topology: ${res.status} ${res.statusText}`);
  const topo = await res.json();

  // Convert TopoJSON 'land' object to GeoJSON FeatureCollection
  const landGeo = feature(topo, topo.objects.land);

  // Create a Natural Earth projection and fit it to the target size
  const projection = geoNaturalEarth1().fitSize([width, height], landGeo);
  const pathGen = geoPath().projection(projection);

  // Generate and return the single path string for the land polygon(s)
  return pathGen(landGeo);
}

// Convenience default export that returns a promise resolving to the path string
export default getLandPath;
