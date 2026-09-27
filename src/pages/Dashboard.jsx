import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/common/Header';
import { Card, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
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
  Filter
} from 'lucide-react';

import ExchangeSummary from '../components/dashboard/ExchangeSummary';

export const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Sample initial state for Phase 1 demonstration
  const [teachingSkills, setTeachingSkills] = useState([
    { id: 1, name: 'Python & FastAPI Backend', category: 'Programming', level: 'Advanced', evidence: 'github.com/alex/fastapi-demo', rating: 4.9 },
    { id: 2, name: 'UI/UX Design in Figma', category: 'Design', level: 'Intermediate', evidence: 'figma.com/@alexdesign', rating: 4.8 },
  ]);

  const [learningSkills, setLearningSkills] = useState([
    { id: 1, name: 'React Native & Mobile Development', category: 'Mobile', target: 'Intermediate', urgency: 'High' },
    { id: 2, name: 'Calculus III & Linear Algebra', category: 'Academics', target: 'Basic Mastery', urgency: 'Medium' },
  ]);

  const [matches] = useState([
    {
      id: 1,
      name: 'Sarah Chen',
      dept: 'Computer Science',
      year: '4th Year',
      teaches: 'React Native & Flutter',
      wants: 'FastAPI Backend Development',
      matchScore: '98%',
      credits: 140,
    },
    {
      id: 2,
      name: 'Marcus Vance',
      dept: 'Applied Math',
      year: '3rd Year',
      teaches: 'Calculus III & Statistics',
      wants: 'UI/UX Design in Figma',
      matchScore: '94%',
      credits: 90,
    }
  ]);

  const [newTeachSkill, setNewTeachSkill] = useState({ name: '', category: 'Programming', level: 'Intermediate', evidence: '' });
  const [newLearnSkill, setNewLearnSkill] = useState({ name: '', category: 'Programming', target: 'Intermediate', urgency: 'Medium' });

  const handleAddTeachSkill = (e) => {
    e.preventDefault();
    if (!newTeachSkill.name) return;
    setTeachingSkills([...teachingSkills, { ...newTeachSkill, id: Date.now(), rating: 5.0 }]);
    setNewTeachSkill({ name: '', category: 'Programming', level: 'Intermediate', evidence: '' });
  };

  const handleAddLearnSkill = (e) => {
    e.preventDefault();
    if (!newLearnSkill.name) return;
    setLearningSkills([...learningSkills, { ...newLearnSkill, id: Date.now() }]);
    setNewLearnSkill({ name: '', category: 'Programming', target: 'Intermediate', urgency: 'Medium' });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-950">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Dashboard Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <Header
              title={`Welcome back, ${user?.full_name || 'Student'}!`}
              description="Manage your skill offers, learning targets, campus matches, and exchange activity."
              badgeText="Phase 1 Active"
            >
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setActiveTab('teaching')}>
                Offer New Skill
              </Button>
            </Header>

            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card padding="md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Skills I Teach</span>
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mt-2 font-heading">{teachingSkills.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Verified offerings</p>
              </Card>

              <Card padding="md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Skills I Want</span>
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white mt-2 font-heading">{learningSkills.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Active targets</p>
              </Card>

              <Card padding="md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Campus Matches</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-indigo-400 mt-2 font-heading">{matches.length}</p>
                <p className="text-[11px] text-slate-500 mt-1">Complementary peers</p>
              </Card>

              <Card padding="md">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Skill Credits</span>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                    <Award className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-amber-400 mt-2 font-heading">100 CR</p>
                <p className="text-[11px] text-slate-500 mt-1">Available balance</p>
              </Card>
            </div>

            {/* Two Column Layout for Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left 2 Cols: Quick Skills & Matches */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-indigo-400" />
                      Teaching Skills Portfolio
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('teaching')}>
                      View All
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {teachingSkills.map((skill) => (
                      <div key={skill.id} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-100">{skill.name}</span>
                            <Badge variant="indigo" size="sm">{skill.level}</Badge>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Evidence:</span>
                            <span className="text-indigo-400 font-mono">{skill.evidence || 'Self-Declared'}</span>
                          </p>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{skill.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Campus Matches Preview */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-400" />
                      Top Campus Skill Matches
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab('matches')}>
                      Explore All
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {matches.map((match) => (
                      <div key={match.id} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-white">{match.name}</h4>
                            <p className="text-xs text-slate-400">{match.dept} • {match.year}</p>
                          </div>
                          <Badge variant="emerald" size="sm">{match.matchScore} Match</Badge>
                        </div>
                        <div className="text-xs space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                          <p className="text-slate-300">
                            <strong className="text-indigo-400">Teaches:</strong> {match.teaches}
                          </p>
                          <p className="text-slate-300">
                            <strong className="text-emerald-400">Wants:</strong> {match.wants}
                          </p>
                        </div>
                        <Button variant="primary" size="sm" icon={Send} className="w-full">
                          Request Exchange
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right Column: User Profile Summary & Quick Add */}
              <div className="space-y-6">
                <Card>
                  <div className="text-center pb-4 border-b border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 mx-auto flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-3">
                      {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <h3 className="text-base font-bold text-white font-heading">{user?.full_name || 'Student User'}</h3>
                    <p className="text-xs text-indigo-400 mt-0.5">{user?.department || 'Computer Science'}</p>
                    <p className="text-[11px] text-slate-500">{user?.email || 'student@university.edu'}</p>
                  </div>

                  <div className="pt-4 space-y-2.5 text-xs text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-500">Year of Study</span>
                      <span className="font-medium text-slate-200">{user?.year_of_study || '3rd Year'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/40">
                      <span className="text-slate-500">Verification Status</span>
                      <Badge variant="emerald" size="sm" icon={ShieldCheck}>Verified</Badge>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Member Since</span>
                      <span className="font-medium text-slate-200">Sept 2026</span>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* TEACHING SKILLS TAB */}
        {activeTab === 'teaching' && (
          <div className="space-y-6">
            <Header
              title="Skills I Can Teach"
              description="List skills you are proficient in. Add evidence like GitHub repos or portfolios to build campus trust."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {teachingSkills.map((skill) => (
                  <Card key={skill.id} padding="md">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{skill.name}</CardTitle>
                          <Badge variant="indigo">{skill.level}</Badge>
                          <Badge variant="slate">{skill.category}</Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                          <span>Evidence Link:</span>
                          {skill.evidence ? (
                            <a href={`https://${skill.evidence}`} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1 font-mono">
                              {skill.evidence} <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-slate-500">No URL attached</span>
                          )}
                        </p>
                      </div>
                      <Badge variant="emerald" icon={CheckCircle2}>Active</Badge>
                    </div>
                  </Card>
                ))}
              </div>

              <div>
                <Card>
                  <CardTitle className="mb-4">Add Teaching Skill</CardTitle>
                  <form onSubmit={handleAddTeachSkill} className="space-y-4">
                    <Input
                      label="Skill Name"
                      placeholder="e.g. Python Backend"
                      value={newTeachSkill.name}
                      onChange={(e) => setNewTeachSkill({ ...newTeachSkill, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Evidence / Portfolio URL"
                      placeholder="github.com/your-username"
                      value={newTeachSkill.evidence}
                      onChange={(e) => setNewTeachSkill({ ...newTeachSkill, evidence: e.target.value })}
                    />
                    <Button type="submit" variant="primary" icon={Plus} className="w-full">
                      Add to Teaching Portfolio
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* LEARNING SKILLS TAB */}
        {activeTab === 'learning' && (
          <div className="space-y-6">
            <Header
              title="Skills I Want to Learn"
              description="Specify what topics or courses you need help mastering to match with complementary mentors."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {learningSkills.map((skill) => (
                  <Card key={skill.id} padding="md">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle>{skill.name}</CardTitle>
                          <Badge variant="emerald">{skill.target}</Badge>
                          <Badge variant="amber">Urgency: {skill.urgency}</Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Category: <span className="text-slate-200">{skill.category}</span>
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div>
                <Card>
                  <CardTitle className="mb-4">Add Learning Target</CardTitle>
                  <form onSubmit={handleAddLearnSkill} className="space-y-4">
                    <Input
                      label="Skill Name"
                      placeholder="e.g. React Native"
                      value={newLearnSkill.name}
                      onChange={(e) => setNewLearnSkill({ ...newLearnSkill, name: e.target.value })}
                      required
                    />
                    <Button type="submit" variant="emerald" icon={Plus} className="w-full">
                      Add Learning Desire
                    </Button>
                  </form>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* MATCHES DISCOVERY TAB */}
        {activeTab === 'matches' && (
          <div className="space-y-6">
            <Header
              title="Campus Skill Matchmaking"
              description="Discover peers whose offered teaching skills align with your learning goals."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matches.map((match) => (
                <Card key={match.id} padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300">
                        {match.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{match.name}</h3>
                        <p className="text-xs text-slate-400">{match.dept} • {match.year}</p>
                      </div>
                    </div>
                    <Badge variant="emerald">{match.matchScore} Match</Badge>
                  </div>

                  <div className="p-3 bg-slate-900/90 rounded-xl space-y-2 text-xs mb-4">
                    <p className="text-slate-300"><strong className="text-indigo-400">Offers:</strong> {match.teaches}</p>
                    <p className="text-slate-300"><strong className="text-emerald-400">Wants:</strong> {match.wants}</p>
                  </div>

                  <Button variant="primary" icon={Send} className="w-full">
                    Send Learning Request
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* EXCHANGES TAB */}
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
              description="Phase 1 Foundation layout ready for extended data models."
            />
            <Card padding="lg" className="text-center py-12">
              <ShieldCheck className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
              <CardTitle className="text-xl">Phase 1 Infrastructure Ready</CardTitle>
              <CardDescription className="max-w-md mx-auto mt-2">
                This dashboard shell is fully hooked up with JWT authentication and responsive React router navigation.
              </CardDescription>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
