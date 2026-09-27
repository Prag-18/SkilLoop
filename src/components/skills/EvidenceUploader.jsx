import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import {
  ShieldCheck,
  Link2,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  Award,
  Video,
  FileCode2,
  BookOpen,
  Trophy,
  X,
  RefreshCw,
} from 'lucide-react';

const EVIDENCE_TYPES = [
  {
    id: 'project',
    label: 'Code / Project',
    icon: FileCode2,
    baseWeight: 30,
    desc: 'GitHub repo, live deployment (Vercel/Netlify), or PR link',
    example: 'https://github.com/username/project',
  },
  {
    id: 'credential',
    label: 'Certificate / Course',
    icon: Award,
    baseWeight: 35,
    desc: 'Coursera, Udemy, LeetCode, Kaggle, university badge',
    example: 'https://coursera.org/verify/ABC123',
  },
  {
    id: 'demo',
    label: 'Video Demo',
    icon: Video,
    baseWeight: 20,
    desc: 'Loom walkthrough, YouTube recording, or interactive demo',
    example: 'https://youtube.com/watch?v=xyz',
  },
  {
    id: 'achievement',
    label: 'Achievement / Award',
    icon: Trophy,
    baseWeight: 25,
    desc: 'Hackathon prize, contest rank, open source bounty',
    example: 'https://devpost.com/software/project',
  },
  {
    id: 'knowledge',
    label: 'Knowledge / Article',
    icon: BookOpen,
    baseWeight: 15,
    desc: 'Technical blog post, research paper, Medium, Dev.to',
    example: 'https://medium.com/@user/article',
  },
];

