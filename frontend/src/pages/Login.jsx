import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { Mail, Lock, AlertCircle, Eye, EyeOff, Check, ArrowRight, Zap, BarChart3, Link2 } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [statsCount, setStatsCount] = useState(9850);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  // Counting animation for stats card
  useEffect(() => {
    let start = 9850;
    const end = 10243;
    const duration = 1500;
    const increment = Math.ceil((end - start) / 30);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setStatsCount(end);
        clearInterval(timer);
        
        const liveTimer = setInterval(() => {
          setStatsCount(prev => prev + Math.floor(Math.random() * 3) + 1);
        }, 3000);
        return () => clearInterval(liveTimer);
      } else {
        setStatsCount(start);
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear field-specific error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setServerError('');
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.email) {
      tempErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    }
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError('');
    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data;
      login(token, user);
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          setServerError(err.response.data.message);
        } else if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          setServerError(err.response.data.errors.map(e => e.msg).join(', '));
        } else {
          setServerError('Invalid email or password');
        }
      } else {
        setServerError('Server unreachable. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isEmailActive = focusedField === 'email' || formData.email;
  const isPasswordActive = focusedField === 'password' || formData.password;

  return (
    <div className="min-h-screen flex bg-white text-slate-800 font-sans overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient-bg {
          background: linear-gradient(135deg, #0F0C29, #302B63, #24243e);
          background-size: 200% 200%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(168, 85, 247, 0.4), 0 0 30px rgba(168, 85, 247, 0.2);
          }
          50% {
            box-shadow: 0 0 25px rgba(168, 85, 247, 0.7), 0 0 40px rgba(168, 85, 247, 0.4);
          }
        }

        .animate-pulse-glow {
          animation: pulseGlow 3s infinite ease-in-out;
        }

        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }

        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(15px) scale(0.95); }
        }

        .animate-float-1 {
          animation: float1 6s ease-in-out infinite;
        }

        .animate-float-2 {
          animation: float2 8s ease-in-out infinite;
        }

        @keyframes fadeInFromLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        @keyframes fadeInFromRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .animate-fade-left {
          animation: fadeInFromLeft 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-fade-right {
          animation: fadeInFromRight 400ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-pill-stagger {
          opacity: 0;
          animation: fadeInUp 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .btn-gradient {
          background-image: linear-gradient(to right, #4f46e5 0%, #9333ea 50%, #4f46e5 100%);
          background-size: 200% auto;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-gradient:hover {
          background-position: right center;
        }
      `}</style>
      
      {/* LEFT HALF (hidden on mobile, compressed on tablet, 50% on desktop) */}
      <div className="hidden md:flex md:w-[40%] lg:w-1/2 animate-gradient-bg p-8 lg:p-16 flex-col justify-between relative overflow-hidden animate-fade-left">
        {/* Floating glowing orbs */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-float-1" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-float-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        {/* Brand header */}
        <div className="flex items-center space-x-4 z-10">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center font-black text-2xl text-indigo-600 animate-pulse-glow">
            L
          </div>
          <span className="font-poppins font-extrabold text-2xl tracking-wide text-white">LinkSnip</span>
        </div>

        {/* Feature Highlights Section */}
        <div className="my-auto max-w-md space-y-8 z-10 text-white">
          <div className="space-y-4">
            <h2 className="text-5xl lg:text-6xl font-poppins font-black leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-purple-400">
              Shorten.
              <br />
              Track.
              <br />
              Grow.
            </h2>
            <p className="text-indigo-200 text-sm lg:text-base leading-relaxed">
              The ultimate SaaS URL shortener built to brand, organize, and inspect your click conversions.
            </p>
          </div>

          {/* Feature pills with glassmorphism styling */}
          <div className="space-y-3 pt-2">
            {[
              { text: 'Free forever, no credit card', icon: Zap, iconColor: 'text-emerald-400' },
              { text: 'Detailed click analytics', icon: BarChart3, iconColor: 'text-cyan-400' },
              { text: 'Custom branded links', icon: Link2, iconColor: 'text-fuchsia-400' }
            ].map((pill, idx) => {
              const IconComponent = pill.icon;
              return (
                <div 
                  key={idx} 
                  className="flex items-center gap-3 px-5 py-2.5 rounded-full shadow-sm w-fit transition-transform hover:translate-x-2 duration-300 animate-pill-stagger"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    animationDelay: `${(idx + 1) * 100}ms`
                  }}
                >
                  <IconComponent className={`h-4.5 w-4.5 ${pill.iconColor} stroke-[2.5px]`} />
                  <span className="text-xs lg:text-sm font-semibold text-slate-100">{pill.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Glassmorphism Stats Card */}
        <div 
          className="w-full max-w-sm rounded-2xl p-5 shadow-2xl z-10 select-none transition-transform duration-300 hover:scale-[1.02] animate-pill-stagger"
          style={{
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            animationDelay: '400ms'
          }}
        >
          <div className="flex justify-between items-center text-[10px] text-indigo-200 pb-2.5 border-b border-white/10 mb-3.5">
            <span className="font-extrabold uppercase tracking-widest font-sans">Platform Activity</span>
            <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30 text-[9px] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live
            </span>
          </div>
          <p className="text-xs lg:text-sm font-medium text-slate-300 font-sans">
            <span className="text-2xl lg:text-3xl font-extrabold text-white tabular-nums tracking-tight mr-1">
              {statsCount.toLocaleString()}+
            </span> links shortened today
          </p>
        </div>
      </div>

      {/* RIGHT HALF: Form (full width on mobile, 60% on tablet, 50% on desktop) */}
      <div 
        className="w-full md:w-[60%] lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16 relative animate-fade-right"
        style={{
          backgroundColor: '#ffffff',
          backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      >
        <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-8 shadow-xl sm:shadow-none sm:border-none sm:bg-transparent">
          
          <div className="flex flex-col items-start">
            {/* Mobile-only logo */}
            <div className="md:hidden h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-md mb-6 animate-pulse-glow">
              L
            </div>
            <h2 className="text-4xl font-poppins font-extrabold text-[#1E293B] tracking-tight">
              Welcome back 👋
            </h2>
            <p className="mt-2 text-sm text-[#64748B] font-medium">
              Simplify links and measure visitor details
            </p>
          </div>

          {serverError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3.5 rounded-xl flex items-start space-x-2.5 text-sm animate-fadeInUp">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
              <span className="font-medium">{serverError}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Address */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className={`h-4.5 w-4.5 transition-colors duration-200 ${focusedField === 'email' ? 'text-indigo-600' : 'text-slate-400'}`} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 pt-6 pb-2 border rounded-xl focus:outline-none focus:ring-0 text-sm transition-all duration-200 ${
                  errors.email 
                    ? 'border-rose-300 focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.1)]' 
                    : focusedField === 'email'
                      ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(79,70,229,0.1)]'
                      : 'border-slate-200 hover:border-slate-300'
                }`}
                placeholder=" "
              />
              <label
                htmlFor="email"
                className={`absolute left-10 pointer-events-none transition-all duration-200 ${
                  isEmailActive
                    ? 'text-[10px] font-bold text-indigo-600 top-2'
                    : 'text-sm text-slate-400 top-1/2 -translate-y-1/2'
                }`}
              >
                Email address
              </label>
              {errors.email && (
                <p className="mt-1.5 text-xs text-rose-600 font-semibold">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className={`h-4.5 w-4.5 transition-colors duration-200 ${focusedField === 'password' ? 'text-indigo-600' : 'text-slate-400'}`} />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={formData.password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                onChange={handleChange}
                className={`block w-full pl-10 pr-10 pt-6 pb-2 border rounded-xl focus:outline-none focus:ring-0 text-sm transition-all duration-200 ${
                  errors.password 
                    ? 'border-rose-300 focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(244,63,94,0.1)]' 
                    : focusedField === 'password'
                      ? 'border-indigo-500 shadow-[0_0_0_3px_rgba(79,70,229,0.1)]'
                      : 'border-slate-200 hover:border-slate-300'
                }`}
                placeholder=" "
              />
              <label
                htmlFor="password"
                className={`absolute left-10 pointer-events-none transition-all duration-200 ${
                  isPasswordActive
                    ? 'text-[10px] font-bold text-indigo-600 top-2'
                    : 'text-sm text-slate-400 top-1/2 -translate-y-1/2'
                }`}
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
              {errors.password && (
                <p className="mt-1.5 text-xs text-rose-600 font-semibold">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="sr-only"
                />
                <div className={`h-4.5 w-4.5 border rounded flex items-center justify-center transition-all duration-200 ${
                  rememberMe 
                    ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-600/35' 
                    : 'border-slate-200 bg-white hover:border-indigo-400'
                }`}>
                  {rememberMe && <Check className="h-3 w-3 text-white stroke-[3.5px]" />}
                </div>
                <span className="ml-2 text-xs text-slate-500 font-semibold">Remember me</span>
              </label>
              
              <button
                type="button"
                onClick={() => alert('Password recovery is under construction!')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            {/* Gradient Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 rounded-xl shadow-lg shadow-indigo-600/15 text-base font-bold text-white btn-gradient hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="h-5.5 w-5.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 font-extrabold uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-500 font-medium">
            New to LinkSnip?{' '}
            <Link to="/signup" className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors duration-200">
              Create an account
            </Link>
          </p>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <div className="flex -space-x-2.5">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">JD</div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">AM</div>
              <div className="w-8 h-8 rounded-full border-2 border-white bg-pink-500 text-[10px] font-bold text-white flex items-center justify-center shadow-sm">SK</div>
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              Join <span className="font-extrabold text-slate-700">50,000+</span> marketers using LinkSnip
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
