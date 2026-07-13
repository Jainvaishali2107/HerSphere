
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  MessageSquare, 
  Activity, 
  ShieldAlert, 
  User, 
  LayoutDashboard,
  Bell,
  Menu,
  X,
  Lock,
  LogOut,
  Clock,
  ShieldCheck
} from 'lucide-react';

// Child view imports
import LandingPage from './components/LandingPage';
import DashboardView from './components/DashboardView';
import PeriodTrackerView from './components/PeriodTrackerView';
import HygieneHubView from './components/HygieneHubView';
import AiChatbotView from './components/AiChatbotView';
import ConsultationView from './components/ConsultationView';
import DailyWellnessView from './components/DailyWellnessView';
import CommunityView from './components/CommunityView';
import EmergencyView from './components/EmergencyView';
import ProfileView from './components/ProfileView';

export default function App() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // App primary database stores
  const [periodLogs, setPeriodLogs] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [wellnessTracker, setWellnessTracker] = useState({});
  const [articles, setArticles] = useState([]);
  const [posts, setPosts] = useState([]);

  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Authenticate user session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/profile');
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
          // Preload essential data feeds
          await fetchAllData();
        }
      } catch (e) {
        console.error('Session authentication bypass check completed.', e);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const fetchAllData = async () => {
    try {
      const [logsRes, consultsRes, wellnessRes, articlesRes, postsRes] = await Promise.all([
        fetch('/api/cycle/logs'),
        fetch('/api/consultations'),
        fetch('/api/wellness/tracker'),
        fetch('/api/articles'),
        fetch('/api/community/posts')
      ]);

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setPeriodLogs(logsData.logs || []);
      }
      if (consultsRes.ok) {
        const consultsData = await consultsRes.json();
        setConsultations(consultsData.consultations || []);
      }
      if (wellnessRes.ok) {
        const wellnessData = await wellnessRes.json();
        setWellnessTracker(wellnessData.tracker || {});
      }
      if (articlesRes.ok) {
        const articlesData = await articlesRes.json();
        setArticles(articlesData.articles || []);
      }
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(postsData.posts || []);
      }
    } catch (e) {
      console.error('Error fetching clinical metrics databases', e);
    }
  };

  const handleLoginSuccess = async (loggedInUser) => {
    setUser(loggedInUser);
    await fetchAllData();
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setPeriodLogs([]);
    setConsultations([]);
    setWellnessTracker({});
  };

  // Callback mutators
  const handlePeriodLogSaved = (newLog) => {
    setPeriodLogs(prev => {
      const filtered = prev.filter(l => l.id !== newLog.id && l.date !== newLog.date);
      return [newLog, ...filtered].sort((a, b) => b.date.localeCompare(a.date));
    });
  };

  const handlePeriodLogDeleted = (id) => {
    setPeriodLogs(prev => prev.filter(l => l.id !== id));
  };

  const handleConsultationBooked = (newC) => {
    setConsultations(prev => [newC, ...prev]);
  };

  const handleConsultationStatusChanged = (id, updated) => {
    setConsultations(prev => prev.map(c => c.id === id ? updated : c));
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostLiked = (postId, liked, count) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: count } : p));
  };

  const handleCommentAdded = (postId, comment) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), comment]
        };
      }
      return p;
    }));
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-pink-50/20 flex flex-col items-center justify-center space-y-4">
        <div className="text-4xl animate-bounce">🌸</div>
        <h2 className="text-xl font-black text-gray-800 tracking-tight">HerSphere Wellness Sanctuary</h2>
        <div className="w-16 h-1.5 bg-pink-100 rounded-full overflow-hidden">
          <div className="h-full bg-pink-500 rounded-full animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage onLoginSuccess={handleLoginSuccess} />;
  }

  // Sidebar link items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'period-tracker', label: 'Period Tracker', icon: Calendar },
    { id: 'hygiene-hub', label: 'Hygiene Hub', icon: BookOpen },
    { id: 'ai-chatbot', label: 'AI Wellness Bot', icon: Sparkles },
    { id: 'consultations', label: 'Consultations', icon: Heart },
    { id: 'daily-wellness', label: 'Daily Wellness', icon: Activity },
    { id: 'community', label: 'Sisterhood Board', icon: MessageSquare },
    { id: 'emergency', label: 'Emergency SOS', icon: ShieldAlert, activeColor: 'text-red-500' },
    { id: 'profile', label: 'Profile Settings', icon: User }
  ];

  return (
    <div className="min-h-screen flex font-sans text-slate-800 selection:bg-pink-100 selection:text-pink-600 antialiased" style={{ background: 'linear-gradient(135deg, #FFF5F7 0%, #F3E8FF 100%)' }}>
      
      {/* Desktop Persistent Sidebar Menu */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-white/40 backdrop-blur-xl border-r border-white/60 p-6 flex-shrink-0">
        <div className="space-y-8">
          
          {/* Logo Branding */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-300 flex items-center justify-center text-white shadow-lg shadow-pink-200/50">
              <span className="text-xl">🌸</span>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                HerSphere
              </span>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold font-mono">Wellness Portal</p>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  id={`side-nav-${item.id}`}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 text-left border ${
                    isActive 
                      ? 'bg-white/80 text-pink-600 shadow-sm border-pink-100' 
                      : 'text-slate-600 border-transparent hover:bg-white/40 hover:text-slate-950'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-pink-500' : item.activeColor || 'text-slate-400 group-hover:text-pink-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom doctor validated badge */}
        <div className="p-4 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-500" /> Clinic Verified
          </div>
          <p className="text-[9px] text-slate-500 leading-relaxed font-semibold">
            All algorithms & tips are medically audited by pediatric advisors.
          </p>
        </div>
      </aside>

      {/* Main Right Hand View container */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Responsive Mobile Header */}
        <header className="lg:hidden h-16 bg-white/40 backdrop-blur-md border-b border-white/60 px-6 flex justify-between items-center flex-shrink-0 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-400 to-rose-300 flex items-center justify-center text-white shadow-md shadow-pink-200/50 text-sm">
              <span>🌸</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              HerSphere
            </span>
          </div>

          <button
            id="btn-mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-white/60 border border-white/80 text-slate-600 hover:text-pink-500 transition"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer Panel */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden bg-white/80 backdrop-blur-md border-b border-white/60 absolute top-16 left-0 right-0 p-6 z-40 space-y-4 shadow-xl"
            >
              <nav className="grid grid-cols-2 gap-2.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`mobile-nav-${item.id}`}
                      onClick={() => { setActiveView(item.id); setIsMobileMenuOpen(false); }}
                      className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                        isActive 
                          ? 'bg-white/90 text-pink-600 shadow-sm border-pink-100' 
                          : 'bg-white/20 text-slate-600 border-transparent hover:bg-white/40'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-pink-500' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Viewport Stage */}
        <main className="flex-grow overflow-y-auto px-6 py-8 md:px-10">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {activeView === 'dashboard' && (
                  <DashboardView 
                    user={user} 
                    periodLogs={periodLogs}
                    consultations={consultations}
                    wellnessTracker={wellnessTracker}
                    onNavigate={(view) => setActiveView(view)}
                    onUpdateWellness={setWellnessTracker}
                  />
                )}

                {activeView === 'period-tracker' && (
                  <PeriodTrackerView 
                    user={user}
                    periodLogs={periodLogs}
                    onLogSaved={handlePeriodLogSaved}
                    onLogDeleted={handlePeriodLogDeleted}
                    onUpdateUser={setUser}
                  />
                )}

                {activeView === 'hygiene-hub' && (
                  <HygieneHubView 
                    articles={articles}
                    onBookmarkToggled={() => fetchAllData()} // Refetch to align sync state
                  />
                )}

                {activeView === 'ai-chatbot' && (
                  <AiChatbotView />
                )}

                {activeView === 'consultations' && (
                  <ConsultationView 
                    consultations={consultations}
                    onConsultationBooked={handleConsultationBooked}
                    onConsultationStatusChanged={handleConsultationStatusChanged}
                  />
                )}

                {activeView === 'daily-wellness' && (
                  <DailyWellnessView 
                    wellnessTracker={wellnessTracker}
                    onUpdateWellness={setWellnessTracker}
                  />
                )}

                {activeView === 'community' && (
                  <CommunityView 
                    posts={posts}
                    onPostCreated={handlePostCreated}
                    onPostLiked={handlePostLiked}
                    onCommentAdded={handleCommentAdded}
                  />
                )}

                {activeView === 'emergency' && (
                  <EmergencyView />
                )}

                {activeView === 'profile' && (
                  <ProfileView 
                    user={user}
                    onUpdateUser={setUser}
                    onLogout={handleLogout}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

      </div>

    </div>
  );
}
