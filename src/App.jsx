import { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

// ============================================================
// Price data
// ============================================================
const PRICE_DATA = [
  { placeId: "ChIJ7RQhju9zhlQR2Z0mfE2A_2E", name: "The Mighty Oak", coffee: 2.5, matcha: null, date: "2015-02-01" },
  { placeId: "ChIJyzUSdeNzhlQRkz3zRrw73Ow", name: "JJ Bean Coffee Roasters", coffee: 2.0, matcha: null, date: "2017-07-01" },
  { placeId: "ChIJrZUaoOFzhlQRm9cwZS-mgso", name: "The Federal Store", coffee: 3.0, matcha: 4.75, date: "2018-04-01" },
  { placeId: "ChIJL7wlu-NzhlQR_WJtTl2Njvw", name: "49th Parallel Café", coffee: 2.35, matcha: null, date: "2018-12-01" },
  { placeId: "ChIJNdmgdPdzhlQRPR6J87ewKck", name: "Trafiq Cafe & Bakery", coffee: 1.95, matcha: null, date: "2019-11-01" },
  { placeId: "ChIJyzUSdeNzhlQRkz3zRrw73Ow", name: "JJ Bean Coffee Roasters", coffee: 2.5, matcha: 3.0, date: "2020-02-01" },
  { placeId: "ChIJL7wlu-NzhlQR_WJtTl2Njvw", name: "49th Parallel Café", coffee: 3.35, matcha: null, date: "2020-03-01" },
  { placeId: "ChIJ7yPsb0ZzhlQRNImVVhLe8tE", name: "Thierry Mount Pleasant", coffee: 3.35, matcha: null, date: "2021-01-01" },
  { placeId: "ChIJO5zViwd0hlQRAFFNbhunA8Q", name: "Le Marché St. George", coffee: 2.98, matcha: 3.5, date: "2021-05-01" },
  { placeId: "ChIJtZ1vTmVzhlQRKYtkWL3vwHs", name: "Foglifter Coffee Roasters", coffee: 2.4, matcha: 5.5, date: "2021-07-01" },
  { placeId: "ChIJ7RQhju9zhlQR2Z0mfE2A_2E", name: "The Mighty Oak", coffee: 3.25, matcha: 5.95, date: "2021-09-01" },
  { placeId: "ChIJO5zViwd0hlQRAFFNbhunA8Q", name: "Le Marché St. George", coffee: null, matcha: 3.65, date: "2021-10-01" },
  { placeId: "ChIJ7yPsb0ZzhlQRNImVVhLe8tE", name: "Thierry Mount Pleasant", coffee: 3.5, matcha: null, date: "2021-12-01" },
  { placeId: "ChIJl9I8XuNzhlQRAQr1-4RURPk", name: "Caffe Mira", coffee: 2.55, matcha: 4.85, date: "2022-02-01" },
  { placeId: "ChIJL7wlu-NzhlQR_WJtTl2Njvw", name: "49th Parallel Café", coffee: 2.8, matcha: null, date: "2022-06-01" },
  { placeId: "ChIJsfgDqXtzhlQROoYf0PVhqPw", name: "Forecast Coffee", coffee: 3.25, matcha: 4.5, date: "2022-06-01" },
  { placeId: "ChIJR7sAXvdzhlQRSt1ypOZngjM", name: "Aperture Coffee Bar", coffee: 3.25, matcha: 4.75, date: "2022-07-01" },
  { placeId: "ChIJNdmgdPdzhlQRPR6J87ewKck", name: "Trafiq Cafe & Bakery", coffee: 2.75, matcha: null, date: "2022-07-01" },
  { placeId: "ChIJtZ1vTmVzhlQRKYtkWL3vwHs", name: "Foglifter Coffee Roasters", coffee: 2.7, matcha: 6.05, date: "2022-07-01" },
  { placeId: "ChIJl9I8XuNzhlQRAQr1-4RURPk", name: "Caffe Mira", coffee: null, matcha: 5.45, date: "2022-08-01" },
  { placeId: "ChIJL7wlu-NzhlQR_WJtTl2Njvw", name: "49th Parallel Café", coffee: 2.9, matcha: null, date: "2022-10-01" },
  { placeId: "ChIJ9emgfTZ1hlQRRUCs6rHblkM", name: "Breka Bakery & Café", coffee: 2.5, matcha: null, date: "2022-11-01" },
  { placeId: "ChIJL7wlu-NzhlQR_WJtTl2Njvw", name: "49th Parallel Café", coffee: 3.0, matcha: null, date: "2023-04-01" },
  { placeId: "ChIJsfgDqXtzhlQROoYf0PVhqPw", name: "Forecast Coffee", coffee: 3.75, matcha: 5.0, date: "2023-04-01" },
  { placeId: "ChIJixK5WvpzhlQREm9WCjjDUbY", name: "Liberty Bakery + Café", coffee: 2.5, matcha: 5.25, date: "2023-04-01" },
  { placeId: "ChIJ7RQhju9zhlQR2Z0mfE2A_2E", name: "The Mighty Oak", coffee: 3.75, matcha: 6.25, date: "2023-08-01" },
  { placeId: "ChIJ7yPsb0ZzhlQRNImVVhLe8tE", name: "Thierry Mount Pleasant", coffee: 3.95, matcha: 4.5, date: "2023-10-01" },
  { placeId: "ChIJtZ1vTmVzhlQRKYtkWL3vwHs", name: "Foglifter Coffee Roasters", coffee: 2.95, matcha: 6.65, date: "2023-10-01" },
  { placeId: "ChIJ7yPsb0ZzhlQRNImVVhLe8tE", name: "Thierry Mount Pleasant", coffee: 4.45, matcha: 4.95, date: "2024-05-01" },
  { placeId: "ChIJl9I8XuNzhlQRAQr1-4RURPk", name: "Caffe Mira", coffee: 2.65, matcha: 5.65, date: "2024-05-01" },
  { placeId: "ChIJO5zViwd0hlQRAFFNbhunA8Q", name: "Le Marché St. George", coffee: 3.0, matcha: 4.75, date: "2024-06-01" },
  { placeId: "ChIJyzUSdeNzhlQRkz3zRrw73Ow", name: "JJ Bean Coffee Roasters", coffee: 3.05, matcha: 5.2, date: "2024-07-01" },
  { placeId: "ChIJ7RQhju9zhlQR2Z0mfE2A_2E", name: "The Mighty Oak", coffee: 3.9, matcha: 6.25, date: "2024-07-01" },
  { placeId: "ChIJl9I8XuNzhlQRAQr1-4RURPk", name: "Caffe Mira", coffee: 3.0, matcha: 5.8, date: "2024-10-01" },
  { placeId: "ChIJmaXZ_KhxhlQRLi-vU-PIKUw", name: "Mercato di Luigi", coffee: 3.0, matcha: null, date: "2024-10-01" },
  { placeId: "ChIJNdmgdPdzhlQRPR6J87ewKck", name: "Trafiq Cafe & Bakery", coffee: 3.75, matcha: null, date: "2024-11-01" },
  { placeId: "ChIJtZ1vTmVzhlQRKYtkWL3vwHs", name: "Foglifter Coffee Roasters", coffee: 3.1, matcha: 7.0, date: "2024-11-01" },
  { placeId: "ChIJsfgDqXtzhlQROoYf0PVhqPw", name: "Forecast Coffee", coffee: 4.0, matcha: 6.2, date: "2025-01-01" },
  { placeId: "ChIJIboWjC5zhlQR_gjGB_hf8to", name: "Mishmish", coffee: 3.0, matcha: null, date: "2025-01-01" },
  { placeId: "ChIJn-m1c5lzhlQRzCO9ALp_kFA", name: "Slo Coffee Fraser St.", coffee: 3.5, matcha: 6.05, date: "2025-02-01" },
  { placeId: "ChIJ7RQhju9zhlQR2Z0mfE2A_2E", name: "The Mighty Oak", coffee: 3.9, matcha: 6.25, date: "2025-02-01" },
  { placeId: "ChIJR7sAXvdzhlQRSt1ypOZngjM", name: "Aperture Coffee Bar", coffee: 3.75, matcha: 5.25, date: "2025-04-01" },
  { placeId: "ChIJL7wlu-NzhlQR_WJtTl2Njvw", name: "49th Parallel Café", coffee: 3.5, matcha: null, date: "2025-06-01" },
  { placeId: "ChIJrZUaoOFzhlQRm9cwZS-mgso", name: "The Federal Store", coffee: 3.25, matcha: 5.75, date: "2025-06-01" },
  { placeId: "ChIJ9emgfTZ1hlQRRUCs6rHblkM", name: "Breka Bakery & Café", coffee: 2.75, matcha: 4.5, date: "2025-07-01" },
  { placeId: "ChIJO5zViwd0hlQRAFFNbhunA8Q", name: "Le Marché St. George", coffee: 3.25, matcha: 5.75, date: "2025-07-01" },
  { placeId: "ChIJNdmgdPdzhlQRPR6J87ewKck", name: "Trafiq Cafe & Bakery", coffee: 4.5, matcha: null, date: "2025-08-01" },
  { placeId: "ChIJIboWjC5zhlQR_gjGB_hf8to", name: "Mishmish", coffee: 3.5, matcha: null, date: "2025-08-01" },
  { placeId: "ChIJl9I8XuNzhlQRAQr1-4RURPk", name: "Caffe Mira", coffee: 3.0, matcha: 6.2, date: "2025-09-01" },
  { placeId: "ChIJn-m1c5lzhlQRzCO9ALp_kFA", name: "Slo Coffee Fraser St.", coffee: 3.65, matcha: 7.0, date: "2025-12-01" },
  { placeId: "ChIJmaXZ_KhxhlQRLi-vU-PIKUw", name: "Mercato di Luigi", coffee: 3.0, matcha: null, date: "2026-01-01" },
  { placeId: "ChIJ9emgfTZ1hlQRRUCs6rHblkM", name: "Breka Bakery & Café", coffee: 3.0, matcha: 4.75, date: "2026-02-01" },
  { placeId: "ChIJO5zViwd0hlQRAFFNbhunA8Q", name: "Le Marché St. George", coffee: 3.5, matcha: 6.0, date: "2026-02-01" },
  { placeId: "ChIJrZUaoOFzhlQRm9cwZS-mgso", name: "The Federal Store", coffee: 3.75, matcha: 6.25, date: "2026-02-01" },
  { placeId: "ChIJtZ1vTmVzhlQRKYtkWL3vwHs", name: "Foglifter Coffee Roasters", coffee: 3.3, matcha: 7.5, date: "2026-02-01" },
  { placeId: "ChIJ7yPsb0ZzhlQRNImVVhLe8tE", name: "Thierry Mount Pleasant", coffee: 4.95, matcha: 5.45, date: "2026-04-01" },
  { placeId: "ChIJtZ1vTmVzhlQRKYtkWL3vwHs", name: "Foglifter Coffee Roasters", coffee: 3.3, matcha: 7.4, date: "2026-05-01" },
];

const PLACE_COORDS = {
  "ChIJ9emgfTZ1hlQRRUCs6rHblkM": [-123.1009639, 49.2438398],
  "ChIJn-m1c5lzhlQRzCO9ALp_kFA": [-123.0899822, 49.2480315],
  "ChIJO5zViwd0hlQRAFFNbhunA8Q": [-123.0944347, 49.2457667],
  "ChIJR7sAXvdzhlQRSt1ypOZngjM": [-123.1008973, 49.2484508],
  "ChIJ7yPsb0ZzhlQRNImVVhLe8tE": [-123.099849,  49.2620964],
  "ChIJL7wlu-NzhlQR_WJtTl2Njvw": [-123.1007927, 49.2591539],
  "ChIJsfgDqXtzhlQROoYf0PVhqPw": [-123.1009593, 49.2584876],
  "ChIJrZUaoOFzhlQRm9cwZS-mgso": [-123.1032786, 49.2619028],
  "ChIJyzUSdeNzhlQRkz3zRrw73Ow": [-123.1009,    49.258272],
  "ChIJNdmgdPdzhlQRPR6J87ewKck": [-123.1009045, 49.2473288],
  "ChIJtZ1vTmVzhlQRKYtkWL3vwHs": [-123.1007379, 49.2531182],
  "ChIJIboWjC5zhlQR_gjGB_hf8to": [-123.0902091, 49.2538644],
  "ChIJl9I8XuNzhlQRAQr1-4RURPk": [-123.1010004, 49.2568449],
  "ChIJmaXZ_KhxhlQRLi-vU-PIKUw": [-123.0913208, 49.2595184],
  "ChIJixK5WvpzhlQREm9WCjjDUbY": [-123.1012221, 49.251916],
  "ChIJ7RQhju9zhlQR2Z0mfE2A_2E": [-123.1096174, 49.2545595],
};

// ============================================================
// Marker SVG templates
// ============================================================
const coffeeMarkerSVG = (price) => `
  <svg viewBox="0 0 110 120" width="60" xmlns="http://www.w3.org/2000/svg">
    <path d="M 25 50 L 30 95 Q 30 100 35 100 L 65 100 Q 70 100 70 95 L 75 50 Z"
          fill="#FFFFFF" stroke="#5C3A1E" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M 28 70 L 72 70 L 70 82 L 30 82 Z"
          fill="#C89070" stroke="#5C3A1E" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="50" cy="50" rx="25" ry="5" fill="#3D2817" stroke="#5C3A1E" stroke-width="2.5"/>
    <ellipse cx="50" cy="50" rx="21" ry="3.5" fill="#4A2C18"/>
    <circle cx="80" cy="25" r="22" fill="#FFD4DC" stroke="#E89BAB" stroke-width="2"/>
    <text x="80" y="25" font-family="Work Sans, sans-serif" font-size="11" font-weight="600"
          fill="#8B4A5C" text-anchor="middle" dominant-baseline="central">${price}</text>
  </svg>
`;

const matchaMarkerSVG = (price) => `
  <svg viewBox="0 0 110 120" width="60" xmlns="http://www.w3.org/2000/svg">
    <path d="M 25 50 L 30 95 Q 30 100 35 100 L 65 100 Q 70 100 70 95 L 75 50 Z"
          fill="#F5E6D3" stroke="#8B6F47" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="50" cy="50" rx="25" ry="5" fill="#FFFFFF" stroke="#8B6F47" stroke-width="2.5"/>
    <ellipse cx="50" cy="50" rx="21" ry="3.5" fill="#A8C97F"/>
    <path d="M 75 60 Q 88 60 88 72 Q 88 84 75 84"
          fill="none" stroke="#8B6F47" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="80" cy="25" r="22" fill="#FFD4DC" stroke="#E89BAB" stroke-width="2"/>
    <text x="80" y="25" font-family="Work Sans, sans-serif" font-size="11" font-weight="600"
          fill="#8B4A5C" text-anchor="middle" dominant-baseline="central">${price}</text>
  </svg>
`;

// ============================================================
// Filter: only observations from exactly the given year.
// If a café has multiple observations in that year, keep the latest.
// ============================================================
function getCafesForYear(year) {
  const start = `${year}-01-01`;
  const end = `${year}-12-31`;
  const latest = new Map();
  for (const row of PRICE_DATA) {
    if (row.date < start || row.date > end) continue;
    const existing = latest.get(row.placeId);
    if (!existing || row.date > existing.date) {
      latest.set(row.placeId, row);
    }
  }
  return Array.from(latest.values());
}

function App() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [year, setYear] = useState(2026);
  const [mapReady, setMapReady] = useState(false);

  // ----- Create the map once on mount -----
  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright',
      center: [-123.100, 49.254],
      zoom: 14,
    });

    mapRef.current.on('load', () => {
      setMapReady(true);
    
      const roadColors = {
        'highway-motorway': '#8BA5C1',
        'highway-trunk': '#D8E0E7',
        'highway-minor': '#D8E0E7'
      };
    
      Object.entries(roadColors).forEach(([layerId, color]) => {
        mapRef.current.setPaintProperty(layerId, 'line-color', color);
      });
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ----- Re-render markers whenever year changes -----
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    // Remove old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const cafes = getCafesForYear(year);
    for (const cafe of cafes) {
      const coords = PLACE_COORDS[cafe.placeId];
      if (!coords) continue;

      if (cafe.coffee != null) {
        const el = document.createElement('div');
        el.innerHTML = coffeeMarkerSVG(`$${cafe.coffee.toFixed(2)}`);
        el.title = cafe.name;
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([coords[0] - 0.0002, coords[1]])
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      }

      if (cafe.matcha != null) {
        const el = document.createElement('div');
        el.innerHTML = matchaMarkerSVG(`$${cafe.matcha.toFixed(2)}`);
        el.title = cafe.name;
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([coords[0] + 0.0002, coords[1]])
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      }
    }
  }, [year, mapReady]);

  // ----- Compute averages and count for the current year -----
  const { avgCoffee, avgMatcha, count } = useMemo(() => {
    const cafes = getCafesForYear(year);
    const coffees = cafes.map(c => c.coffee).filter(p => p != null);
    const matchas = cafes.map(c => c.matcha).filter(p => p != null);
    const mean = arr => arr.length
      ? arr.reduce((s, p) => s + p, 0) / arr.length
      : null;
    return {
      avgCoffee: mean(coffees),
      avgMatcha: mean(matchas),
      count: cafes.length,
    };
  }, [year]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div ref={mapContainer} style={{ position: 'absolute', inset: 0 }} />

      {/* Floating average price circles on the right */}
      <div style={styles.avgWrapper}>
        <div style={styles.avgCircle}>
          <div style={{fontSize:'22px', marginBottom:'-10px', marginTop: '-25px'}}>  <svg viewBox="0 0 110 120" width="60" xmlns="http://www.w3.org/2000/svg">
    <path d="M 25 50 L 30 95 Q 30 100 35 100 L 65 100 Q 70 100 70 95 L 75 50 Z"
          fill="#F5E6D3" stroke="#8B6F47" stroke-width="2.5" stroke-linejoin="round"/>
    <ellipse cx="50" cy="50" rx="25" ry="5" fill="#FFFFFF" stroke="#8B6F47" stroke-width="2.5"/>
    <ellipse cx="50" cy="50" rx="21" ry="3.5" fill="#A8C97F"/>
    <path d="M 75 60 Q 88 60 88 72 Q 88 84 75 84"
          fill="none" stroke="#8B6F47" stroke-width="2.5" stroke-linecap="round"/>
  </svg></div>
          <div style={styles.avgLabel}>matcha</div>
          <div style={styles.avgValue}>
            {avgMatcha != null ? `$${avgMatcha.toFixed(2)}` : '—'}
          </div>
        </div>
        <div style={styles.avgCircle}>
          <div style={{fontSize:'22px', marginBottom:'-10px', marginTop: '-25px'}}>  <svg viewBox="0 0 110 120" width="60" xmlns="http://www.w3.org/2000/svg">
    <path d="M 25 50 L 30 95 Q 30 100 35 100 L 65 100 Q 70 100 70 95 L 75 50 Z"
          fill="#FFFFFF" stroke="#5C3A1E" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M 28 70 L 72 70 L 70 82 L 30 82 Z"
          fill="#C89070" stroke="#5C3A1E" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="50" cy="50" rx="25" ry="5" fill="#3D2817" stroke="#5C3A1E" stroke-width="2.5"/>
    <ellipse cx="50" cy="50" rx="21" ry="3.5" fill="#4A2C18"/>
  </svg></div>
          <div style={styles.avgLabel}>coffee</div>
          <div style={styles.avgValue}>
            {avgCoffee != null ? `$${avgCoffee.toFixed(2)}` : '—'}
          </div>
        </div>
      </div>

      {/* Floating year slider at the bottom */}
      <div style={styles.timelineBar}>
        <div style={styles.timelineHeader}>
          <span style={styles.timelineLabel}>YEAR</span>
          <span style={styles.timelineYear}>{year}</span>
        </div>
        <input
          type="range"
          min="2015"
          max="2026"
          step="1"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value, 10))}
          style={styles.slider}
        />
        <div style={styles.timelineCount}>{count} cafés</div>
      </div>
    </div>
  );
}

