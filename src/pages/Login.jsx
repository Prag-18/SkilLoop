import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardTitle, CardDescription } from '../components/ui/Card';
import { Sparkles, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMsg) setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md relative">
        {/* Washi tape pin on card top */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#fde047]/90 -rotate-1 border-t border-b border-[#ca8a04]/40 shadow-sm z-10 pointer-events-none rounded-[1px]" />

        {/* Top Icon */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#ebdcc2] border border-[#d6c7b2] items-center justify-center shadow-sm mb-3">
            <Sparkles className="w-6 h-6 text-amber-900" />
          </div>
          <h1 className="text-3xl font-bold font-heading text-stone-900 tracking-tight">Welcome Back</h1>
          <p className="text-xs text-stone-600 mt-1 font-medium">Sign in to your SkillLoop student account</p>
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
              label="Campus Email Address"
              name="email"
              type="email"
              placeholder="alex@university.edu"
              icon={Mail}
              value={formData.email}
              onChange={handleChange}
              required
            />

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

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full shadow-md font-semibold"
                isLoading={isSubmitting}
                icon={ArrowRight}
              >
                Sign In to SkillLoop
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-[#dfd7c5] text-center">
            <p className="text-xs text-stone-600">
              New to SkillLoop?{' '}
              <Link to="/register" className="font-bold text-amber-900 hover:text-amber-950 underline underline-offset-2 transition-colors">
                Create Student Account
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