export const EvidenceUploader = ({
  isOpen,
  onClose,
  userSkill,
  onEvidenceUpdated,
}) => {
  const [evidenceList, setEvidenceList] = useState([]);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [url, setUrl] = useState('');
  const [type, setType] = useState('project');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen && userSkill) {
      setUrl('');
      setDescription('');
      setType('project');
      setErrorMessage('');
      setSuccessMessage('');
      fetchEvidence();
    }
  }, [isOpen, userSkill]);

  const fetchEvidence = async () => {
    if (!userSkill) return;
    try {
      setLoadingEvidence(true);
      const res = await api.get(`/skills/${userSkill.id}/evidence`);
      setEvidenceList(res.data || []);
    } catch (err) {
      console.error('Failed to fetch evidence:', err);
    } finally {
      setLoadingEvidence(false);
    }
  };

  const handleAddEvidence = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setErrorMessage('Please provide a valid evidence URL.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      const res = await api.post(`/skills/${userSkill.id}/evidence`, {
        url: url.trim(),
        type,
        description: description.trim() || undefined,
      });

      setSuccessMessage('Evidence attached successfully! Confidence score updated.');
      setUrl('');
      setDescription('');
      await fetchEvidence();

      if (onEvidenceUpdated) {
        onEvidenceUpdated();
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Failed to attach evidence.';
      setErrorMessage(detail);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEvidence = async (evidenceId) => {
    try {
      setVerifyingId(evidenceId);
      setErrorMessage('');
      const res = await api.patch(`/evidence/${evidenceId}/verify`);
      setSuccessMessage(
        `Verification updated: State is now "${res.data.verification_state}". Confidence recalculated to ${res.data.confidence_score}%.`
      );
      await fetchEvidence();
      if (onEvidenceUpdated) {
        onEvidenceUpdated();
      }
    } catch (err) {
      const detail = err.response?.data?.detail || 'Verification request failed.';
      setErrorMessage(detail);
    } finally {
      setVerifyingId(null);
    }
  };

  if (!isOpen || !userSkill) return null;

  const currentScore = userSkill.confidence_score || 0;
  const scoreVariant =
    currentScore >= 75 ? 'emerald' : currentScore >= 40 ? 'indigo' : 'slate';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#faf6ee] border-2 border-[#dfd7c5] rounded-3xl w-full max-w-2xl shadow-[0_20px_50px_rgba(40,30,20,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#dfd7c5] flex items-center justify-between bg-[#f4ecd8]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ebdcc2] border border-[#d6c7b2] flex items-center justify-center text-amber-900 shadow-inner">
              <ShieldCheck className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900 font-heading flex items-center gap-2">
                Evidence & Verification
                <Badge variant={scoreVariant === 'emerald' ? 'emerald' : scoreVariant === 'indigo' ? 'amber' : 'slate'} size="sm">
                  {currentScore}% Confidence
                </Badge>
              </h2>
              <p className="text-xs text-stone-600 font-medium">
                Skill: <span className="text-stone-900 font-bold">{userSkill.skill?.name}</span> ({userSkill.direction.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-[#ebdcc2] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#fffdfa]">
          {/* Confidence Score Progress Bar Banner */}
          <div className="bg-[#fbf7ee] border-2 border-[#e5dcc7] rounded-2xl p-4 space-y-2 shadow-inner">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800 flex items-center gap-1.5 font-heading">
                <Sparkles className="w-3.5 h-3.5 text-amber-800" />
                Proof Trust & Recommendation Weight
              </span>
              <span className="font-bold text-amber-900 font-mono text-sm">{currentScore} / 100</span>
            </div>
            <div className="w-full bg-[#ebdcc2] h-3 rounded-full overflow-hidden border border-[#d6c7b2]/70">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  currentScore >= 75
                    ? 'bg-emerald-600'
                    : currentScore >= 40
                    ? 'bg-amber-700'
                    : 'bg-stone-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, currentScore))}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed font-medium">
              Attaching verified repository links, certificates, or video demos directly boosts your confidence score and match ranking.
            </p>
          </div>

          {/* Form to Attach New Evidence */}
          <form onSubmit={handleAddEvidence} className="bg-[#faf6ee] border-2 border-[#dfd7c5] rounded-2xl p-4 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5 font-heading">
              <Plus className="w-3.5 h-3.5 text-amber-800" /> Attach New Evidence Link
            </h3>

            {/* Evidence Type Selection */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                Proof Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EVIDENCE_TYPES.map((et) => {
                  const Icon = et.icon;
                  const isSelected = type === et.id;
                  return (
                    <button
                      key={et.id}
                      type="button"
                      onClick={() => setType(et.id)}
                      className={`p-2.5 rounded-xl border-2 text-left flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-[#fef3c7] border-amber-600 text-stone-900 shadow-sm'
                          : 'bg-[#fffdfa] border-[#dfd7c5] text-stone-600 hover:text-stone-900 hover:border-amber-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-800' : 'text-stone-500'}`} />
                      <div className="truncate">
                        <div className="text-xs font-bold truncate font-heading">{et.label}</div>
                        <div className="text-[10px] text-amber-900 font-medium">+{et.baseWeight} pts max</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* URL Input */}
            <div>
              <Input
                label="Evidence URL"
                icon={Link2}
                placeholder={EVIDENCE_TYPES.find((t) => t.id === type)?.example || 'https://...'}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="text-xs font-semibold text-stone-700 tracking-wide block mb-1.5">
                Description / Context (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Explain what this repo/certificate showcases (e.g., implemented transformer pipeline from scratch)..."
                className="w-full rounded-xl bg-[#fffdfa] border border-[#dfd7c5] focus:border-amber-700 focus:ring-2 focus:ring-amber-700/15 px-3 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none transition-all shadow-sm"
              />
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-[#fff1f2] border-2 border-rose-300 text-xs text-rose-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-2.5 rounded-lg bg-[#ecfdf5] border-2 border-emerald-300 text-xs text-emerald-900 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={submitting}
                disabled={submitting || !url.trim()}
                className="shadow-sm font-semibold"
              >
                Submit Evidence Proof
              </Button>
            </div>
          </form>

          {/* Existing Evidence List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider font-heading">
              Attached Proofs ({evidenceList.length})
            </h3>

            {loadingEvidence ? (
              <div className="text-center py-6 text-xs text-stone-500 font-medium">Loading attached proofs...</div>
            ) : evidenceList.length === 0 ? (
              <div className="text-center py-8 rounded-2xl border-2 border-dashed border-[#dfd7c5] bg-[#faf6ee] text-stone-600 text-xs">
                No evidence attached yet. Add a GitHub repository, portfolio, or certificate above to increase your trust score.
              </div>
            ) : (
              <div className="space-y-2.5">
                {evidenceList.map((ev) => {
                  const evMeta = EVIDENCE_TYPES.find((t) => t.id === ev.type) || EVIDENCE_TYPES[0];
                  const Icon = evMeta.icon;
                  const isVerified = ev.verification_state === 'verified';
                  const isPending = ev.verification_state === 'pending';

                  return (
                    <div
                      key={ev.id}
                      className="bg-[#faf6ee] border-2 border-[#e5dcc7] rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-[#ebdcc2] border border-[#d6c7b2] text-amber-900 shrink-0 mt-0.5 shadow-inner">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-stone-900 capitalize font-heading">
                              {ev.type}
                            </span>
                            <Badge
                              variant={isVerified ? 'emerald' : isPending ? 'amber' : 'slate'}
                              size="sm"
                              icon={isVerified ? CheckCircle : isPending ? Clock : AlertCircle}
                            >
                              {ev.verification_state}
                            </Badge>
                          </div>
                          <a
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-900 font-medium hover:text-amber-950 flex items-center gap-1 mt-1 truncate underline underline-offset-2"
                          >
                            <span className="truncate">{ev.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          {ev.description && (
                            <p className="text-[11px] text-stone-600 mt-1 leading-snug">
                              {ev.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Verify Action Button */}
                      <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={RefreshCw}
                          isLoading={verifyingId === ev.id}
                          disabled={verifyingId === ev.id}
                          onClick={() => handleVerifyEvidence(ev.id)}
                          title="Run rule-based verification check"
                          className="text-xs shadow-xs"
                        >
                          Verify Proof
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#dfd7c5] bg-[#f4ecd8]/60 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceUploader;
