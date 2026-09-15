import type { StyleSpecification } from "maplibre-gl";

/**
 * Keyless MapLibre style. OSM.org raster tiles are often blocked; CARTO’s
 * public raster CDN now watermarks “API KEY REQUIRED”. OpenFreeMap serves
 * OpenStreetMap vector tiles with no key.
 * @see https://openfreemap.org/quick_start/
 */
export const OSM_STYLE: string | StyleSpecification =
  "https://tiles.openfreemap.org/styles/positron";
