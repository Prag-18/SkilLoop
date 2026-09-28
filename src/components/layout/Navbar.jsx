import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
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
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-heading font-bold text-xl tracking-tight text-white">
                Skill<span className="text-indigo-400">Loop</span>
              </span>
              <span className="block text-[10px] text-slate-400 font-medium -mt-1 tracking-wider uppercase">
                Campus Skill Exchange
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard' ? 'text-indigo-400 font-semibold' : 'text-slate-300 hover:text-white'
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
            >
              {apiOnline ? 'API Online' : apiOnline === false ? 'Offline' : 'Checking'}
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
                >
                  Dashboard
                </Button>
                <Link
                  to="/profile/edit"
                  title="Edit Profile"
                  className="flex items-center gap-2 pl-2 border-l border-slate-800 hover:opacity-80 transition-opacity"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 overflow-hidden shrink-0">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}</span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-slate-300 max-w-[100px] truncate">
                    {user?.full_name || 'Student'}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded-lg transition-colors"
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
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={UserCheck}
                  onClick={() => navigate('/register')}
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
              className="p-2 text-slate-400 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
          >
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Dashboard
              </Link>
              <Link
                to="/profile/edit"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-slate-800"
              >
                Edit Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-base font-medium text-rose-400 hover:bg-slate-800 flex items-center gap-2"
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
