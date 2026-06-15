import { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import './App.css';

const mapStyle = {
  "version": 8,
  "metadata": {},
  "sources": {
    "ne2_shaded": {
      "maxzoom": 6,
      "tileSize": 256,
      "tiles": [
        "https://tiles.openfreemap.org/natural_earth/ne2sr/{z}/{x}/{y}.png"
      ],
      "type": "raster"
    },
    "openmaptiles": {
      "type": "vector",
      "url": "https://tiles.openfreemap.org/planet"
    }
  },
  "sprite": "https://tiles.openfreemap.org/sprites/ofm_f384/ofm",
  "glyphs": "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf",
  "layers": [
    {
      "id": "background",
      "type": "background",
      "paint": {"background-color": "rgba(246, 245, 245, 1)"}
    },
    {
      "id": "landcover-glacier",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landcover",
      "filter": ["==", ["get", "subclass"], "glacier"],
      "paint": {
        "fill-color": "rgba(255, 255, 255, 1)",
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.9, 10, 0.3]
      }
    },
    {
      "id": "landuse-residential",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landuse",
      "filter": [
        "match",
        ["get", "class"],
        ["neighbourhood", "residential"],
        true,
        false
      ],
      "paint": {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["zoom"],
          12,
          "hsla(30,19%,90%,0.4)",
          16,
          "hsla(30,19%,90%,0.2)"
        ]
      }
    },
    {
      "id": "landuse-suburb",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landuse",
      "maxzoom": 10,
      "filter": ["==", ["get", "class"], "suburb"],
      "paint": {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8,
          "hsla(30,19%,90%,0.4)",
          10,
          "hsla(30,19%,90%,0.0)"
        ]
      }
    },
    {
      "id": "landuse-commercial",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landuse",
      "filter": [
        "all",
        ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false],
        ["==", ["get", "class"], "commercial"]
      ],
      "paint": {"fill-color": "rgba(246, 245, 245, 1)"}
    },
    {
      "id": "landuse-industrial",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landuse",
      "filter": [
        "all",
        ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false],
        [
          "match",
          ["get", "class"],
          ["dam", "garages", "industrial"],
          true,
          false
        ]
      ],
      "paint": {"fill-color": "rgba(246, 245, 245, 1)"}
    },
    {
      "id": "landuse-cemetery",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landuse",
      "filter": ["==", ["get", "class"], "cemetery"],
      "paint": {"fill-color": "rgba(246, 245, 245, 1)"}
    },
    {
      "id": "landuse-hospital",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landuse",
      "filter": ["==", ["get", "class"], "hospital"],
      "paint": {"fill-color": "rgba(246, 245, 245, 1)"}
    },
    {
      "id": "landuse-school",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landuse",
      "filter": ["==", ["get", "class"], "school"],
      "paint": {"fill-color": "rgba(246, 245, 245, 1)"}
    },
    {
      "id": "landuse-railway",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landuse",
      "filter": ["==", ["get", "class"], "railway"],
      "paint": {"fill-color": "rgba(246, 245, 245, 1)"}
    },
    {
      "id": "park",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "park",
      "filter": [
        "match",
        ["geometry-type"],
        ["MultiPolygon", "Polygon"],
        true,
        false
      ],
      "paint": {
        "fill-color": "rgba(195, 241, 213, 1)",
        "fill-opacity": [
          "interpolate",
          ["exponential", 1.8],
          ["zoom"],
          9,
          0.5,
          12,
          0.2
        ]
      }
    },
    {
      "id": "landcover-wood",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landcover",
      "filter": ["==", ["get", "class"], "wood"],
      "paint": {
        "fill-antialias": ["step", ["zoom"], false, 9, true],
        "fill-color": "rgba(195, 241, 213, 1)",
        "fill-opacity": 0.1,
        "fill-outline-color": "hsla(0,0%,0%,0.03)"
      }
    },
    {
      "id": "landcover-grass",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landcover",
      "filter": ["==", ["get", "class"], "grass"],
      "paint": {"fill-color": "rgba(195, 241, 213, 1)", "fill-opacity": 1}
    },
    {
      "id": "landcover-grass-park",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "park",
      "filter": ["==", ["get", "class"], "public_park"],
      "paint": {"fill-color": "rgba(195, 241, 213, 1)", "fill-opacity": 0.8}
    },
    {
      "id": "waterway_tunnel",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "waterway",
      "minzoom": 14,
      "filter": [
        "all",
        ["match", ["get", "class"], ["canal", "river", "stream"], true, false],
        ["==", ["get", "brunnel"], "tunnel"]
      ],
      "layout": {"line-cap": "round"},
      "paint": {
        "line-color": "rgba(144, 218, 238, 1)",
        "line-dasharray": [2, 4],
        "line-width": [
          "interpolate",
          ["exponential", 1.3],
          ["zoom"],
          13,
          0.5,
          20,
          6
        ]
      }
    },
    {
      "id": "waterway-other",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "waterway",
      "filter": [
        "all",
        ["match", ["get", "class"], ["canal", "river", "stream"], false, true],
        ["==", ["get", "intermittent"], 0]
      ],
      "layout": {"line-cap": "round"},
      "paint": {
        "line-color": "rgba(144, 218, 238, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.3],
          ["zoom"],
          13,
          0.5,
          20,
          2
        ]
      }
    },
    {
      "id": "waterway-other-intermittent",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "waterway",
      "filter": [
        "all",
        ["match", ["get", "class"], ["canal", "river", "stream"], false, true],
        ["==", ["get", "intermittent"], 1]
      ],
      "layout": {"line-cap": "round"},
      "paint": {
        "line-color": "rgba(144, 218, 238, 1)",
        "line-dasharray": [4, 3],
        "line-width": [
          "interpolate",
          ["exponential", 1.3],
          ["zoom"],
          13,
          0.5,
          20,
          2
        ]
      }
    },
    {
      "id": "waterway-stream-canal",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "waterway",
      "filter": [
        "all",
        ["match", ["get", "class"], ["canal", "stream"], true, false],
        ["!=", ["get", "brunnel"], "tunnel"],
        ["==", ["get", "intermittent"], 0]
      ],
      "layout": {"line-cap": "round"},
      "paint": {
        "line-color": "rgba(144, 218, 238, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.3],
          ["zoom"],
          13,
          0.5,
          20,
          6
        ]
      }
    },
    {
      "id": "waterway-stream-canal-intermittent",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "waterway",
      "filter": [
        "all",
        ["match", ["get", "class"], ["canal", "stream"], true, false],
        ["!=", ["get", "brunnel"], "tunnel"],
        ["==", ["get", "intermittent"], 1]
      ],
      "layout": {"line-cap": "round"},
      "paint": {
        "line-color": "rgba(144, 218, 238, 1)",
        "line-dasharray": [4, 3],
        "line-width": [
          "interpolate",
          ["exponential", 1.3],
          ["zoom"],
          13,
          0.5,
          20,
          6
        ]
      }
    },
    {
      "id": "waterway-river",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "waterway",
      "filter": [
        "all",
        ["==", ["get", "class"], "river"],
        ["!=", ["get", "brunnel"], "tunnel"],
        ["!=", ["get", "intermittent"], 1]
      ],
      "layout": {"line-cap": "round"},
      "paint": {
        "line-color": "rgba(144, 218, 238, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          10,
          0.8,
          20,
          6
        ]
      }
    },
    {
      "id": "waterway-river-intermittent",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "waterway",
      "filter": [
        "all",
        ["==", ["get", "class"], "river"],
        ["!=", ["get", "brunnel"], "tunnel"],
        ["==", ["get", "intermittent"], 1]
      ],
      "layout": {"line-cap": "round"},
      "paint": {
        "line-color": "rgba(144, 218, 238, 1)",
        "line-dasharray": [3, 2.5],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          10,
          0.8,
          20,
          6
        ]
      }
    },
    {
      "id": "water",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "water",
      "filter": [
        "all",
        ["!=", ["get", "intermittent"], 1],
        ["!=", ["get", "brunnel"], "tunnel"]
      ],
      "paint": {"fill-color": "rgba(144, 218, 238, 1)"}
    },
    {
      "id": "water-intermittent",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "water",
      "filter": ["==", ["get", "intermittent"], 1],
      "paint": {"fill-color": "rgba(160, 200, 240, 1)", "fill-opacity": 0.7}
    },
    {
      "id": "landcover-ice-shelf",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landcover",
      "filter": ["==", ["get", "subclass"], "ice_shelf"],
      "paint": {
        "fill-color": "#fff",
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.9, 10, 0.3]
      }
    },
    {
      "id": "landcover-sand",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "landcover",
      "filter": ["==", ["get", "class"], "sand"],
      "paint": {"fill-color": "rgba(247, 236, 207, 1)", "fill-opacity": 1}
    },
    {
      "id": "building",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "building",
      "paint": {
        "fill-antialias": true,
        "fill-color": [
          "interpolate",
          ["linear"],
          ["zoom"],
          15.5,
          "#f2eae2",
          16,
          "#dfdbd7"
        ]
      }
    },
    {
      "id": "building-top",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "building",
      "paint": {
        "fill-color": "rgba(232, 233, 237, 1)",
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 16, 1],
        "fill-outline-color": "#dfdbd7",
        "fill-translate": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14,
          ["literal", [0, 0]],
          16,
          ["literal", [-2, -2]]
        ]
      }
    },
    {
      "id": "tunnel-service-track-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["match", ["get", "class"], ["service", "track"], true, false]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#cfcdca",
        "line-dasharray": [0.5, 0.25],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          15,
          1,
          16,
          4,
          20,
          11
        ]
      }
    },
    {
      "id": "tunnel-motorway-link-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["==", ["get", "class"], "motorway"],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(200, 147, 102, 1)",
        "line-dasharray": [0.5, 0.25],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12,
          1,
          13,
          3,
          14,
          4,
          20,
          15
        ]
      }
    },
    {
      "id": "tunnel-minor-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["==", ["get", "class"], "minor"]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#cfcdca",
        "line-dasharray": [0.5, 0.25],
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 12.5, 1],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12,
          0.5,
          13,
          1,
          14,
          4,
          20,
          15
        ]
      }
    },
    {
      "id": "tunnel-link-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        [
          "match",
          ["get", "class"],
          ["primary", "secondary", "tertiary", "trunk"],
          true,
          false
        ],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#e9ac77",
        "line-dasharray": [0.5, 0.25],
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12,
          1,
          13,
          3,
          14,
          4,
          20,
          15
        ]
      }
    },
    {
      "id": "tunnel-secondary-tertiary-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["match", ["get", "class"], ["secondary", "tertiary"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#e9ac77",
        "line-dasharray": [0.5, 0.25],
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          8,
          1.5,
          20,
          17
        ]
      }
    },
    {
      "id": "tunnel-trunk-primary-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["match", ["get", "class"], ["primary", "trunk"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#e9ac77",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          5,
          0.4,
          6,
          0.6,
          7,
          1.5,
          20,
          22
        ]
      }
    },
    {
      "id": "tunnel-motorway-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["==", ["get", "class"], "motorway"],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#e9ac77",
        "line-dasharray": [0.5, 0.25],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          5,
          0.4,
          6,
          0.6,
          7,
          1.5,
          20,
          22
        ]
      }
    },
    {
      "id": "tunnel-path",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["==", ["get", "brunnel"], "tunnel"],
        ["==", ["get", "class"], "path"]
      ],
      "paint": {
        "line-color": "#cba",
        "line-dasharray": [1.5, 0.75],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          15,
          1.2,
          20,
          4
        ]
      }
    },
    {
      "id": "tunnel-motorway-link",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["==", ["get", "class"], "motorway"],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(244, 209, 158, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12.5,
          0,
          13,
          1.5,
          14,
          2.5,
          20,
          11.5
        ]
      }
    },
    {
      "id": "tunnel-service-track",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["match", ["get", "class"], ["service", "track"], true, false]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#fff",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          15.5,
          0,
          16,
          2,
          20,
          7.5
        ]
      }
    },
    {
      "id": "tunnel-link",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        [
          "match",
          ["get", "class"],
          ["primary", "secondary", "tertiary", "trunk"],
          true,
          false
        ],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#fff4c6",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12.5,
          0,
          13,
          1.5,
          14,
          2.5,
          20,
          11.5
        ]
      }
    },
    {
      "id": "tunnel-minor",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["==", ["get", "class"], "minor"]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#fff",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          13.5,
          0,
          14,
          2.5,
          20,
          11.5
        ]
      }
    },
    {
      "id": "tunnel-secondary-tertiary",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["match", ["get", "class"], ["secondary", "tertiary"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#fff4c6",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          6.5,
          0,
          7,
          0.5,
          20,
          10
        ]
      }
    },
    {
      "id": "tunnel-trunk-primary",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["match", ["get", "class"], ["primary", "trunk"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#fff4c6",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          6.5,
          0,
          7,
          0.5,
          20,
          18
        ]
      }
    },
    {
      "id": "tunnel-motorway",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["==", ["get", "class"], "motorway"],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "#ffdaa6",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          6.5,
          0,
          7,
          0.5,
          20,
          18
        ]
      }
    },
    {
      "id": "tunnel-railway",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "tunnel"],
        ["==", ["get", "class"], "rail"]
      ],
      "paint": {
        "line-color": "#bbb",
        "line-dasharray": [2, 2],
        "line-width": [
          "interpolate",
          ["exponential", 1.4],
          ["zoom"],
          14,
          0.4,
          15,
          0.75,
          20,
          2
        ]
      }
    },
    {
      "id": "ferry",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": ["match", ["get", "class"], ["ferry"], true, false],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(108, 159, 182, 1)",
        "line-dasharray": [2, 2],
        "line-width": 1.1
      }
    },
    {
      "id": "aeroway-taxiway-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "aeroway",
      "minzoom": 12,
      "filter": ["match", ["get", "class"], ["taxiway"], true, false],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(153, 153, 153, 1)",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          11,
          2,
          17,
          12
        ]
      }
    },
    {
      "id": "aeroway-runway-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "aeroway",
      "minzoom": 12,
      "filter": ["match", ["get", "class"], ["runway"], true, false],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(153, 153, 153, 1)",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          11,
          5,
          17,
          55
        ]
      }
    },
    {
      "id": "aeroway-area",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "aeroway",
      "minzoom": 4,
      "filter": [
        "all",
        ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false],
        ["match", ["get", "class"], ["runway", "taxiway"], true, false]
      ],
      "paint": {
        "fill-color": "rgba(255, 255, 255, 1)",
        "fill-opacity": ["interpolate", ["linear"], ["zoom"], 13, 0, 14, 1]
      }
    },
    {
      "id": "aeroway-taxiway",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "aeroway",
      "minzoom": 4,
      "filter": [
        "all",
        ["match", ["get", "class"], ["taxiway"], true, false],
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(255, 255, 255, 1)",
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0, 12, 1],
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          11,
          1,
          17,
          10
        ]
      }
    },
    {
      "id": "aeroway-runway",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "aeroway",
      "minzoom": 4,
      "filter": [
        "all",
        ["match", ["get", "class"], ["runway"], true, false],
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(255, 255, 255, 1)",
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 11, 0, 12, 1],
        "line-width": [
          "interpolate",
          ["exponential", 1.5],
          ["zoom"],
          11,
          4,
          17,
          50
        ]
      }
    },
    {
      "id": "road_area_pier",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false],
        ["==", ["get", "class"], "pier"]
      ],
      "paint": {"fill-antialias": true, "fill-color": "rgba(138, 164, 192, 1)"}
    },
    {
      "id": "road_pier",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["match", ["get", "class"], ["pier"], true, false]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(138, 164, 192, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          15,
          1,
          17,
          4
        ]
      }
    },
    {
      "id": "highway-area",
      "type": "fill",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["match", ["geometry-type"], ["MultiPolygon", "Polygon"], true, false],
        ["match", ["get", "class"], ["pier"], false, true]
      ],
      "paint": {
        "fill-antialias": false,
        "fill-color": "hsla(0,0%,89%,0.56)",
        "fill-opacity": 0.9,
        "fill-outline-color": "#cfcdca"
      }
    },
    {
      "id": "highway-motorway-link-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["==", ["get", "class"], "motorway"],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(138, 164, 192, 1)",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12,
          1,
          13,
          3,
          14,
          4,
          20,
          15
        ]
      }
    },
    {
      "id": "highway-link-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "minzoom": 13,
      "filter": [
        "all",
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        [
          "match",
          ["get", "class"],
          ["primary", "secondary", "tertiary", "trunk"],
          true,
          false
        ],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {
        "line-cap": "round",
        "line-join": "round",
        "visibility": "visible"
      },
      "paint": {
        "line-color": "rgba(138, 164, 192, 1)",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12,
          1,
          13,
          3,
          14,
          4,
          20,
          15
        ]
      }
    },
    {
      "id": "highway-minor-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["!=", ["get", "brunnel"], "tunnel"],
        ["match", ["get", "class"], ["minor", "service", "track"], true, false]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(216, 224, 231, 1)",
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 12.5, 1],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12,
          0.5,
          13,
          1,
          14,
          4,
          20,
          15
        ]
      }
    },
    {
      "id": "highway-secondary-tertiary-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["match", ["get", "class"], ["secondary", "tertiary"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-cap": "butt", "line-join": "round"},
      "paint": {
        "line-color": "rgba(138, 164, 192, 1)",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          8,
          1.5,
          20,
          17
        ]
      }
    },
    {
      "id": "highway-primary-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "minzoom": 5,
      "filter": [
        "all",
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["match", ["get", "class"], ["primary"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-cap": "butt", "line-join": "round"},
      "paint": {
        "line-color": "rgba(138, 164, 192, 1)",
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          7,
          0,
          8,
          0.6,
          9,
          1.5,
          20,
          22
        ]
      }
    },
    {
      "id": "highway-trunk-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "minzoom": 5,
      "filter": [
        "all",
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["match", ["get", "class"], ["trunk"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-cap": "butt", "line-join": "round"},
      "paint": {
        "line-color": "rgba(138, 164, 192, 1)",
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 5, 0, 6, 1],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          5,
          0,
          6,
          0.6,
          7,
          1.5,
          20,
          22
        ]
      }
    },
    {
      "id": "highway-motorway-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "minzoom": 4,
      "filter": [
        "all",
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["==", ["get", "class"], "motorway"],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-cap": "butt", "line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 4, 0, 5, 1],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          4,
          0,
          5,
          0.4,
          6,
          0.6,
          7,
          1.5,
          20,
          22
        ]
      }
    },
    {
      "id": "highway-path",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["==", ["get", "class"], "path"]
      ],
      "paint": {
        "line-color": "rgba(216, 224, 231, 1)",
        "line-dasharray": [1.5, 0.75],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          15,
          1.2,
          20,
          4
        ]
      }
    },
    {
      "id": "highway-motorway-link",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "minzoom": 12,
      "filter": [
        "all",
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["==", ["get", "class"], "motorway"],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(216, 224, 231, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12.5,
          0,
          13,
          1.5,
          14,
          2.5,
          20,
          11.5
        ]
      }
    },
    {
      "id": "highway-link",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "minzoom": 13,
      "filter": [
        "all",
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        [
          "match",
          ["get", "class"],
          ["primary", "secondary", "tertiary", "trunk"],
          true,
          false
        ],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(216, 224, 231, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12.5,
          0,
          13,
          1.5,
          14,
          2.5,
          20,
          11.5
        ]
      }
    },
    {
      "id": "highway-minor",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["!=", ["get", "brunnel"], "tunnel"],
        ["match", ["get", "class"], ["minor", "service", "track"], true, false]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(216, 224, 231, 1)",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          13.5,
          0,
          14,
          2.5,
          20,
          11.5
        ]
      }
    },
    {
      "id": "highway-secondary-tertiary",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["match", ["get", "class"], ["secondary", "tertiary"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(216, 224, 231, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          6.5,
          0,
          8,
          0.5,
          20,
          13
        ]
      }
    },
    {
      "id": "highway-primary",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["match", ["get", "class"], ["primary"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          8.5,
          0,
          9,
          0.5,
          20,
          18
        ]
      }
    },
    {
      "id": "highway-trunk",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["match", ["get", "class"], ["trunk"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(216, 224, 231, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          6.5,
          0,
          7,
          0.5,
          20,
          18
        ]
      }
    },
    {
      "id": "highway-motorway",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "minzoom": 5,
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["==", ["get", "class"], "motorway"],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(216, 224, 231, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          6.5,
          0,
          7,
          0.5,
          20,
          18
        ]
      }
    },
    {
      "id": "railway-transit",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["==", ["get", "class"], "transit"],
        ["match", ["get", "brunnel"], ["tunnel"], false, true]
      ],
      "paint": {
        "line-color": "hsla(0,0%,73%,0.77)",
        "line-width": [
          "interpolate",
          ["exponential", 1.4],
          ["zoom"],
          14,
          0.4,
          20,
          1
        ]
      }
    },
    {
      "id": "railway-transit-hatching",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["==", ["get", "class"], "transit"],
        ["match", ["get", "brunnel"], ["tunnel"], false, true]
      ],
      "paint": {
        "line-color": "hsla(0,0%,73%,0.68)",
        "line-dasharray": [0.2, 8],
        "line-width": [
          "interpolate",
          ["exponential", 1.4],
          ["zoom"],
          14.5,
          0,
          15,
          2,
          20,
          6
        ]
      }
    },
    {
      "id": "railway-service",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["==", ["get", "class"], "rail"],
        ["has", "service"]
      ],
      "paint": {
        "line-color": "hsla(0,0%,73%,0.77)",
        "line-width": [
          "interpolate",
          ["exponential", 1.4],
          ["zoom"],
          14,
          0.4,
          20,
          1
        ]
      }
    },
    {
      "id": "railway-service-hatching",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["==", ["get", "class"], "rail"],
        ["has", "service"]
      ],
      "paint": {
        "line-color": "hsla(0,0%,73%,0.68)",
        "line-dasharray": [0.2, 8],
        "line-width": [
          "interpolate",
          ["exponential", 1.4],
          ["zoom"],
          14.5,
          0,
          15,
          2,
          20,
          6
        ]
      }
    },
    {
      "id": "railway",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["!", ["has", "service"]],
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["==", ["get", "class"], "rail"]
      ],
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.4],
          ["zoom"],
          14,
          0.4,
          15,
          0.75,
          20,
          2
        ]
      }
    },
    {
      "id": "railway-hatching",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["!", ["has", "service"]],
        ["match", ["get", "brunnel"], ["bridge", "tunnel"], false, true],
        ["==", ["get", "class"], "rail"]
      ],
      "paint": {
        "line-color": "#bbb",
        "line-dasharray": [0.2, 8],
        "line-width": [
          "interpolate",
          ["exponential", 1.4],
          ["zoom"],
          14.5,
          0,
          15,
          3,
          20,
          8
        ]
      }
    },
    {
      "id": "bridge-motorway-link-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        ["==", ["get", "class"], "motorway"],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12,
          1,
          13,
          3,
          14,
          4,
          20,
          19
        ]
      }
    },
    {
      "id": "bridge-link-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        [
          "match",
          ["get", "class"],
          ["primary", "secondary", "tertiary", "trunk"],
          true,
          false
        ],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12,
          1,
          13,
          3,
          14,
          4,
          20,
          19
        ]
      }
    },
    {
      "id": "bridge-secondary-tertiary-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        ["match", ["get", "class"], ["secondary", "tertiary"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          5,
          0.4,
          7,
          0.6,
          8,
          1.5,
          20,
          21
        ]
      }
    },
    {
      "id": "bridge-trunk-primary-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        ["match", ["get", "class"], ["primary", "trunk"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          5,
          0.4,
          6,
          0.6,
          7,
          1.5,
          20,
          26
        ]
      }
    },
    {
      "id": "bridge-motorway-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        ["==", ["get", "class"], "motorway"],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          5,
          0.4,
          6,
          0.6,
          7,
          1.5,
          20,
          26
        ]
      }
    },
    {
      "id": "bridge-minor-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["==", ["get", "brunnel"], "bridge"],
        ["match", ["get", "class"], ["minor", "service", "track"], true, false]
      ],
      "layout": {"line-cap": "butt", "line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 12, 0, 12.5, 1],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12,
          0.5,
          13,
          1,
          14,
          6,
          20,
          24
        ]
      }
    },
    {
      "id": "bridge-path-casing",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["==", ["get", "brunnel"], "bridge"],
        ["==", ["get", "class"], "path"]
      ],
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          15,
          1.2,
          20,
          18
        ]
      }
    },
    {
      "id": "bridge-path",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["==", ["get", "brunnel"], "bridge"],
        ["==", ["get", "class"], "path"]
      ],
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-dasharray": [1.5, 0.75],
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          15,
          1.2,
          20,
          4
        ]
      }
    },
    {
      "id": "bridge-motorway-link",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        ["==", ["get", "class"], "motorway"],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12.5,
          0,
          13,
          1.5,
          14,
          2.5,
          20,
          11.5
        ]
      }
    },
    {
      "id": "bridge-link",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        [
          "match",
          ["get", "class"],
          ["primary", "secondary", "tertiary", "trunk"],
          true,
          false
        ],
        ["==", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          12.5,
          0,
          13,
          1.5,
          14,
          2.5,
          20,
          11.5
        ]
      }
    },
    {
      "id": "bridge-minor",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["==", ["get", "brunnel"], "bridge"],
        ["match", ["get", "class"], ["minor", "service", "track"], true, false]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-opacity": 1,
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          13.5,
          0,
          14,
          2.5,
          20,
          11.5
        ]
      }
    },
    {
      "id": "bridge-secondary-tertiary",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        ["match", ["get", "class"], ["secondary", "tertiary"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          6.5,
          0,
          8,
          0.5,
          20,
          13
        ]
      }
    },
    {
      "id": "bridge-trunk-primary",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        ["match", ["get", "class"], ["primary", "trunk"], true, false],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          6.5,
          0,
          7,
          0.5,
          20,
          18
        ]
      }
    },
    {
      "id": "bridge-motorway",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        ["==", ["get", "class"], "motorway"],
        ["!=", ["get", "ramp"], 1]
      ],
      "layout": {"line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          6.5,
          0,
          7,
          0.5,
          20,
          18
        ]
      }
    },
    {
      "id": "bridge-railway",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        ["==", ["get", "class"], "rail"]
      ],
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": [
          "interpolate",
          ["exponential", 1.4],
          ["zoom"],
          14,
          0.4,
          15,
          0.75,
          20,
          2
        ]
      }
    },
    {
      "id": "bridge-railway-hatching",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "filter": [
        "all",
        ["==", ["get", "brunnel"], "bridge"],
        ["==", ["get", "class"], "rail"]
      ],
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-dasharray": [0.2, 8],
        "line-width": [
          "interpolate",
          ["exponential", 1.4],
          ["zoom"],
          14.5,
          0,
          15,
          3,
          20,
          8
        ]
      }
    },
    {
      "id": "cablecar",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "minzoom": 13,
      "filter": ["==", ["get", "subclass"], "cable_car"],
      "layout": {"line-cap": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-width": ["interpolate", ["linear"], ["zoom"], 11, 1, 19, 2.5]
      }
    },
    {
      "id": "cablecar-dash",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "minzoom": 13,
      "filter": ["==", ["get", "subclass"], "cable_car"],
      "layout": {"line-cap": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-dasharray": [2, 3],
        "line-width": ["interpolate", ["linear"], ["zoom"], 11, 3, 19, 5.5]
      }
    },
    {
      "id": "boundary_3",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "boundary",
      "minzoom": 5,
      "filter": [
        "all",
        [">=", ["get", "admin_level"], 3],
        ["<=", ["get", "admin_level"], 6],
        ["!=", ["get", "maritime"], 1],
        ["!=", ["get", "disputed"], 1],
        ["!", ["has", "claimed_by"]]
      ],
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-dasharray": [1, 1],
        "line-width": ["interpolate", ["linear", 1], ["zoom"], 7, 1, 11, 2]
      }
    },
    {
      "id": "boundary_2",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "boundary",
      "filter": [
        "all",
        ["==", ["get", "admin_level"], 2],
        ["!=", ["get", "maritime"], 1],
        ["!=", ["get", "disputed"], 1],
        ["!", ["has", "claimed_by"]]
      ],
      "layout": {"line-cap": "round", "line-join": "round"},
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.4, 4, 1],
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1, 5, 1.2, 12, 3]
      }
    },
    {
      "id": "boundary_disputed",
      "type": "line",
      "source": "openmaptiles",
      "source-layer": "boundary",
      "filter": [
        "all",
        ["!=", ["get", "maritime"], 1],
        ["==", ["get", "disputed"], 1]
      ],
      "paint": {
        "line-color": "rgba(139, 165, 193, 1)",
        "line-dasharray": [1, 2],
        "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1, 5, 1.2, 12, 3]
      }
    },
    {
      "id": "road_oneway",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "minzoom": 15,
      "filter": [
        "all",
        ["==", ["get", "oneway"], 1],
        [
          "match",
          ["get", "class"],
          [
            "minor",
            "motorway",
            "primary",
            "secondary",
            "service",
            "tertiary",
            "trunk"
          ],
          true,
          false
        ]
      ],
      "layout": {
        "icon-image": "oneway",
        "icon-padding": 2,
        "icon-rotate": 90,
        "icon-rotation-alignment": "map",
        "icon-size": ["interpolate", ["linear"], ["zoom"], 15, 0.5, 19, 1],
        "symbol-placement": "line",
        "symbol-spacing": 75
      },
      "paint": {"icon-opacity": 0.5}
    },
    {
      "id": "road_oneway_opposite",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "transportation",
      "minzoom": 15,
      "filter": [
        "all",
        ["==", ["get", "oneway"], -1],
        [
          "match",
          ["get", "class"],
          [
            "minor",
            "motorway",
            "primary",
            "secondary",
            "service",
            "tertiary",
            "trunk"
          ],
          true,
          false
        ]
      ],
      "layout": {
        "icon-image": "oneway",
        "icon-padding": 2,
        "icon-rotate": -90,
        "icon-rotation-alignment": "map",
        "icon-size": ["interpolate", ["linear"], ["zoom"], 15, 0.5, 19, 1],
        "symbol-placement": "line",
        "symbol-spacing": 75
      },
      "paint": {"icon-opacity": 0.5}
    },
    {
      "id": "waterway_line_label",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "waterway",
      "minzoom": 10,
      "filter": [
        "match",
        ["geometry-type"],
        ["LineString", "MultiLineString"],
        true,
        false
      ],
      "layout": {
        "symbol-placement": "line",
        "symbol-spacing": 350,
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], " ", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Italic"],
        "text-letter-spacing": 0.2,
        "text-max-width": 5,
        "text-size": 14
      },
      "paint": {
        "text-color": "#74aee9",
        "text-halo-color": "rgba(255,255,255,0.7)",
        "text-halo-width": 1.5
      }
    },
    {
      "id": "water_name_point_label",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "water_name",
      "filter": [
        "match",
        ["geometry-type"],
        ["MultiPoint", "Point"],
        true,
        false
      ],
      "layout": {
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Italic"],
        "text-letter-spacing": 0.2,
        "text-max-width": 5,
        "text-size": ["interpolate", ["linear"], ["zoom"], 0, 10, 8, 14]
      },
      "paint": {
        "text-color": "#495e91",
        "text-halo-color": "rgba(255,255,255,0.7)",
        "text-halo-width": 1.5
      }
    },
    {
      "id": "water_name_line_label",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "water_name",
      "filter": [
        "match",
        ["geometry-type"],
        ["LineString", "MultiLineString"],
        true,
        false
      ],
      "layout": {
        "symbol-placement": "line",
        "symbol-spacing": 350,
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], " ", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Italic"],
        "text-letter-spacing": 0.2,
        "text-max-width": 5,
        "text-size": 14
      },
      "paint": {
        "text-color": "#495e91",
        "text-halo-color": "rgba(255,255,255,0.7)",
        "text-halo-width": 1.5
      }
    },
    {
      "id": "poi_r20",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "poi",
      "minzoom": 17,
      "filter": [
        "all",
        ["match", ["geometry-type"], ["MultiPoint", "Point"], true, false],
        [">=", ["get", "rank"], 20]
      ],
      "layout": {
        "icon-image": [
          "match",
          ["get", "subclass"],
          ["florist", "furniture"],
          ["get", "subclass"],
          ["get", "class"]
        ],
        "text-anchor": "top",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Italic"],
        "text-max-width": 9,
        "text-offset": [0, 0.6],
        "text-size": 12
      },
      "paint": {
        "text-color": "#666",
        "text-halo-blur": 0.5,
        "text-halo-color": "#ffffff",
        "text-halo-width": 1
      }
    },
    {
      "id": "poi_r7",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "poi",
      "minzoom": 16,
      "filter": [
        "all",
        ["match", ["geometry-type"], ["MultiPoint", "Point"], true, false],
        [">=", ["get", "rank"], 7],
        ["<", ["get", "rank"], 20]
      ],
      "layout": {
        "icon-image": [
          "match",
          ["get", "subclass"],
          ["florist", "furniture"],
          ["get", "subclass"],
          ["get", "class"]
        ],
        "text-anchor": "top",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Italic"],
        "text-max-width": 9,
        "text-offset": [0, 0.6],
        "text-size": 12
      },
      "paint": {
        "text-color": "#666",
        "text-halo-blur": 0.5,
        "text-halo-color": "#ffffff",
        "text-halo-width": 1
      }
    },
    {
      "id": "poi_r1",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "poi",
      "minzoom": 15,
      "filter": [
        "all",
        ["match", ["geometry-type"], ["MultiPoint", "Point"], true, false],
        [">=", ["get", "rank"], 1],
        ["<", ["get", "rank"], 7]
      ],
      "layout": {
        "icon-image": [
          "match",
          ["get", "subclass"],
          ["florist", "furniture"],
          ["get", "subclass"],
          ["get", "class"]
        ],
        "text-anchor": "top",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Italic"],
        "text-max-width": 9,
        "text-offset": [0, 0.6],
        "text-size": 12
      },
      "paint": {
        "text-color": "#666",
        "text-halo-blur": 0.5,
        "text-halo-color": "#ffffff",
        "text-halo-width": 1
      }
    },
    {
      "id": "poi_transit",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "poi",
      "filter": [
        "match",
        ["get", "class"],
        ["airport", "bus", "rail"],
        true,
        false
      ],
      "layout": {
        "icon-image": ["to-string", ["get", "class"]],
        "icon-size": 0.7,
        "text-anchor": "left",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Italic"],
        "text-max-width": 9,
        "text-offset": [0.9, 0],
        "text-size": 12
      },
      "paint": {
        "text-color": "#2e5a80",
        "text-halo-blur": 0.5,
        "text-halo-color": "#ffffff",
        "text-halo-width": 1
      }
    },
    {
      "id": "highway-name-path",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "transportation_name",
      "minzoom": 15.5,
      "filter": ["==", ["get", "class"], "path"],
      "layout": {
        "symbol-placement": "line",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], " ", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Regular"],
        "text-rotation-alignment": "map",
        "text-size": ["interpolate", ["linear"], ["zoom"], 13, 12, 14, 13]
      },
      "paint": {
        "text-color": "hsl(30,23%,62%)",
        "text-halo-color": "#f8f4f0",
        "text-halo-width": 0.5
      }
    },
    {
      "id": "highway-name-minor",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "transportation_name",
      "minzoom": 15,
      "filter": [
        "all",
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["match", ["get", "class"], ["minor", "service", "track"], true, false]
      ],
      "layout": {
        "symbol-placement": "line",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], " ", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Regular"],
        "text-rotation-alignment": "map",
        "text-size": ["interpolate", ["linear"], ["zoom"], 13, 12, 14, 13]
      },
      "paint": {
        "text-color": "#666",
        "text-halo-blur": 0.5,
        "text-halo-width": 1
      }
    },
    {
      "id": "highway-name-major",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "transportation_name",
      "minzoom": 12.2,
      "filter": [
        "match",
        ["get", "class"],
        ["primary", "secondary", "tertiary", "trunk"],
        true,
        false
      ],
      "layout": {
        "symbol-placement": "line",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], " ", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Regular"],
        "text-rotation-alignment": "map",
        "text-size": ["interpolate", ["linear"], ["zoom"], 13, 12, 14, 13]
      },
      "paint": {
        "text-color": "#666",
        "text-halo-blur": 0.5,
        "text-halo-width": 1
      }
    },
    {
      "id": "highway-shield-non-us",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "transportation_name",
      "minzoom": 8,
      "filter": [
        "all",
        ["<=", ["get", "ref_length"], 6],
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        [
          "match",
          ["get", "network"],
          ["us-highway", "us-interstate", "us-state"],
          false,
          true
        ]
      ],
      "layout": {
        "icon-image": ["concat", "road_", ["get", "ref_length"]],
        "icon-rotation-alignment": "viewport",
        "icon-size": 1,
        "symbol-placement": ["step", ["zoom"], "point", 11, "line"],
        "symbol-spacing": 200,
        "text-field": ["to-string", ["get", "ref"]],
        "text-font": ["Noto Sans Regular"],
        "text-rotation-alignment": "viewport",
        "text-size": 10
      }
    },
    {
      "id": "highway-shield-us-interstate",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "transportation_name",
      "minzoom": 7,
      "filter": [
        "all",
        ["<=", ["get", "ref_length"], 6],
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["match", ["get", "network"], ["us-interstate"], true, false]
      ],
      "layout": {
        "icon-image": [
          "concat",
          ["get", "network"],
          "_",
          ["get", "ref_length"]
        ],
        "icon-rotation-alignment": "viewport",
        "icon-size": 1,
        "symbol-placement": ["step", ["zoom"], "point", 7, "line", 8, "line"],
        "symbol-spacing": 200,
        "text-field": ["to-string", ["get", "ref"]],
        "text-font": ["Noto Sans Regular"],
        "text-rotation-alignment": "viewport",
        "text-size": 10
      }
    },
    {
      "id": "road_shield_us",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "transportation_name",
      "minzoom": 9,
      "filter": [
        "all",
        ["<=", ["get", "ref_length"], 6],
        [
          "match",
          ["geometry-type"],
          ["LineString", "MultiLineString"],
          true,
          false
        ],
        ["match", ["get", "network"], ["us-highway", "us-state"], true, false]
      ],
      "layout": {
        "icon-image": [
          "concat",
          ["get", "network"],
          "_",
          ["get", "ref_length"]
        ],
        "icon-rotation-alignment": "viewport",
        "icon-size": 1,
        "symbol-placement": ["step", ["zoom"], "point", 11, "line"],
        "symbol-spacing": 200,
        "text-field": ["to-string", ["get", "ref"]],
        "text-font": ["Noto Sans Regular"],
        "text-rotation-alignment": "viewport",
        "text-size": 10
      }
    },
    {
      "id": "airport",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "aerodrome_label",
      "minzoom": 10,
      "filter": ["all", ["has", "iata"]],
      "layout": {
        "icon-image": "airport_11",
        "icon-size": 1,
        "text-anchor": "top",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Regular"],
        "text-max-width": 9,
        "text-offset": [0, 0.6],
        "text-optional": true,
        "text-padding": 2,
        "text-size": 12
      },
      "paint": {
        "text-color": "#666",
        "text-halo-blur": 0.5,
        "text-halo-color": "#ffffff",
        "text-halo-width": 1
      }
    },
    {
      "id": "label_other",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "place",
      "minzoom": 8,
      "filter": [
        "match",
        ["get", "class"],
        ["city", "continent", "country", "state", "town", "village"],
        false,
        true
      ],
      "layout": {
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Italic"],
        "text-letter-spacing": 0.1,
        "text-max-width": 9,
        "text-size": ["interpolate", ["linear"], ["zoom"], 8, 9, 12, 10],
        "text-transform": "uppercase"
      },
      "paint": {
        "text-color": "#333",
        "text-halo-blur": 1,
        "text-halo-color": "#fff",
        "text-halo-width": 1
      }
    },
    {
      "id": "label_village",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "place",
      "minzoom": 9,
      "filter": ["==", ["get", "class"], "village"],
      "layout": {
        "icon-allow-overlap": true,
        "icon-image": ["step", ["zoom"], "circle_11_black", 10, ""],
        "icon-optional": false,
        "icon-size": 0.2,
        "text-anchor": "bottom",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Regular"],
        "text-max-width": 8,
        "text-size": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          7,
          10,
          11,
          12
        ]
      },
      "paint": {
        "text-color": "#000",
        "text-halo-blur": 1,
        "text-halo-color": "#fff",
        "text-halo-width": 1
      }
    },
    {
      "id": "label_town",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "place",
      "minzoom": 6,
      "filter": ["==", ["get", "class"], "town"],
      "layout": {
        "icon-allow-overlap": true,
        "icon-image": ["step", ["zoom"], "circle_11_black", 10, ""],
        "icon-optional": false,
        "icon-size": 0.2,
        "text-anchor": "bottom",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Regular"],
        "text-max-width": 8,
        "text-size": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          7,
          12,
          11,
          14
        ]
      },
      "paint": {
        "text-color": "#000",
        "text-halo-blur": 1,
        "text-halo-color": "#fff",
        "text-halo-width": 1
      }
    },
    {
      "id": "label_state",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "place",
      "minzoom": 5,
      "maxzoom": 8,
      "filter": ["==", ["get", "class"], "state"],
      "layout": {
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Italic"],
        "text-letter-spacing": 0.2,
        "text-max-width": 9,
        "text-size": ["interpolate", ["linear"], ["zoom"], 5, 10, 8, 14],
        "text-transform": "uppercase"
      },
      "paint": {
        "text-color": "#333",
        "text-halo-blur": 1,
        "text-halo-color": "#fff",
        "text-halo-width": 1
      }
    },
    {
      "id": "label_city",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "place",
      "minzoom": 3,
      "filter": [
        "all",
        ["==", ["get", "class"], "city"],
        ["!=", ["get", "capital"], 2]
      ],
      "layout": {
        "icon-allow-overlap": true,
        "icon-image": ["step", ["zoom"], "circle_11_black", 9, ""],
        "icon-optional": false,
        "icon-size": 0.4,
        "text-anchor": "bottom",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Regular"],
        "text-max-width": 8,
        "text-offset": [0, -0.1],
        "text-size": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          4,
          11,
          7,
          13,
          11,
          18
        ]
      },
      "paint": {
        "text-color": "#000",
        "text-halo-blur": 1,
        "text-halo-color": "#fff",
        "text-halo-width": 1
      }
    },
    {
      "id": "label_city_capital",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "place",
      "minzoom": 3,
      "filter": [
        "all",
        ["==", ["get", "class"], "city"],
        ["==", ["get", "capital"], 2]
      ],
      "layout": {
        "icon-allow-overlap": true,
        "icon-image": ["step", ["zoom"], "circle_11_black", 9, ""],
        "icon-optional": false,
        "icon-size": 0.5,
        "text-anchor": "bottom",
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Bold"],
        "text-max-width": 8,
        "text-offset": [0, -0.2],
        "text-size": [
          "interpolate",
          ["exponential", 1.2],
          ["zoom"],
          4,
          12,
          7,
          14,
          11,
          20
        ]
      },
      "paint": {
        "text-color": "#000",
        "text-halo-blur": 1,
        "text-halo-color": "#fff",
        "text-halo-width": 1
      }
    },
    {
      "id": "label_country_3",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "place",
      "minzoom": 2,
      "maxzoom": 9,
      "filter": [
        "all",
        ["==", ["get", "class"], "country"],
        [">=", ["get", "rank"], 3]
      ],
      "layout": {
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Bold"],
        "text-max-width": 6.25,
        "text-size": ["interpolate", ["linear"], ["zoom"], 3, 9, 7, 17]
      },
      "paint": {
        "text-color": "#000",
        "text-halo-blur": 1,
        "text-halo-color": "#fff",
        "text-halo-width": 1
      }
    },
    {
      "id": "label_country_2",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "place",
      "maxzoom": 9,
      "filter": [
        "all",
        ["==", ["get", "class"], "country"],
        ["==", ["get", "rank"], 2]
      ],
      "layout": {
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Bold"],
        "text-max-width": 6.25,
        "text-size": ["interpolate", ["linear"], ["zoom"], 2, 9, 5, 17]
      },
      "paint": {
        "text-color": "#000",
        "text-halo-blur": 1,
        "text-halo-color": "#fff",
        "text-halo-width": 1
      }
    },
    {
      "id": "label_country_1",
      "type": "symbol",
      "source": "openmaptiles",
      "source-layer": "place",
      "maxzoom": 9,
      "filter": [
        "all",
        ["==", ["get", "class"], "country"],
        ["==", ["get", "rank"], 1]
      ],
      "layout": {
        "text-field": [
          "case",
          ["has", "name:nonlatin"],
          ["concat", ["get", "name:latin"], "\n", ["get", "name:nonlatin"]],
          ["coalesce", ["get", "name_en"], ["get", "name"]]
        ],
        "text-font": ["Noto Sans Bold"],
        "text-max-width": 6.25,
        "text-size": ["interpolate", ["linear"], ["zoom"], 1, 9, 4, 17]
      },
      "paint": {
        "text-color": "#000",
        "text-halo-blur": 1,
        "text-halo-color": "#fff",
        "text-halo-width": 1
      }
    }
  ],
  "id": "leiny371l"
}
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
    <circle cx="80" cy="25" r="22" fill="#F6F5F5" stroke="#000000" stroke-width="2"/>
    <text x="80" y="25" font-family="Work Sans, sans-serif" font-size="11" font-weight="600"
          fill="#000000" text-anchor="middle" dominant-baseline="central">${price}</text>
  </svg>
