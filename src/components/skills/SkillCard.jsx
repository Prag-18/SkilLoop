import React from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  GraduationCap,
  BookOpen,
  ShieldCheck,
  Award,
  Link2,
  Trash2,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const SkillCard = ({
  userSkill,
  onOpenEvidence,
  onDeleteSkill,
  isDeleting = false,
}) => {
  const isTeaching = userSkill.direction === 'teach';
  const confidence = userSkill.confidence_score || 0;
  const evidenceCount = userSkill.evidence?.length || 0;

  // Compute confidence badge color & label
  const getConfidenceDetails = (score) => {
    if (score >= 75) {
      return {
        variant: 'emerald',
        label: 'High Trust',
        bg: 'bg-emerald-100 border-emerald-300 text-emerald-800',
        ring: 'text-emerald-700 font-bold',
      };
    }
    if (score >= 40) {
      return {
        variant: 'indigo',
        label: 'Verified Proof',
        bg: 'bg-amber-100 border-amber-300 text-amber-800',
        ring: 'text-amber-800 font-bold',
      };
    }
    if (score > 0) {
      return {
        variant: 'amber',
        label: 'Unverified',
        bg: 'bg-yellow-100 border-yellow-300 text-yellow-800',
        ring: 'text-yellow-700 font-bold',
      };
    }
    return {
      variant: 'slate',
      label: 'No Evidence',
      bg: 'bg-stone-100 border-stone-300 text-stone-600',
      ring: 'text-stone-500 font-bold',
    };
  };

  const conf = getConfidenceDetails(confidence);

  return (
    <div className="bg-[#fffdf9] rounded-2xl border-2 border-[#e5dcc7] p-5 flex flex-col justify-between relative overflow-hidden group shadow-[2px_4px_16px_rgba(40,30,20,0.06)] hover:shadow-[3px_8px_20px_rgba(40,30,20,0.1)] transition-all duration-200">
      {/* Top accent line based on direction */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isTeaching ? 'bg-[#ca8a04]' : 'bg-[#059669]'
        }`}
      />

      <div>
        {/* Badges Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge
            variant={isTeaching ? 'amber' : 'emerald'}
            size="sm"
            icon={isTeaching ? GraduationCap : BookOpen}
            className="font-medium"
          >
            {isTeaching ? 'I Can Teach' : 'I Want to Learn'}
          </Badge>

          <span className="text-[11px] font-semibold text-stone-600 px-2.5 py-0.5 rounded-full bg-[#f4ecd8] border border-[#dfd7c5]">
            {userSkill.level || 'Intermediate'}
          </span>
        </div>

        {/* Skill Title & Category */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-900 transition-colors font-heading tracking-wide">
            {userSkill.skill?.name || 'Skill Name'}
          </h3>
          {userSkill.skill?.category_name && (
            <div className="text-xs text-amber-800 font-semibold">
              {userSkill.skill.category_name}
            </div>
          )}
          {userSkill.skill?.description && (
            <p className="text-xs text-stone-600 line-clamp-2 mt-2 leading-relaxed">
              {userSkill.skill.description}
            </p>
          )}
        </div>
      </div>

      {/* Confidence Score & Evidence Section */}
      <div className="mt-5 pt-4 border-t border-[#ede5d3] space-y-3">
        {isTeaching ? (
          /* For teaching skills, show confidence & evidence proofs */
          <div className="flex items-center justify-between bg-[#fbf7ee] rounded-xl p-2.5 border border-[#dfd7c5]">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full bg-[#ebdcc2] border border-[#d6c7b2] flex items-center justify-center font-bold text-xs shadow-inner">
                <span className={conf.ring}>{confidence}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-stone-800">
                  {conf.label}
                </span>
                <span className="text-[10px] text-stone-500 font-medium">
                  {evidenceCount} proof{evidenceCount !== 1 ? 's' : ''} attached
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Link2}
              onClick={() => onOpenEvidence(userSkill)}
              className="text-xs py-1 px-2.5 h-7 shadow-xs"
            >
              {evidenceCount > 0 ? 'Proofs' : '+ Proof'}
            </Button>
          </div>
        ) : (
          /* For learning skills, show learning intent */
          <div className="flex items-center justify-between bg-[#f0fdf4] rounded-xl p-2.5 border border-[#bbf7d0]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span className="text-xs text-emerald-900 font-medium">Ready for Peer Match</span>
            </div>
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
              Active Request
            </span>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[10px] text-stone-500 font-medium">
            Added {new Date(userSkill.created_at).toLocaleDateString()}
          </span>

          <button
            onClick={() => onDeleteSkill(userSkill.id)}
            disabled={isDeleting}
            title="Remove claimed skill"
            className="text-stone-400 hover:text-rose-600 p-1 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
