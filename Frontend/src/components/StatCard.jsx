export function StatCard({ title, value, subValue, icon: Icon, color }) {
  const colorStyles = {
    red: {
      bg: 'from-white to-red-50/30',
      iconBg: 'bg-red-50 text-red-600',
      border: 'hover:border-red-200',
    },
    amber: {
      bg: 'from-white to-amber-50/30',
      iconBg: 'bg-amber-50 text-amber-600',
      border: 'hover:border-amber-200',
    },
    blue: {
      bg: 'from-white to-blue-50/30',
      iconBg: 'bg-blue-50 text-blue-600',
      border: 'hover:border-blue-200',
    },
    slate: {
      bg: 'from-white to-slate-50/50',
      iconBg: 'bg-slate-100 text-slate-600',
      border: 'hover:border-slate-300',
    },
  };

  const style = colorStyles[color];

  return (
    <div
      className={`bg-gradient-to-b ${style.bg} rounded-2xl p-6 shadow-premium border border-slate-200 hover:-translate-y-1 shadow-premium-hover transition-all duration-300 cursor-default group ${style.border}`}
    >
      <div className="flex items-start justify-between mb-5">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${style.iconBg}`}
        >
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
      <div>
        <h4 className="text-[14px] font-semibold text-slate-500 mb-1">{title}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-bold tracking-tight text-slate-900">{value}</span>
        </div>
        <p className="text-[13px] font-medium text-slate-400 mt-1">{subValue}</p>
      </div>
    </div>
  );
}
