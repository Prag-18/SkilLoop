import React, { useState } from 'react';
import Card, { CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { Sparkles, Send, ShieldCheck, Check, GraduationCap, BookOpen, Users } from 'lucide-react';

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
      console.error("Failed to send request:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card padding="lg" className="flex flex-col justify-between space-y-4 relative">
      {/* Top Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-indigo-500/20">
            {recommendation.full_name ? recommendation.full_name.charAt(0).toUpperCase() : 'S'}
          </div>
          <div>
            <h3 className="font-bold text-white text-base font-heading">
              {recommendation.full_name}
            </h3>
            <p className="text-xs text-slate-400">
              {recommendation.department} • {recommendation.year_of_study}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
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

      {/* Reciprocity Reason Box */}
      <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
        <p>{recommendation.reason}</p>
      </div>

      {/* Skills Teaches vs Wants */}
      <div className="space-y-2 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-1 flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            Offers to Teach:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {recommendation.teaches && recommendation.teaches.map((skill, idx) => (
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
            {recommendation.wants && recommendation.wants.map((skill, idx) => (
              <Badge key={idx} variant="emerald" size="sm">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Send Request Trigger */}
      <div className="pt-2">
        <Button
          variant={requestSent ? "emerald" : "primary"}
          size="md"
          className="w-full"
          disabled={requestSent || sending}
          isLoading={sending}
          icon={requestSent ? Check : Send}
          onClick={handleSend}
        >
          {requestSent ? "Learning Request Sent!" : "Send Learning Request"}
        </Button>
      </div>
    </Card>
  );
};

export default RecommendationCard;
