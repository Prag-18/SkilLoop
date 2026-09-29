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
    <div className="bg-[#fffdfa] border-2 border-[#dfd7c5] rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-200 relative overflow-hidden flex flex-col justify-between space-y-4">
      {/* Decorative Washi Tape Accent */}
      <div className="washi-tape washi-tape-sage -top-2.5 right-6 w-20 rotate-1" />

      {/* Top Header */}
      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <Link
            to={`/u/${recommendation.user_id}`}
            title="View student public profile"
            className="shrink-0 hover:opacity-90 transition-opacity"
          >
            <Avatar
              src={recommendation.avatar_url}
              name={recommendation.full_name}
              size="md"
              shape="rounded"
              className="border-2 border-[#d6c7b2] shadow-sm"
            />
          </Link>

          <div>
            <Link
              to={`/u/${recommendation.user_id}`}
              className="font-bold text-stone-900 text-base font-heading hover:text-amber-800 transition-colors flex items-center gap-1.5"
            >
              <span>{recommendation.full_name}</span>
            </Link>
            <p className="text-xs text-stone-600 font-medium">
              {recommendation.department} • {recommendation.year_of_study}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className="bg-emerald-100/90 border border-emerald-300/80 text-emerald-950 font-bold px-2.5 py-1 rounded-xl text-xs font-mono shadow-xs">
            {recommendation.compatibility_percent}% Match
          </span>
          {recommendation.evidence_verified && (
            <span className="stamp-seal-emerald text-[9px] py-0.5 px-2">
              ★ VERIFIED EVIDENCE ★
            </span>
          )}
        </div>
      </div>

      {/* Headline if available */}
      {recommendation.headline && (
        <p className="text-xs text-amber-900 font-semibold -mt-1 px-1">
          {recommendation.headline}
        </p>
      )}

      {/* Reciprocity Reason Box */}
      {recommendation.reason && (
        <div className="p-3.5 rounded-2xl bg-[#faf5e8] border border-[#e5dcc7] text-xs text-stone-800 leading-relaxed flex items-start gap-2.5 shadow-xs">
          <Sparkles className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
          <p className="font-medium text-stone-800">{recommendation.reason}</p>
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
                className="px-2.5 py-0.5 rounded-lg bg-[#efe7d3] border border-[#dfd7c5] text-[11px] font-medium text-stone-800"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills Teaches vs Wants */}
      <div className="space-y-2.5 text-xs pt-1">
        <div>
          <span className="text-stone-700 font-semibold block mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-amber-800" />
            Offers to Teach:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {recommendation.teaches &&
              recommendation.teaches.map((skill, idx) => (
                <Badge key={idx} variant="amber" size="sm">
                  {skill}
                </Badge>
              ))}
          </div>
        </div>

        <div>
          <span className="text-stone-700 font-semibold block mb-1.5 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
            Wants to Learn:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {recommendation.wants &&
              recommendation.wants.map((skill, idx) => (
                <Badge key={idx} variant="emerald" size="sm">
                  {skill}
                </Badge>
              ))}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-2 flex items-center gap-2">
        <Button
          variant={requestSent ? 'emerald' : 'primary'}
          size="md"
          className="flex-1 font-semibold"
          disabled={requestSent || sending}
          isLoading={sending}
          icon={requestSent ? Check : Send}
          onClick={handleSend}
        >
          {requestSent ? 'Learning Request Sent!' : 'Send Learning Request'}
        </Button>
        <Link
          to={`/u/${recommendation.user_id}`}
          className="p-2.5 rounded-xl border-2 border-[#dfd7c5] hover:bg-[#ebdcc2]/60 text-stone-700 hover:text-stone-950 transition-colors shadow-xs flex items-center justify-center"
          title="View Public Profile"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default RecommendationCard;
