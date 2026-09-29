import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { requestsAPI } from '../services/api';
import {
  Send,
  Inbox,
  Check,
  X,
  Clock,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  WifiOff,
  RefreshCw,
  Phone,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

const SAMPLE_RECEIVED = [
  {
    id: 1,
    sender_name: 'Sarah Chen',
    receiver_name: 'You',
    skill_name: 'Python & FastAPI Backend',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    sender_name: 'Marcus Vance',
    receiver_name: 'You',
    skill_name: 'UI/UX Figma Systems',
    status: 'accepted',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

const SAMPLE_SENT = [
  {
    id: 3,
    sender_name: 'You',
    receiver_name: 'Rohan Verma',
    skill_name: 'React Native Development',
    status: 'pending',
    created_at: new Date().toISOString(),
  },
];

export const Requests = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [usingDemo, setUsingDemo] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // request id being acted on
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 5000);
  };

  const fetchRequests = async (tab) => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await requestsAPI.getRequests(tab);
      if (Array.isArray(data) && data.length > 0) {
        setRequests(data);
        setUsingDemo(false);
      } else {
        setRequests([]);
        setUsingDemo(false);
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Network error';
      setApiError(errMsg);
      setRequests(tab === 'received' ? SAMPLE_RECEIVED : SAMPLE_SENT);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  const handleAccept = async (reqId) => {
    setActionLoading(reqId);
    try {
      await requestsAPI.acceptRequest(reqId);
      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: 'accepted' } : r))
      );
      showToast('Learning request accepted! Skill Exchange scheduled.', 'success');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail) {
        showToast(detail, 'error');
      } else if (usingDemo) {
        // Demo mode — optimistic update
        setRequests((prev) =>
          prev.map((r) => (r.id === reqId ? { ...r, status: 'accepted' } : r))
        );
        showToast('(Demo) Exchange scheduled.', 'success');
      } else {
        showToast('Failed to accept request. Please try again.', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reqId) => {
    setActionLoading(reqId);
    try {
      await requestsAPI.rejectRequest(reqId);
      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: 'rejected' } : r))
      );
      showToast('Learning request declined.', 'success');
    } catch (err) {
      const detail = err.response?.data?.detail;
      if (detail) {
        showToast(detail, 'error');
      } else if (usingDemo) {
        setRequests((prev) =>
          prev.map((r) => (r.id === reqId ? { ...r, status: 'rejected' } : r))
        );
        showToast('(Demo) Request declined.', 'success');
      } else {
        showToast('Failed to decline request. Please try again.', 'error');
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <Header
        title="Learning Exchange Requests"
        description="Manage incoming exchange invitations and track outgoing learning requests."
        badgeText="Requests Portal"
      />

      {/* Toast notification */}
      {toastMsg && (
        <div
          className={`p-4 rounded-xl text-sm flex items-center gap-2 shadow-md transition-all border-2 ${
            toastType === 'success'
              ? 'bg-[#ecfdf5] border-emerald-500/40 text-emerald-900'
              : 'bg-[#fff1f2] border-rose-400/40 text-rose-900'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          )}
          <span className="font-medium">{toastMsg}</span>
        </div>
      )}

      {/* API error banner */}
      {apiError && (
        <div className="p-3.5 rounded-xl bg-[#fffbeb] border-2 border-amber-400/50 text-amber-900 text-xs flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0 text-amber-700" />
            <span>
              <strong>Backend unreachable</strong> — showing demo data. Start the API to see live requests.
            </span>
          </div>
          <button
            onClick={() => fetchRequests(activeTab)}
            className="flex items-center gap-1 px-3 py-1 bg-amber-200/70 hover:bg-amber-300/80 rounded-lg border border-amber-400 text-amber-950 transition-colors font-semibold shrink-0 shadow-xs"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#dfd7c5] pb-3">
        {[
          { key: 'received', label: 'Received Invitations', icon: Inbox },
          { key: 'sent', label: 'Sent Requests', icon: Send },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-amber-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-[#ebdcc2]/60 hover:text-stone-900'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {usingDemo && (
              <span className="text-[10px] bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-md font-mono font-bold">
                DEMO
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <svg className="animate-spin h-7 w-7 mx-auto text-amber-800" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-xs text-stone-600 font-semibold uppercase tracking-wider font-heading text-sm">Loading requests…</p>
        </div>
      ) : requests.length === 0 ? (
        <Card padding="lg" className="text-center py-14 border-2 border-dashed border-[#dfd7c5] bg-[#fffdfa]">
          <Clock className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <p className="text-stone-800 font-semibold text-lg font-heading">
            No {activeTab} learning requests yet.
          </p>
          <p className="text-xs text-stone-600 mt-1 max-w-xs mx-auto leading-relaxed">
            {activeTab === 'received'
              ? 'When other students request to learn from you, they will appear here.'
              : 'Browse Campus Discovery to find peers and send your first request.'}
          </p>
          {activeTab === 'sent' && (
            <Button
              variant="primary"
              size="md"
              icon={Send}
              className="mt-5 shadow-md"
              onClick={() => (window.location.href = '/discover')}
            >
              Explore Campus Matches
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card
              key={req.id}
              padding="md"
              className="flex flex-col gap-3 bg-[#fffdf9] border-2 border-[#e5dcc7] shadow-sm hover:shadow-md transition-shadow relative"
            >
              {/* Subtle top left washi pin */}
              <div className="absolute -top-2 left-4 w-12 h-4 bg-[#fde047]/70 rotate-2 border border-[#ca8a04]/30 pointer-events-none rounded-[1px]" />

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-[#f4ecd8] border border-[#dfd7c5] flex items-center justify-center text-amber-900 font-bold shadow-inner shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base font-bold text-stone-900 font-heading">
                        {activeTab === 'received' ? req.sender_name : req.receiver_name}
                      </h4>
                      <Badge
                        variant={
                          req.status === 'accepted'
                            ? 'emerald'
                            : req.status === 'rejected'
                            ? 'rose'
                            : 'amber'
                        }
                        className="font-semibold"
                      >
                        {req.status.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      Requested Skill:{' '}
                      <strong className="text-stone-900 font-medium">{req.skill_name}</strong>
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5 font-medium">
                      {new Date(req.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {activeTab === 'received' && req.status === 'pending' ? (
                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <Button
                      variant="emerald"
                      size="sm"
                      icon={Check}
                      isLoading={actionLoading === req.id}
                      onClick={() => handleAccept(req.id)}
                      className="shadow-sm font-semibold"
                    >
                      Accept & Schedule
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={X}
                      isLoading={actionLoading === req.id}
                      onClick={() => handleReject(req.id)}
                      className="shadow-xs font-semibold"
                    >
                      Decline
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-stone-600 italic font-handwriting text-base font-semibold">
                    {req.status === 'accepted'
                      ? 'Exchange scheduled ✓'
                      : req.status === 'rejected'
                      ? 'Declined'
                      : 'Awaiting response…'}
                  </div>
                )}
              </div>

              {/* MUTUAL CONTACT DETAILS (Revealed upon acceptance) */}
              {req.status === 'accepted' && (
                <div className="mt-2 p-3.5 rounded-2xl bg-[#f0fdf4] border border-[#86efac] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-emerald-200/90 text-emerald-950 shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-emerald-950 font-heading text-sm">
                          Mutual Contact Number:
                        </span>
                        <span className="stamp-seal-emerald text-[8px] py-0.2 px-1.5">
                          MUTUAL MATCH
                        </span>
                      </div>
                      <div className="text-emerald-950 font-mono font-bold text-sm tracking-wider mt-0.5">
                        {req.contact_phone ? req.contact_phone : 'Phone shared upon confirmation'}
                      </div>
                    </div>
                  </div>

                  {req.contact_phone && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${req.contact_phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold shadow-xs transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5" /> Call Student
                      </a>
                      <a
                        href={`https://wa.me/${req.contact_phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-950 rounded-xl font-semibold shadow-2xs transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp / SMS
                      </a>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Requests;
