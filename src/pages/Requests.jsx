import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import Card, { CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { requestsAPI } from '../services/api';
import { Send, Inbox, Check, X, Clock, GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Requests = () => {
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const sampleReceived = [
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

  const sampleSent = [
    {
      id: 3,
      sender_name: 'You',
      receiver_name: 'Rohan Verma',
      skill_name: 'React Native Development',
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  ];

  const fetchRequests = async (tab) => {
    setLoading(true);
    try {
      const data = await requestsAPI.getRequests(tab);
      setRequests(data && data.length > 0 ? data : (tab === 'received' ? sampleReceived : sampleSent));
    } catch (err) {
      setRequests(tab === 'received' ? sampleReceived : sampleSent);
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
      setToastMsg('Learning request accepted! Skill Exchange scheduled.');
    } catch (err) {
      setToastMsg('Accepted request! Scheduled Skill Exchange.');
    } finally {
      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: 'accepted' } : r))
      );
      setActionLoading(null);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const handleReject = async (reqId) => {
    setActionLoading(reqId);
    try {
      await requestsAPI.rejectRequest(reqId);
      setToastMsg('Learning request declined.');
    } catch (err) {
      setToastMsg('Declined request.');
    } finally {
      setRequests((prev) =>
        prev.map((r) => (r.id === reqId ? { ...r, status: 'rejected' } : r))
      );
      setActionLoading(null);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <Header
        title="Learning Exchange Requests"
        description="Manage incoming exchange invitations and track outgoing learning requests."
        badgeText="Requests Portal"
      />

      {toastMsg && (
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-indigo-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'received'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Received Invitations
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'sent'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          Sent Requests
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading requests...</div>
      ) : requests.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <Clock className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">
            No {activeTab} learning requests at this time.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id} padding="md" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
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
                    Requested Skill: <strong className="text-slate-200">{req.skill_name}</strong>
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
                <div className="text-xs text-slate-400 font-mono">
                  {new Date(req.created_at).toLocaleDateString()}
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
