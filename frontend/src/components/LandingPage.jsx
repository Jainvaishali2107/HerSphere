/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  ChevronRight, 
  Users, 
  Smile, 
  BookOpen, 
  Flame, 
  Calendar, 
  Smartphone,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LandingPage({ onLoginSuccess }) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Stats and features list
  const stats = [
    { value: '500K+', label: 'Active Women' },
    { value: '99.8%', label: 'Cycle Accuracy' },
    { value: '4.9 ★', label: 'App Rating' },
    { value: '100%', label: 'Secure & Private' }
  ];

  const features = [
    {
      icon: <Calendar className="w-6 h-6 text-pink-500" />,
      title: "Predictive Tracker",
      description: "Intelligent symptom logger, ovulation calculations, and personalized period forecasting."
    },
    {
      icon: <Sparkles className="w-6 h-6 text-purple-500" />,
      title: "Compassionate Gemini AI",
      description: "A private wellness coach for all PCOS/PCOD, mental, and general medical education queries."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-rose-500" />,
      title: "Menstrual Hygiene Hub",
      description: "Expert-curated, doctor-approved guide library debunking taboos and reviewing safe products."
    },
    {
      icon: <Users className="w-6 h-6 text-indigo-500" />,
      title: "Anonymous Sisterhood",
      description: "Share real-life stories and get peer support securely with a completely anonymous toggle."
    }
  ];

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        onLoginSuccess(data.user, data.token);
      } else if (authMode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Signup failed');
        onLoginSuccess(data.user, data.token);
      } else if (authMode === 'otp-request') {
        const res = await fetch('/api/auth/otp-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'OTP request failed');
        setInfoMessage(data.message);
        setAuthMode('otp-verify');
      } else if (authMode === 'otp-verify') {
        const res = await fetch('/api/auth/otp-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, code: otpCode })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'OTP verification failed');
        onLoginSuccess(data.user, data.token);
      }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleMockLogin = () => {
    // Simulate a secure Google Login
    setName('Google User');
    setEmail(email || 'google_user@hersphere.org');
    setAuthMode('signup');
    setPassword('google_mock_secured_password_123');
    setInfoMessage('Google account authenticated! Click Sign Up below to finalize your HerSphere dashboard creation.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-pink-50 via-purple-50 to-white text-slate-800 font-sans relative overflow-x-hidden">
      
      {/* Decorative Floating Elements */}
      <div className="absolute top-20 left-10 w-48 h-48 bg-pink-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[8s]" />
      <div className="absolute top-96 right-20 w-72 h-72 bg-purple-200/40 rounded-full blur-3xl -z-10 animate-pulse duration-[10s]" />
      <div className="absolute bottom-10 left-1/3 w-64 h-64 bg-rose-200/30 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header id="landing-header" className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 flex items-center justify-center shadow-md">
            <Heart className="w-5 h-5 text-white fill-current" />
          </div>
          <span className="text-2xl font-bold tracking-tight bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            HerSphere
          </span>
        </div>
        
        <button 
          id="btn-login-trigger"
          onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}
          className="px-6 py-2.5 rounded-full bg-white/80 hover:bg-white text-pink-600 border border-white/80 font-semibold shadow-sm hover:shadow transition-all duration-300 backdrop-blur-sm cursor-pointer"
        >
          Enter Portal
        </button>
      </header>

      {/* Hero Section */}
      <section id="landing-hero" className="max-w-7xl mx-auto px-6 pt-12 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        <div className="lg:col-span-7 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 border border-white/80 text-pink-700 text-sm font-semibold shadow-sm animate-bounce">
            <Sparkles className="w-4 h-4" /> Award-Winning Wellness Companion
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight text-slate-900">
            A beautiful, safe & <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">intelligent</span> wellness companion.
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl leading-relaxed">
            HerSphere is designed with clinical precision and elegant grace. Track your cycle phases, balance hormones naturally, schedule specialty consults, and chat securely with our highly customized Gemini AI wellness engine.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              id="btn-signup-hero"
              onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
              className="px-8 py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-400 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 cursor-pointer"
            >
              Begin Free Journey <ChevronRight className="w-5 h-5" />
            </button>
            <button 
              id="btn-otp-hero"
              onClick={() => { setAuthMode('otp-request'); setIsAuthOpen(true); }}
              className="px-8 py-4 rounded-full bg-white/70 hover:bg-white text-slate-700 border border-white/80 font-semibold shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
            >
              Login via OTP Code
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/80">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-1">
                <div className="text-2xl md:text-3xl font-extrabold text-pink-600">{stat.value}</div>
                <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Interactive Mockup */}
        <div className="lg:col-span-5 flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-[360px] aspect-[9/18] bg-white/70 backdrop-blur-md rounded-[40px] p-4 shadow-2xl border-[8px] border-white/80 relative overflow-hidden"
          >
            {/* Phone Notch */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-pink-100/30 rounded-b-2xl z-20" />
            
            {/* Screen Content Mock */}
            <div className="h-full w-full bg-gradient-to-b from-pink-50/40 to-white/70 flex flex-col justify-between p-4 pt-8 text-center relative z-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs text-slate-400 font-bold px-1">
                  <span>HerSphere</span>
                  <span>10:42 AM</span>
                </div>
                
                {/* Simulated Circle Chart */}
                <div className="w-32 h-32 rounded-full border-8 border-dashed border-pink-400 mx-auto flex flex-col items-center justify-center p-3 shadow-inner bg-white/40 relative">
                  <div className="absolute inset-2 rounded-full border border-pink-100 animate-spin" />
                  <span className="text-xs text-pink-500 font-bold uppercase tracking-wide">Phase 1</span>
                  <span className="text-2xl font-black text-slate-800">Day 3</span>
                  <span className="text-[10px] text-slate-400 font-medium">Menstruation</span>
                </div>
                
                <div className="bg-white/70 backdrop-blur-md rounded-2xl p-3 shadow-sm border border-white/85 text-left space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-bold text-slate-700">HerSphere Gemini AI</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    "Your hormone estrogen is starting its natural rise. Perfect day for cozy journaling or some warm chamomile tea!"
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/50 border border-white/60 rounded-xl p-2 text-center text-xs">
                    <div className="text-pink-600 font-bold text-sm">3.2 L</div>
                    <div className="text-[10px] text-slate-400 font-bold">Water Log</div>
                  </div>
                  <div className="flex-1 bg-white/50 border border-white/60 rounded-xl p-2 text-center text-xs">
                    <div className="text-purple-600 font-bold text-sm">7.8 hrs</div>
                    <div className="text-[10px] text-slate-400 font-bold">Restful Sleep</div>
                  </div>
                </div>
                <button 
                  onClick={() => { setAuthMode('signup'); setIsAuthOpen(true); }}
                  className="w-full py-2.5 rounded-xl bg-pink-500 text-white font-bold text-xs shadow hover:bg-pink-600 transition cursor-pointer"
                >
                  Join her space
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="landing-features" className="bg-white/70 backdrop-blur-md py-20 border-y border-white/80 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
              Crafted beautifully with features you will love
            </h2>
            <p className="text-slate-600 font-medium">
              We focus on intuitive layouts, medical insights, and privacy so you can understand your biology with calmness and ease.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, index) => (
              <div 
                key={index} 
                className="bg-white/70 backdrop-blur-md rounded-3xl p-6 border border-white/80 shadow-xl shadow-pink-100/5 hover:shadow-2xl transition-all duration-300 space-y-4 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
                  {feat.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feat.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Banner */}
      <section id="landing-security" className="max-w-7xl mx-auto px-6 py-20 text-center space-y-6 relative z-10">
        <div className="w-16 h-16 rounded-3xl bg-white border border-white/80 flex items-center justify-center mx-auto text-pink-600 shadow-xl shadow-pink-100/10">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 max-w-xl mx-auto leading-snug">
          Your medical records. Encrypted, private, and secure.
        </h2>
        <p className="text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium text-sm">
          We strictly follow health-privacy principles. We never sell your cycle or clinical parameters. You can delete your entire account instantly from the settings pane, or choose anonymous support mode.
        </p>
      </section>

      {/* Beautiful Footer */}
      <footer id="landing-footer" className="bg-white/40 border-t border-white/80 py-10 relative z-10 text-center text-sm text-slate-500">
        <p className="font-semibold text-slate-700">HerSphere Wellness Suite • 2026</p>
        <p className="mt-1 font-medium">Dedicated to every woman's comfort, power, and cognitive peace.</p>
      </footer>

      {/* AUTH MODAL DIALOG */}
      <AnimatePresence>
        {isAuthOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white/85 backdrop-blur-lg rounded-[32px] w-full max-w-md p-8 shadow-2xl border border-white/80 relative overflow-hidden"
            >
              
              {/* Sparkle background elements */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-pink-200/40 rounded-full blur-2xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-purple-200/40 rounded-full blur-2xl -z-10" />

              <button 
                id="btn-close-auth"
                onClick={() => setIsAuthOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center cursor-pointer shadow-sm border border-white/40"
              >
                ✕
              </button>

              <div className="text-center space-y-2 mb-6">
                <div className="w-12 h-12 rounded-full bg-white/60 border border-white/80 flex items-center justify-center mx-auto text-pink-500 shadow-sm">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {authMode === 'login' && 'Welcome Back'}
                  {authMode === 'signup' && 'Create Free Account'}
                  {authMode === 'otp-request' && 'OTP Sign In'}
                  {authMode === 'otp-verify' && 'Verify OTP'}
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  {authMode === 'login' && 'Sign in to access your personal wellness hub.'}
                  {authMode === 'signup' && 'Unlock predictive cycle charts and AI help.'}
                  {authMode === 'otp-request' && 'Access securely without saving passwords.'}
                  {authMode === 'otp-verify' && 'Input the 6-digit code to log in.'}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3.5 rounded-2xl text-xs font-semibold mb-4 border border-red-100">
                  ⚠️ {error}
                </div>
              )}

              {infoMessage && (
                <div className="bg-purple-50 text-purple-700 p-3.5 rounded-2xl text-xs font-semibold mb-4 border border-purple-100">
                  ✨ {infoMessage}
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 px-1">Your Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Emma Watson"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white text-sm transition text-slate-800 font-semibold"
                      />
                    </div>
                  </div>
                )}

                {(authMode === 'login' || authMode === 'signup' || authMode === 'otp-request' || authMode === 'otp-verify') && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 px-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="email" 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="emma@example.com"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white text-sm transition text-slate-800 font-semibold"
                        disabled={authMode === 'otp-verify'}
                      />
                    </div>
                  </div>
                )}

                {(authMode === 'login' || authMode === 'signup') && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 px-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white text-sm transition text-slate-800 font-semibold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {authMode === 'otp-verify' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 px-1">6-Digit OTP Code</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        required
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white text-sm transition tracking-widest text-center font-bold text-slate-800"
                      />
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold text-sm shadow-md hover:opacity-90 disabled:opacity-50 transition mt-2 cursor-pointer"
                >
                  {loading ? 'Processing...' : (
                    authMode === 'login' ? 'Sign In' :
                    authMode === 'signup' ? 'Create Account' :
                    authMode === 'otp-request' ? 'Send OTP Code' : 'Verify Code & Login'
                  )}
                </button>
              </form>

              {/* Secure Google Login Simulator (Required for startup-vibe Oauth flow in mock container!) */}
              {(authMode === 'login' || authMode === 'signup') && (
                <div className="mt-4">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-white/60"></div>
                    <span className="flex-shrink mx-4 text-slate-400 text-xs font-bold">OR</span>
                    <div className="flex-grow border-t border-white/60"></div>
                  </div>
                  <button 
                    onClick={handleGoogleMockLogin}
                    className="w-full py-3.5 rounded-2xl bg-white/60 border border-white/80 text-slate-700 font-semibold text-sm shadow-sm hover:bg-white transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.94 5.94 0 0 1 8 12.571a5.94 5.94 0 0 1 5.991-5.943c1.556 0 2.972.583 4.053 1.543l3.155-3.155A10.15 10.15 0 0 0 13.99 2 10.19 10.19 0 0 0 3.8 12.19a10.19 10.19 0 0 0 10.19 10.19c5.626 0 10.19-4.564 10.19-10.19a10.4 10.4 0 0 0-.154-1.9H12.24Z" />
                    </svg>
                    Continue with Google Auth
                  </button>
                </div>
              )}

              {/* Mode switch */}
              <div className="mt-6 text-center text-xs space-y-2">
                {authMode === 'login' && (
                  <>
                    <p className="text-slate-500 font-semibold">
                      New to HerSphere?{' '}
                      <button onClick={() => setAuthMode('signup')} className="text-pink-500 font-bold hover:underline cursor-pointer">
                        Create Account
                      </button>
                    </p>
                    <p className="text-slate-400 font-semibold">
                      Prefer login code?{' '}
                      <button onClick={() => setAuthMode('otp-request')} className="text-purple-500 font-bold hover:underline cursor-pointer">
                        Login via OTP code
                      </button>
                    </p>
                  </>
                )}
                {authMode === 'signup' && (
                  <p className="text-slate-500 font-semibold">
                    Already registered?{' '}
                    <button onClick={() => setAuthMode('login')} className="text-pink-500 font-bold hover:underline cursor-pointer">
                      Sign In
                    </button>
                  </p>
                )}
                {(authMode === 'otp-request' || authMode === 'otp-verify') && (
                  <p className="text-slate-500 font-semibold">
                    Back to standard{' '}
                    <button onClick={() => setAuthMode('login')} className="text-pink-500 font-bold hover:underline cursor-pointer">
                      Email & Password Login
                    </button>
                  </p>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
