import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import {
  Search,
  BookOpen,
  Code,
  Palette,
  Briefcase,
  Wrench,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  X,
  Layers,
  HelpCircle,
} from 'lucide-react';

const CATEGORY_ICONS = {
  Technical: Code,
  Creative: Palette,
  Knowledge: BookOpen,
  Professional: Briefcase,
  Practical: Wrench,
};

export const SkillPicker = ({
  isOpen,
  onClose,
  onSkillClaimed,
  defaultDirection = 'teach',
}) => {
  const [categories, setCategories] = useState([]);
  const [flatSkills, setFlatSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [direction, setDirection] = useState(defaultDirection);
  const [level, setLevel] = useState('Intermediate');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDirection(defaultDirection);
      setSelectedSkill(null);
      setErrorMessage('');
      setSuccessMessage('');
      fetchTaxonomy();
    }
  }, [isOpen, defaultDirection]);

  const fetchTaxonomy = async () => {
    try {
      setLoading(true);
      const [treeRes, skillsRes] = await Promise.all([
        api.get('/skills/categories'),
        api.get('/skills'),
      ]);
      setCategories(treeRes.data || []);
      setFlatSkills(skillsRes.data || []);
      if (treeRes.data && treeRes.data.length > 0 && !selectedCategory) {
        setSelectedCategory(treeRes.data[0]);
      }
    } catch (err) {
      console.error('Failed to load taxonomy:', err);
      setErrorMessage('Failed to load skill taxonomy tree.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!selectedSkill) {
      setErrorMessage('Please select a skill to claim.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      const res = await api.post('/users/me/skills', {
        skill_id: selectedSkill.id,
        direction,
        level,
      });

      setSuccessMessage(`Successfully added "${selectedSkill.name}" to your ${direction} profile!`);
      setTimeout(() => {
        if (onSkillClaimed) onSkillClaimed(res.data);
        onClose();
      }, 700);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to claim skill.';
      setErrorMessage(detail);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Filter skills by search query if present, otherwise by selected category hierarchy
  const filteredSkills = searchQuery.trim()
    ? flatSkills.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.category_name && s.category_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.description && s.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#faf6ee] border-2 border-[#dfd7c5] rounded-3xl w-full max-w-4xl shadow-[0_20px_50px_rgba(40,30,20,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#dfd7c5] flex items-center justify-between bg-[#f4ecd8]/60">
          <div>
            <h2 className="text-xl font-bold text-stone-900 font-heading flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-800" />
              Claim Skill from Taxonomy
            </h2>
            <p className="text-xs text-stone-600 mt-0.5 font-medium">
              Explore university verified skill categories or search across the campus graph
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#ebdcc2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Claim Config Bar */}
        <div className="p-4 bg-[#fcf9f2] border-b border-[#dfd7c5] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="w-full sm:w-80">
            <Input
              icon={Search}
              placeholder="Search all skills (e.g., PyTorch, Figma)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="py-2"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {/* Direction Selector */}
            <div className="flex rounded-xl bg-[#ebdcc2] p-1 border border-[#d6c7b2]">
              <button
                type="button"
                onClick={() => setDirection('teach')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  direction === 'teach'
                    ? 'bg-amber-800 text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                I Teach (Offer)
              </button>
              <button
                type="button"
                onClick={() => setDirection('learn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  direction === 'learn'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-700 hover:text-stone-950'
                }`}
              >
                I Want (Learn)
              </button>
            </div>

            {/* Proficiency Level */}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="rounded-xl bg-[#fffdfa] border border-[#dfd7c5] px-3 py-1.5 text-xs text-stone-800 font-medium focus:outline-none focus:border-amber-700 shadow-sm"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {searchQuery.trim() ? (
            /* Search Results View */
            <div className="flex-1 p-5 overflow-y-auto max-h-[480px] bg-[#fffdfa]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider font-heading">
                  Search Results ({filteredSkills.length})
                </span>
              </div>
              {filteredSkills.length === 0 ? (
                <div className="text-center py-12 text-stone-500 text-sm">
                  No taxonomy skills match "{searchQuery}". Try browsing categories.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredSkills.map((skill) => {
                    const isSelected = selectedSkill?.id === skill.id;
                    return (
                      <div
                        key={skill.id}
                        onClick={() => setSelectedSkill(skill)}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#fef3c7] border-amber-600 shadow-sm'
                            : 'bg-[#faf6ee] border-[#dfd7c5] hover:border-amber-400 hover:bg-[#fbf7ee]'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-bold text-stone-900 font-heading">{skill.name}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />}
                        </div>
                        {skill.category_name && (
                          <span className="text-[11px] text-amber-800 font-medium block mt-0.5">
                            {skill.category_name}
                          </span>
                        )}
                        {skill.description && (
                          <p className="text-xs text-stone-600 mt-1.5 line-clamp-2">
                            {skill.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Hierarchical Category Tree View */
            <>
              {/* Category Roots Sidebar */}
              <div className="w-full md:w-56 border-r border-[#dfd7c5] bg-[#f4ecd8]/60 p-3 overflow-y-auto space-y-1 shrink-0">
                <div className="px-2 py-1 mb-1">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider font-heading">
                    Taxonomy Pillars
                  </span>
                </div>
                {categories.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.name] || Layers;
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-amber-800 text-white shadow-sm'
                          : 'text-stone-700 hover:text-stone-900 hover:bg-[#ebdcc2]/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-stone-400'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Category Tree & Skill Selector Pane */}
              <div className="flex-1 p-5 overflow-y-auto max-h-[480px] bg-[#fffdfa]">
                {loading ? (
                  <div className="flex items-center justify-center h-48 text-stone-500 text-sm">
                    Loading category taxonomy...
                  </div>
                ) : selectedCategory ? (
                  <div className="space-y-6">
                    {/* Category Header */}
                    <div>
                      <h3 className="text-lg font-bold text-stone-900 font-heading">
                        {selectedCategory.name}
                      </h3>
                      {selectedCategory.description && (
                        <p className="text-xs text-stone-600 mt-1">
                          {selectedCategory.description}
                        </p>
                      )}
                    </div>

                    {/* Direct Skills if any */}
                    {selectedCategory.skills?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-stone-600 uppercase tracking-wider font-heading">
                          General {selectedCategory.name} Skills
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {selectedCategory.skills.map((skill) => {
                            const isSelected = selectedSkill?.id === skill.id;
                            return (
                              <div
                                key={skill.id}
                                onClick={() => setSelectedSkill(skill)}
                                className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-[#fef3c7] border-amber-600 shadow-sm'
                                    : 'bg-[#faf6ee] border-[#dfd7c5] hover:border-amber-400 hover:bg-[#fbf7ee]'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <h4 className="text-xs font-bold text-stone-900 font-heading">{skill.name}</h4>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                                </div>
                                {skill.description && (
                                  <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                                    {skill.description}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Subcategories (Level 2 & Level 3) */}
                    {selectedCategory.subcategories?.map((subcat) => (
                      <div key={subcat.id} className="bg-[#faf6ee] border-2 border-[#dfd7c5] rounded-2xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-amber-900 font-heading">
                              {subcat.name}
                            </h4>
                            {subcat.description && (
                              <p className="text-[11px] text-stone-600 mt-0.5">{subcat.description}</p>
                            )}
                          </div>
                          <Badge variant="amber" size="sm">Subcategory</Badge>
                        </div>

                        {/* Level 2 Skills */}
                        {subcat.skills?.length > 0 && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {subcat.skills.map((skill) => {
                              const isSelected = selectedSkill?.id === skill.id;
                              return (
                                <div
                                  key={skill.id}
                                  onClick={() => setSelectedSkill(skill)}
                                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                    isSelected
                                      ? 'bg-[#fef3c7] border-amber-600 shadow-sm'
                                      : 'bg-[#fffdfa] border-[#dfd7c5] hover:border-amber-400 hover:bg-[#fbf7ee]'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <h5 className="text-xs font-bold text-stone-900 font-heading">{skill.name}</h5>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                                  </div>
                                  {skill.description && (
                                    <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">
                                      {skill.description}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Level 3 Subcategories (e.g. Technical > AI/ML > Machine Learning) */}
                        {subcat.subcategories?.map((l3cat) => (
                          <div key={l3cat.id} className="bg-[#f4ecd8]/70 border border-[#dfd7c5] rounded-xl p-3 space-y-2 mt-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                              <span className="text-xs font-bold text-stone-800 font-heading">
                                {l3cat.name}
                              </span>
                              <span className="text-[10px] text-stone-500 font-medium">(Deep Specialization)</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {l3cat.skills?.map((skill) => {
                                const isSelected = selectedSkill?.id === skill.id;
                                return (
                                  <div
                                    key={skill.id}
                                    onClick={() => setSelectedSkill(skill)}
                                    className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                                      isSelected
                                        ? 'bg-[#fef3c7] border-amber-600 shadow-xs'
                                        : 'bg-[#fffdfa] border-[#dfd7c5] hover:border-amber-400'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <h6 className="text-xs font-semibold text-stone-900">{skill.name}</h6>
                                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />}
                                    </div>
                                    {skill.description && (
                                      <p className="text-[10px] text-stone-600 mt-0.5 line-clamp-2">
                                        {skill.description}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Selected Skill Confirmation & Footer */}
        <div className="p-4 border-t border-[#dfd7c5] bg-[#f4ecd8]/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {selectedSkill ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-stone-600 font-medium">Selected:</span>
                <span className="font-bold text-stone-900 bg-[#fffdfa] px-2.5 py-1 rounded-lg border border-[#dfd7c5] font-heading">
                  {selectedSkill.name}
                </span>
                <Badge variant={direction === 'teach' ? 'amber' : 'emerald'} size="sm">
                  {direction.toUpperCase()} ({level})
                </Badge>
              </div>
            ) : (
              <span className="text-xs text-stone-500 italic flex items-center gap-1.5 font-handwriting text-sm">
                <HelpCircle className="w-4 h-4 text-stone-400" /> Click any skill above to select
              </span>
            )}
          </div>

          {errorMessage && (
            <span className="text-xs font-semibold text-rose-600">{errorMessage}</span>
          )}
          {successMessage && (
            <span className="text-xs font-semibold text-emerald-700">{successMessage}</span>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant={direction === 'teach' ? 'primary' : 'emerald'}
              size="sm"
              disabled={!selectedSkill || submitting}
              isLoading={submitting}
              onClick={handleClaim}
            >
              Claim Skill
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillPicker;
