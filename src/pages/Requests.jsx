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
          className={`p-4 rounded-xl text-sm flex items-center gap-2 shadow-lg transition-all ${
            toastType === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
          }`}
        >
          {toastType === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{toastMsg}</span>
        </div>
      )}

      {/* API error banner */}
      {apiError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              <strong>Backend unreachable</strong> — showing demo data. Start the API to see live requests.
            </span>
          </div>
          <button
            onClick={() => fetchRequests(activeTab)}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 rounded-lg hover:bg-amber-500/30 transition-colors font-semibold shrink-0"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        {[
          { key: 'received', label: 'Received Invitations', icon: Inbox },
          { key: 'sent', label: 'Sent Requests', icon: Send },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === key
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            {usingDemo && (
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-md font-mono">
                DEMO
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <svg className="animate-spin h-7 w-7 mx-auto text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading requests…</p>
        </div>
      ) : requests.length === 0 ? (
        <Card padding="lg" className="text-center py-14 border border-dashed border-slate-700">
          <Clock className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold text-base">
            No {activeTab} learning requests yet.
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {activeTab === 'received'
              ? 'When other students request to learn from you, they will appear here.'
              : 'Browse Campus Discovery to find peers and send your first request.'}
          </p>
          {activeTab === 'sent' && (
            <Button
              variant="primary"
              size="md"
              icon={Send}
              className="mt-5"
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
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-base font-bold text-white font-heading">
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
                    >
                      {req.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Requested Skill:{' '}
                    <strong className="text-slate-200">{req.skill_name}</strong>
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
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
                  >
                    Accept & Schedule
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    icon={X}
                    isLoading={actionLoading === req.id}
                    onClick={() => handleReject(req.id)}
                  >
                    Decline
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">
                  {req.status === 'accepted'
                    ? 'Exchange scheduled ✓'
                    : req.status === 'rejected'
                    ? 'Declined'
                    : 'Awaiting response…'}
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
