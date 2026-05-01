import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronRight,
  LogOut,
  Phone,
  Shield,
  User,
  Users,
} from 'lucide-react';

import { RECENT_ALERTS } from '../data/alerts';

export function TopNav({
  isCrowdShieldActive,
  onToggleCrowdShield,
  onTriggerFakeCall,
  onSelectView,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 flex items-center justify-between px-4 sm:px-6 lg:px-10 sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm shrink-0">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectView('dashboard')}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 bg-blue-600">
          <Shield size={22} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-[20px] tracking-tight text-slate-900 hidden sm:block">
          Guardian<span className="text-blue-600">Shield</span>
        </span>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <button
          onClick={onToggleCrowdShield}
          className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-[13px] uppercase tracking-wider transition-colors ${
            isCrowdShieldActive
              ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
              : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isCrowdShieldActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
          ></span>
          Crowd Shield {isCrowdShieldActive ? 'Active' : 'Inactive'}
        </button>

        <button
          onClick={onTriggerFakeCall}
          className="flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-[14px] transition-all shadow-lg shadow-red-500/20 active:scale-95 group"
        >
          <Phone size={18} strokeWidth={2.5} className="group-hover:animate-pulse" />
          <span className="hidden sm:block">Trigger Fake Call</span>
          <span className="sm:hidden">Fake Call</span>
        </button>

        <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((v) => !v)}
            className="p-2.5 rounded-full relative transition-colors hover:bg-slate-100 text-slate-500"
          >
            <Bell size={20} strokeWidth={2.5} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-bold text-slate-900">Notifications</h3>
                <button className="text-[12px] font-semibold text-blue-600 hover:underline">
                  Mark all as read
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {RECENT_ALERTS.map((alert) => {
                  const colors =
                    alert.type === 'danger'
                      ? 'text-red-600 bg-red-50'
                      : alert.type === 'warning'
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-emerald-600 bg-emerald-50';

                  return (
                    <div
                      key={alert.id}
                      className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 cursor-pointer"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${colors}`}
                      >
                        <alert.icon size={18} strokeWidth={2.5} />
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-slate-900">{alert.title}</p>
                        <p className="text-[13px] text-slate-500 mt-0.5">{alert.message}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((v) => !v)}
            className="flex items-center gap-2 sm:gap-3 transition-opacity hover:opacity-80 group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center border-2 border-white shadow-sm ring-2 ring-transparent group-hover:ring-blue-100 transition-all">
              <img
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=e2e8f0"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <ChevronRight
              size={16}
              className={`text-slate-400 hidden sm:block transition-transform duration-200 ${
                showProfileMenu ? 'rotate-90' : ''
              }`}
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                <p className="font-bold text-[15px] text-slate-900">Sarah Jenkins</p>
                <p className="text-[13px] text-slate-500 truncate">sarah.j@example.com</p>
              </div>
              <div className="p-2">
                <button
                  onClick={() => {
                    onSelectView('account');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <User size={18} /> My Account
                </button>
                <button
                  onClick={() => {
                    onSelectView('contacts');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <Users size={18} /> Close Contacts
                </button>
              </div>
              <div className="p-2 border-t border-slate-100">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 text-[14px] font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
