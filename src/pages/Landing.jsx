import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { 
  Sparkles, 
  BookOpen, 
  GraduationCap, 
  ShieldCheck, 
  Users, 
  Send, 
  Repeat, 
  Award, 
  MessageSquare,
  ArrowRight,
  Zap,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: GraduationCap,
      title: '1. List Teaching Skills',
      desc: 'Offer your expertise in Python, UI/UX, Data Structures, Calculus, or Music to campus peers.',
      tapeClass: 'tape-strip-yellow -rotate-3',
    },
    {
      icon: BookOpen,
      title: '2. List Learning Wants',
      desc: 'Specify skills you need help with to automatically match with campus experts.',
      tapeClass: 'tape-strip-pink rotate-2',
    },
    {
      icon: ShieldCheck,
      title: '3. Skill Evidence & Verification',
      desc: 'Attach GitHub links, certificates, portfolio work, or past project proofs.',
      tapeClass: 'tape-strip-sage -rotate-2',
    },
    {
      icon: Users,
      title: '4. Complementary Matching',
      desc: 'Find peers whose taught skills match your learning desires and vice-versa.',
      tapeClass: 'tape-strip-sky rotate-3',
    },
    {
      icon: Send,
      title: '5. Direct Learning Requests',
      desc: 'Send exchange requests specifying preferred session schedules and goals.',
      tapeClass: 'tape-strip-pink -rotate-1',
    },
    {
      icon: Repeat,
      title: '6. Structured Exchanges',
      desc: 'Conduct 1-on-1 skill exchanges with time-tracking and milestone confirmation.',
      tapeClass: 'tape-strip-yellow rotate-2',
    },
    {
      icon: MessageSquare,
      title: '7. Peer Feedback & Ratings',
      desc: 'Build campus reputation with authentic reviews following every session.',
      tapeClass: 'tape-strip-amber -rotate-3',
    },
    {
      icon: Award,
      title: '8. Skill Credits Economy',
      desc: 'Earn credit tokens by teaching that you can spend to learn new skills.',
      tapeClass: 'tape-strip-sage rotate-1',
    }
  ];

  return (
    <div className="relative min-h-screen text-stone-800 overflow-hidden pb-16">
      {/* Soft warm scrapbook background glow elements */}
      <div className="absolute top-12 left-1/4 w-96 h-96 bg-amber-200/40 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-rose-200/40 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-20 left-10 w-80 h-80 bg-emerald-200/30 blur-[100px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Scrapbook Stamp Header Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full stamp-badge text-stone-800 text-xs font-semibold tracking-wide mb-8 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-700" />
          <span>Campus Skill Exchange Platform • Peer-Powered Mood Board</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight font-heading text-stone-900 max-w-4xl mx-auto leading-tight">
          Teach What You Know. <br />
          <span className="highlighter-yellow inline-block -rotate-1 text-amber-950 mt-2 px-3 py-1 rounded-lg">
            Learn What You Need.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-stone-700 max-w-2xl mx-auto leading-relaxed font-sans">
          SkillLoop connects students for direct, peer-to-peer skill swaps. Exchange coding, design, academics, and creative crafts with verified campus evidence & credit rewards.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Button
              size="lg"
              variant="primary"
              icon={ArrowRight}
              onClick={() => navigate('/dashboard')}
              className="shadow-paper hover:shadow-paper-lg"
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
                className="shadow-paper hover:shadow-paper-lg"
              >
                Create Free Profile
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
                className="shadow-paper"
              >
                Student Sign In
              </Button>
            </>
          )}
        </div>

        {/* Polaroid Preview Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="polaroid-frame p-5 rounded-2xl text-center relative -rotate-1">
            <div className="tape-strip tape-strip-yellow -top-2.5 left-1/2 -translate-x-1/2 -rotate-2" />
            <p className="text-3xl font-bold text-stone-900 font-heading">100%</p>
            <p className="text-xs font-semibold text-stone-600 mt-1">Peer-to-Peer</p>
          </div>
          <div className="polaroid-frame p-5 rounded-2xl text-center relative rotate-2">
            <div className="tape-strip tape-strip-pink -top-2.5 left-1/2 -translate-x-1/2 rotate-3" />
            <p className="text-3xl font-bold text-amber-800 font-heading">Verified</p>
            <p className="text-xs font-semibold text-stone-600 mt-1">Proof Evidence</p>
          </div>
          <div className="polaroid-frame p-5 rounded-2xl text-center relative -rotate-2">
            <div className="tape-strip tape-strip-sage -top-2.5 left-1/2 -translate-x-1/2 -rotate-1" />
            <p className="text-3xl font-bold text-emerald-800 font-heading">Ledger</p>
            <p className="text-xs font-semibold text-stone-600 mt-1">Credit Economy</p>
          </div>
          <div className="polaroid-frame p-5 rounded-2xl text-center relative rotate-1">
            <div className="tape-strip tape-strip-sky -top-2.5 left-1/2 -translate-x-1/2 rotate-2" />
            <p className="text-3xl font-bold text-sky-900 font-heading">Direct</p>
            <p className="text-xs font-semibold text-stone-600 mt-1">1-on-1 Swaps</p>
          </div>
        </div>
      </section>

      {/* Feature Pinboard Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto relative">
        <div className="text-center mb-14">
          <Badge variant="amber" className="mb-3">How SkillLoop Works</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 font-heading">
            Everything You Need for Campus Skill Swaps
          </h2>
          <p className="text-stone-600 text-sm mt-2 max-w-xl mx-auto">
            From listing evidence-backed skills to tracking exchange completion and earning reputation on the campus board.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`polaroid-frame p-6 rounded-2xl flex flex-col justify-between relative ${
                  idx % 4 === 0
                    ? '-rotate-1'
                    : idx % 4 === 1
                    ? 'rotate-1'
                    : idx % 4 === 2
                    ? '-rotate-2'
                    : 'rotate-2'
                }`}
              >
                {/* Washi Tape Strip at Card Corner */}
                <div className={`tape-strip ${feat.tapeClass} -top-2.5 left-6`} />

                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center mb-4 text-amber-800 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-stone-900 font-heading mb-1.5">{feat.title}</h3>
                  <p className="text-xs text-stone-600 leading-relaxed font-sans">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Landing;
