import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Import Fake Call Modal
import { FakeCallModal } from './modals/FakeCallModal.jsx';

// --- CONSTANTS & DATA ---

// Predefined path in Bengaluru
const BENGALURU_PATH = [
  [77.5946, 12.9716],
  [77.5966, 12.9726],
  [77.5986, 12.9736],
  [77.6006, 12.9716],
  [77.6026, 12.9696],
  [77.6046, 12.9706],
];

// Predefined safety zones
const SAFETY_ZONES = [
  {
    id: 'zone-red',
    center: [77.5980, 12.9740],
    radius: 70, // visual radius in pixels
    geoRadius: 0.003, // approximate radius in degrees for collision detection
    color: '#ef4444', // Red - High Risk
    riskLevel: 'DANGER',
  },
  {
    id: 'zone-yellow',
    center: [77.6010, 12.9680],
    radius: 50, // visual radius in pixels
    geoRadius: 0.0025,
    color: '#eab308', // Yellow - Medium Risk
    riskLevel: 'CAUTION',
  },
  {
    id: 'zone-green',
    center: [77.5900, 12.9680],
    radius: 90, // visual radius in pixels
    geoRadius: 0.004,
    color: '#22c55e', // Green - Safe Zone
    riskLevel: 'SAFE',
  }
];

const SAFETY_STATES = {
  IDLE: 'IDLE',
  RISK_DETECTED: 'RISK_DETECTED',
  NOTIFICATION_SENT: 'NOTIFICATION_SENT',
  WAITING_20S: 'WAITING_20S',
  CALL_TRIGGERED: 'CALL_TRIGGERED',
  CALL_MISSED: 'CALL_MISSED',
  SECOND_CALL: 'SECOND_CALL',
  NO_RESPONSE: 'NO_RESPONSE',
  VERIFICATION_REQUIRED: 'VERIFICATION_REQUIRED',
  EMERGENCY: 'EMERGENCY'
};

// --- HELPER FUNCTIONS & HOOKS ---

// Helper to determine risk level based on simple coordinate distance
const checkRiskLevel = (location) => {
  const [lng1, lat1] = location;
  let currentRisk = 'SAFE'; // Default assumption

  for (const zone of SAFETY_ZONES) {
    const [lng2, lat2] = zone.center;
    // Simple Pythagorean Euclidean approximation for local distances
    const distance = Math.sqrt(Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2));

    if (distance <= zone.geoRadius) {
      if (zone.riskLevel === 'DANGER') return 'DANGER'; // Prioritize highest risk
      if (zone.riskLevel === 'CAUTION') currentRisk = 'CAUTION';
    }
  }

  return currentRisk;
};

// State Machine Hook for Safety Flow
function useSafetyStateMachine(currentRisk) {
  const [safetyState, setSafetyState] = useState(SAFETY_STATES.IDLE);

  useEffect(() => {
    let timeoutId;

    const transitionTo = (nextState, delay = 0) => {
      timeoutId = setTimeout(() => {
        setSafetyState(nextState);
      }, delay);
    };

    switch (safetyState) {
      case SAFETY_STATES.IDLE:
        if (currentRisk === 'DANGER') {
          setSafetyState(SAFETY_STATES.RISK_DETECTED);
        }
        break;
      
      case SAFETY_STATES.RISK_DETECTED:
        transitionTo(SAFETY_STATES.NOTIFICATION_SENT, 1500); // 1.5s delay
        break;
        
      case SAFETY_STATES.NOTIFICATION_SENT:
        transitionTo(SAFETY_STATES.WAITING_20S, 2000); // 2s delay
        break;
        
      case SAFETY_STATES.WAITING_20S:
        transitionTo(SAFETY_STATES.CALL_TRIGGERED, 20000); 
        break;
        
      case SAFETY_STATES.CALL_TRIGGERED:
        transitionTo(SAFETY_STATES.CALL_MISSED, 10000); // Ring for 10s
        break;
        
      case SAFETY_STATES.CALL_MISSED:
        transitionTo(SAFETY_STATES.SECOND_CALL, 2000); // 2s pause between calls
        break;
        
      case SAFETY_STATES.SECOND_CALL:
        transitionTo(SAFETY_STATES.NO_RESPONSE, 10000); // Ring for 10s
        break;
        
      case SAFETY_STATES.NO_RESPONSE:
        transitionTo(SAFETY_STATES.EMERGENCY, 1000); // 1s final delay
        break;
        
      case SAFETY_STATES.VERIFICATION_REQUIRED:
        // Wait for manual verification input
        break;

      case SAFETY_STATES.EMERGENCY:
        // Terminal state. Wait for manual reset.
        break;

      default:
        break;
    }

    return () => clearTimeout(timeoutId);
  }, [safetyState, currentRisk]);

  return { safetyState, setSafetyState };
}

