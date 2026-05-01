export function AccountView() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h2 className="text-[24px] font-bold text-slate-900">My Account</h2>
        <p className="text-slate-500 mt-1">Manage your personal profile and account security.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-premium border border-slate-200 overflow-hidden p-8">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
          <div className="w-24 h-24 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center border-4 border-white shadow-md">
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=e2e8f0"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-[20px] font-bold text-slate-900">Sarah Jenkins</h3>
            <p className="text-[15px] text-slate-500 mb-3">sarah.j@example.com</p>
            <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-semibold rounded-lg transition-colors">
              Change Avatar
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                First Name
              </label>
              <input
                type="text"
                defaultValue="Sarah"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[15px]"
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                Last Name
              </label>
              <input
                type="text"
                defaultValue="Jenkins"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[15px]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              type="email"
              defaultValue="sarah.j@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-[15px]"
            />
          </div>
          <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end gap-3">
            <button className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
