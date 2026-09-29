import React from 'react';
import { useAuth } from '../../context/AuthContext';
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

export const Sidebar = ({ activeTab = 'overview', setActiveTab, creditBalance }) => {
  const { user } = useAuth();
  const balance = creditBalance ?? user?.skill_credits ?? 100;
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
    <aside className="w-full md:w-64 bg-[#f8f4ea] border-r-2 border-[#dfd7c5] p-4 shrink-0 flex flex-col justify-between relative shadow-sm">
      {/* Decorative Washi Tape at top of sidebar */}
      <div className="washi-tape washi-tape-pink top-2 -left-2 w-28 rotate-[-3deg]" />

      <div className="space-y-6 pt-3">
        <div className="px-3 py-1 flex items-center justify-between border-b border-[#e5dcc7] pb-2">
          <span className="text-[11px] font-bold text-stone-700 tracking-wider uppercase font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-700 inline-block" />
            STUDENT JOURNAL
          </span>
          <span className="text-[10px] text-stone-500 font-handwriting font-bold text-sm">2026/27</span>
        </div>

        <nav className="space-y-1.5">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 relative ${
                  isActive
                    ? 'bg-[#fffdfa] text-amber-950 border-2 border-amber-600/70 shadow-[2px_3px_8px_rgba(40,30,20,0.08)] font-bold -translate-r-1'
                    : 'text-stone-700 hover:text-stone-950 hover:bg-[#efe7d3]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-800' : 'text-stone-500'}`} />
                  <span className="font-heading text-sm">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-[#292524] text-white shadow-xs'
                        : 'bg-[#e5dcc7] text-stone-700'
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

      {/* System Status Footer inside sidebar styled as a mini receipt */}
      <div className="pt-4 border-t-2 border-dashed border-[#dfd7c5] mt-6 px-1">
        <div className="bg-[#fffdf9] rounded-xl p-3 border border-[#dfd7c5] shadow-sm text-xs relative">
          {/* Tape corner */}
          <div className="washi-tape washi-tape-yellow -top-2.5 right-2 w-14 rotate-3" />
          <div className="flex items-center justify-between text-stone-800 mb-1 pt-1">
            <span className="font-semibold font-heading">Credit Balance</span>
            <span className="font-bold text-amber-900 font-mono text-sm">{balance} CR</span>
          </div>
          <p className="text-[11px] text-stone-500 font-handwriting text-xs font-semibold">Earn +50 CR for every peer exchange!</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
