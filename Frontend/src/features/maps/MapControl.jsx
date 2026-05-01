import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import gsap from 'gsap';

import { MAP_STYLE } from '../../config/mapConfig.js';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select.jsx';
import { Button } from '../../components/ui/button.jsx';

const CAMPUS_STYLE = 'mapbox://styles/mapbox/standard';

import { MapProvider } from './mapControl/MapProvider.jsx';
import { useMapContext } from './mapControl/mapContext.js';
import { useMapController } from './mapControl/hooks/useMapController.js';
import { useLocationFilters } from './mapControl/hooks/useLocationFilters.js';
import { useRobotStream } from './mapControl/hooks/useRobotStream.js';
import { calculateBearing, interpolateLngLat } from '../../lib/geo.js';

// WORLD VIEW (strict)
const WORLD_CENTER = [20, 0];
const WORLD_ZOOM = 1.5;

// DEFAULT CENTER (Bengaluru)
const BENGALURU_CENTER = [77.5946, 12.9716];
const INITIAL_ZOOM = 17.5;

// SIMULATION PATH (Bengaluru)
const SIMULATION_POINTS = [
  [77.5946, 12.9716], // Cubbon Park
  [77.6101, 12.9767], // MG Road
  [77.6245, 12.9711], // Indiranagar
  [77.6109, 12.9345], // Koramangala
  [77.5855, 12.9272], // Jayanagar
];

const ZOOM_LEVELS = {
  COUNTRY: 4.7,
  STATE: 6.7,
  CITY: 9.6,
  AREA: 13.2,
  CAMPUS: 17.2,
};

const SAFETY_STATES = {
  IDLE: 'IDLE',
  RISK_DETECTED: 'RISK_DETECTED',
  WAITING_20S: 'WAITING_20S',
  CALL_TRIGGERED: 'CALL_TRIGGERED',
  SECOND_CALL: 'SECOND_CALL',
  EMERGENCY: 'EMERGENCY',
};

function toSelectableValue(id) {
  return id ? String(id) : '__none__';
}

function fromSelectableValue(v) {
  if (!v || v === '__none__') return null;
  return String(v);
}

function hasCenter(loc) {
  return typeof loc?.lat === 'number' && typeof loc?.lon === 'number';
}

