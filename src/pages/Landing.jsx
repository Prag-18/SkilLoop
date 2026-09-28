import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import {
  ArrowRight,
  Zap,
  Sparkles,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Award,
  Users,
  Send,
  Repeat
} from 'lucide-react';
import {
  SmileySticker,
  StarSticker,
  BinderClip,
  WashiTape,
  GinghamPatch,
  HalftoneSunburst,
  LightbulbSticker,
  PencilSticker,
  LaptopSticker,
  BookSticker,
  BunnyDoodle
} from '../components/theme/ScrapbookPrimitives';

export const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const steps = [
    {
      num: '1',
      title: 'List Your Skills',
      desc: 'Share what you teach (Coding, UI Design, Calculus) and what you want to learn.',
      sticker: '✏️',
    },
    {
      num: '2',
      title: 'Get Matched',
      desc: 'Our complementary algorithm pairs you with campus peers ready for 1-on-1 swaps.',
      sticker: '⭐',
    },
    {
      num: '3',
      title: 'Exchange & Earn',
      desc: 'Complete peer sessions, earn skill credit tokens, and build your campus reputation.',
      sticker: '🏆',
    },
  ];

  return (
    <div className="relative min-h-screen text-[#1e1b18] overflow-hidden">
      {/* 1. Top Torn Kraft Strip with Spaced Lead-in & Main Headline */}
      <div className="w-full torn-kraft-top pt-6 pb-10 px-4 sm:px-8 text-center shadow-md relative z-10">
        <p className="font-lead text-xs sm:text-sm uppercase tracking-widest text-[#4b5560] font-bold">
          Synapse Platform:
        </p>
        <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl text-[#7b4630] font-bold mt-1">
          “Little Joys of Learning”
        </h1>
      </div>

      {/* Hero Collage Section */}
      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* Background Accents (Halftone rays + Gingham patch) */}
        <div className="absolute top-8 left-8 sm:left-24 -z-10">
          <HalftoneSunburst className="w-48 h-48 sm:w-64 sm:h-64" />
        </div>
        <div className="absolute top-1/3 right-4 sm:right-16 -z-10 rotate-2">
          <GinghamPatch className="w-40 h-40 sm:w-56 sm:h-56" />
        </div>

        {/* Hero Title & Intro */}
        <div className="text-center max-w-3xl mx-auto mb-12 relative">
          {/* Smiley Doodle cutout */}
          <div className="absolute -top-6 right-2 sm:-right-8 hidden sm:block">
            <SmileySticker className="w-16 h-16" rotation="rotate-2" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full note-cream text-xs font-bold text-[#7b4630] border border-[#dfd7c5] shadow-xs mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-800" />
            <span>CAMPUS SKILL EXCHANGE • SCRAPBOOK COMMUNITY</span>
          </div>

          <h2 className="font-heading text-2xl sm:text-4xl text-[#7b4630] leading-tight font-bold">
            Teach What You Know. <br />
            <span className="underline decoration-[#dec0a0] decoration-wavy underline-offset-8">
              Learn What You Need.
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#2d241e] font-mono leading-relaxed max-w-2xl mx-auto">
            Synapse connects university students for genuine, peer-to-peer knowledge sharing. Swap coding, design, academics, and creative crafts with verified evidence and skill credits.
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Button
                size="lg"
                variant="primary"
                icon={ArrowRight}
                onClick={() => navigate('/dashboard')}
                className="shadow-md font-bold px-8 py-3.5"
              >
                Open Campus Dashboard
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  variant="primary"
                  icon={Zap}
                  onClick={() => navigate('/register')}
                  className="shadow-md font-bold px-8 py-3.5"
                >
                  Create Student Profile
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                  className="shadow-sm font-bold bg-[#faf6ee] px-6 py-3.5"
                >
                  Student Sign In
                </Button>
              </>
            )}
          </div>
        </div>

        {/* 2. Collage Note Cards (Sage "How it Works" & Peach "Skill Swap Recipe") */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start my-12">
          {/* Left: Pale Gray-Green Note Card ("WHAT IS SYNAPSE?") */}
          <div className="md:col-span-6 relative note-sage p-6 sm:p-8 rounded-2xl -rotate-1">
            {/* Washi tape at top */}
            <WashiTape variant="mauve" rotation="-rotate-1" className="w-32 -top-3 left-8" />

            <div className="flex items-center justify-between mb-4 border-b border-[#c8ccc2] pb-3">
              <div>
                <span className="font-lead text-[11px] uppercase tracking-widest text-[#4b5560] font-bold">
                  OVERVIEW
                </span>
                <h3 className="font-heading text-xl font-bold text-[#7b4630]">
                  WHAT IS SYNAPSE?
                </h3>
              </div>
              <SmileySticker className="w-12 h-12" rotation="-rotate-2" />
            </div>

            <p className="text-xs sm:text-sm font-mono text-[#2d241e] leading-relaxed mb-6">
              Synapse is a collaborative student community where knowledge is the currency. Instead of paying expensive tutors, swap your Python expertise for Figma design, or Calculus help for Guitar lessons.
            </p>

            {/* 3 Step List */}
            <div className="space-y-3">
              {steps.map((s) => (
                <div
                  key={s.num}
                  className="p-3 rounded-xl bg-white/70 border border-[#cbcfc6] flex items-start gap-3 shadow-2xs"
                >
                  <span className="w-6 h-6 rounded-full bg-[#7b4630] text-white flex items-center justify-center text-xs font-bold shrink-0 font-heading">
                    {s.num}
                  </span>
                  <div>
                    <h4 className="font-heading text-xs font-bold text-[#7b4630]">
                      {s.title}
                    </h4>
                    <p className="text-[11px] font-mono text-stone-700 leading-normal mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Peach Note Card with Binder Clip ("Skill Exchange Recipe") */}
          <div className="md:col-span-6 relative note-peach p-6 sm:p-8 rounded-2xl rotate-1">
            {/* Metal Binder Clip pinned on top */}
            <BinderClip className="w-12 h-10 -top-5 left-1/2 -translate-x-1/2" />

            <div className="flex items-center justify-between mb-4 border-b border-[#dec0a0] pb-3 pt-2">
              <div>
                <span className="font-lead text-[11px] uppercase tracking-widest text-[#4b5560] font-bold">
                  CAMPUS GUIDE
                </span>
                <h3 className="font-heading text-xl font-bold text-[#7b4630]">
                  Skill Exchange Recipe:
                </h3>
              </div>
              <StarSticker className="w-12 h-12" rotation="rotate-2">
                100%
              </StarSticker>
            </div>

            <ul className="text-xs sm:text-sm font-mono text-[#2d241e] space-y-2.5 leading-relaxed">
              <li className="flex items-center gap-2">
                <span className="text-[#7b4630] font-bold">•</span>
                <span><strong>1 Verified Student Profile</strong> (University email)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#7b4630] font-bold">•</span>
                <span><strong>2+ Skills to Offer</strong> (with GitHub/portfolio proofs)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#7b4630] font-bold">•</span>
                <span><strong>1+ Skill You Want to Learn</strong></span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#7b4630] font-bold">•</span>
                <span><strong>1-on-1 Structured Sessions</strong> (60 mins focused)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#7b4630] font-bold">•</span>
                <span><strong>Skill Credit Reward</strong> (+50 CR per session)</span>
              </li>
            </ul>

            {/* Curly-quote pull quote inside note */}
            <div className="mt-6 p-4 rounded-xl bg-white/70 border border-[#dec0a0] text-center shadow-2xs">
              <p className="font-heading text-sm sm:text-base text-[#7b4630] italic font-bold">
                “Start your day with a skill and a smile.”
              </p>
            </div>

            {/* Bottom corner doodle */}
            <div className="absolute -bottom-4 -right-4">
              <BunnyDoodle className="w-14 h-14" rotation="rotate-1" />
            </div>
          </div>
        </div>

        {/* 3. Collage Doodles / Highlights Bar */}
        <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="polaroid-frame p-4 rounded-xl -rotate-1">
            <WashiTape variant="yellow" rotation="-rotate-2" className="w-20 -top-2.5 left-1/2 -translate-x-1/2" />
            <LaptopSticker className="w-10 h-10 mx-auto mb-2" />
            <p className="font-heading text-lg font-bold text-[#7b4630]">Tech & Code</p>
            <p className="text-[11px] font-mono text-stone-600">Python, React, ML</p>
          </div>

          <div className="polaroid-frame p-4 rounded-xl rotate-1">
            <WashiTape variant="pink" rotation="rotate-1" className="w-20 -top-2.5 left-1/2 -translate-x-1/2" />
            <PencilSticker className="w-10 h-10 mx-auto mb-2" />
            <p className="font-heading text-lg font-bold text-[#7b4630]">Design & UI</p>
            <p className="text-[11px] font-mono text-stone-600">Figma, UX, Branding</p>
          </div>

          <div className="polaroid-frame p-4 rounded-xl -rotate-2">
            <WashiTape variant="sage" rotation="-rotate-1" className="w-20 -top-2.5 left-1/2 -translate-x-1/2" />
            <BookSticker className="w-10 h-10 mx-auto mb-2" />
            <p className="font-heading text-lg font-bold text-[#7b4630]">Academics</p>
            <p className="text-[11px] font-mono text-stone-600">Calculus, Stats, Econ</p>
          </div>

          <div className="polaroid-frame p-4 rounded-xl rotate-2">
            <WashiTape variant="mauve" rotation="rotate-2" className="w-20 -top-2.5 left-1/2 -translate-x-1/2" />
            <LightbulbSticker className="w-10 h-10 mx-auto mb-2" />
            <p className="font-heading text-lg font-bold text-[#7b4630]">Creative</p>
            <p className="text-[11px] font-mono text-stone-600">Music, Photo, Audio</p>
          </div>
        </div>
      </main>

      {/* 4. Bottom Torn Kraft Banner with Recurring Curly Quote */}
      <footer className="w-full torn-kraft-bottom pt-10 pb-8 px-4 text-center shadow-inner relative z-10 mt-10">
        <p className="font-heading text-lg sm:text-2xl text-[#7b4630] font-bold tracking-wide">
          “Life is better when there’s a skill to share.”
        </p>
        <p className="font-lead text-[11px] text-[#4b5560] uppercase tracking-widest mt-1 font-bold">
          © {new Date().getFullYear()} Synapse • Campus Skill-Exchange Platform
        </p>
      </footer>
    </div>
  );
};

export default Landing;
