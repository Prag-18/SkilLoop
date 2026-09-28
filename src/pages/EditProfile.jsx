import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import Header from '../components/common/Header';
import Card, { CardTitle, CardDescription } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AvatarUpload from '../components/profile/AvatarUpload';
import TagInput from '../components/profile/TagInput';
import LinksEditor from '../components/profile/LinksEditor';
import {
  User,
  GraduationCap,
  Calendar,
  Type,
  AlignLeft,
  Clock,
  Quote,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

export const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form fields
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('');
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState('');
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState([]);
  const [links, setLinks] = useState([]);
  const [availability, setAvailability] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      // Fetch fresh profile from /users/me
      const profileData = await usersAPI.getProfile('me').catch(() => null);
      const data = profileData || user;
      if (data) {
        setFullName(data.full_name || '');
        setDepartment(data.department || 'Computer Science');
        setYearOfStudy(data.year_of_study || '3rd Year');
        setCurrentAvatarUrl(data.avatar_url || '');
        setHeadline(data.headline || '');
        setBio(data.bio || '');
        setInterests(Array.isArray(data.interests) ? data.interests : []);
        setLinks(Array.isArray(data.links) ? data.links : []);
        setAvailability(data.availability || '');
        setFavoriteQuote(data.favorite_quote || '');
      }
    } catch (err) {
      console.error('Failed to load profile for edit:', err);
      setErrorMsg('Could not load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // 1. Upload new avatar if changed
      let newAvatarUrl = currentAvatarUrl;
      if (selectedAvatarFile) {
        const uploadRes = await usersAPI.uploadAvatar(selectedAvatarFile);
        if (uploadRes && uploadRes.avatar_url) {
          newAvatarUrl = uploadRes.avatar_url;
          setCurrentAvatarUrl(newAvatarUrl);
          setSelectedAvatarFile(null);
        }
      }

      // 2. Prepare and clean profile update
      const validLinks = (links || []).filter(
        (l) =>
          l.label &&
          l.url &&
          (l.url.startsWith('http://') || l.url.startsWith('https://'))
      );

      const updatePayload = {
        full_name: fullName.trim(),
        department: department.trim(),
        year_of_study: yearOfStudy.trim(),
        headline: headline.trim() || null,
        bio: bio.trim() || null,
        interests: interests,
        links: validLinks,
        availability: availability.trim() || null,
        favorite_quote: favoriteQuote.trim() || null,
      };

      const updatedUser = await usersAPI.updateProfile(updatePayload);

      // Update cached user in localStorage if matching
      const stored = localStorage.getItem('skillloop_user');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          localStorage.setItem(
            'skillloop_user',
            JSON.stringify({ ...parsed, ...updatedUser, avatar_url: newAvatarUrl })
          );
        } catch (e) {}
      }

      setSuccessMsg('Profile personalization saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to save changes.';
      setErrorMsg(typeof msg === 'string' ? msg : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-400">
        <svg className="animate-spin h-8 w-8 mx-auto text-indigo-500 mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs uppercase font-semibold tracking-wider">Loading Profile Settings…</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          icon={ArrowLeft}
          onClick={() => navigate('/dashboard')}
        >
          Back to Dashboard
        </Button>
        {user?.id && (
          <Button
            variant="outline"
            size="sm"
            icon={ExternalLink}
            onClick={() => navigate(`/u/${user.id}`)}
          >
            View Public Profile
          </Button>
        )}
      </div>

      <Header
        title="Edit Student Profile"
        description="Personalize your campus presence with photo, headline, bio, interests, and external links."
        badgeText="Profile Personalization"
      />

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card padding="lg">
          <CardTitle className="mb-4">Identity & Photo</CardTitle>
          <div className="space-y-5">
            <AvatarUpload
              name={fullName}
              currentAvatarUrl={currentAvatarUrl}
              selectedFile={selectedAvatarFile}
              onFileSelect={setSelectedAvatarFile}
              disabled={saving}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Full Name"
                icon={User}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={saving}
              />
              <Input
                label="Department / Major"
                icon={GraduationCap}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                disabled={saving}
              />
              <Input
                label="Year of Study"
                icon={Calendar}
                value={yearOfStudy}
                onChange={(e) => setYearOfStudy(e.target.value)}
                disabled={saving}
              />
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <CardTitle className="mb-4">Personalization & Interests</CardTitle>
          <div className="space-y-5">
            <Input
              label="Headline"
              placeholder='e.g. "3rd-year CS, into ML and design"'
              icon={Type}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              maxLength={80}
              helperText={`${headline.length}/80 characters`}
              disabled={saving}
            />

            <div className="w-full flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 tracking-wide flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
                  Bio / About Me
                </label>
                <span className="text-[11px] text-slate-500 font-mono">
                  {bio.length}/300
                </span>
              </div>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={300}
                placeholder="Share your interests, background, and what you are learning..."
                disabled={saving}
                className="w-full rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 resize-none transition-all duration-200"
              />
            </div>

            <TagInput
              tags={interests}
              onChange={setInterests}
              maxTags={8}
              maxLength={30}
              disabled={saving}
            />

            <LinksEditor
              links={links}
              onChange={setLinks}
              maxLinks={5}
              disabled={saving}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Availability"
                placeholder="e.g. Weekday evenings"
                icon={Clock}
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                maxLength={100}
                disabled={saving}
              />
              <Input
                label="Favorite Quote (Scrapbook Sticker)"
                placeholder="e.g. Stay curious"
                icon={Quote}
                value={favoriteQuote}
                onChange={(e) => setFavoriteQuote(e.target.value)}
                maxLength={120}
                disabled={saving}
              />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="emerald"
            size="lg"
            isLoading={saving}
            icon={Save}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