`;

const matchaMarkerSVG = (price) => `
  <svg viewBox="0 0 110 120" width="60" xmlns="http://www.w3.org/2000/svg">
    <path d="M 25 50 L 30 95 Q 30 100 35 100 L 65 100 Q 70 100 70 95 L 75 50 Z" stroke-width="2.5" stroke-linejoin="round" stroke="#0f2a0f" fill="#2e5c2e"></path><ellipse cx="50" cy="50" rx="25" ry="5" fill="#FFFFFF" stroke-width="2.5" stroke="#0f2a0f"></ellipse><ellipse cx="50" cy="50" rx="21" ry="3.5" fill="#5aaa5a"></ellipse><path d="M 75 60 Q 88 60 88 72 Q 88 84 75 84" fill="none" stroke-width="2.5" stroke-linecap="round" stroke="#0f2a0f"></path>
    <circle cx="80" cy="25" r="22" fill="#F6F5F5" stroke="#000000" stroke-width="2"></circle>
    <text x="80" y="25" font-family="Work Sans, sans-serif" font-size="11" font-weight="600"
          fill="#000000" text-anchor="middle" dominant-baseline="central">${price}</text>
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
      style: mapStyle,
      center: [-123.100, 49.254],
      zoom: 13,
    });

    mapRef.current.on('load', () => {
      setMapReady(true);
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
    <path d="M 25 50 L 30 95 Q 30 100 35 100 L 65 100 Q 70 100 70 95 L 75 50 Z" stroke-width="2.5" stroke-linejoin="round" stroke="#0f2a0f" fill="#2e5c2e"></path><ellipse cx="50" cy="50" rx="25" ry="5" fill="#FFFFFF" stroke-width="2.5" stroke="#0f2a0f"></ellipse><ellipse cx="50" cy="50" rx="21" ry="3.5" fill="#5aaa5a"></ellipse><path d="M 75 60 Q 88 60 88 72 Q 88 84 75 84" fill="none" stroke-width="2.5" stroke-linecap="round" stroke="#0f2a0f"></path>
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
    color: '#000000',
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
    color: '#000000',
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
    color: '#000000',
  },
  slider: {
    width: '100%',
    accentColor: '#000000',
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
