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
    <div className="relative group transition-all duration-300 hover:-translate-y-1">
      {/* Authentic serrated washi tape accent on top */}
      <div className="washi-tape washi-tape-yellow -top-3 left-1/2 -translate-x-1/2 w-28 -rotate-1" />

      <Card padding="lg" className="flex flex-col justify-between space-y-4 relative bg-[#fffdfa] border-2 border-[#dfd7c5] shadow-[3px_8px_24px_rgba(40,30,20,0.08)] rounded-3xl hover:shadow-[4px_12px_30px_rgba(40,30,20,0.12)]">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-12 h-14 bg-white border-2 border-[#dfd7c5] rounded-sm p-1 mx-auto shadow-sm -rotate-2 shrink-0">
              <div className="w-full h-full bg-[#ebdcc2] border border-[#d6c7b2] flex items-center justify-center font-bold text-amber-950 text-xl font-heading shadow-inner">
                {recommendation.full_name ? recommendation.full_name.charAt(0).toUpperCase() : 'S'}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-stone-900 text-lg font-heading tracking-wide">
                {recommendation.full_name}
              </h3>
              <p className="text-xs text-stone-600 font-medium">
                {recommendation.department} • {recommendation.year_of_study}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="bg-[#ecfdf5] border-2 border-emerald-500/40 text-emerald-900 px-3 py-1 rounded-2xl shadow-xs text-center">
              <span className="font-heading text-lg font-extrabold block leading-none">{recommendation.compatibility_percent}%</span>
              <span className="text-[9px] uppercase font-bold tracking-widest text-emerald-700 font-mono">MATCH</span>
            </div>
            {recommendation.evidence_verified && (
              <span className="stamp-seal-emerald text-[9px] mt-0.5">
                ★ VERIFIED ★
              </span>
            )}
          </div>
        </div>

        {/* Reciprocity Reason Box - Hand-written paper note aesthetic */}
        <div className="p-3.5 rounded-2xl bg-[#faf5e8] border border-[#e5dcc7] text-stone-800 text-sm leading-relaxed flex items-start gap-2.5 relative shadow-inner">
          <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
          <p className="font-handwriting text-base font-bold text-stone-700 tracking-wide">"{recommendation.reason}"</p>
        </div>

        {/* Skills Teaches vs Wants */}
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-stone-700 font-bold block mb-1.5 flex items-center gap-1.5 font-heading text-sm">
              <GraduationCap className="w-4 h-4 text-amber-800" />
              Offers to Teach:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.teaches && recommendation.teaches.map((skill, idx) => (
                <Badge key={idx} variant="amber" size="sm" className="font-semibold bg-[#fef3c7] text-amber-950 border border-amber-300">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <span className="text-stone-700 font-bold block mb-1.5 flex items-center gap-1.5 font-heading text-sm">
              <BookOpen className="w-4 h-4 text-emerald-800" />
              Wants to Learn:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {recommendation.wants && recommendation.wants.map((skill, idx) => (
                <Badge key={idx} variant="emerald" size="sm" className="font-semibold bg-[#ecfdf5] text-emerald-950 border border-emerald-300">
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
            className="w-full shadow-md font-semibold"
            disabled={requestSent || sending}
            isLoading={sending}
            icon={requestSent ? Check : Send}
            onClick={handleSend}
          >
            {requestSent ? "Learning Request Sent!" : "Send Learning Request"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RecommendationCard;
