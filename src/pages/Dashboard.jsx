import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/common/Header';
import { Card, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import SkillCard from '../components/skills/SkillCard';
import EvidenceUploader from '../components/skills/EvidenceUploader';
import RecommendationCard from '../components/discover/RecommendationCard';
import ExchangeSummary from '../components/dashboard/ExchangeSummary';
import Requests from './Requests';
import {
  GraduationCap,
  BookOpen,
  Users,
  Send,
  Repeat,
  Award,
  ShieldCheck,
  Plus,
  ExternalLink,
  CheckCircle2,
  Clock,
  Zap,
  UserCheck,
  Star,
  Search,
  Filter,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Real API State
  const [userSkills, setUserSkills] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Evidence modal state for embedded management
  const [selectedSkillForEvidence, setSelectedSkillForEvidence] = useState(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [skillsRes, discRes, profRes] = await Promise.all([
        api.get('/users/me/skills').catch(() => ({ data: [] })),
        api.get('/discover').catch(() => ({ data: [] })),
        api.get('/users/me').catch(() => ({ data: null })),
      ]);
      setUserSkills(skillsRes.data || []);
      setRecommendations(discRes.data || []);
      setUserProfile(profRes.data || user);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEvidence = (userSkill) => {
    setSelectedSkillForEvidence(userSkill);
    setIsEvidenceOpen(true);
  };

  const handleDeleteSkill = async (userSkillId) => {
    if (!window.confirm('Remove this skill from your profile?')) return;
    try {
      await api.delete(`/users/me/skills/${userSkillId}`);
      setUserSkills((prev) => prev.filter((s) => s.id !== userSkillId));
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  const handleSendLearningRequest = async (recommendation) => {
    const requestedSkill = userSkills.find((s) => s.direction === 'learn');
    await api.post('/requests', {
      receiver_id: recommendation.user_id,
      requested_skill_id: requestedSkill ? requestedSkill.skill_id : undefined,
    });
  };

  const teachingSkills = userSkills.filter((s) => s.direction === 'teach');
  const learningSkills = userSkills.filter((s) => s.direction === 'learn');
  const creditBalance = userProfile?.skill_credits ?? user?.skill_credits ?? 100;

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-[#faf6ee] text-stone-800">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Dashboard Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto journal-grid">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Scrapbook Header Banner */}
            <div className="relative bg-[#fffdfa] border-2 border-[#dfd7c5] rounded-3xl p-6 sm:p-8 shadow-[3px_6px_22px_rgba(40,30,20,0.07)]">
              {/* Corner washi tape strips */}
              <div className="washi-tape washi-tape-yellow -top-3 left-8 w-32 -rotate-2" />
              <div className="washi-tape washi-tape-sage -top-3 right-10 w-28 rotate-3" />

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10 pt-2">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="stamp-seal text-xs">★ CAMPUS SKILL LOG ★</span>
                    <span className="text-xs text-stone-500 font-handwriting font-bold text-sm">semester entry · 2026</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading tracking-tight">
                    Welcome back, <span className="highlighter-yellow">{userProfile?.full_name || user?.full_name || 'Dark sider'}</span>!
                  </h1>
                  <p className="text-sm text-stone-600 font-medium max-w-2xl leading-relaxed font-sans">
                    Manage your skill offers, learning targets, campus matches, and peer exchange journal.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="md"
                    icon={Plus}
                    onClick={() => navigate('/skills/me')}
                    className="shadow-md font-semibold"
                  >
                    + Manage Skill Profile
                  </Button>
                </div>
              </div>

              {/* Decorative label punch stickers in corner */}
              <div className="mt-4 pt-3 border-t border-dashed border-[#e5dcc7] flex items-center gap-1.5 text-stone-500 text-xs">
                <span className="font-handwriting font-bold text-sm text-stone-600">index tags:</span>
                <span className="label-sticker">S</span>
                <span className="label-sticker">K</span>
                <span className="label-sticker">I</span>
                <span className="label-sticker">L</span>
                <span className="label-sticker">L</span>
                <span className="label-sticker">S</span>
                <span className="text-[11px] text-stone-400 font-mono ml-2">#peer-exchange #campus-graph</span>
              </div>
            </div>

            {/* Top Metric Cards: Authentic Polaroid Instant Photos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
              {/* Polaroid 1: Skills I Teach */}
              <div className="polaroid-frame p-3 pb-6 rounded-[2px] relative -rotate-2">
                <div className="washi-tape washi-tape-yellow -top-3 left-1/2 -translate-x-1/2 w-24 -rotate-1" />
                <div className="bg-[#fcfaf4] border border-[#ebe1cc] rounded-[2px] p-4 flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-700 font-bold uppercase tracking-wider font-mono">I TEACH</span>
                    <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shadow-inner">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-stone-900 font-heading leading-none">{teachingSkills.length}</p>
                    <p className="text-[10px] text-stone-500 font-mono uppercase mt-1">OFFERINGS</p>
                  </div>
                </div>
                <div className="pt-2 text-center">
                  <p className="font-handwriting text-sm font-bold text-stone-600">"my verified skill stack ✎"</p>
                </div>
              </div>

              {/* Polaroid 2: Skills I Want */}
              <div className="polaroid-frame p-3 pb-6 rounded-[2px] relative rotate-2">
                <div className="washi-tape washi-tape-pink -top-3 left-1/2 -translate-x-1/2 w-24 rotate-2" />
                <div className="bg-[#fcfaf4] border border-[#ebe1cc] rounded-[2px] p-4 flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-700 font-bold uppercase tracking-wider font-mono">I WANT</span>
                    <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 shadow-inner">
                      <BookOpen className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-stone-900 font-heading leading-none">{learningSkills.length}</p>
                    <p className="text-[10px] text-stone-500 font-mono uppercase mt-1">LEARNING GOALS</p>
                  </div>
                </div>
                <div className="pt-2 text-center">
                  <p className="font-handwriting text-sm font-bold text-stone-600">"what i need to master ↳"</p>
                </div>
              </div>

              {/* Polaroid 3: Campus Matches */}
              <div className="polaroid-frame p-3 pb-6 rounded-[2px] relative -rotate-1">
                <div className="washi-tape washi-tape-sky -top-3 left-1/2 -translate-x-1/2 w-24 -rotate-2" />
                <div className="bg-[#fcfaf4] border border-[#ebe1cc] rounded-[2px] p-4 flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-700 font-bold uppercase tracking-wider font-mono">MATCHES</span>
                    <div className="w-8 h-8 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-900 shadow-inner">
                      <Users className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-sky-950 font-heading leading-none">{recommendations.length}</p>
                    <p className="text-[10px] text-stone-500 font-mono uppercase mt-1">PEER GRAPH</p>
                  </div>
                </div>
                <div className="pt-2 text-center">
                  <p className="font-handwriting text-sm font-bold text-stone-600">"complementary peers ★"</p>
                </div>
              </div>

              {/* Polaroid 4: Skill Credits */}
              <div className="polaroid-frame p-3 pb-6 rounded-[2px] relative rotate-3">
                <div className="washi-tape washi-tape-sage -top-3 left-1/2 -translate-x-1/2 w-24 rotate-1" />
                <div className="bg-[#fcfaf4] border border-[#ebe1cc] rounded-[2px] p-4 flex flex-col justify-between h-32">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-700 font-bold uppercase tracking-wider font-mono">CREDITS</span>
                    <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shadow-inner">
                      <Award className="w-4 h-4" />
                    </div>
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold text-amber-900 font-heading leading-none">{creditBalance} <span className="text-lg">CR</span></p>
                    <p className="text-[10px] text-stone-500 font-mono uppercase mt-1">WALLET</p>
                  </div>
                </div>
                <div className="pt-2 text-center">
                  <p className="font-handwriting text-sm font-bold text-stone-600">"available balance ✓"</p>
                </div>
              </div>
            </div>

            {/* Two Column Layout for Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Quick Skills & Matches */}
              <div className="lg:col-span-2 space-y-6">
                {/* Teaching Skills Card */}
                <div className="bg-[#fffdfa] border-2 border-[#dfd7c5] rounded-3xl p-6 shadow-sm relative">
                  <div className="washi-tape washi-tape-yellow -top-2.5 right-10 w-28 rotate-1" />

                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#ede5d3]">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-800" />
                      <h2 className="text-lg font-bold text-stone-900 font-heading">
                        Teaching Skills Portfolio
                      </h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/skills/me')} className="font-medium text-xs">
                      Manage at /skills/me <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>

                  {teachingSkills.length === 0 ? (
                    <div className="text-center py-10 rounded-2xl border-2 border-dashed border-[#dfd7c5] bg-[#fbf8f0] text-stone-600 text-xs space-y-3">
                      <p className="font-heading text-base font-bold text-stone-800">No teaching skills claimed yet.</p>
                      <p className="text-stone-500 max-w-sm mx-auto font-sans">Claim skills from the university taxonomy graph to start receiving student requests.</p>
                      <Button variant="primary" size="sm" onClick={() => navigate('/skills/me')} className="shadow-sm">
                        + Claim Skills from Taxonomy
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teachingSkills.slice(0, 3).map((skill) => (
                        <div key={skill.id} className="p-3.5 rounded-2xl bg-[#faf6ee] border-2 border-[#e5dcc7] shadow-xs flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-stone-900 font-heading">{skill.skill?.name}</span>
                              <Badge variant="amber" size="sm">{skill.level}</Badge>
                            </div>
                            <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-2 font-sans font-medium">
                              <span>Confidence:</span>
                              <span className="text-amber-900 font-bold font-mono">{skill.confidence_score}%</span>
                              <span>•</span>
                              <span>{skill.evidence?.length || 0} proofs attached</span>
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEvidence(skill)}
                            className="text-xs"
                          >
                            Proofs
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campus Matches Preview styled as Ticket Stubs */}
                <div className="bg-[#fffdfa] border-2 border-[#dfd7c5] rounded-3xl p-6 shadow-sm relative">
                  <div className="washi-tape washi-tape-pink -top-2.5 left-10 w-24 -rotate-1" />

                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#ede5d3]">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-800" />
                      <h2 className="text-lg font-bold text-stone-900 font-heading">
                        Top Campus Skill Matches
                      </h2>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('matches')} className="font-medium text-xs">
                      Explore All ({recommendations.length})
                    </Button>
                  </div>

                  {recommendations.length === 0 ? (
                    <div className="text-center py-10 text-stone-600 text-xs bg-[#fbf8f0] rounded-2xl border-2 border-dashed border-[#dfd7c5] font-medium">
                      No matches found yet. Add more teach/learn skills at /skills/me to generate peer recommendations.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.slice(0, 2).map((match) => (
                        <div key={match.user_id} className="p-4 rounded-2xl bg-[#faf6ee] border-2 border-[#e5dcc7] shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden">
                          {/* Top ticket header */}
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-base font-bold text-stone-900 font-heading">{match.full_name}</h4>
                              <p className="text-xs text-stone-500 font-medium">{match.department} • {match.year_of_study}</p>
                            </div>
                            <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold px-2.5 py-1 rounded-xl text-xs font-mono">
                              {match.compatibility_percent}% Match
                            </div>
                          </div>

                          <div className="text-xs space-y-1 bg-[#fffdfa] p-3 rounded-xl border border-[#dfd7c5] font-sans">
                            <p className="text-stone-800">
                              <strong className="text-amber-900 font-semibold">Offers:</strong> {match.teaches?.join(', ')}
                            </p>
                            <p className="text-stone-800">
                              <strong className="text-emerald-800 font-semibold">Wants:</strong> {match.wants?.join(', ')}
                            </p>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            icon={Send}
                            className="w-full shadow-xs font-semibold"
                            onClick={() => handleSendLearningRequest(match)}
                          >
                            Send Learning Request
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Student Passport & Profile Badge */}
              <div className="space-y-6">
                <div className="bg-[#fffdfa] border-2 border-[#dfd7c5] rounded-3xl p-6 shadow-sm relative">
                  {/* Tape pin at top center */}
                  <div className="washi-tape washi-tape-sage -top-3 left-1/2 -translate-x-1/2 w-28 -rotate-1" />

                  {/* Passport / ID header */}
                  <div className="text-center pb-4 border-b-2 border-dashed border-[#dfd7c5] pt-1">
                    {/* Instant photo frame for avatar */}
                    <div className="w-20 h-24 bg-white border-2 border-[#dfd7c5] rounded-sm p-1.5 pb-4 mx-auto shadow-md rotate-1 mb-3">
                      <div className="w-full h-full bg-[#ebdcc2] border border-[#d6c7b2] flex items-center justify-center text-2xl font-bold text-amber-950 font-heading">
                        {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900 font-heading">{userProfile?.full_name || 'Dark sider'}</h3>
                    <p className="text-xs text-amber-900 font-semibold mt-0.5">{userProfile?.department || 'Computer Science'}</p>
                    <p className="text-[11px] text-stone-500 font-mono">{userProfile?.email || 'darksider70117@gmail.com'}</p>
                    
                    <div className="mt-2.5">
                      <span className="stamp-seal-emerald text-[10px]">★ VERIFIED STUDENT ★</span>
                    </div>
                  </div>

                  {/* ID metadata rows */}
                  <div className="pt-4 space-y-2.5 text-xs text-stone-700">
                    <div className="flex justify-between py-1.5 border-b border-[#f0e8d7]">
                      <span className="text-stone-500 font-medium">Year of Study</span>
                      <span className="font-bold text-stone-800 font-sans">{userProfile?.year_of_study || '3rd Year'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#f0e8d7]">
                      <span className="text-stone-500 font-medium">Credit Balance</span>
                      <span className="font-extrabold text-amber-900 font-mono text-sm">{creditBalance} CR</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#f0e8d7]">
                      <span className="text-stone-500 font-medium">Verification Status</span>
                      <Badge variant="emerald" size="sm" icon={ShieldCheck}>VERIFIED</Badge>
                    </div>
                    <div className="pt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full font-semibold shadow-xs"
                        onClick={() => navigate('/skills/me')}
                      >
                        Open Skill & Evidence Portal
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEACHING SKILLS TAB (Reused canonical view) */}
        {activeTab === 'teaching' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Header
                title="Skills I Can Teach"
                description="List skills you are proficient in. Back your offers with evidence proofs to build campus trust."
              />
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => navigate('/skills/me')}
              >
                + Add / Manage at /skills/me
              </Button>
            </div>

            {teachingSkills.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-[#fffdfa] border-2 border-dashed border-[#dfd7c5] text-stone-600 text-xs space-y-3">
                <GraduationCap className="w-8 h-8 mx-auto text-amber-800" />
                <p className="font-heading text-base font-bold text-stone-800">You haven't claimed any teaching skills yet.</p>
                <Button variant="primary" size="sm" onClick={() => navigate('/skills/me')}>
                  Explore Taxonomy & Claim Skills
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teachingSkills.map((userSkill) => (
                  <SkillCard
                    key={userSkill.id}
                    userSkill={userSkill}
                    onOpenEvidence={handleOpenEvidence}
                    onDeleteSkill={handleDeleteSkill}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* LEARNING SKILLS TAB (Reused canonical view) */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Header
                title="Skills I Want to Learn"
                description="Specify topics or tools you need help mastering to match with complementary peer mentors."
              />
              <Button
                variant="emerald"
                size="sm"
                icon={Plus}
                onClick={() => navigate('/skills/me')}
              >
                + Add / Manage at /skills/me
              </Button>
            </div>

            {learningSkills.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-[#fffdfa] border-2 border-dashed border-[#dfd7c5] text-stone-600 text-xs space-y-3">
                <BookOpen className="w-8 h-8 mx-auto text-emerald-800" />
                <p className="font-heading text-base font-bold text-stone-800">No learning targets declared yet.</p>
                <Button variant="emerald" size="sm" onClick={() => navigate('/skills/me')}>
                  Explore Taxonomy & Request Skills
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {learningSkills.map((userSkill) => (
                  <SkillCard
                    key={userSkill.id}
                    userSkill={userSkill}
                    onOpenEvidence={handleOpenEvidence}
                    onDeleteSkill={handleDeleteSkill}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* MATCHES DISCOVERY TAB */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <Header
              title="Campus Skill Matchmaking"
              description="Discover peers whose offered teaching skills align with your learning goals."
            />

            {recommendations.length === 0 ? (
              <div className="text-center py-16 text-stone-600 text-xs bg-[#fffdfa] border-2 border-dashed border-[#dfd7c5] rounded-3xl font-medium">
                No recommendations available yet. Try adding more skills at /skills/me.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.map((rec) => (
                  <RecommendationCard
                    key={rec.user_id}
                    recommendation={rec}
                    onRequestSend={handleSendLearningRequest}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* EXCHANGES TAB (Track B component untouched) */}
        {activeTab === 'exchanges' && (
          <div className="space-y-6">
            <ExchangeSummary onExchangeCompleted={fetchDashboardData} />
          </div>
        )}

        {/* LEARNING REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            <Requests />
          </div>
        )}

        {/* SKILL CREDITS & TRUST ECONOMY TAB */}
        {activeTab === 'credits' && (
          <div className="space-y-8">
            <Header
              title="Skill Credits & Campus Trust Economy"
              description="Track your peer currency ledger, completed exchange payouts, and verification trust tiers."
              badgeText="Trust Ledger"
            />

            {/* Top Credit Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="polaroid-frame p-6 rounded-3xl relative -rotate-1 shadow-md">
                <div className="tape-strip tape-strip-yellow -top-2.5 left-8 w-24 -rotate-2" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-stone-500">Available Balance</span>
                <div className="text-4xl font-extrabold text-stone-900 font-heading mt-2">
                  {creditBalance} <span className="text-amber-800 text-2xl">CR</span>
                </div>
                <p className="text-xs text-stone-600 mt-2 font-medium">Ready for peer exchange matching & learning requests</p>
              </div>

              <div className="polaroid-frame p-6 rounded-3xl relative rotate-1 shadow-md">
                <div className="tape-strip tape-strip-sage -top-2.5 left-8 w-24 rotate-3" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800">Exchange Payout</span>
                <div className="text-4xl font-extrabold text-emerald-900 font-heading mt-2">
                  +50 <span className="text-emerald-700 text-2xl">CR</span>
                </div>
                <p className="text-xs text-stone-600 mt-2 font-medium">Earned automatically upon 1-on-1 session completion</p>
              </div>

              <div className="polaroid-frame p-6 rounded-3xl relative -rotate-1 shadow-md">
                <div className="tape-strip tape-strip-pink -top-2.5 left-8 w-24 -rotate-1" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">Verified Mentor Bonus</span>
                <div className="text-4xl font-extrabold text-amber-950 font-heading mt-2">
                  +25 <span className="text-amber-700 text-2xl">CR</span>
                </div>
                <p className="text-xs text-stone-600 mt-2 font-medium">Extra reward for teaching evidence-verified skills</p>
              </div>
            </div>

            {/* Ledger Rules & Economy Guide */}
            <div className="bg-[#fffdfa] border-2 border-[#dfd7c5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 relative">
              <div className="washi-tape washi-tape-sage -top-3 left-10 w-28 rotate-2" />
              <h3 className="text-xl font-bold text-stone-900 font-heading pt-2">How Campus Credits Work</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-stone-700">
                <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#dfd7c5]">
                  <div className="font-bold text-stone-900 font-heading text-sm mb-1">1. Welcome Grant (100 CR)</div>
                  Every student receives 100 CR upon registration to kickstart learning requests without prior teaching.
                </div>
                <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#dfd7c5]">
                  <div className="font-bold text-stone-900 font-heading text-sm mb-1">2. Peer Exchange (+50 CR)</div>
                  Complete a teaching session and confirm mutual completion to deposit +50 CR directly to your ledger.
                </div>
                <div className="p-4 rounded-2xl bg-[#faf6ee] border border-[#dfd7c5]">
                  <div className="font-bold text-stone-900 font-heading text-sm mb-1">3. Proof Multiplier (+25 CR)</div>
                  Skills backed with verified GitHub projects or certificates earn a +25 CR reputation multiplier.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MY PROFILE & EVIDENCE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Header
                title="Student Identity & Evidence Dossier"
                description="Your verified campus profile, credentials, and evidence attachments."
                badgeText="Verified Student ID"
              />
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => navigate('/skills/me')}
              >
                Manage Full Skill Taxonomy
              </Button>
            </div>

            {/* Student ID Card / Dossier */}
            <div className="relative bg-[#fffdfa] border-2 border-[#dfd7c5] rounded-3xl p-6 sm:p-8 shadow-[3px_6px_22px_rgba(40,30,20,0.07)]">
              <div className="washi-tape washi-tape-pink -top-3 left-8 w-32 -rotate-2" />
              <div className="washi-tape washi-tape-yellow -top-3 right-10 w-28 rotate-3" />

              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 pt-2">
                {/* Polaroid Avatar Frame */}
                <div className="polaroid-frame p-4 rounded-2xl shrink-0 -rotate-2 shadow-md">
                  <div className="w-24 h-24 rounded-xl bg-[#e5dcc7] flex items-center justify-center text-3xl font-extrabold text-stone-800 font-heading border border-[#d6c7b2] shadow-inner">
                    {(userProfile?.full_name || user?.full_name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="mt-2 text-center">
                    <span className="stamp-seal text-[10px] inline-block">★ VERIFIED ★</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 flex-1">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-md border border-amber-300">
                        {userProfile?.department || user?.department || 'Engineering & Science'}
                      </span>
                      <span className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md border border-stone-300">
                        {userProfile?.year_of_study || user?.year_of_study || 'Student'}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
                      {userProfile?.full_name || user?.full_name || 'Campus Scholar'}
                    </h2>
                    <p className="text-xs font-mono text-stone-500 mt-0.5">
                      {userProfile?.email || user?.email}
                    </p>
                  </div>

                  <p className="text-sm text-stone-700 font-medium leading-relaxed max-w-2xl">
                    {userProfile?.bio || user?.bio || 'Active campus learner participating in peer skill swaps.'}
                  </p>

                  <div className="flex items-center gap-3 pt-1 flex-wrap">
                    {(userProfile?.github_url || user?.github_url) && (
                      <a
                        href={userProfile?.github_url || user?.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-[#efe7d3] px-3 py-1.5 rounded-xl border border-[#dfd7c5] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> GitHub Profile
                      </a>
                    )}
                    {(userProfile?.portfolio_url || user?.portfolio_url) && (
                      <a
                        href={userProfile?.portfolio_url || user?.portfolio_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-stone-950 bg-[#efe7d3] px-3 py-1.5 rounded-xl border border-[#dfd7c5] transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Portfolio / Showcase
                      </a>
                    )}
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-200/70 px-3 py-1.5 rounded-xl border border-amber-300 font-mono">
                      <Award className="w-3.5 h-3.5" /> {creditBalance} Skill Credits
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Attached Skills & Proofs Overview */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-stone-900 font-heading">Claimed Skills & Attached Proofs</h3>
                <span className="text-xs text-stone-500 font-handwriting text-sm">
                  {userSkills.length} total active skills
                </span>
              </div>

              {userSkills.length === 0 ? (
                <div className="text-center py-12 rounded-3xl bg-[#fffdfa] border-2 border-dashed border-[#dfd7c5] text-stone-600 text-xs">
                  No skills claimed yet. Click "Manage Full Skill Taxonomy" above to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userSkills.map((userSkill) => (
                    <SkillCard
                      key={userSkill.id}
                      userSkill={userSkill}
                      onOpenEvidence={handleOpenEvidence}
                      onDeleteSkill={handleDeleteSkill}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Evidence Modal for proofs management */}
      <EvidenceUploader
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        userSkill={selectedSkillForEvidence}
        onEvidenceUpdated={fetchDashboardData}
      />
    </div>
  );
};

export default Dashboard;