// Inline Safety Verification Component
function SafetyVerificationModal({ onSubmit }) {
  const [code, setCode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <div className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-[0_0_40px_rgba(0,0,0,0.3)] w-80 text-center border border-slate-200 dark:border-slate-800 transform transition-all">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Verify Status</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          Please enter your secret safety code to confirm you are secure.
        </p>
        
        <form onSubmit={handleSubmit}>
          <input 
            type="password" 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="•••••••" 
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-4 mb-4 text-center tracking-[0.5em] text-xl font-bold focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all placeholder:tracking-normal placeholder:font-normal"
            autoFocus
          />
          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
          >
            Confirm Identity
          </button>
        </form>
      </div>
    </div>
  );
}

// Inline Emergency Escalation Panel Component
function EmergencyEscalationPanel({ location, onReset }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Helper to simulate asynchronous emergency steps
    const addLog = (message, delay) => {
      return setTimeout(() => {
        setLogs((prev) => [
          ...prev, 
          { time: new Date().toLocaleTimeString(), message }
        ]);
      }, delay);
    };

    // Sequential simulation of emergency responses
    const t1 = addLog('🚨 EMERGENCY TRIGGERED. Initiating SOS protocols...', 0);
    const t2 = addLog(`📍 Acquiring precise coordinates: [${location[0].toFixed(4)}, ${location[1].toFixed(4)}]`, 1500);
    const t3 = addLog('📞 Calling primary emergency contact (Mom)...', 3000);
    const t4 = addLog('📡 Sending live tracking link via SMS...', 4500);
    const t5 = addLog('🚓 Alerting local authorities (112)...', 6000);
    const t6 = addLog('✅ Emergency response activated successfully.', 8000);

    return () => {
      [t1, t2, t3, t4, t5, t6].forEach(clearTimeout);
    };
  }, [location]);

  // Keep the latest logs visible
  const logsEndRef = useRef(null);
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="absolute inset-x-4 bottom-4 z-[120] bg-red-950/90 border border-red-500/50 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.3)] overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-red-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-bold uppercase tracking-wide">Emergency Mode Active</span>
        </div>
        <button 
          onClick={onReset} 
          className="text-white/80 hover:text-white bg-red-800/50 hover:bg-red-800 px-3 py-1 rounded text-sm transition-colors"
        >
          Cancel SOS
        </button>
      </div>
      
      {/* Logs Terminal */}
      <div className="p-4 bg-black/50 h-40 overflow-y-auto font-mono text-sm space-y-2">
        {logs.map((log, i) => (
          <div key={i} className="text-red-300 animate-in fade-in slide-in-from-left-2 duration-300">
            <span className="text-slate-500 mr-2">[{log.time}]</span>
            {log.message}
          </div>
        ))}
        {logs.length < 6 && (
          <div className="text-slate-500 flex items-center gap-2 mt-2">
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        )}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
}

