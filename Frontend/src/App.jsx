import { useState } from 'react';


import { TopNav } from './components/topnav/TopNav.jsx';
import { AccountView } from './pages/AccountView.jsx';
import { ContactsView } from './pages/ContactsView.jsx';
import { DashboardView } from './pages/DashboardView.jsx';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isCrowdShieldActive, setIsCrowdShieldActive] = useState(true);
  const [showFakeCall, setShowFakeCall] = useState(false);
  
  return (
    <div className="flex flex-col h-screen overflow-hidden font-sans text-slate-900 bg-[#F4F7F9]">
      <TopNav
        onNavigate={setCurrentView}
        isCrowdShieldActive={isCrowdShieldActive}
        onToggleCrowdShield={() => setIsCrowdShieldActive((v) => !v)}
        onTriggerFakeCall={() => setShowFakeCall(true)}
      />

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {currentView === 'dashboard' && <DashboardView isCrowdShieldActive={isCrowdShieldActive} />}
          {currentView === 'account' && <AccountView />}
          {currentView === 'contacts' && <ContactsView />}
        </div>
      </main>


    </div>
  );
}