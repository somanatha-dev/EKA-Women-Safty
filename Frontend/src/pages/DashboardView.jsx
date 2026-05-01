import {
  Activity,
  Bell,
  CheckCircle,
  Map,
  MapPin,
  Navigation,
  X,
} from 'lucide-react';

import { RECENT_ALERTS } from '../data/recentAlerts.js';
import { StatCard } from '../components/ui/StatCard.jsx';

export function DashboardView({ isCrowdShieldActive }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div
        id="mapbox-container"
        className="relative w-full h-[450px] rounded-2xl overflow-hidden shadow-premium bg-slate-100 border border-slate-200/60 flex items-center justify-center"
      >
        <div className="text-center">
          <Map size={48} className="mx-auto text-slate-300 mb-4" strokeWidth={1.5} />
          <p className="text-slate-500 font-medium text-[15px]">Mapbox Integration Container</p>
          <p className="text-slate-400 text-[13px] mt-1">Ready for Mapbox GL JS mount</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Current Risk" value="High" subValue="Score: 72/100" icon={Activity} color="red" />
        <StatCard
          title="Location Safety"
          value="Marginal"
          subValue="Based on recent data"
          icon={MapPin}
          color="amber"
        />
        <StatCard title="Movement" value="Walking" subValue="3.2 km/h" icon={Navigation} color="blue" />
        <StatCard title="Alerts Sent" value="2" subValue="In last 24 hours" icon={Bell} color="slate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-[18px] font-bold text-slate-900">Activity & Alerts</h3>
              <p className="text-[13px] text-slate-500 mt-1">Recent events tracking your journey</p>
            </div>
            <button className="text-[14px] font-semibold text-blue-600 hover:text-blue-700 hover:underline px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
              View all
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {RECENT_ALERTS.map((alert, index) => {
              const colorMap = {
                danger: { bg: 'bg-red-50', text: 'text-red-600' },
                warning: { bg: 'bg-amber-50', text: 'text-amber-600' },
                success: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
              };
              const colors = colorMap[alert.type];

              return (
                <div
                  key={alert.id}
                  className={`flex items-start gap-4 p-5 transition-colors hover:bg-slate-50 ${
                    index !== RECENT_ALERTS.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${colors.bg}`}
                  >
                    <alert.icon size={22} className={colors.text} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[15px] font-semibold text-slate-900 truncate">{alert.title}</h4>
                      <span className="text-[12px] font-medium text-slate-400 whitespace-nowrap ml-4">
                        {alert.time}
                      </span>
                    </div>
                    <p className="text-[14px] text-slate-500 truncate">{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-premium border border-slate-200 p-8 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors duration-500"></div>

          <div className="relative z-10 w-full flex items-center justify-between mb-8">
            <h3 className="text-[18px] font-bold text-slate-900">Crowd Shield</h3>
            <div
              className={`px-3 py-1 text-[12px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 border transition-colors ${
                isCrowdShieldActive
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCrowdShieldActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
                }`}
              ></span>
              {isCrowdShieldActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4 relative z-10">
            <div className="relative mb-8">
              <div
                className={`absolute inset-0 bg-gradient-to-tr ${
                  isCrowdShieldActive
                    ? 'from-blue-600 to-cyan-400 animate-pulse'
                    : 'from-slate-400 to-slate-300'
                } rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500`}
              ></div>
              <div
                className={`w-32 h-32 rounded-full p-[3px] bg-gradient-to-tr ${
                  isCrowdShieldActive ? 'from-blue-600 to-cyan-400' : 'from-slate-300 to-slate-200'
                } relative transition-colors duration-500`}
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-inner">
                  <span
                    className={`text-[48px] font-bold text-transparent bg-clip-text bg-gradient-to-tr ${
                      isCrowdShieldActive
                        ? 'from-blue-700 to-cyan-500'
                        : 'from-slate-500 to-slate-400'
                    } leading-none`}
                  >
                    {isCrowdShieldActive ? '3' : '0'}
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white p-1 shadow-lg border border-slate-100">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center transition-colors ${
                    isCrowdShieldActive ? 'bg-emerald-500' : 'bg-red-500'
                  }`}
                >
                  {isCrowdShieldActive ? (
                    <CheckCircle size={18} className="text-white" strokeWidth={3} />
                  ) : (
                    <X size={18} className="text-white" strokeWidth={3} />
                  )}
                </div>
              </div>
            </div>

            <h4 className="text-[18px] font-bold text-slate-900 mb-2">
              {isCrowdShieldActive ? 'Nearby Supporters' : 'Shield Disabled'}
            </h4>
            <p className="text-[14px] text-slate-500 max-w-[220px] leading-relaxed">
              {isCrowdShieldActive
                ? 'Verified network users within a 500m radius ready to assist.'
                : 'Turn on Crowd Shield to securely connect with verified users nearby.'}
            </p>
          </div>

          <button className="w-full py-3.5 rounded-xl font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors mt-6 relative z-10 border border-blue-100">
            View Network Details
          </button>
        </div>
      </div>
    </div>
  );
}
