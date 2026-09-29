import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../common/Avatar';
import { healthAPI } from '../../services/api';
import {
  Sparkles,
  BookOpen,
  UserCheck,
  LogOut,
  LayoutDashboard,
  Activity,
  Menu,
  X
} from 'lucide-react';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const checkApiHealth = async () => {
      try {
        await healthAPI.checkHealth();
        if (isMounted) setApiOnline(true);
      } catch (err) {
        if (isMounted) setApiOnline(false);
      }
    };
    checkApiHealth();
    const interval = setInterval(checkApiHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#faf6ee]/95 border-b-2 border-[#dfd7c5] shadow-sm backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group relative">
            <div className="w-10 h-10 rounded-2xl bg-[#ebdcc2] border-2 border-[#d6c7b2] shadow-inner flex items-center justify-center text-amber-900 group-hover:rotate-6 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-amber-800" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-2xl tracking-tight text-stone-900">
                Syna<span className="text-amber-800 font-extrabold">pse</span>
              </span>
              <span className="block text-[9px] text-stone-600 font-bold -mt-1 tracking-widest uppercase font-mono">
                Campus Skill Exchange
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors ${location.pathname === '/' ? 'text-amber-950 font-bold underline decoration-amber-500 decoration-2 underline-offset-4' : 'text-stone-700 hover:text-stone-950'
                }`}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`text-sm font-semibold transition-colors ${location.pathname === '/dashboard' ? 'text-amber-950 font-bold underline decoration-amber-500 decoration-2 underline-offset-4' : 'text-stone-700 hover:text-stone-950'
                  }`}
              >
                Dashboard
              </Link>
            )}

            {/* Health status badge */}
            <Badge
              variant={apiOnline ? 'emerald' : apiOnline === false ? 'rose' : 'slate'}
              size="sm"
              icon={Activity}
              className="font-mono font-bold text-[11px] shadow-xs"
            >
              {apiOnline ? 'API ONLINE' : apiOnline === false ? 'OFFLINE' : 'CHECKING'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  icon={LayoutDashboard}
                  onClick={() => navigate('/dashboard')}
                  className="shadow-xs font-semibold"
                >
                  Dashboard
                </Button>
                <Link
                  to="/profile/edit"
                  title="Edit Profile"
                  className="flex items-center gap-2 pl-2 border-l border-[#dfd7c5] hover:opacity-80 transition-opacity"
                >
                  <Avatar
                    src={user?.avatar_url}
                    name={user?.full_name}
                    size="sm"
                    shape="circle"
                    className="border-2 border-[#d6c7b2] shadow-xs"
                  />
                  <span className="text-xs font-semibold text-stone-800 max-w-[110px] truncate">
                    {user?.full_name || 'Student'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-stone-500 hover:text-rose-700 hover:bg-[#ebdcc2]/60 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login')}
                  className="font-semibold"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={UserCheck}
                  onClick={() => navigate('/register')}
                  className="shadow-md font-semibold"
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-stone-600 hover:text-stone-900 rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf6ee] border-b-2 border-[#dfd7c5] px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-[#ebdcc2]/60 font-heading"
          >
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-[#ebdcc2]/60 font-heading"
              >
                Dashboard
              </Link>
              <Link
                to="/profile/edit"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-stone-800 hover:bg-[#ebdcc2]/60 font-heading"
              >
                Edit Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-[#fff1f2] flex items-center gap-2 font-heading"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" className="w-full justify-center" onClick={() => { setMobileMenuOpen(false); navigate('/login'); }}>
                Sign In
              </Button>
              <Button variant="primary" className="w-full justify-center" onClick={() => { setMobileMenuOpen(false); navigate('/register'); }}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
