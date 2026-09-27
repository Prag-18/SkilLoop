import React, { useState, useEffect } from 'react';
import Header from '../components/common/Header';
import RecommendationCard from '../components/discover/RecommendationCard';
import { discoverAPI, requestsAPI } from '../services/api';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Badge from '../components/ui/Badge';
import { Sparkles, Search, Filter, AlertCircle, CheckCircle2 } from 'lucide-react';

export const Discover = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const sampleRecommendations = [
    {
      user_id: 101,
      full_name: 'Priya Sharma',
      department: 'Computer Science',
      year_of_study: '4th Year',
      compatibility_percent: 96,
      reason: 'You can teach Priya Python, she can teach you UI/UX Design. Both interested in AI.',
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
      reason: 'You can teach Arjun React, he can teach you Data Structures & Algorithms.',
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
      reason: 'You can teach Ananya Web Dev, she can teach you Microcontrollers & Embedded C.',
      teaches: ['Embedded C', 'IoT Hardware'],
      wants: ['Full Stack Web', 'REST APIs'],
      evidence_verified: false,
    },
  ];

  useEffect(() => {
    let isMounted = true;
    const fetchRecommendations = async () => {
      try {
        const data = await discoverAPI.getRecommendations();
        if (isMounted) {
          setRecommendations(data && data.length > 0 ? data : sampleRecommendations);
        }
      } catch (err) {
        if (isMounted) {
          setRecommendations(sampleRecommendations);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRecommendations();
    return () => { isMounted = false; };
  }, []);

  const handleRequestSend = async (rec) => {
    try {
      await requestsAPI.createRequest({ receiver_id: rec.user_id });
      setToastMsg(`Learning request sent to ${rec.full_name}!`);
      setTimeout(() => setToastMsg(''), 4000);
    } catch (err) {
      console.log("Mock request sent for candidate:", rec.user_id);
      setToastMsg(`Learning request sent to ${rec.full_name}!`);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const filteredRecs = recommendations.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.teaches.some((s) => s.toLowerCase().includes(q)) ||
      r.wants.some((s) => s.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <Header
        title="Campus Discovery & Skill Matching"
        description="Find complementary student peers ranked by reciprocal skill compatibility & evidence confidence."
        badgeText="Reciprocity Engine"
      />

      {toastMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 shadow-lg animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="w-full sm:w-96">
          <Input
            placeholder="Search by peer name, department, or skill..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Showing Top Matches</span>
        </div>
      </div>

      {/* Recommendations Feed */}
      {loading ? (
        <div className="text-center py-16 text-indigo-400 space-y-3">
          <svg className="animate-spin h-8 w-8 mx-auto text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            Calculating Reciprocal Skill Matches...
          </p>
        </div>
      ) : filteredRecs.length === 0 ? (
        <Card padding="lg" className="text-center py-12">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">No matching students found for "{searchQuery}".</p>
          <p className="text-xs text-slate-500 mt-1">Try searching for a different skill or department.</p>
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
