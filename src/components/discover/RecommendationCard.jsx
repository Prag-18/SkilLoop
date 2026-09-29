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
} from 'lucide-react';

export const RecommendationCard = ({ recommendation, onRequestSend }) => {
  const [requestSent, setRequestSent] = useState(false);
  const [sending, setSending] = useState(false);

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

      {/* Reciprocity Reason Box styled as a lovely soft note */}
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
          <span className="text-amber-950 font-semibold block mb-1.5 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <GraduationCap className="w-3.5 h-3.5 text-amber-800" />
            Offers to Teach:
          </span>
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
    </div>
  );
};

export default RecommendationCard;
