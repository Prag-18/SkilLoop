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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div>
            <h2 className="text-xl font-bold text-white font-heading flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Claim Skill from Taxonomy
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Explore university verified skill categories or search across the campus graph
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Claim Config Bar */}
        <div className="p-4 bg-slate-900/40 border-b border-slate-800/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
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
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setDirection('teach')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  direction === 'teach'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                I Teach (Offer)
              </button>
              <button
                type="button"
                onClick={() => setDirection('learn')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  direction === 'learn'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                I Want (Learn)
              </button>
            </div>

            {/* Proficiency Level */}
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="rounded-xl bg-slate-950 border border-slate-800 px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
            <div className="flex-1 p-5 overflow-y-auto max-h-[480px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Search Results ({filteredSkills.length})
                </span>
              </div>
              {filteredSkills.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">
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
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/10'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-semibold text-white">{skill.name}</h4>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                        </div>
                        {skill.category_name && (
                          <span className="text-[11px] text-indigo-300/80 font-medium block mt-0.5">
                            {skill.category_name}
                          </span>
                        )}
                        {skill.description && (
                          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
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
              <div className="w-full md:w-56 border-r border-slate-800/80 bg-slate-950/40 p-3 overflow-y-auto space-y-1 shrink-0">
                <div className="px-2 py-1 mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Category Tree & Skill Selector Pane */}
              <div className="flex-1 p-5 overflow-y-auto max-h-[480px]">
                {loading ? (
                  <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
                    Loading category taxonomy...
                  </div>
                ) : selectedCategory ? (
                  <div className="space-y-6">
                    {/* Category Header */}
                    <div>
                      <h3 className="text-lg font-bold text-white font-heading">
                        {selectedCategory.name}
                      </h3>
                      {selectedCategory.description && (
                        <p className="text-xs text-slate-400 mt-1">
                          {selectedCategory.description}
                        </p>
                      )}
                    </div>

                    {/* Direct Skills if any */}
                    {selectedCategory.skills?.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          General {selectedCategory.name} Skills
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {selectedCategory.skills.map((skill) => {
                            const isSelected = selectedSkill?.id === skill.id;
                            return (
                              <div
                                key={skill.id}
                                onClick={() => setSelectedSkill(skill)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                  isSelected
                                    ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/10'
                                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <h4 className="text-xs font-semibold text-white">{skill.name}</h4>
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                                </div>
                                {skill.description && (
                                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
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
                      <div key={subcat.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-indigo-300 font-heading">
                              {subcat.name}
                            </h4>
                            {subcat.description && (
                              <p className="text-[11px] text-slate-400 mt-0.5">{subcat.description}</p>
                            )}
                          </div>
                          <Badge variant="indigo" size="sm">Subcategory</Badge>
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
                                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                    isSelected
                                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-600/10'
                                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                                  }`}
                                >
                                  <div className="flex items-start justify-between">
                                    <h5 className="text-xs font-semibold text-white">{skill.name}</h5>
                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                                  </div>
                                  {skill.description && (
                                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
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
                          <div key={l3cat.id} className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 space-y-2 mt-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                              <span className="text-xs font-bold text-slate-200">
                                {l3cat.name}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">(Deep Specialization)</span>
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
                                        ? 'bg-indigo-600/25 border-indigo-400 shadow-md'
                                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between">
                                      <h6 className="text-xs font-medium text-white">{skill.name}</h6>
                                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                                    </div>
                                    {skill.description && (
                                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">
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
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {selectedSkill ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Selected:</span>
                <span className="font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                  {selectedSkill.name}
                </span>
                <Badge variant={direction === 'teach' ? 'indigo' : 'emerald'} size="sm">
                  {direction.toUpperCase()} ({level})
                </Badge>
              </div>
            ) : (
              <span className="text-xs text-slate-500 italic flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Click any skill above to select
              </span>
            )}
          </div>

          {errorMessage && (
            <span className="text-xs font-semibold text-rose-400">{errorMessage}</span>
          )}
          {successMessage && (
            <span className="text-xs font-semibold text-emerald-400">{successMessage}</span>
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
