import React from 'react';
import { MoreVertical, Plus } from 'lucide-react';

export function ContactsView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-[24px] font-bold text-slate-900">Close Contacts</h2>
        <p className="text-slate-500 mt-1">
          Manage the people automatically notified when a high-risk alert is triggered.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-[18px] font-bold text-slate-900">Emergency Network</h3>
            <p className="text-[14px] text-slate-500 mt-1">Your primary trusted contacts.</p>
          </div>
          <button className="hidden sm:flex px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[14px] font-semibold transition-colors items-center gap-2">
            <Plus size={16} /> Add Contact
          </button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { name: 'Mom', phone: '+1 (555) 019-283', active: true, relation: 'Family' },
            { name: 'David Smith', phone: '+1 (555) 837-112', active: true, relation: 'Brother' },
            { name: 'Emma Wilson', phone: '+1 (555) 123-456', active: false, relation: 'Friend' },
          ].map((contact, i) => (
            <div
              key={i}
              className={`flex items-center justify-between p-4 rounded-xl border transition-colors group ${
                contact.active ? 'border-slate-200 hover:border-blue-300' : 'border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-[18px] transition-colors ${
                    contact.active
                      ? 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {contact.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`font-bold text-[15px] ${contact.active ? 'text-slate-900' : 'text-slate-500'}`}>
                      {contact.name}
                    </p>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                      {contact.relation}
                    </span>
                  </div>
                  <p className="text-[14px] text-slate-500 mt-0.5">{contact.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${
                    contact.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {contact.active ? 'Active' : 'Inactive'}
                </div>
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>
            </div>
          ))}
          <button className="sm:hidden w-full py-4 rounded-xl border-2 border-dashed border-slate-200 text-[15px] font-semibold text-slate-500 mt-4 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
            <Plus size={20} /> Add New Contact
          </button>
        </div>
      </div>
    </div>
  );
}
