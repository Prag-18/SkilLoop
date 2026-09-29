import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card, { CardTitle, CardDescription } from '../ui/Card';
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

  const initial = recommendation.full_name
    ? recommendation.full_name.charAt(0).toUpperCase()
    : 'S';

  return (
    <Card padding="lg" className="flex flex-col justify-between space-y-4 relative">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Avatar with initials fallback */}
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
              className="border border-[#d6c7b2] shadow-sm"
            />
          </Link>

          <div>
            <Link
              to={`/u/${recommendation.user_id}`}
              className="font-bold text-white text-base font-heading hover:text-indigo-300 transition-colors flex items-center gap-1.5"
            >
              <span>{recommendation.full_name}</span>
            </Link>
            <p className="text-xs text-slate-400">
              {recommendation.department} • {recommendation.year_of_study}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge variant="emerald" size="lg" className="font-bold">
            {recommendation.compatibility_percent}% Match
          </Badge>
          {recommendation.evidence_verified && (
            <Badge variant="indigo" size="sm" icon={ShieldCheck}>
              Verified Evidence
            </Badge>
          )}
        </div>
      </div>

      {/* Headline if available */}
      {recommendation.headline && (
        <p className="text-xs text-indigo-300 font-medium -mt-1">
          {recommendation.headline}
        </p>
      )}

      {/* Reciprocity Reason Box */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p>{recommendation.reason}</p>
      </div>

      {/* Interests badges if present */}
      {Array.isArray(recommendation.interests) && recommendation.interests.length > 0 && (
        <div className="space-y-1 text-xs">
          <span className="text-slate-400 font-medium block flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-slate-400" />
            Interests:
          </span>
          <div className="flex flex-wrap gap-1">
            {recommendation.interests.slice(0, 4).map((interest, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Skills Teaches vs Wants */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-1 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            Offers to Teach:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {recommendation.teaches &&
              recommendation.teaches.map((skill, idx) => (
                <Badge key={idx} variant="indigo" size="sm">
                  {skill}
                </Badge>
              ))}
          </div>
        </div>

        <div>
          <span className="text-slate-400 font-medium block mb-1 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
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
          className="flex-1"
          disabled={requestSent || sending}
          isLoading={sending}
          icon={requestSent ? Check : Send}
          onClick={handleSend}
        >
          {requestSent ? 'Learning Request Sent!' : 'Send Learning Request'}
        </Button>
        <Link
          to={`/u/${recommendation.user_id}`}
          className="p-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          title="View Public Profile"
        >
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>
    </Card>
  );
};

export default RecommendationCard;
