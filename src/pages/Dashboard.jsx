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
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <Header
              title={`Welcome back, ${userProfile?.full_name || user?.full_name || 'Student'}!`}
              description="Manage your skill offers, learning targets, campus matches, and exchange activity."
              badgeText="Phase 1 Active"
            >
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => navigate('/skills/me')}
              >
                Manage Skill Profile
              </Button>
            </Header>

            {/* Top Metric Cards in Scrapbook style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="polaroid-frame p-4 rounded-2xl relative -rotate-1">
                <div className="tape-strip tape-strip-yellow -top-2 left-6 -rotate-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600 font-semibold font-sans">Skills I Teach</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-stone-900 mt-2 font-heading">{teachingSkills.length}</p>
                <p className="text-[11px] text-stone-500 mt-1 font-sans">Verified offerings</p>
              </div>

              <div className="polaroid-frame p-4 rounded-2xl relative rotate-1">
                <div className="tape-strip tape-strip-pink -top-2 right-6 rotate-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600 font-semibold font-sans">Skills I Want</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-stone-900 mt-2 font-heading">{learningSkills.length}</p>
                <p className="text-[11px] text-stone-500 mt-1 font-sans">Active targets</p>
              </div>

              <div className="polaroid-frame p-4 rounded-2xl relative -rotate-1">
                <div className="tape-strip tape-strip-sky -top-2 left-6 -rotate-1" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600 font-semibold font-sans">Campus Matches</span>
                  <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-800">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-sky-900 mt-2 font-heading">{recommendations.length}</p>
                <p className="text-[11px] text-stone-500 mt-1 font-sans">Complementary peers</p>
              </div>

              <div className="polaroid-frame p-4 rounded-2xl relative rotate-1">
                <div className="tape-strip tape-strip-sage -top-2 right-6 rotate-3" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-600 font-semibold font-sans">Skill Credits</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-amber-800 mt-2 font-heading">{creditBalance} CR</p>
                <p className="text-[11px] text-stone-500 mt-1 font-sans">Available balance</p>
              </div>
            </div>

            {/* Two Column Layout for Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Quick Skills & Matches */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-800" />
                      Teaching Skills Portfolio
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/skills/me')}>
                      Manage at /skills/me <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </div>

                  {teachingSkills.length === 0 ? (
                    <div className="text-center py-8 rounded-xl border-2 border-dashed border-[#d6c5a5] bg-[#fdfbf7] text-stone-500 text-xs space-y-2">
                      <p>No teaching skills claimed yet.</p>
                      <Button variant="primary" size="sm" onClick={() => navigate('/skills/me')}>
                        + Claim Skills from Taxonomy
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {teachingSkills.slice(0, 3).map((skill) => (
                        <div key={skill.id} className="p-3.5 rounded-xl bg-[#fefdf9] border border-[#e5dcc7] shadow-sm flex items-center justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-stone-900 font-sans">{skill.skill?.name}</span>
                              <Badge variant="indigo" size="sm">{skill.level}</Badge>
                            </div>
                            <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-2 font-sans">
                              <span>Confidence:</span>
                              <span className="text-amber-800 font-bold">{skill.confidence_score}%</span>
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
                </Card>

                {/* Campus Matches Preview */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-amber-700" />
                      Top Campus Skill Matches
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('matches')}>
                      Explore All ({recommendations.length})
                    </Button>
                  </div>

                  {recommendations.length === 0 ? (
                    <div className="text-center py-8 text-stone-500 text-xs bg-[#fdfbf7] rounded-xl border border-dashed border-[#d6c5a5]">
                      No matches found yet. Add more teach/learn skills at /skills/me to generate peer recommendations.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {recommendations.slice(0, 2).map((match) => (
                        <div key={match.user_id} className="p-4 rounded-xl bg-[#fefdf9] border border-[#e5dcc7] shadow-sm flex flex-col justify-between space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="text-sm font-bold text-stone-900 font-heading text-base">{match.full_name}</h4>
                              <p className="text-xs text-stone-500">{match.department} • {match.year_of_study}</p>
                            </div>
                            <Badge variant="emerald" size="sm">{match.compatibility_percent}% Match</Badge>
                          </div>
                          <div className="text-xs space-y-1 bg-[#fbf7ed] p-2.5 rounded-lg border border-[#e5dcc7]">
                            <p className="text-stone-800">
                              <strong className="text-amber-800">Offers:</strong> {match.teaches?.join(', ')}
                            </p>
                            <p className="text-stone-800">
                              <strong className="text-emerald-800">Wants:</strong> {match.wants?.join(', ')}
                            </p>
                          </div>
                          <Button
                            variant="primary"
                            size="sm"
                            icon={Send}
                            className="w-full"
                            onClick={() => handleSendLearningRequest(match)}
                          >
                            Send Learning Request
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Column: User Profile Summary */}
              <div className="space-y-6">
                <Card>
                  <div className="text-center pb-4 border-b border-stone-200">
                    <div className="w-16 h-16 rounded-full bg-amber-200 border-2 border-amber-400 mx-auto flex items-center justify-center text-2xl font-bold text-stone-900 font-heading shadow-md mb-3">
                      {userProfile?.full_name ? userProfile.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <h3 className="text-base font-bold text-stone-900 font-heading">{userProfile?.full_name || 'Student User'}</h3>
                    <p className="text-xs text-amber-800 font-medium mt-0.5">{userProfile?.department || 'Computer Science'}</p>
                    <p className="text-[11px] text-stone-500">{userProfile?.email || 'student@university.edu'}</p>
                  </div>

                  <div className="pt-4 space-y-2.5 text-xs text-stone-700">
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500">Year of Study</span>
                      <span className="font-semibold text-stone-800">{userProfile?.year_of_study || '3rd Year'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500">Credit Balance</span>
                      <span className="font-bold text-emerald-800">{creditBalance} CR</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-stone-200">
                      <span className="text-stone-500">Verification Status</span>
                      <Badge variant="emerald" size="sm" icon={ShieldCheck}>Verified</Badge>
                    </div>
                    <div className="pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => navigate('/skills/me')}
                      >
                        Open Skill & Evidence Portal
                      </Button>
                    </div>
                  </div>
                </Card>
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
            <ExchangeSummary />
          </div>
        )}

        {/* OTHER TABS PLACEHOLDERS */}
        {(activeTab === 'requests' || activeTab === 'credits' || activeTab === 'profile') && (
          <div className="space-y-6">
            <Header
              title={activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              description="Campus skill exchange portal."
            />
            <Card padding="lg" className="text-center py-12 bg-[#fffdfa] border-2 border-[#e5dcc7]">
              <ShieldCheck className="w-12 h-12 text-amber-800 mx-auto mb-3" />
              <CardTitle className="text-xl font-heading text-stone-900">Campus Skill Exchange Active</CardTitle>
              <CardDescription className="max-w-md mx-auto mt-2 text-stone-600 font-medium">
                Manage your skills, proofs, and peer exchanges seamlessly.
              </CardDescription>
              <div className="mt-4">
                <Button variant="primary" size="sm" onClick={() => navigate('/skills/me')}>
                  Go to /skills/me
                </Button>
              </div>
            </Card>
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
