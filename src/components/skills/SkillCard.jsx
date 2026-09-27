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
        bg: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300',
        ring: 'text-emerald-400',
      };
    }
    if (score >= 40) {
      return {
        variant: 'indigo',
        label: 'Verified Proof',
        bg: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-300',
        ring: 'text-indigo-400',
      };
    }
    if (score > 0) {
      return {
        variant: 'amber',
        label: 'Unverified',
        bg: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-300',
        ring: 'text-amber-400',
      };
    }
    return {
      variant: 'slate',
      label: 'No Evidence',
      bg: 'from-slate-800 to-slate-900 border-slate-700 text-slate-400',
      ring: 'text-slate-500',
    };
  };

  const conf = getConfidenceDetails(confidence);

  return (
    <div className="glass-card glass-card-hover rounded-2xl border border-slate-800/80 p-5 flex flex-col justify-between relative overflow-hidden group">
      {/* Top ambient glow based on direction */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          isTeaching ? 'from-indigo-500 via-purple-500 to-pink-500' : 'from-emerald-500 via-teal-500 to-cyan-500'
        }`}
      />

      <div>
        {/* Badges Bar */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge
            variant={isTeaching ? 'indigo' : 'emerald'}
            size="sm"
            icon={isTeaching ? GraduationCap : BookOpen}
          >
            {isTeaching ? 'I Can Teach' : 'I Want to Learn'}
          </Badge>

          <span className="text-[11px] font-medium text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800">
            {userSkill.level || 'Intermediate'}
          </span>
        </div>

        {/* Skill Title & Category */}
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
            {userSkill.skill?.name || 'Skill Name'}
          </h3>
          {userSkill.skill?.category_name && (
            <div className="text-xs text-indigo-400/90 font-medium">
              {userSkill.skill.category_name}
            </div>
          )}
          {userSkill.skill?.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
              {userSkill.skill.description}
            </p>
          )}
        </div>
      </div>

      {/* Confidence Score & Evidence Section */}
      <div className="mt-5 pt-4 border-t border-slate-800/70 space-y-3">
        {isTeaching ? (
          /* For teaching skills, show confidence & evidence proofs */
          <div className="flex items-center justify-between bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center font-bold text-xs">
                <span className={conf.ring}>{confidence}%</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold text-slate-200">
                  {conf.label}
                </span>
                <span className="text-[10px] text-slate-500">
                  {evidenceCount} proof{evidenceCount !== 1 ? 's' : ''} attached
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              icon={Link2}
              onClick={() => onOpenEvidence(userSkill)}
              className="text-xs py-1 px-2.5 h-7"
            >
              {evidenceCount > 0 ? 'Proofs' : '+ Proof'}
            </Button>
          </div>
        ) : (
          /* For learning skills, show learning intent */
          <div className="flex items-center justify-between bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-300">Ready for Peer Match</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
              Active Request
            </span>
          </div>
        )}

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-[10px] text-slate-500">
            Added {new Date(userSkill.created_at).toLocaleDateString()}
          </span>

          <button
            onClick={() => onDeleteSkill(userSkill.id)}
            disabled={isDeleting}
            title="Remove claimed skill"
            className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillCard;
