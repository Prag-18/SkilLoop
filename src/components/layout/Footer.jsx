import React from 'react';
import { Sparkles, Github, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="glass-panel border-t border-slate-800/80 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/30 flex items-center justify-center border border-indigo-500/30">
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-sm font-semibold text-slate-300 font-heading">
              SkillLoop Platform Phase 1
            </span>
          </div>

          <p className="text-xs text-slate-500 flex items-center gap-1">
            Built for peer-to-peer campus learning & skill verification
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>FastAPI + React</span>
            <span>•</span>
            <span>PostgreSQL</span>
            <span>•</span>
            <span>Alembic</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
