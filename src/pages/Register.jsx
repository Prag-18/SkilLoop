import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usersAPI } from '../services/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import AvatarUpload from '../components/profile/AvatarUpload';
import TagInput from '../components/profile/TagInput';
import LinksEditor from '../components/profile/LinksEditor';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  GraduationCap,
  ArrowRight,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Quote,
  Type,
  AlignLeft,
} from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  // Step state
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [followUpWarning, setFollowUpWarning] = useState('');

  // Step 1 Form Data
  const [step1Data, setStep1Data] = useState({
    full_name: '',
    email: '',
    department: 'Computer Science',
    year_of_study: '3rd Year',
    password: '',
    confirm_password: '',
  });

  // Step 2 Profile Personalization Data
  const [avatarFile, setAvatarFile] = useState(null);
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState([]);
  const [links, setLinks] = useState([]);
  const [availability, setAvailability] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');

  const handleStep1Change = (e) => {
    setStep1Data((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (step1Data.password !== step1Data.confirm_password) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (step1Data.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await register({
        full_name: step1Data.full_name,
        email: step1Data.email,
        department: step1Data.department,
        year_of_study: step1Data.year_of_study,
        password: step1Data.password,
      });
      // Advance to Step 2 after successful registration
      setStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipStep2 = () => {
    navigate('/dashboard');
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');
    setFollowUpWarning('');

    try {
      // 1. Upload avatar if selected
      if (avatarFile) {
        try {
          await usersAPI.uploadAvatar(avatarFile);
        } catch (avErr) {
          console.error('Avatar upload follow-up failed:', avErr);
          setFollowUpWarning('Avatar could not be uploaded, but your profile was created.');
        }
      }

      // 2. Filter valid links
      const validLinks = links.filter(
        (l) =>
          l.label &&
          l.url &&
          (l.url.startsWith('http://') || l.url.startsWith('https://'))
      );

      // 3. Update profile fields
      const profileUpdate = {};
      if (headline.trim()) profileUpdate.headline = headline.trim();
      if (bio.trim()) profileUpdate.bio = bio.trim();
      if (interests.length > 0) profileUpdate.interests = interests;
      if (validLinks.length > 0) profileUpdate.links = validLinks;
      if (availability.trim()) profileUpdate.availability = availability.trim();
      if (favoriteQuote.trim()) profileUpdate.favorite_quote = favoriteQuote.trim();

      if (Object.keys(profileUpdate).length > 0) {
        try {
          await usersAPI.updateProfile(profileUpdate);
        } catch (profErr) {
          console.error('Profile update follow-up failed:', profErr);
          setFollowUpWarning('Some profile details could not be saved, but you are logged in.');
        }
      }

      navigate('/dashboard');
    } catch (err) {
      // Never block signup completion
      console.error('Step 2 submission note:', err);
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-500 items-center justify-center shadow-lg shadow-indigo-500/30 mb-3">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">
            {step === 1 ? 'Join SkillLoop' : 'Personalize Your Profile'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {step === 1
              ? 'Step 1 of 2: Create your student account'
              : 'Step 2 of 2: Add personality so peers can discover you (All optional)'}
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
            step === 1
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
          }`}>
            <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">1</span>
            <span>Account</span>
          </div>

          <div className="w-6 h-[1px] bg-slate-800" />

          <div className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
            step === 2
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
              : 'bg-slate-800/80 text-slate-500 border border-slate-700/50'
          }`}>
            <span className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[10px]">2</span>
            <span>Personalization</span>
          </div>
        </div>

        <Card padding="lg" hoverable={false} className="shadow-2xl">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {followUpWarning && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{followUpWarning}</span>
            </div>
          )}

          {/* STEP 1: Core Account Details */}
          {step === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <Input
                label="Full Name"
                name="full_name"
                placeholder="Alex Johnson"
                icon={User}
                value={step1Data.full_name}
                onChange={handleStep1Change}
                required
              />

              <Input
                label="Campus Email Address"
                name="email"
                type="email"
                placeholder="alex@university.edu"
                icon={Mail}
                value={step1Data.email}
                onChange={handleStep1Change}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Department / Major"
                  name="department"
                  placeholder="Computer Science"
                  icon={GraduationCap}
                  value={step1Data.department}
                  onChange={handleStep1Change}
                />
                <Input
                  label="Year of Study"
                  name="year_of_study"
                  placeholder="3rd Year"
                  icon={Calendar}
                  value={step1Data.year_of_study}
                  onChange={handleStep1Change}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={step1Data.password}
                  onChange={handleStep1Change}
                  required
                />
                <Input
                  label="Confirm Password"
                  name="confirm_password"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={step1Data.confirm_password}
                  onChange={handleStep1Change}
                  required
                />
              </div>

              <div className="pt-3">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isSubmitting}
                  icon={ArrowRight}
                >
                  Continue to Profile Personalization
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-800/80 text-center">
                <p className="text-xs text-slate-400">
                  Already have a SkillLoop account?{' '}
                  <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
                    Sign In Instead
                  </Link>
                </p>
              </div>
            </form>
          )}

          {/* STEP 2: Optional Rich Profile Personalization */}
          {step === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-5">
              {/* Photo Upload */}
              <AvatarUpload
                name={step1Data.full_name}
                selectedFile={avatarFile}
                onFileSelect={setAvatarFile}
                disabled={isSubmitting}
              />

              {/* Headline */}
              <Input
                label="Headline (Short summary)"
                placeholder='e.g. "3rd-year CS, into ML and design"'
                icon={Type}
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={80}
                helperText={`${headline.length}/80 characters`}
                disabled={isSubmitting}
              />

              {/* Bio with Live Character Counter */}
              <div className="w-full flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 tracking-wide flex items-center gap-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-indigo-400" />
                    About Me / Bio
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
                  placeholder="Share what you are passionate about, what projects you build, and what you love learning..."
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 resize-none transition-all duration-200"
                />
              </div>

              {/* Interests Tag Input */}
              <TagInput
                tags={interests}
                onChange={setInterests}
                maxTags={8}
                maxLength={30}
                disabled={isSubmitting}
              />

              {/* Links Editor */}
              <LinksEditor
                links={links}
                onChange={setLinks}
                maxLinks={5}
                disabled={isSubmitting}
              />

              {/* Availability & Quote */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Availability"
                  placeholder="e.g. Weekday evenings"
                  icon={Clock}
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  maxLength={100}
                  disabled={isSubmitting}
                />
                <Input
                  label="Favorite Quote / Scrapbook Sticker"
                  placeholder="e.g. Stay hungry, stay foolish"
                  icon={Quote}
                  value={favoriteQuote}
                  onChange={(e) => setFavoriteQuote(e.target.value)}
                  maxLength={120}
                  disabled={isSubmitting}
                />
              </div>

              {/* Step 2 Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
                <Button
                  type="submit"
                  variant="emerald"
                  size="lg"
                  className="w-full sm:flex-1"
                  isLoading={isSubmitting}
                  icon={CheckCircle2}
                >
                  Complete Profile & Finish
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  className="w-full sm:w-auto text-slate-400 hover:text-slate-200"
                  onClick={handleSkipStep2}
                  disabled={isSubmitting}
                >
                  Skip for now
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Register;
