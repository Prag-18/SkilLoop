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
      color: 'indigo'
    },
    {
      icon: BookOpen,
      title: '2. List Learning Wants',
      desc: 'Specify skills you need help with to automatically match with campus experts.',
      color: 'emerald'
    },
    {
      icon: ShieldCheck,
      title: '3. Skill Evidence & Verification',
      desc: 'Attach GitHub links, certificates, portfolio work, or past project proofs.',
      color: 'purple'
    },
    {
      icon: Users,
      title: '4. Complementary Matching',
      desc: 'Find peers whose taught skills match your learning desires and vice-versa.',
      color: 'amber'
    },
    {
      icon: Send,
      title: '5. Direct Learning Requests',
      desc: 'Send exchange requests specifying preferred session schedules and goals.',
      color: 'indigo'
    },
    {
      icon: Repeat,
      title: '6. Structured Exchanges',
      desc: 'Conduct 1-on-1 skill exchanges with time-tracking and milestone confirmation.',
      color: 'emerald'
    },
    {
      icon: MessageSquare,
      title: '7. Peer Feedback & Ratings',
      desc: 'Build campus reputation with authentic reviews following every session.',
      color: 'rose'
    },
    {
      icon: Award,
      title: '8. Skill Credits Economy',
      desc: 'Earn credit tokens by teaching that you can spend to learn new skills.',
      color: 'amber'
    }
  ];

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Background Glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-600/10 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-600/10 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute bottom-10 left-0 w-80 h-80 bg-emerald-600/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-indigo-500/30 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-8 animate-pulse-slow">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Campus Skill Exchange Platform • Phase 1 Foundation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight font-heading text-white max-w-4xl mx-auto leading-tight">
          Teach What You Know. <br />
          <span className="text-gradient">Learn What You Need.</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          SkillLoop connects students for direct, peer-to-peer skill swaps. Exchange coding, design, academics, and creative crafts with verified campus evidence & credit rewards.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          {isAuthenticated ? (
            <Button
              size="lg"
              variant="primary"
              icon={ArrowRight}
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant="primary"
                icon={Zap}
                onClick={() => navigate('/register')}
              >
                Create Free Profile
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/login')}
              >
                Student Sign In
              </Button>
            </>
          )}
        </div>

        {/* Live Preview Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="glass-card p-4 rounded-2xl text-center border border-slate-800">
            <p className="text-2xl font-bold text-white font-heading">100%</p>
            <p className="text-xs text-slate-400 mt-1">Peer-to-Peer</p>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center border border-slate-800">
            <p className="text-2xl font-bold text-indigo-400 font-heading">Verified</p>
            <p className="text-xs text-slate-400 mt-1">Skill Evidence</p>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center border border-slate-800">
            <p className="text-2xl font-bold text-emerald-400 font-heading">Credit</p>
            <p className="text-xs text-slate-400 mt-1">Reward System</p>
          </div>
          <div className="glass-card p-4 rounded-2xl text-center border border-slate-800">
            <p className="text-2xl font-bold text-pink-400 font-heading">JWT</p>
            <p className="text-xs text-slate-400 mt-1">Secure Fast API</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <Badge variant="indigo" className="mb-3">Platform Workflow</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-heading">
            Everything You Need for Campus Skill Exchange
          </h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">
            From listing evidence-backed skills to tracking exchange completion and earning reputation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} padding="md" className="flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-indigo-400" />
                  </div>
                  <CardTitle className="text-base mb-2">{feat.title}</CardTitle>
                  <CardDescription className="text-xs">{feat.desc}</CardDescription>
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Landing;
