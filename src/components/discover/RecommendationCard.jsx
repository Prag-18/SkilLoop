import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Avatar from '../common/Avatar';
import {
  Sparkles,
  Send,
  ShieldCheck,
  Check,
  GraduationCap,
  BookOpen,
  Tag,
  ExternalLink,
  Zap,
  FileCode2,
  Award,
  Video,
  Link2,
  ChevronDown,
  ChevronUp,
  X,
  FileCheck,
} from 'lucide-react';

export const RecommendationCard = ({ recommendation, onRequestSend }) => {
  const [requestSent, setRequestSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [showProofsModal, setShowProofsModal] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      if (onRequestSend) {
        await onRequestSend(recommendation);
      }
      setRequestSent(true);
    } catch (err) {
      console.error('Failed to send request:', err);
    } finally {
      setSending(false);
    }
  };

  const proofs = recommendation.proofs || [];
  const hasProofs = proofs.length > 0;

  const getProofIcon = (type) => {
    switch (type) {
      case 'credential':
        return Award;
      case 'demo':
        return Video;
      case 'project':
        return FileCode2;
      default:
        return Link2;
    }
  };

  return (
    <div className="bg-[#fffdf9] border-2 border-[#dfd7c5] rounded-3xl p-6 shadow-[2px_5px_18px_rgba(45,35,25,0.06)] hover:shadow-[4px_12px_26px_rgba(45,35,25,0.12)] hover:-translate-y-1 transition-all duration-200 relative overflow-hidden flex flex-col justify-between space-y-4">
      {/* Decorative Washi Tape Corner */}
      <div className="washi-tape washi-tape-sage -top-2.5 right-6 w-24 rotate-1" />

      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex items-center gap-3.5">
          {/* Avatar in Polaroid-style frame */}
          <Link
            to={`/u/${recommendation.user_id}`}
            title="View student public profile"
            className="shrink-0 hover:scale-105 transition-transform"
          >
            <div className="p-1 bg-white border-2 border-[#dfd7c5] rounded-2xl shadow-xs">
              <Avatar
                src={recommendation.avatar_url}
                name={recommendation.full_name}
                size="md"
                shape="rounded"
                className="w-12 h-12"
              />
            </div>
          </Link>

          <div>
            {/* Student Name with artistic brush script font */}
            <Link
              to={`/u/${recommendation.user_id}`}
              className="font-script text-2xl sm:text-3xl text-[#1e1b18] hover:text-amber-900 transition-colors block leading-tight tracking-wide"
            >
              {recommendation.full_name}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-semibold text-stone-600 bg-[#efe7d3] px-2.5 py-0.5 rounded-full border border-[#dfd7c5]">
                {recommendation.department} • {recommendation.year_of_study}
              </span>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="bg-emerald-100/90 border border-emerald-300/90 text-emerald-950 font-bold px-2.5 py-1 rounded-xl text-xs font-mono shadow-xs flex items-center gap-1">
            <Zap className="w-3 h-3 text-emerald-700 fill-emerald-500" />
            {recommendation.compatibility_percent}% Match
          </span>
          {recommendation.evidence_verified && (
            <span className="stamp-seal-emerald text-[9px] py-0.5 px-2">
              ★ VERIFIED ★
            </span>
          )}
        </div>
      </div>

      {/* Headline if available */}
      {recommendation.headline && (
        <p className="text-xs text-amber-900/90 font-semibold italic -mt-1 px-1">
          "{recommendation.headline}"
        </p>
      )}

      {/* Reciprocity Reason Box */}
      {recommendation.reason && (
        <div className="p-3.5 rounded-2xl bg-[#faf5e8] border border-[#e5dcc7] text-xs text-stone-800 leading-relaxed flex items-start gap-2.5 shadow-xs relative">
          <Sparkles className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <p className="font-medium text-stone-800 leading-snug">
            {recommendation.reason}
          </p>
        </div>
      )}

      {/* Interests badges if present */}
      {Array.isArray(recommendation.interests) && recommendation.interests.length > 0 && (
        <div className="space-y-1.5 text-xs">
          <span className="text-stone-600 font-semibold flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-amber-800" />
            Interests:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {recommendation.interests.slice(0, 4).map((interest, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-[#efe7d3] border border-[#dfd7c5] text-[11px] font-medium text-stone-800 shadow-2xs"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills Teaches vs Wants in 2 distinct tactile panels */}
      <div className="space-y-2.5 text-xs pt-1">
        {/* Offers to Teach */}
        <div className="p-2.5 rounded-2xl bg-[#fdfaf3] border border-[#ebdcc2]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-amber-950 font-semibold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-amber-800" />
              Offers to Teach:
            </span>

            {/* View Proofs Button */}
            {hasProofs ? (
              <button
                onClick={() => setShowProofsModal(true)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-950 text-[10px] font-bold transition-all shadow-2xs cursor-pointer"
                title="Inspect verified evidence and portfolio links"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>View Proofs ({proofs.length})</span>
              </button>
            ) : (
              <span className="text-[10px] text-stone-500 font-medium italic">
                No links attached
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recommendation.teaches &&
              recommendation.teaches.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#fde68a]/60 border border-[#f59e0b]/40 text-amber-950 font-semibold text-xs shadow-2xs"
                >
                  {skill}
                </span>
              ))}
          </div>
        </div>

        {/* Wants to Learn */}
        <div className="p-2.5 rounded-2xl bg-[#f4f8f4] border border-[#cbe4cb]">
          <span className="text-emerald-950 font-semibold block mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
            Wants to Learn:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {recommendation.wants &&
              recommendation.wants.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-[#bbf7d0]/60 border border-[#10b981]/40 text-emerald-950 font-semibold text-xs shadow-2xs"
                >
                  {skill}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center gap-2">
        <Button
          variant={requestSent ? 'emerald' : 'primary'}
          size="md"
          className="flex-1 font-semibold shadow-sm"
          disabled={requestSent || sending}
          isLoading={sending}
          icon={requestSent ? Check : Send}
          onClick={handleSend}
        >
          {requestSent ? 'Learning Request Sent!' : 'Send Learning Request'}
        </Button>
        <Link
          to={`/u/${recommendation.user_id}`}
          className="p-2.5 rounded-xl border-2 border-[#dfd7c5] hover:bg-[#ebdcc2]/60 text-stone-700 hover:text-stone-950 transition-colors shadow-xs flex items-center justify-center shrink-0"
          title="View Public Profile"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Proofs Inspection Modal */}
      {showProofsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#faf6ee] border-2 border-[#dfd7c5] rounded-3xl w-full max-w-lg shadow-[0_20px_50px_rgba(40,30,20,0.25)] overflow-hidden flex flex-col max-h-[85vh] relative">
            {/* Washi tape topper */}
            <div className="washi-tape washi-tape-yellow -top-3 left-10 w-28 -rotate-1" />

            {/* Modal Header */}
            <div className="p-5 border-b border-[#dfd7c5] flex items-center justify-between bg-[#fffdfa]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900 font-heading leading-tight">
                    Attached Skill Proofs
                  </h3>
                  <p className="text-xs text-stone-600 font-medium">
                    Verified evidence submitted by {recommendation.full_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowProofsModal(false)}
                className="p-2 rounded-xl text-stone-500 hover:text-stone-900 hover:bg-[#ebdcc2]/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Proofs List */}
            <div className="p-5 space-y-3.5 overflow-y-auto max-h-[60vh]">
              {proofs.map((proof) => {
                const IconComponent = getProofIcon(proof.type);
                const isVerified = proof.verification_state === 'verified';
                return (
                  <div
                    key={proof.id}
                    className="p-4 rounded-2xl bg-[#fffdfa] border-2 border-[#e5dcc7] shadow-xs space-y-2 relative"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-[#f4ecd8] border border-[#dfd7c5] text-amber-900">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 text-sm block leading-tight">
                            {proof.skill_name}
                          </span>
                          <span className="text-[11px] font-mono text-stone-500 uppercase tracking-wider font-semibold">
                            {proof.type}
                          </span>
                        </div>
                      </div>

                      {isVerified ? (
                        <span className="stamp-seal-emerald text-[9px] py-0.5 px-2">
                          ★ VERIFIED PROOF
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-stone-600 bg-[#efe7d3] px-2 py-0.5 rounded-md border border-[#dfd7c5]">
                          {proof.verification_state}
                        </span>
                      )}
                    </div>

                    {proof.description && (
                      <p className="text-xs text-stone-700 leading-relaxed font-medium bg-[#faf6ee] p-2.5 rounded-xl border border-[#ebdcc2]">
                        "{proof.description}"
                      </p>
                    )}

                    <div className="pt-1 flex items-center justify-end">
                      <a
                        href={proof.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-semibold text-xs shadow-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Proof Link
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#dfd7c5] bg-[#fffdfa] flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowProofsModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;