// Inline Activity Log Panel Component
function ActivityLogPanel({ logs }) {
  if (logs.length === 0) return null;
  
  return (
    <div className="absolute bottom-4 left-4 z-40 w-72 md:w-80 max-h-56 bg-white/95 dark:bg-slate-900/95 rounded-xl shadow-lg backdrop-blur-md border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden transition-all duration-300">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
        <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
        <h3 className="font-semibold text-xs text-slate-600 dark:text-slate-300 uppercase tracking-wider">
          Activity Log
        </h3>
      </div>
      <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-3">
        {logs.map((log, i) => (
          <div key={i} className={`flex items-start gap-2 ${i === 0 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
            <span className="opacity-70 whitespace-nowrap">[{log.time}]</span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---

export function MapComponent() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // React state for user location and simulation logic
  const [userLocation, setUserLocation] = useState(BENGALURU_PATH[0]);
  const [, setPathIndex] = useState(0);
  const [currentRisk, setCurrentRisk] = useState('SAFE');
  
  // Notification banner state
  const [showBanner, setShowBanner] = useState(false);
  
  // Custom hook containing the state machine
  const { safetyState, setSafetyState } = useSafetyStateMachine(currentRisk);

  // Activity Logs state
  const [activityLogs, setActivityLogs] = useState([]);

  // Monitor safetyState to auto-generate activity logs
  useEffect(() => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let message = '';
    
    switch (safetyState) {
      case SAFETY_STATES.IDLE:
        if (activityLogs.length > 0) message = 'System reset to IDLE';
        break;
      case SAFETY_STATES.RISK_DETECTED:
        message = 'Entered danger zone';
        break;
      case SAFETY_STATES.NOTIFICATION_SENT:
        message = 'Notification sent';
        break;
      case SAFETY_STATES.WAITING_20S:
        message = 'Monitoring response...';
        break;
      case SAFETY_STATES.CALL_TRIGGERED:
        message = 'Fake call triggered';
        break;
      case SAFETY_STATES.CALL_MISSED:
        message = 'Call missed, attempting again...';
        break;
      case SAFETY_STATES.SECOND_CALL:
        message = 'Second fake call triggered';
        break;
      case SAFETY_STATES.NO_RESPONSE:
        message = 'No response detected';
        break;
      case SAFETY_STATES.VERIFICATION_REQUIRED:
        message = 'Awaiting safety verification';
        break;
      case SAFETY_STATES.EMERGENCY:
        message = 'Emergency activated';
        break;
      default:
        break;
    }

    if (message) {
      setActivityLogs(prev => [{ time, message }, ...prev].slice(0, 50));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safetyState]);

  // Notification Auto-dismiss Logic
  useEffect(() => {
    if (currentRisk === 'DANGER') {
      setShowBanner(true);
      // Auto-dismiss the banner after 5 seconds
      const timer = setTimeout(() => setShowBanner(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }
  }, [currentRisk]);

  useEffect(() => {
    // Check for the access token
    if (!import.meta.env.VITE_MAPBOX_TOKEN) {
      console.error('Mapbox access token is missing. Please set VITE_MAPBOX_TOKEN in your environment.');
      return;
    }

    // Set the Mapbox access token
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

    // Initialize the map only once
    if (mapRef.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark theme map
      center: BENGALURU_PATH[0],
      zoom: 14, // Zoomed in a bit to clearly see the movement
    });

    // Add zoom and rotation controls to the map
    mapRef.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Wait for the map to load before adding sources and layers
    mapRef.current.on('load', () => {
      // Add the safety zones as a GeoJSON source
      mapRef.current.addSource('safety-zones', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: SAFETY_ZONES.map((zone) => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: zone.center,
            },
            properties: {
              color: zone.color,
              radius: zone.radius,
            },
          })),
        },
      });

      // Add a circle layer to visualize the zones
      mapRef.current.addLayer({
        id: 'safety-zones-layer',
        type: 'circle',
        source: 'safety-zones',
        paint: {
          'circle-radius': ['get', 'radius'], // Use the radius from properties
          'circle-color': ['get', 'color'],   // Use the color from properties
          'circle-opacity': 0.3,              // Semi-transparent bubble
          'circle-stroke-width': 2,
          'circle-stroke-color': ['get', 'color'],
          'circle-stroke-opacity': 0.8,
        },
      });
    });

    // Create a custom DOM element for the marker
    const markerEl = document.createElement('div');
    markerEl.className = 'simulated-user-marker';
    markerEl.style.width = '16px';
    markerEl.style.height = '16px';
    markerEl.style.backgroundColor = '#3b82f6';
    markerEl.style.borderRadius = '50%';
    markerEl.style.border = '3px solid white';
    markerEl.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.8)';
    markerEl.style.transition = 'transform 3s linear';

    // Initialize the marker
    markerRef.current = new mapboxgl.Marker({ element: markerEl })
      .setLngLat(BENGALURU_PATH[0])
      .addTo(mapRef.current);

    // Initial risk assessment
    setCurrentRisk(checkRiskLevel(BENGALURU_PATH[0]));

    // Clean up on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update user location state every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPathIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % BENGALURU_PATH.length;
        setUserLocation(BENGALURU_PATH[nextIndex]);
        return nextIndex;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Sync marker position with React state and recalculate risk
  useEffect(() => {
    if (markerRef.current && mapRef.current) {
      markerRef.current.setLngLat(userLocation);
      
      // Smooth pan the map to follow the user
      mapRef.current.panTo(userLocation, {
        duration: 3000,
        easing: (t) => t, // Linear easing for continuous movement
      });

      // Recalculate risk on movement
      const newRiskLevel = checkRiskLevel(userLocation);
      setCurrentRisk(newRiskLevel);
    }
  }, [userLocation]);

  // Handle interacting with the fake call
  const handleCallAction = () => {
    // Picking up or declining the fake call transitions to verification
    setSafetyState(SAFETY_STATES.VERIFICATION_REQUIRED);
  };

  // Handle submitting the verification modal
  const handleVerificationSubmit = (code) => {
    if (code === 'SAFE123') {
      setSafetyState(SAFETY_STATES.IDLE);
    } else {
      setSafetyState(SAFETY_STATES.EMERGENCY);
    }
  };

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800">
      
      {/* High Risk Notification Banner */}
      <div 
        className={`absolute top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-in-out ${
          showBanner ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'
        }`}
      >
        <div className="bg-red-600/95 backdrop-blur-md text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-red-500/50">
          <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-bold text-sm tracking-wide uppercase">High risk area ahead</span>
        </div>
      </div>

      {/* HUD Overlay for Risk Level */}
      <div className="absolute top-4 left-4 z-40 bg-white/95 dark:bg-slate-900/95 p-4 rounded-xl shadow-lg backdrop-blur-md border border-slate-200 dark:border-slate-700 transition-colors duration-500">
        <h3 className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Location Risk
        </h3>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              currentRisk === 'DANGER' ? 'bg-red-400' :
              currentRisk === 'CAUTION' ? 'bg-yellow-400' :
              'bg-green-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-3 w-3 ${
              currentRisk === 'DANGER' ? 'bg-red-500' :
              currentRisk === 'CAUTION' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}></span>
          </span>
          <span className={`font-bold tracking-wide ${
            currentRisk === 'DANGER' ? 'text-red-500' :
            currentRisk === 'CAUTION' ? 'text-yellow-500' :
            'text-green-500'
          }`}>
            {currentRisk}
          </span>
        </div>
      </div>

      {/* HUD Overlay for Safety Flow State Machine */}
      <div className="absolute top-4 right-4 z-40 bg-white/95 dark:bg-slate-900/95 p-4 rounded-xl shadow-lg backdrop-blur-md border border-slate-200 dark:border-slate-700">
        <h3 className="font-semibold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
          Safety Flow System
        </h3>
        <div className="font-mono text-sm text-blue-600 dark:text-blue-400 font-bold mb-2">
          {safetyState}
        </div>
        
        {safetyState !== SAFETY_STATES.IDLE && (
          <button 
            onClick={() => setSafetyState(SAFETY_STATES.IDLE)}
            className="w-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-md text-slate-700 dark:text-slate-200 transition-colors"
          >
            Reset Flow
          </button>
        )}
      </div>

      {/* Render Activity Log Panel */}
      <ActivityLogPanel logs={activityLogs} />

      {/* Render Fake Call Modal */}
      {(safetyState === SAFETY_STATES.CALL_TRIGGERED || safetyState === SAFETY_STATES.SECOND_CALL) && (
        <FakeCallModal onClose={handleCallAction} />
      )}

      {/* Render Safety Verification Modal */}
      {safetyState === SAFETY_STATES.VERIFICATION_REQUIRED && (
        <SafetyVerificationModal onSubmit={handleVerificationSubmit} />
      )}

      {/* Render Emergency Escalation Terminal */}
      {safetyState === SAFETY_STATES.EMERGENCY && (
        <EmergencyEscalationPanel 
          location={userLocation} 
          onReset={() => setSafetyState(SAFETY_STATES.IDLE)} 
        />
      )}

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
      />
    </div>
  );
}
