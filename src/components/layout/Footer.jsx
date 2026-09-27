import React from 'react';
import { Sparkles, Github, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#f4ebd9]/90 border-t border-[#e2d5bd] mt-auto py-8 text-stone-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-200 flex items-center justify-center border border-amber-400">
              <Sparkles className="w-4 h-4 text-amber-800" />
            </div>
            <span className="text-sm font-bold text-stone-800 font-heading">
              SkillLoop Campus Board
            </span>
          </div>

          <p className="text-xs text-stone-600 font-handwriting text-base flex items-center gap-1">
            Handcrafted for peer-to-peer campus learning & verified skill swaps
          </p>

          <div className="flex items-center gap-4 text-xs font-mono text-stone-600">
            <span>FastAPI + React</span>
            <span>•</span>
            <span>SQLite/Postgres</span>
            <span>•</span>
            <span>Ledger Credits</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
