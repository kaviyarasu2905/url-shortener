import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import { User, Mail, Lock, AlertCircle, Eye, EyeOff, Check, ArrowRight } from 'lucide-react';

const Signup = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
    setServerError('');
  };

  const validateForm = () => {
    const tempErrors = {};
    if (!formData.name.trim()) {
      tempErrors.name = 'Full name is required';
    }
    if (!formData.email) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }
    if (!agreeTerms) {
      tempErrors.agreeTerms = 'You must agree to the Terms of Service';
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
      const response = await authAPI.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      const { token, user } = response.data;
      login(token, user);
      navigate('/home');
    } catch (err) {
      console.error('Signup error:', err);
      if (err.response && err.response.data) {
        if (err.response.data.message) {
          setServerError(err.response.data.message);
        } else if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          setServerError(err.response.data.errors.map(e => e.msg).join(', '));
        } else {
          setServerError('Registration failed. Please check your entries.');
        }
      } else {
        setServerError('Server unreachable. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (pwd) => {
    if (!pwd) return { text: '', color: 'bg-transparent', textColor: 'text-slate-400', width: 'w-0' };
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    
    if (score <= 2) return { text: 'Weak 🔴', color: 'bg-rose-500', textColor: 'text-rose-500', width: 'w-1/3' };
    if (score <= 4) return { text: 'Fair 🟡', color: 'bg-amber-500', textColor: 'text-amber-500', width: 'w-2/3' };
    return { text: 'Strong 🟢', color: 'bg-emerald-500', textColor: 'text-emerald-500', width: 'w-full' };
  };

  const strength = getPasswordStrength(formData.password);

  const isNameActive = focusedField === 'name' || formData.name;
  const isEmailActive = focusedField === 'email' || formData.email;
  const isPasswordActive = focusedField === 'password' || formData.password;
  const isConfirmPasswordActive = focusedField === 'confirmPassword' || formData.confirmPassword;

  return (
    <div className="min-h-screen flex bg-white text-slate-800 font-sans">
      
      {/* LEFT HALF (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#7C3AED] p-16 flex-col justify-between relative overflow-hidden">
        {/* Floating CSS shapes */}
        <div className="absolute top-1/4 right-1/10 w-80 h-80 rounded-full bg-gradient-to-tr from-cyan-500/10 to-indigo-500/10 blur-3xl animate-float pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/10 w-96 h-96 rounded-full bg-gradient-to-tr from-purple-500/15 to-indigo-500/15 blur-3xl animate-float pointer-events-none" style={{ animationDelay: '-2s' }} />
        
        {/* Decorative background grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        
        {/* Brand header */}
        <div className="flex items-center space-x-4 z-10">
          <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center font-black text-2xl text-indigo-600 shadow-lg shadow-indigo-500/10 animate-pulse-glow">
            L
          </div>
          <span className="font-poppins font-extrabold text-2xl tracking-wide text-white">LinkSnip</span>
        </div>

        {/* Feature Highlights Section */}
        <div className="my-auto max-w-md space-y-8 z-10 text-white animate-fadeInUp">
          <div className="space-y-4">
            <h2 className="text-5xl font-poppins font-bold tracking-tight leading-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Create an account
            </h2>
            <p className="text-indigo-205 text-base leading-relaxed text-slate-300">
              Start branding your links, building QR codes, and trace visitor traffic in real time.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              'Free forever, no credit card',
              'Detailed click analytics',
              'Custom branded links'
            ].map((pill, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 text-sm font-semibold text-white shadow-sm w-fit transition-transform hover:translate-x-1 duration-200">
                <Check className="h-4 w-4 text-emerald-400 stroke-[3px]" />
                <span>{pill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating Glassmorphism Stats Card */}
        <div className="w-full max-w-sm glass-dark rounded-2xl p-5 border border-white/10 shadow-2xl z-10 select-none backdrop-blur-md animate-fadeInUp delay-150">
          <div className="flex justify-between items-center text-[10px] text-indigo-200 pb-2.5 border-b border-white/10 mb-3.5">
            <span className="font-extrabold uppercase tracking-widest font-sans">Social Proof</span>
            <span className="bg-[#7C3AED]/20 text-[#C084FC] font-bold px-2.5 py-0.5 rounded-full border border-[#7C3AED]/30 text-[9px] flex items-center gap-1">
              Popular ⚡
            </span>
          </div>
          <p className="text-sm font-medium text-slate-300 font-sans">
            Join <span className="text-2xl font-extrabold text-white tabular-nums tracking-tight">50,000+</span> marketers shortening links
          </p>
        </div>
      </div>

      {/* RIGHT HALF: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-16 overflow-y-auto">
        <div className="max-w-md w-full space-y-7 bg-white p-2">
          
          <div className="flex flex-col items-start">
            {/* Mobile-only logo */}
            <div className="lg:hidden h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center font-black text-2xl text-white shadow-md mb-6 animate-pulse-glow">
              L
            </div>
            <h2 className="text-4xl font-poppins font-bold text-slate-900 tracking-tight">
              Get Started 🚀
            </h2>
            <p className="mt-2 text-sm text-slate-500 font-medium">
              Join modern creators growing their audience
            </p>
          </div>

          {serverError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-700 px-4 py-3.5 rounded-xl flex items-start space-x-2.5 text-sm animate-fadeInUp">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
              <span className="font-medium">{serverError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <User className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField('')}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 pt-6 pb-2 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all ${
                  errors.name ? 'border-rose-300 ring-rose-200' : 'border-slate-200'
                }`}
                placeholder=" "
              />
              <label
                htmlFor="name"
                className={`absolute left-10 pointer-events-none transition-all duration-200 ${
                  isNameActive
                    ? 'text-[10px] font-bold text-indigo-600 top-2'
                    : 'text-sm text-slate-400 top-1/2 -translate-y-1/2'
                }`}
              >
                Full Name
              </label>
              {errors.name && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.name}</p>
              )}
            </div>

            {/* Email Address */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField('')}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 pt-6 pb-2 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all ${
                  errors.email ? 'border-rose-300 ring-rose-200' : 'border-slate-200'
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
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField('')}
                onChange={handleChange}
                className={`block w-full pl-10 pr-10 pt-6 pb-2 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all ${
                  errors.password ? 'border-rose-300 ring-rose-200' : 'border-slate-200'
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
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.password}</p>
              )}
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-1.5 px-1 animate-fadeInUp">
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300 rounded-full`} />
                </div>
                <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider">
                  <span className="text-slate-400">Password strength</span>
                  <span className={strength.textColor}>{strength.text}</span>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 text-slate-400" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField('')}
                onChange={handleChange}
                className={`block w-full pl-10 pr-10 pt-6 pb-2 border rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-sm transition-all ${
                  errors.confirmPassword ? 'border-rose-300 ring-rose-200' : 'border-slate-200'
                }`}
                placeholder=" "
              />
              <label
                htmlFor="confirmPassword"
                className={`absolute left-10 pointer-events-none transition-all duration-200 ${
                  isConfirmPasswordActive
                    ? 'text-[10px] font-bold text-indigo-600 top-2'
                    : 'text-sm text-slate-400 top-1/2 -translate-y-1/2'
                }`}
              >
                Confirm Password
              </label>
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start cursor-pointer select-none">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => {
                      setAgreeTerms(e.target.checked);
                      if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: '' });
                    }}
                    className="sr-only"
                  />
                  <div className={`h-4.5 w-4.5 border rounded flex items-center justify-center transition-all ${
                    agreeTerms 
                      ? 'bg-indigo-600 border-indigo-600' 
                      : errors.agreeTerms 
                        ? 'border-rose-300 bg-rose-50' 
                        : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}>
                    {agreeTerms && <Check className="h-3 w-3 text-white stroke-[3px]" />}
                  </div>
                </div>
                <span className="ml-2.5 text-xs text-slate-500 leading-normal font-semibold">
                  I agree to the{' '}
                  <span onClick={(e) => { e.preventDefault(); alert('Terms of Service dialog is coming soon!'); }} className="text-indigo-600 font-bold hover:underline">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span onClick={(e) => { e.preventDefault(); alert('Privacy Policy dialog is coming soon!'); }} className="text-indigo-600 font-bold hover:underline">
                    Privacy Policy
                  </span>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="mt-1 text-xs text-rose-600 font-semibold">
                  {errors.agreeTerms}
                </p>
              )}
            </div>

            {/* Animated Gradient Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md shadow-indigo-500/10 text-sm font-bold text-white bg-gradient-to-r from-[#4F46E5] to-[#7C3AED] hover:brightness-105 hover:animate-shimmer active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="relative flex py-1.5 items-center">
            <div className="flex-grow border-t border-slate-100"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">or</span>
            <div className="flex-grow border-t border-slate-100"></div>
          </div>

          <p className="text-center text-sm text-slate-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
