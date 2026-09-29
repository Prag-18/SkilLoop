import React, { useState, useEffect } from 'react';
import Card, { CardTitle, CardDescription } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { exchangesAPI } from '../../services/api';
import { Repeat, CheckCircle2, Award, Clock, Star, ExternalLink, AlertCircle, Phone, PhoneCall, MessageSquare } from 'lucide-react';

export const ExchangeSummary = ({ onExchangeCompleted }) => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const sampleExchanges = [
    {
      id: 1,
      teacher_name: 'Priya Sharma',
      learner_name: 'You',
      skill_name: 'UI/UX Design in Figma',
      status: 'scheduled',
      duration_minutes: 60,
      credits_awarded: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      teacher_name: 'You',
      learner_name: 'Marcus Vance',
      skill_name: 'FastAPI Backend Development',
      status: 'completed',
      duration_minutes: 60,
      credits_awarded: 50, // 20 + 5 + 25 mentor bonus
      created_at: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  const fetchExchanges = async () => {
    try {
      const data = await exchangesAPI.getExchanges();
      setExchanges(data && data.length > 0 ? data : sampleExchanges);
    } catch (err) {
      setExchanges(sampleExchanges);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExchanges();
  }, []);

  const handleComplete = async (exchangeId) => {
    setCompletingId(exchangeId);
    setFeedbackSuccess('');
    setFeedbackError('');
    try {
      const res = await exchangesAPI.completeExchange(exchangeId, {
        duration_minutes: 60,
        is_verified_mentor: true,
      });

      // Confirm response validity before showing success
      if (res && (res.status === 'completed' || res.id)) {
        await fetchExchanges();
        if (onExchangeCompleted) {
          await onExchangeCompleted();
        }
        setFeedbackSuccess('Exchange marked complete! +50 Skill Credits awarded.');
      } else {
        throw new Error('Unexpected response received from server.');
      }
    } catch (err) {
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        err.message ||
        'Failed to complete exchange due to a network or server error.';
      setFeedbackError(errMsg);
    } finally {
      setCompletingId(null);
      setTimeout(() => {
        setFeedbackSuccess('');
        setFeedbackError('');
      }, 5000);
    }
  };

  const offeredCount = exchanges.filter((e) => e.teacher_name === 'You' || e.teacher_id === 1).length;
  const requestedCount = exchanges.filter((e) => e.learner_name === 'You' || e.learner_id === 1).length;
  const completedCount = exchanges.filter((e) => e.status === 'completed').length;

  return (
    <Card padding="lg" className="space-y-6 bg-[#fffdf9] border-2 border-[#e5dcc7] shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 font-heading text-xl text-stone-900">
            <Repeat className="w-5 h-5 text-amber-800" />
            Active Exchanges & Credit Summary
          </CardTitle>
          <CardDescription className="text-stone-600 font-medium text-xs">
            Track scheduled 1-on-1 sessions, complete exchanges, and earn skill credit rewards.
          </CardDescription>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-2">
          <Badge variant="amber" className="font-semibold">Offered: {offeredCount}</Badge>
          <Badge variant="emerald" className="font-semibold">Requested: {requestedCount}</Badge>
          <Badge variant="amber" className="font-semibold bg-[#fef3c7] text-amber-950">Completed: {completedCount}</Badge>
        </div>
      </div>

      {feedbackSuccess && (
        <div className="p-3 rounded-xl bg-[#ecfdf5] border-2 border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {feedbackError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {/* Exchanges List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-xs text-stone-500 text-center py-4 font-medium">Loading exchanges...</p>
        ) : exchanges.length === 0 ? (
          <p className="text-xs text-stone-500 text-center py-4 font-medium">No active or completed exchanges yet.</p>
        ) : (
          exchanges.map((ex) => (
            <div
              key={ex.id}
              className="p-4 rounded-2xl bg-[#faf6ee] border-2 border-[#e5dcc7] flex flex-col gap-3 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-stone-900 font-heading">{ex.skill_name}</span>
                    <Badge variant={ex.status === 'completed' ? 'emerald' : 'amber'} className="font-semibold">
                      {ex.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-stone-600 mt-1">
                    Teacher: <strong className="text-amber-900 font-bold">{ex.teacher_name}</strong> • Learner:{' '}
                    <strong className="text-emerald-800 font-bold">{ex.learner_name}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {ex.status === 'completed' ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-950 font-bold bg-[#fef3c7] px-3 py-1.5 rounded-xl border border-amber-300 shadow-xs">
                      <Award className="w-4 h-4 text-amber-800" />
                      <span>+{ex.credits_awarded || 50} CR Earned</span>
                    </div>
                  ) : (
                    <Button
                      variant="emerald"
                      size="sm"
                      icon={CheckCircle2}
                      isLoading={completingId === ex.id}
                      onClick={() => handleComplete(ex.id)}
                      className="shadow-sm font-semibold"
                    >
                      Mark Done (+50 CR)
                    </Button>
                  )}
                </div>
              </div>

              {/* MUTUAL CONTACT DETAILS (Only visible while active/scheduled, hidden once completed) */}
              {ex.status !== 'completed' && ex.contact_phone && (
                <div className="p-3 rounded-xl bg-[#f0fdf4] border border-[#86efac] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="text-emerald-950 font-medium">
                      Matched Partner Contact:{' '}
                      <strong className="font-mono text-emerald-950 font-bold text-sm ml-1">
                        {ex.contact_phone}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${ex.contact_phone}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold text-[11px] transition-colors"
                    >
                      <PhoneCall className="w-3 h-3" /> Call
                    </a>
                    <a
                      href={`https://wa.me/${ex.contact_phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-950 rounded-lg font-semibold text-[11px] transition-colors"
                    >
                      <MessageSquare className="w-3 h-3" /> WhatsApp
                    </a>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default ExchangeSummary;
