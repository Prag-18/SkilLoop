import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Users, 
  Send, 
  Repeat, 
  Award, 
  ShieldCheck, 
  User, 
  Settings 
} from 'lucide-react';

export const Sidebar = ({ activeTab = 'overview', setActiveTab }) => {
  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'teaching', label: 'Skills I Teach', icon: GraduationCap, badge: 'Offers' },
    { id: 'learning', label: 'Skills I Want', icon: BookOpen, badge: 'Wants' },
    { id: 'matches', label: 'Campus Matches', icon: Users, badge: 'Discover' },
    { id: 'requests', label: 'Learning Requests', icon: Send },
    { id: 'exchanges', label: 'Active Exchanges', icon: Repeat },
    { id: 'credits', label: 'Skill Credits & Trust', icon: Award },
    { id: 'profile', label: 'My Profile & Evidence', icon: ShieldCheck },
  ];

  return (
    <aside className="w-full md:w-64 glass-panel border-r border-slate-800/80 p-4 shrink-0 flex flex-col justify-between">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-heading">
            Student Portal
          </h2>
        </div>

        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-200'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer inside sidebar */}
      <div className="pt-4 border-t border-slate-800/60 mt-6 px-3">
        <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Skill Credit Balance</span>
            <span className="font-bold text-emerald-400">100 CR</span>
          </div>
          <p className="text-[11px] text-slate-500">Earn more by teaching peers.</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
