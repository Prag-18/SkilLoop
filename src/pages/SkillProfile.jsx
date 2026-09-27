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
    <div className="min-h-screen bg-[#faf6ee] text-stone-800 flex flex-col">
      <Navbar />

      {/* Floating Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-bounce-in">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border-2 text-xs font-semibold flex items-center gap-2 ${
              toast.type === 'error'
                ? 'bg-[#fff1f2] border-rose-400 text-rose-900'
                : 'bg-[#ecfdf5] border-emerald-400 text-emerald-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Skill Header Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-[#f4ecd8] border-2 border-[#dfd7c5] p-6 sm:p-8 shadow-[3px_6px_20px_rgba(40,30,20,0.06)]">
          {/* Top washi tape decorative accent */}
          <div className="absolute top-0 right-12 w-28 h-5 bg-[#fde047]/80 -rotate-2 border-b border-[#ca8a04]/40 shadow-xs pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ebdcc2] border border-[#d6c7b2] text-amber-900 text-xs font-semibold font-heading">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-800" />
                Verified Campus Skill Profile
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading tracking-tight">
                My Skills, Taxonomy & Evidence
              </h1>
              <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
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
                className="shadow-md"
              >
                + Teach a Skill
              </Button>
              <Button
                variant="emerald"
                size="md"
                icon={BookOpen}
                onClick={() => openClaimModal('learn')}
                className="shadow-md"
              >
                + Learn a Skill
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#dfd7c5]">
            <div className="bg-[#fffdfa] rounded-2xl p-4 border border-[#dfd7c5] shadow-sm">
              <span className="text-xs font-semibold text-stone-600 block">Teaching (Offers)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-stone-900 font-heading">{teachingSkills.length}</span>
                <span className="text-xs text-amber-800 font-semibold">Skills</span>
              </div>
            </div>

            <div className="bg-[#fffdfa] rounded-2xl p-4 border border-[#dfd7c5] shadow-sm">
              <span className="text-xs font-semibold text-stone-600 block">Learning (Wants)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-stone-900 font-heading">{learningSkills.length}</span>
                <span className="text-xs text-emerald-800 font-semibold">Skills</span>
              </div>
            </div>

            <div className="bg-[#fffdfa] rounded-2xl p-4 border border-[#dfd7c5] shadow-sm">
              <span className="text-xs font-semibold text-stone-600 block">Evidence Proofs</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-stone-900 font-heading">{totalProofs}</span>
                <span className="text-xs text-amber-900 font-semibold">Attached</span>
              </div>
            </div>

            <div className="bg-[#fffdfa] rounded-2xl p-4 border border-[#dfd7c5] shadow-sm">
              <span className="text-xs font-semibold text-stone-600 block">Avg Confidence</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold text-emerald-800 font-heading">{avgConfidence}%</span>
                <span className="text-xs text-stone-500 font-medium">Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Filter & Search Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#ebdcc2] border border-[#d6c7b2] overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              All Skills ({userSkills.length})
            </button>
            <button
              onClick={() => setActiveTab('teach')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'teach'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              I Teach ({teachingSkills.length})
            </button>
            <button
              onClick={() => setActiveTab('learn')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'learn'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-950'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              I Want to Learn ({learningSkills.length})
            </button>
            <button
              onClick={() => setActiveTab('taxonomy')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'taxonomy'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-950'
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
                <h2 className="text-lg font-bold text-stone-900 font-heading">
                  University Skill Taxonomy Matrix
                </h2>
                <p className="text-xs text-stone-600">
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
              <div className="text-center py-16 text-stone-500 text-sm">
                Loading complete taxonomy...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {taxonomyTree.map((rootCat) => (
                  <Card key={rootCat.id} className="flex flex-col justify-between bg-[#fffdfa] border-2 border-[#e5dcc7] shadow-sm">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-[#f4ecd8] border border-[#dfd7c5] text-amber-900">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-stone-900 font-heading">
                            {rootCat.name}
                          </h3>
                          <span className="text-[11px] text-stone-600 font-medium">
                            {rootCat.subcategories?.length || 0} Subcategories
                          </span>
                        </div>
                      </div>

                      {rootCat.description && (
                        <p className="text-xs text-stone-600 leading-relaxed">{rootCat.description}</p>
                      )}

                      {/* Subcategories */}
                      <div className="space-y-3 pt-2 border-t border-[#ede5d3]">
                        {rootCat.subcategories?.map((sub) => (
                          <div key={sub.id} className="bg-[#fbf7ee] rounded-xl p-3 border border-[#dfd7c5] space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-amber-900 font-heading">
                                {sub.name}
                              </h4>
                              <span className="text-[10px] text-stone-500 font-medium">
                                {sub.skills?.length || 0} skills
                              </span>
                            </div>

                            {/* Level 3 subcategories if any */}
                            {sub.subcategories?.map((l3) => (
                              <div key={l3.id} className="pl-2 border-l-2 border-amber-700/50 space-y-1">
                                <span className="text-[11px] font-semibold text-amber-950 block font-heading">
                                  ↳ {l3.name}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {l3.skills?.map((sk) => (
                                    <span key={sk.id} className="text-[10px] bg-[#fffdfa] px-2 py-0.5 rounded text-stone-700 border border-[#dfd7c5]">
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
                                  <span key={sk.id} className="text-[10px] bg-[#fffdfa] px-2 py-0.5 rounded text-stone-700 border border-[#dfd7c5]">
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
              <div className="text-center py-20 text-stone-500 text-sm">
                Loading your skill profile...
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="text-center py-16 rounded-3xl bg-[#fffdfa] border-2 border-dashed border-[#dfd7c5] p-8 max-w-md mx-auto space-y-4 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-[#f4ecd8] border border-[#dfd7c5] flex items-center justify-center mx-auto text-amber-800">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 font-heading">
                  {searchQuery.trim() ? 'No Matching Skills' : 'No Skills Claimed Yet'}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
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