function MapFiltersBar({
  countries,
  states,
  cities,
  areas,
  campuses,
  countryId,
  stateId,
  cityId,
  areaId,
  campusId,
  setCountryId,
  setStateId,
  setCityId,
  setAreaId,
  setCampusId,
  loading,
  resetAll,
}) {
  return (
    <div className="map-filters-bar" aria-label="Map location filters">
      <div className="map-filters-bar__group">
        <Select value={toSelectableValue(countryId)} onValueChange={(v) => setCountryId(fromSelectableValue(v))}>
          <SelectTrigger className="map-filter-trigger">
            <SelectValue placeholder={loading.countries ? 'Loading…' : 'Country'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">World</SelectItem>
            {countries.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={toSelectableValue(stateId)}
          onValueChange={(v) => setStateId(fromSelectableValue(v))}
          disabled={!countryId || loading.states}
        >
          <SelectTrigger className="map-filter-trigger">
            <SelectValue placeholder={loading.states ? 'Loading…' : 'State'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {states.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={toSelectableValue(cityId)}
          onValueChange={(v) => setCityId(fromSelectableValue(v))}
          disabled={!stateId || loading.cities}
        >
          <SelectTrigger className="map-filter-trigger">
            <SelectValue placeholder={loading.cities ? 'Loading…' : 'City'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {cities.map((ci) => (
              <SelectItem key={ci.id} value={String(ci.id)}>
                {ci.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={toSelectableValue(areaId)}
          onValueChange={(v) => setAreaId(fromSelectableValue(v))}
          disabled={!cityId || loading.areas}
        >
          <SelectTrigger className="map-filter-trigger">
            <SelectValue placeholder={loading.areas ? 'Loading…' : 'Area'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a.id} value={String(a.id)}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={toSelectableValue(campusId)} onValueChange={(v) => setCampusId(fromSelectableValue(v))}>
          <SelectTrigger className="map-filter-trigger">
            <SelectValue placeholder={loading.campuses ? 'Loading…' : 'Campus'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None</SelectItem>
            {Array.isArray(campuses) &&
              campuses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="button" variant="ghost" size="sm" onClick={resetAll} className="map-filters-bar__reset">
        Reset
      </Button>
    </div>
  );
}

function FakeCallOverlay({ onAccept, onReject }) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-between py-24 animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4">
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center border-2 border-slate-700">
          <div className="text-4xl text-white">👩‍🦳</div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-light text-white mb-1">Mom</h2>
          <p className="text-slate-400 animate-pulse">Calling...</p>
        </div>
      </div>

      <div className="flex gap-20">
        <button
          onClick={onReject}
          className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform"
        >
          <StopCircle className="text-white w-8 h-8" />
        </button>
        <button
          onClick={onAccept}
          className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg animate-bounce active:scale-95 transition-transform"
        >
          <Maximize2 className="text-white w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

function MapControlInner({ filtersHost }) {
  const { mapContainerRef, mapRef, markersRef } = useMapContext();
  const [userLocation, setUserLocation] = useState({ lng: 77.5946, lat: 12.9716, bearing: 0 });
  const [routeData, setRouteData] = useState(null);

  // Zones data from backend
  const [zones, setZones] = useState([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [errorZones, setErrorZones] = useState(null);

  // Risk detection state
  const [isInHighRiskZone, setIsInHighRiskZone] = useState(false);
  const [safetyState, setSafetyState] = useState(SAFETY_STATES.IDLE);
  const [logs, setLogs] = useState([]);
  const timeoutRef = useRef(null);

  const addLog = (message) => {
    setLogs((prev) => [{ id: Date.now(), time: new Date().toLocaleTimeString(), message }, ...prev]);
  };

  const userMarkerRef = useRef(null);
  const overlayRef = useRef(null);
  const canvasRef = useRef(null);
  const styleModeRef = useRef('default');
  const styleTransitionIdRef = useRef(0);
  const latestCameraRef = useRef(null);

  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  // Initialize Mapbox once (no reloads)
  useEffect(() => {
    if (!token) return;
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLE,
      center: BENGALURU_CENTER,
      zoom: INITIAL_ZOOM,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'top-left');

    mapRef.current = map;

    const onResize = () => {
      try {
        map.resize();
      } catch {
        // ignore
      }
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);

      try {
        markersRef.current.forEach((m) => {
          try {
            m?.marker?.remove?.();
          } catch {
            // ignore
          }
        });
      } catch {
        // ignore
      }
      try {
        markersRef.current.clear();
      } catch {
        // ignore
      }

      try {
        userMarkerRef.current?.remove?.();
        userMarkerRef.current = null;
      } catch {
        // ignore
      }

      try {
        map.remove();
      } catch {
        // ignore
      }
      mapRef.current = null;
    };
  }, [token, mapContainerRef, mapRef, markersRef]);

  const { isMapLoaded, flyTo } = useMapController(mapRef, { overlayRef, canvasRef });

  const {
    countries,
    states,
    cities,
    areas,
    campuses,
    countryId,
    stateId,
    cityId,
    areaId,
    campusId,
    selectedCountry,
    selectedState,
    selectedCity,
    selectedArea,
    selectedCampus,
    setCountryId,
    setStateId,
    setCityId,
    setAreaId,
    setCampusId,
    loading,
    resetAll,
  } = useLocationFilters();

  // Removed filter-based focus logic in favor of user-location-centric approach


  // Automatically update map center whenever userLocation changes
  useEffect(() => {
    if (!isMapLoaded) return;

    const cam = {
      lon: userLocation.lng,
      lat: userLocation.lat,
      bearing: userLocation.bearing,
      pitch: 60, // 3D Tilt
    };

    latestCameraRef.current = cam;
    flyTo(cam);
  }, [isMapLoaded, userLocation, flyTo]);

  // User Marker: Create or update marker position
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded) return;

    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.className = 'user-marker';
      // Basic styling for the user marker
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.backgroundColor = '#3b82f6'; // Blue
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.6)';

      userMarkerRef.current = new mapboxgl.Marker(el).setLngLat([userLocation.lng, userLocation.lat]).addTo(map);
    } else {
      userMarkerRef.current.setLngLat([userLocation.lng, userLocation.lat]);
    }
  }, [isMapLoaded, userLocation, mapRef]);

  // Fetch zones from backend API
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const response = await fetch('http://localhost:4000/api/zones');
        if (!response.ok) throw new Error('Failed to fetch zones');
        const data = await response.json();
        setZones(data);
      } catch (err) {
        console.error('Error fetching zones:', err);
        setErrorZones(err.message);
      } finally {
        setLoadingZones(false);
      }
    };

    fetchZones();
  }, []);

  // Render risk zones on map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapLoaded || zones.length === 0) return;

    const sourceId = 'risk-zones';
    const layerId = 'risk-zones-circles';

    // Convert zones data to GeoJSON
    const geojson = {
      type: 'FeatureCollection',
      features: zones.map((z) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [z.lng, z.lat],
        },
        properties: {
          risk: z.risk,
          zone: z.zone_type || z.zone, // Support both naming conventions
        },
      })),
    };

    const setupLayers = () => {
      // Remove existing layer/source if they exist
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      map.addSource(sourceId, {
        type: 'geojson',
        data: geojson,
      });

      map.addLayer({
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 10, 10, 15, 30],
          'circle-color': [
            'match',
            ['get', 'zone'],
            'RED',
            '#ff3b30',
            'YELLOW',
            '#ffcc00',
            'GREEN',
            '#34c759',
            '#ccc', // default
          ],
          'circle-opacity': 0.6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
    };

    setupLayers();

    return () => {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [isMapLoaded, zones, mapRef]);

  // Simulation: Fetch real road route
  useEffect(() => {
    if (!token) return;

    const fetchRoute = async () => {
      try {
        const coords = SIMULATION_POINTS.map((p) => p.join(',')).join(';');
        const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${coords}?geometries=geojson&overview=full&access_token=${token}`;
        const res = await fetch(url);
        const data = await res.json();
        const fullRoute = data.routes[0].geometry.coordinates;
        
        // Calculate cumulative distances for smooth movement
        let totalDist = 0;
        const segments = fullRoute.map((curr, i) => {
          if (i === 0) return { dist: 0, coord: curr };
          const prev = fullRoute[i - 1];
          const d = Math.sqrt(Math.pow(curr[0] - prev[0], 2) + Math.pow(curr[1] - prev[1], 2)); // Simple approximation for speed
          totalDist += d;
          return { dist: totalDist, coord: curr };
        });

        setRouteData({ segments, totalDist });
      } catch (err) {
        console.error('Failed to fetch route:', err);
      }
    };

    fetchRoute();
  }, [token]);

  // Simulation: Move userLocation smoothly along the road
  useEffect(() => {
    if (!routeData) return;

    let startTime = Date.now();
    const SPEED = 0.00000015; // Slow walking speed (very realistic)
    const DURATION = routeData.totalDist / SPEED;
    let rafId;

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) % DURATION;
      const progressDist = (elapsed / DURATION) * routeData.totalDist;

      // Find segment
      let i = 0;
      while (i < routeData.segments.length - 2 && routeData.segments[i + 1].dist < progressDist) {
        i++;
      }

      const p1 = routeData.segments[i];
      const p2 = routeData.segments[i + 1];
      const segmentDist = p2.dist - p1.dist;
      const t = segmentDist === 0 ? 0 : (progressDist - p1.dist) / segmentDist;

      const lng = p1.coord[0] + (p2.coord[0] - p1.coord[0]) * t;
      const lat = p1.coord[1] + (p2.coord[1] - p1.coord[1]) * t;
      const bearing = calculateBearing(
        { lng: p1.coord[0], lat: p1.coord[1] },
        { lng: p2.coord[0], lat: p2.coord[1] }
      );

      setUserLocation({ lng, lat, bearing });
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [routeData]);

  // Risk Zone Detection Logic
  useEffect(() => {
    if (zones.length === 0) return;

    // 1. Find the nearest zone using simple Euclidean distance
    let minSourceDist = Infinity;
    let nearestZone = null;

    zones.forEach((z) => {
      const dLat = z.lat - userLocation.lat;
      const dLng = z.lng - userLocation.lng;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);

      if (dist < minSourceDist) {
        minSourceDist = dist;
        nearestZone = z;
      }
    });

    // 2. Detection parameters
    const THRESHOLD = 0.003; // ~300 meters approximation
    const inside = minSourceDist < THRESHOLD;
    const isRed = nearestZone?.zone === 'RED' || nearestZone?.zone_type === 'RED';

    // 3. Trigger alert only on entry (avoid repeated triggers)
    if (inside && isRed) {
      if (!isInHighRiskZone) {
        addLog('🚨 Entered high-risk (RED) zone');
        setIsInHighRiskZone(true);
        if (safetyState === SAFETY_STATES.IDLE) {
          setSafetyState(SAFETY_STATES.RISK_DETECTED);
        }
      }
    } else if (!inside || !isRed) {
      if (isInHighRiskZone) {
        addLog('✅ Left high-risk area');
        setIsInHighRiskZone(false);
        setSafetyState(SAFETY_STATES.IDLE);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    }
  }, [userLocation, zones, isInHighRiskZone, safetyState]);

  // Safety State Machine Transitions
  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    switch (safetyState) {
      case SAFETY_STATES.RISK_DETECTED:
        addLog('⚠️ Risk detected - initializing safety protocol');
        timeoutRef.current = setTimeout(() => setSafetyState(SAFETY_STATES.WAITING_20S), 1000);
        break;

      case SAFETY_STATES.WAITING_20S:
        addLog('⏳ Waiting for user response (20s timer)');
        timeoutRef.current = setTimeout(() => setSafetyState(SAFETY_STATES.CALL_TRIGGERED), 5000); // Reduced for demo
        break;

      case SAFETY_STATES.CALL_TRIGGERED:
        addLog('📞 TRIGGERED: Automatic fake call initiated');
        timeoutRef.current = setTimeout(() => setSafetyState(SAFETY_STATES.SECOND_CALL), 5000);
        break;

      case SAFETY_STATES.SECOND_CALL:
        addLog('📞 RETRY: Second automated call triggered');
        timeoutRef.current = setTimeout(() => setSafetyState(SAFETY_STATES.EMERGENCY), 5000);
        break;

      case SAFETY_STATES.EMERGENCY:
        addLog('🚨 EMERGENCY: Safety protocol breached - initiating SOS');
        addLog('📱 SMS SENT: "Emergency! I am in a high-risk area and need help."');
        addLog(`📡 GPS COORDS SENT: ${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`);
        addLog('🚓 ALERT: Nearby police patrol notified of your location');
        break;

      default:
        break;
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [safetyState]);

  // Campus view: switch to day 3D basemap (Mapbox Standard) with a smooth fade transition
  useEffect(() => {
    const map = mapRef?.current;
    if (!map) return;

    const wantMode = campusId ? 'campus' : 'default';
    if (styleModeRef.current === wantMode) return;
    styleModeRef.current = wantMode;

    const nextStyle = wantMode === 'campus' ? CAMPUS_STYLE : MAP_STYLE;

    const overlayEl = overlayRef.current;
    const canvasEl = canvasRef.current;

    const transitionId = Date.now();
    styleTransitionIdRef.current = transitionId;

    const setInteractive = (isInteractive) => {
      if (!canvasEl) return;
      canvasEl.style.pointerEvents = isInteractive ? '' : 'none';
    };

    const fadeOut = () => {
      try {
        if (canvasEl) gsap.killTweensOf(canvasEl);
        if (overlayEl) gsap.killTweensOf(overlayEl);
      } catch {
        // ignore
      }

      return new Promise((resolve) => {
        if (overlayEl) {
          gsap.to(overlayEl, { opacity: 0.18, duration: 0.16, ease: 'power2.out' });
        }
        if (!canvasEl) {
          resolve();
          return;
        }
        gsap.to(canvasEl, {
          opacity: 0.12,
          duration: 0.16,
          ease: 'power2.out',
          onComplete: resolve,
        });
      });
    };

    const fadeIn = () => {
      if (overlayEl) {
        gsap.to(overlayEl, { opacity: 0, duration: 0.22, ease: 'power2.out' });
      }
      if (canvasEl) {
        gsap.to(canvasEl, { opacity: 1, duration: 0.22, ease: 'power2.out' });
      }
    };

    const applyCampusConfig = () => {
      try {
        map.setConfigProperty?.('basemap', 'lightPreset', 'day');
      } catch {
        // ignore
      }
      try {
        map.setConfigProperty?.('basemap', 'show3dObjects', true);
      } catch {
        // ignore
      }
    };

    const onStyleLoad = () => {
      if (styleTransitionIdRef.current !== transitionId) return;

      if (wantMode === 'campus') applyCampusConfig();

      try {
        map.resize?.();
      } catch {
        // ignore
      }

      const cam = latestCameraRef.current;
      if (cam) flyTo(cam);

      fadeIn();
      setInteractive(true);
      styleTransitionIdRef.current = 0;
    };

    setInteractive(false);

    fadeOut()
      .then(() => {
        if (styleTransitionIdRef.current !== transitionId) return;
        try {
          map.once('style.load', onStyleLoad);
          map.setStyle(nextStyle);
        } catch {
          // ignore
          setInteractive(true);
          fadeIn();
        }
      })
      .catch(() => {
        setInteractive(true);
        fadeIn();
      });

    return () => {
      if (styleTransitionIdRef.current === transitionId) styleTransitionIdRef.current = 0;
      try {
        map.off?.('style.load', onStyleLoad);
      } catch {
        // ignore
      }
    };
  }, [campusId, mapRef, flyTo]);

  // Robots: fetch only when AREA selected (strict)
  useRobotStream({
    locationId: areaId,
    campusId,
    mapRef,
    markersRef,
  });

  const filtersBar = (
    <MapFiltersBar
      countries={countries}
      states={states}
      cities={cities}
      areas={areas}
      campuses={campuses}
      countryId={countryId}
      stateId={stateId}
      cityId={cityId}
      areaId={areaId}
      campusId={campusId}
      setCountryId={setCountryId}
      setStateId={setStateId}
      setCityId={setCityId}
      setAreaId={setAreaId}
      setCampusId={setCampusId}
      loading={loading}
      resetAll={resetAll}
    />
  );

  if (!token) {
    return (
      <div className="w-full h-full relative">
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 text-slate-200">
          <div className="text-sm font-semibold">Missing `VITE_MAPBOX_TOKEN`</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* overlay used by GSAP pulse */}
      <div ref={overlayRef} className="map-overlay absolute inset-0 pointer-events-none opacity-0 bg-black/10" />

      <div ref={canvasRef} className="absolute inset-0">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Safety Notifications Banner */}
      {safetyState !== SAFETY_STATES.IDLE && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div
            className={`px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border-2 ${
              safetyState === SAFETY_STATES.EMERGENCY ? 'bg-red-600 border-red-400' : 'bg-orange-600 border-orange-400'
            }`}
          >
            <span className="text-white font-bold whitespace-nowrap">
              {safetyState === SAFETY_STATES.EMERGENCY ? '🔴 EMERGENCY ACTIVE' : '⚠️ SAFETY PROTOCOL ACTIVE'}
            </span>
            <div className="w-2 h-2 rounded-full bg-white animate-ping" />
          </div>
        </div>
      )}

      {/* Activity Log Panel */}
      <div className="absolute bottom-6 right-6 z-50 w-80 max-h-64 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        <div className="p-3 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Live Activity Log</h3>
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <div className="overflow-y-auto p-3 space-y-2 flex-1 scrollbar-hide">
          {logs.length === 0 && <p className="text-[10px] text-slate-500 text-center py-4">No active threats detected.</p>}
          {logs.map((log) => (
            <div key={log.id} className="flex gap-2 items-start animate-in slide-in-from-right-4 duration-300">
              <span className="text-[9px] font-mono text-slate-500 mt-0.5 whitespace-nowrap">{log.time}</span>
              <p className="text-[11px] text-slate-200 leading-tight">{log.message}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fake Call Modal */}
      {(safetyState === SAFETY_STATES.CALL_TRIGGERED || safetyState === SAFETY_STATES.SECOND_CALL) && (
        <FakeCallOverlay
          onAccept={() => {
            addLog('✅ User answered the call. Danger averted.');
            setSafetyState(SAFETY_STATES.IDLE);
          }}
          onReject={() => {
            addLog('⚠️ User declined the call. Monitoring continues...');
            setSafetyState(SAFETY_STATES.IDLE);
          }}
        />
      )}

      {/* Emergency Flash Overlay */}
      {safetyState === SAFETY_STATES.EMERGENCY && (
        <div className="fixed inset-0 z-[90] pointer-events-none animate-pulse bg-red-600/20 mix-blend-overlay border-[10px] border-red-600 shadow-[inset_0_0_100px_rgba(220,38,38,0.8)]" />
      )}

      {filtersHost && createPortal(filtersBar, filtersHost)}
    </div>
  );
}

export default function MapControl({ filtersHost }) {
  return (
    <MapProvider>
      <MapControlInner filtersHost={filtersHost} />
    </MapProvider>
  );
}
