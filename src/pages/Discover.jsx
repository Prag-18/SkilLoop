import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import RecommendationCard from '../components/discover/RecommendationCard';
import { discoverAPI, requestsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import { 
  Sparkles, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  WifiOff, 
  GraduationCap, 
  RefreshCw,
  Telescope
} from 'lucide-react';

const SAMPLE_RECOMMENDATIONS = [
  {
    user_id: 101,
    full_name: 'Priya Sharma',
    department: 'Computer Science',
    year_of_study: '4th Year',
    compatibility_percent: 96,
    reason: 'You can teach Priya Python and they can teach you UI/UX Design. Both in Computer Science.',
    teaches: ['UI/UX Design in Figma', 'Design Systems'],
    wants: ['Python Backend', 'FastAPI'],
    evidence_verified: true,
  },
  {
    user_id: 102,
    full_name: 'Arjun Mehta',
    department: 'Data Science',
    year_of_study: '3rd Year',
    compatibility_percent: 92,
    reason: 'You can teach Arjun React and they can teach you Data Structures & Algorithms.',
    teaches: ['Data Structures', 'Python Algorithms'],
    wants: ['React Frontend', 'Tailwind CSS'],
    evidence_verified: true,
  },
  {
    user_id: 103,
    full_name: 'Ananya Roy',
    department: 'Electronics',
    year_of_study: '3rd Year',
    compatibility_percent: 88,
    reason: 'You can teach Ananya Web Dev and they can teach you Embedded C.',
    teaches: ['Embedded C', 'IoT Hardware'],
    wants: ['Full Stack Web', 'REST APIs'],
    evidence_verified: false,
  },
];

export const Discover = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [usingDemo, setUsingDemo] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success'); // 'success' | 'error'

  const showToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(''), 5000);
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await discoverAPI.getRecommendations();
      if (Array.isArray(data) && data.length > 0) {
        setRecommendations(data);
        setUsingDemo(false);
      } else {
        // Empty response — backend up but user has no matches yet
        setRecommendations([]);
        setUsingDemo(false);
      }
    } catch (err) {
      const errMsg = err.response?.data?.detail || err.message || 'Network error';
      setApiError(errMsg);
      // Fall back to demo data so the page is still useful for demoing
      setRecommendations(SAMPLE_RECOMMENDATIONS);
      setUsingDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRequestSend = async (rec) => {
    try {
      await requestsAPI.createRequest({ receiver_id: rec.user_id });
      showToast(`Learning request sent to ${rec.full_name}!`, 'success');
    } catch (err) {
      const detail = err.response?.data?.detail || null;
      if (detail && detail.toLowerCase().includes('already')) {
        showToast(`A pending request to ${rec.full_name} already exists.`, 'error');
      } else if (usingDemo) {
        // Demo mode — act as if it succeeded
        showToast(`(Demo) Request to ${rec.full_name} recorded.`, 'success');
      } else {
        showToast(`Failed to send request to ${rec.full_name}. Try again.`, 'error');
      }
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.full_name?.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q) ||
      r.teaches?.some((s) => s.toLowerCase().includes(q)) ||
      r.wants?.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <Header
        title="Campus Discovery & Skill Matching"
        description="Find complementary student peers ranked by reciprocal skill compatibility and evidence confidence."
        badgeText="Reciprocity Engine"
      />

      {/* Toast notifications */}
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

      {/* API error banner (non-blocking — shows demo data below) */}
      {apiError && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              <strong>Backend unreachable</strong> — showing demo data. Start the API server to see live matches.
            </span>
          </div>
          <button
            onClick={fetchRecommendations}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-500/20 rounded-lg hover:bg-amber-500/30 transition-colors font-semibold shrink-0"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="w-full sm:w-96">
          <Input
            placeholder="Search by name, department, or skill..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>
            {usingDemo ? 'Demo data' : `${recommendations.length} matches found`}
          </span>
        </div>
      </div>

      {/* Content area */}
      {loading ? (
        <div className="text-center py-20 space-y-3">
          <svg className="animate-spin h-8 w-8 mx-auto text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Calculating Reciprocal Skill Matches…
          </p>
        </div>
      ) : filteredRecs.length === 0 && searchQuery ? (
        /* No search results */
        <Card padding="lg" className="text-center py-14">
          <Search className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-200 font-semibold">No matches for "{searchQuery}"</p>
          <p className="text-xs text-slate-500 mt-1">Try a different skill, name, or department.</p>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => setSearchQuery('')}>
            Clear Search
          </Button>
        </Card>
      ) : recommendations.length === 0 ? (
        /* Backend returned empty — user likely has no skills yet */
        <Card padding="lg" hoverable={false} className="text-center py-16 border border-dashed border-slate-700">
          <Telescope className="w-12 h-12 text-indigo-400/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-200 font-heading">No matches yet</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
            Claim more skills in your Teaching Portfolio and Learning Wants to improve your campus recommendations.
          </p>
          <Button
            variant="primary"
            size="md"
            icon={GraduationCap}
            className="mt-6"
            onClick={() => window.location.href = '/dashboard'}
          >
            Add Skills to Profile
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecs.map((rec) => (
            <RecommendationCard
              key={rec.user_id}
              recommendation={rec}
              onRequestSend={handleRequestSend}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Discover;
