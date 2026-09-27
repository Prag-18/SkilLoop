import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Sparkles, User, Mail, Lock, GraduationCap, ArrowRight, AlertCircle, Calendar } from 'lucide-react';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: 'Computer Science',
    year_of_study: '3rd Year',
    password: '',
    confirm_password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await register({
        full_name: formData.full_name,
        email: formData.email,
        department: formData.department,
        year_of_study: formData.year_of_study,
        password: formData.password,
      });
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg relative">
        {/* Washi tape pin on card top */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-36 h-6 bg-[#fde047]/90 rotate-1 border-t border-b border-[#ca8a04]/40 shadow-sm z-10 pointer-events-none rounded-[1px]" />

        {/* Top Icon */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#ebdcc2] border border-[#d6c7b2] items-center justify-center shadow-sm mb-3">
            <Sparkles className="w-6 h-6 text-amber-900" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-stone-900 tracking-tight">Join SkillLoop</h1>
          <p className="text-xs text-stone-600 mt-1 font-medium">Create your student profile and start exchanging skills</p>
        </div>

        <Card padding="lg" hoverable={false} className="shadow-[3px_8px_30px_rgba(40,30,20,0.1)] bg-[#fffdfa] border-2 border-[#e5dcc7] rounded-3xl">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#fff1f2] border-2 border-rose-300 text-rose-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              name="full_name"
              placeholder="Alex Johnson"
              icon={User}
              value={formData.full_name}
              onChange={handleChange}
              required
            />

            <Input
              label="Campus Email Address"
              name="email"
              type="email"
              placeholder="alex@university.edu"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Department / Major"
                name="department"
                placeholder="Computer Science"
                icon={GraduationCap}
                value={formData.department}
                onChange={handleChange}
              />
              <Input
                label="Year of Study"
                name="year_of_study"
                placeholder="3rd Year"
                icon={Calendar}
                value={formData.year_of_study}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.password}
                onChange={handleChange}
                required
              />
              <Input
                label="Confirm Password"
                name="confirm_password"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={formData.confirm_password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="pt-3">
              <Button
                type="submit"
                variant="emerald"
                size="lg"
                className="w-full shadow-md font-semibold"
                isLoading={isSubmitting}
                icon={ArrowRight}
              >
                Create Student Account
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#dfd7c5] text-center">
            <p className="text-xs text-stone-600">
              Already have a SkillLoop account?{' '}
              <Link to="/login" className="font-bold text-amber-900 hover:text-amber-950 underline underline-offset-2 transition-colors">
                Sign In Instead
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Register;
