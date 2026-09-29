import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI, requestsAPI } from '../services/api';
import Card, { CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Avatar from '../components/common/Avatar';
import {
  GraduationCap,
  Calendar,
  Sparkles,
  Quote,
  Clock,
  ExternalLink,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export const PublicProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requestSent, setRequestSent] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersAPI.getProfile(id);
      setProfile(data);
    } catch (err) {
      console.error('Failed to load student profile:', err);
      setError('Student profile not found or server is unreachable.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!profile) return;
    setSendingRequest(true);
    try {
      await requestsAPI.createRequest({ receiver_id: profile.id });
      setRequestSent(true);
    } catch (err) {
      console.error('Failed to send request:', err);
      // If already requested or error
      setRequestSent(true);
    } finally {
      setSendingRequest(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400">
        <svg className="animate-spin h-8 w-8 mx-auto text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs uppercase font-semibold tracking-wider">Loading Student Profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <Card padding="lg">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-xs text-slate-400 mb-6">{error || 'This student profile could not be found.'}</p>
          <Button variant="outline" size="sm" icon={ArrowLeft} onClick={() => navigate('/discover')}>
            Back to Discovery
          </Button>
        </Card>
      </div>
    );
  }

  const initial = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'S';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Badge variant="indigo" size="sm" icon={Sparkles}>
          Campus Peer
        </Badge>
      </div>

      {/* Main Profile Header Card */}
      <Card padding="lg" className="relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar with initials fallback */}
          <Avatar
            src={profile.avatar_url}
            name={profile.full_name}
            size="2xl"
            shape="rounded"
            className="border-2 border-[#d6c7b2] shadow-xl"
          />

          {/* Profile Identity */}
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-stone-900 font-heading tracking-tight">
                  {profile.full_name}
                </h1>
                {profile.headline && (
                  <p className="text-sm font-semibold text-amber-900 mt-0.5">
                    {profile.headline}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-center md:justify-end gap-2">
                <Button
                  variant={requestSent ? 'emerald' : 'primary'}
                  size="md"
                  icon={requestSent ? CheckCircle2 : Send}
                  disabled={requestSent || sendingRequest}
                  isLoading={sendingRequest}
                  onClick={handleSendRequest}
                >
                  {requestSent ? 'Request Sent!' : 'Send Learning Request'}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-stone-600 font-medium pt-1">
              <span className="flex items-center gap-1">
                <GraduationCap className="w-4 h-4 text-amber-800" />
                {profile.department || 'Computer Science'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-emerald-800" />
                {profile.year_of_study || 'Student'}
              </span>
              {profile.availability && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-900 font-semibold">
                    <Clock className="w-4 h-4" />
                    {profile.availability}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Favorite Quote Scrapbook Sticker */}
        {profile.favorite_quote && (
          <div className="mt-6 p-4 rounded-2xl bg-[#faf5e8] border border-[#e5dcc7] text-stone-800 text-xs flex items-center gap-3 shadow-xs">
            <Quote className="w-5 h-5 text-amber-800 shrink-0 opacity-80" />
            <p className="italic font-medium">"{profile.favorite_quote}"</p>
          </div>
        )}
      </Card>

      {/* Bio / About */}
      {profile.bio && (
        <Card padding="lg">
          <CardTitle className="mb-2">About</CardTitle>
          <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-wrap font-sans">
            {profile.bio}
          </p>
        </Card>
      )}

      {/* Interests & Topics */}
      {Array.isArray(profile.interests) && profile.interests.length > 0 && (
        <Card padding="lg">
          <CardTitle className="mb-3">Interests & Topics</CardTitle>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, idx) => (
              <Badge key={idx} variant="amber" size="md">
                {interest}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Featured External Links */}
      {Array.isArray(profile.links) && profile.links.length > 0 && (
        <Card padding="lg">
          <CardTitle className="mb-3">Connect & Links</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.links.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-[#faf6ee] border-2 border-[#e5dcc7] hover:border-amber-600/50 hover:bg-[#ebdcc2]/50 transition-all duration-200 flex items-center justify-between group text-xs text-stone-800 shadow-xs"
              >
                <span className="font-semibold text-stone-900 group-hover:text-amber-900 transition-colors">
                  {link.label || 'Link'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-800 transition-colors" />
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default PublicProfile;
