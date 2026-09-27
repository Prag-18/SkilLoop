import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import SkillCard from '../components/skills/SkillCard';
import SkillPicker from '../components/skills/SkillPicker';
import EvidenceUploader from '../components/skills/EvidenceUploader';
import {
  GraduationCap,
  BookOpen,
  Plus,
  Sparkles,
  ShieldCheck,
  Search,
  Layers,
  Award,
  TrendingUp,
  Filter,
  CheckCircle2,
  HelpCircle,
  FolderTree,
} from 'lucide-react';

export const SkillProfile = () => {
  const { user } = useAuth();
  const [userSkills, setUserSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'teach' | 'learn' | 'taxonomy'
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Modals state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerDirection, setPickerDirection] = useState('teach');
  const [selectedSkillForEvidence, setSelectedSkillForEvidence] = useState(null);
  const [isEvidenceOpen, setIsEvidenceOpen] = useState(false);

  // Taxonomy Explorer state
  const [taxonomyTree, setTaxonomyTree] = useState([]);
  const [loadingTaxonomy, setLoadingTaxonomy] = useState(false);

  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetchUserSkills();
  }, []);

  useEffect(() => {
    if (activeTab === 'taxonomy' && taxonomyTree.length === 0) {
      fetchTaxonomyTree();
    }
  }, [activeTab]);

  const fetchUserSkills = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/me/skills');
      setUserSkills(res.data || []);
    } catch (err) {
      console.error('Failed to load user skills:', err);
      showToast('Could not load skills. Please check connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTaxonomyTree = async () => {
    try {
      setLoadingTaxonomy(true);
      const res = await api.get('/skills/categories');
      setTaxonomyTree(res.data || []);
    } catch (err) {
      console.error('Failed to fetch taxonomy tree:', err);
      showToast('Failed to fetch university taxonomy.', 'error');
    } finally {
      setLoadingTaxonomy(false);
    }
  };

  const handleDeleteSkill = async (userSkillId) => {
    if (!window.confirm('Are you sure you want to remove this skill from your profile?')) {
      return;
    }
    try {
      setDeletingId(userSkillId);
      await api.delete(`/users/me/skills/${userSkillId}`);
      setUserSkills((prev) => prev.filter((s) => s.id !== userSkillId));
      showToast('Skill successfully removed from your profile.', 'success');
    } catch (err) {
      console.error('Failed to remove skill:', err);
      showToast('Could not remove skill. Please try again.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const openClaimModal = (direction = 'teach') => {
    setPickerDirection(direction);
    setIsPickerOpen(true);
  };

  const openEvidenceModal = (userSkill) => {
    setSelectedSkillForEvidence(userSkill);
    setIsEvidenceOpen(true);
  };

  const handleEvidenceUpdated = () => {
    showToast('Evidence updated! Recalculated confidence score.', 'success');
    fetchUserSkills();
  };

  // Stats Calculations
  const teachingSkills = userSkills.filter((s) => s.direction === 'teach');
  const learningSkills = userSkills.filter((s) => s.direction === 'learn');
  const totalProofs = teachingSkills.reduce(
    (acc, s) => acc + (s.evidence?.length || 0),
    0
  );
  const avgConfidence =
    teachingSkills.length > 0
      ? Math.round(
          teachingSkills.reduce((acc, s) => acc + (s.confidence_score || 0), 0) /
            teachingSkills.length
        )
      : 0;

  // Filter skills based on tab and search
  const filteredSkills = userSkills.filter((item) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'teach' && item.direction === 'teach') ||
      (activeTab === 'learn' && item.direction === 'learn');

    const matchesSearch =
      !searchQuery.trim() ||
      item.skill?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skill?.category_name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-bounce-in">
          <div
            className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold flex items-center gap-2 backdrop-blur-xl ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Skill Header Banner */}
        <div className="relative rounded-3xl overflow-hidden glass-panel border border-slate-800/80 p-6 sm:p-8 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-purple-950/40">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Campus Skill Profile
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-heading tracking-tight">
                My Skills, Taxonomy & Evidence
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                Claim what you can teach and what you want to learn. Back your teaching offers with proof links (GitHub, certificates, live demos) to boost your confidence score.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="md"
                icon={GraduationCap}
                onClick={() => openClaimModal('teach')}
                className="shadow-lg shadow-indigo-600/25"
              >
                + Teach a Skill
              </Button>
              <Button
                variant="emerald"
                size="md"
                icon={BookOpen}
                onClick={() => openClaimModal('learn')}
                className="shadow-lg shadow-emerald-600/25"
              >
                + Learn a Skill
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/60">
            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Teaching (Offers)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-white">{teachingSkills.length}</span>
                <span className="text-xs text-indigo-400 font-semibold">Skills</span>
              </div>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Learning (Wants)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-white">{learningSkills.length}</span>
                <span className="text-xs text-emerald-400 font-semibold">Skills</span>
              </div>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Evidence Proofs</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-white">{totalProofs}</span>
                <span className="text-xs text-purple-400 font-semibold">Attached</span>
              </div>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80">
              <span className="text-xs font-medium text-slate-400 block">Avg Confidence</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-400">{avgConfidence}%</span>
                <span className="text-xs text-slate-400">Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900 border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Skills ({userSkills.length})
            </button>
            <button
              onClick={() => setActiveTab('teach')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'teach'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              I Teach ({teachingSkills.length})
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'learn'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              I Want to Learn ({learningSkills.length})
            </button>
            <button
              onClick={() => setActiveTab('taxonomy')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'taxonomy'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              Browse Full Taxonomy
            </button>
          </div>

          {/* Search inside claimed skills (when not in taxonomy tab) */}
          {activeTab !== 'taxonomy' && (
            <div className="w-full sm:w-72">
              <Input
                icon={Search}
                placeholder="Filter my skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="py-2"
              />
            </div>
          )}
        </div>

        {/* Content Section */}
        {activeTab === 'taxonomy' ? (
          /* Full Taxonomy Tree View */
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white font-heading">
                  University Skill Taxonomy Matrix
                </h2>
                <p className="text-xs text-slate-400">
                  Full 5-pillar skill hierarchy with 3-level deep specializations
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => openClaimModal('teach')}
              >
                Claim a Skill Now
              </Button>
            </div>

            {loadingTaxonomy ? (
              <div className="text-center py-16 text-slate-400 text-sm">
                Loading complete taxonomy...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {taxonomyTree.map((rootCat) => (
                  <Card key={rootCat.id} className="flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white font-heading">
                            {rootCat.name}
                          </h3>
                          <span className="text-[11px] text-slate-400">
                            {rootCat.subcategories?.length || 0} Subcategories
                          </span>
                        </div>
                      </div>

                      {rootCat.description && (
                        <p className="text-xs text-slate-400">{rootCat.description}</p>
                      )}

                      {/* Subcategories */}
                      <div className="space-y-3 pt-2 border-t border-slate-800">
                        {rootCat.subcategories?.map((sub) => (
                          <div key={sub.id} className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-indigo-300">
                                {sub.name}
                              </h4>
                              <span className="text-[10px] text-slate-500">
                                {sub.skills?.length || 0} skills
                              </span>
                            </div>

                            {/* Level 3 subcategories if any */}
                            {sub.subcategories?.map((l3) => (
                              <div key={l3.id} className="pl-2 border-l-2 border-indigo-500/40 space-y-1">
                                <span className="text-[11px] font-semibold text-pink-300 block">
                                  ↳ {l3.name}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {l3.skills?.map((sk) => (
                                    <span key={sk.id} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                                      {sk.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}

                            {/* Direct skills */}
                            {sub.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1">
                                {sub.skills.map((sk) => (
                                  <span key={sk.id} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-slate-300 border border-slate-800">
                                    {sk.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* User Skills Grid */
          <div>
            {loading ? (
              <div className="text-center py-20 text-slate-400 text-sm">
                Loading your skill profile...
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="text-center py-16 rounded-3xl glass-card border border-dashed border-slate-800 p-8 max-w-md mx-auto space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto text-indigo-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading">
                  {searchQuery.trim() ? 'No Matching Skills' : 'No Skills Claimed Yet'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {searchQuery.trim()
                    ? `No claimed skills match "${searchQuery}".`
                    : 'Start building your campus profile by adding skills you can teach to peers or skills you want to learn.'}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={GraduationCap}
                    onClick={() => openClaimModal('teach')}
                  >
                    Teach a Skill
                  </Button>
                  <Button
                    variant="emerald"
                    size="sm"
                    icon={BookOpen}
                    onClick={() => openClaimModal('learn')}
                  >
                    Learn a Skill
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map((userSkill) => (
                  <SkillCard
                    key={userSkill.id}
                    userSkill={userSkill}
                    onOpenEvidence={openEvidenceModal}
                    onDeleteSkill={handleDeleteSkill}
                    isDeleting={deletingId === userSkill.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <SkillPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        defaultDirection={pickerDirection}
        onSkillClaimed={() => {
          fetchUserSkills();
        }}
      />

      <EvidenceUploader
        isOpen={isEvidenceOpen}
        onClose={() => setIsEvidenceOpen(false)}
        userSkill={selectedSkillForEvidence}
        onEvidenceUpdated={handleEvidenceUpdated}
      />

      <Footer />
    </div>
  );
};

export default SkillProfile;
