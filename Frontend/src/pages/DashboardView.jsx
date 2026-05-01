import React, { useState } from 'react';
import {
  Activity,
  MapPin,
  Shield,
} from 'lucide-react';

import { StatCard } from '../components/ui/StatCard.jsx';
import MapControl from '../features/maps/MapControl.jsx';

export function DashboardView({ isCrowdShieldActive }) {
  // Store exact backend response in state
  const [metrics, setMetrics] = useState({ 
    currentRisk: 0, 
    safety: 'Safe', 
    zone: 'GREEN',
    crowd: 0
  });

  const getZoneColor = (zone) => {
    if (zone === 'RED') return 'red';
    if (zone === 'YELLOW') return 'amber';
    return 'emerald';
  };

  // Compute percentages for UI
  const riskPercent = Math.round(metrics.currentRisk * 100);
  const safetyPercent = 100 - riskPercent;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div
        id="mapbox-container"
        className="relative w-full h-[450px] rounded-2xl overflow-hidden shadow-premium bg-slate-100 border border-slate-200/60"
      >
        <MapControl onMetricsUpdate={setMetrics} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Current Risk" 
          value={`${riskPercent}%`} 
          subValue={`Zone: ${metrics.zone}`} 
          icon={Activity} 
          color={getZoneColor(metrics.zone)} 
        />
        <StatCard
          title="Location Safety"
          value={`${safetyPercent}%`}
          subValue={`Status: ${metrics.safety}`}
          icon={MapPin}
          color={getZoneColor(metrics.zone)}
        />
        <StatCard
          title="Crowd Shield"
          value={isCrowdShieldActive ? 'Active' : 'Inactive'}
          subValue={isCrowdShieldActive ? `${metrics.crowd} Supporters nearby` : 'Safety network disabled'}
          icon={Shield}
          color={isCrowdShieldActive ? 'emerald' : 'red'}
        />
      </div>
    </div>
  );
}