// ============================================================
// Inline styles
// ============================================================
const styles = {
  avgWrapper: {
    position: 'absolute',
    top: '50%',
    right: '24px',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    zIndex: 100,
  },
  avgCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Work Sans, sans-serif',
    color: '#5A7A95',
    border: '1px solid rgba(255, 255, 255, 0.6)',
  },
  avgIcon: { fontSize: '22px', marginBottom: '-10px' },
  avgLabel: {
    fontSize: '10px',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    opacity: 0.7,
    marginBottom: '4px',
  },
  avgValue: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#8B4A5C',
    fontVariantNumeric: 'tabular-nums',
  },
  timelineBar: {
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(560px, calc(100vw - 48px))',
    background: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '16px',
    padding: '16px 24px',
    boxShadow: '0 8px 32px rgba(90, 122, 149, 0.18)',
    fontFamily: 'Work Sans, sans-serif',
    color: '#5A7A95',
    border: '1px solid rgba(255, 255, 255, 0.6)',
    zIndex: 100,
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '8px',
  },
  timelineLabel: {
    fontSize: '11px',
    letterSpacing: '3px',
    opacity: 0.7,
  },
  timelineYear: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#8B4A5C',
  },
  slider: {
    width: '100%',
    accentColor: '#E89BAB',
    cursor: 'pointer',
  },
  timelineCount: {
    fontSize: '12px',
    opacity: 0.6,
    textAlign: 'center',
    marginTop: '4px',
  },
};

export default App;
