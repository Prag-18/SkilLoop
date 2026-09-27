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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                Evidence & Verification
                <Badge variant={scoreVariant} size="sm">
                  {currentScore}% Confidence
                </Badge>
              </h2>
              <p className="text-xs text-slate-400">
                Skill: <span className="text-slate-200 font-semibold">{userSkill.skill?.name}</span> ({userSkill.direction.toUpperCase()})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Confidence Score Progress Bar Banner */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Proof Trust & Recommendation Weight
              </span>
              <span className="font-bold text-indigo-300">{currentScore} / 100</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  currentScore >= 75
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : currentScore >= 40
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500'
                    : 'bg-gradient-to-r from-slate-600 to-indigo-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(5, currentScore))}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Attaching verified repository links, certificates, or video demos directly boosts your confidence score and match ranking.
            </p>
          </div>

          {/* Form to Attach New Evidence */}
          <form onSubmit={handleAddEvidence} className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-400" /> Attach New Evidence Link
            </h3>

            {/* Evidence Type Selection */}
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">
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
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                      <div className="truncate">
                        <div className="text-xs font-semibold truncate">{et.label}</div>
                        <div className="text-[10px] text-indigo-400/80">+{et.baseWeight} pts max</div>
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
              <label className="text-xs font-semibold text-slate-300 tracking-wide block mb-1.5">
                Description / Context (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Explain what this repo/certificate showcases (e.g., implemented transformer pipeline from scratch)..."
                className="w-full rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-all"
              />
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
            {successMessage && (
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
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
              >
                Submit Evidence Proof
              </Button>
            </div>
          </form>

          {/* Existing Evidence List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Attached Proofs ({evidenceList.length})
            </h3>

            {loadingEvidence ? (
              <div className="text-center py-6 text-xs text-slate-500">Loading attached proofs...</div>
            ) : evidenceList.length === 0 ? (
              <div className="text-center py-8 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
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
                      className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-indigo-400 shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-white capitalize">
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
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1 truncate hover:underline"
                          >
                            <span className="truncate">{ev.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          {ev.description && (
                            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
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
                          className="text-xs"
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
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EvidenceUploader;
