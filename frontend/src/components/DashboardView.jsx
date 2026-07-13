/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  Calendar, 
  Droplet, 
  User, 
  Clock, 
  Bell, 
  Medal, 
  Quote, 
  ChevronRight, 
  Heart, 
  PhoneCall, 
  Plus, 
  BookOpen,
  Coffee,
  CheckCircle2
} from 'lucide-react';

export default function DashboardView({ 
  user, 
  periodLogs, 
  consultations, 
  wellnessTracker, 
  onNavigate,
  onUpdateWellness
}) {
  const [quickWater, setQuickWater] = useState(wellnessTracker.waterIntake || 0);
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    // Current time
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Update local water intake
  const handleAddWater = async (amount) => {
    const updatedAmount = quickWater + amount;
    setQuickWater(updatedAmount);

    try {
      const res = await fetch('/api/wellness/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waterIntake: updatedAmount })
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateWellness(data.tracker);
      }
    } catch (e) {
      console.error('Error logging water', e);
    }
  };

  // Cycle Phase Calculation Engine
  const lastPeriodDateStr = user.cycleInfo?.lastPeriodDate || new Date().toISOString().split('T')[0];
  const lastPeriodDate = new Date(lastPeriodDateStr);
  const cycleLength = user.cycleInfo?.averageCycleLength || 28;
  const periodLength = user.cycleInfo?.averagePeriodLength || 5;

  const today = new Date();
  const diffTime = Math.abs(today.getTime() - lastPeriodDate.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) % cycleLength;

  let currentPhase = 'Follicular Phase';
  let phaseColor = 'from-emerald-400 to-teal-500 text-teal-600 bg-teal-50';
  let phaseDesc = 'Estrogen is rising, physical energy is boosting. Perfect for active routines.';

  if (diffDays < periodLength) {
    currentPhase = 'Menstrual Phase';
    phaseColor = 'from-pink-400 to-rose-400 text-pink-600 bg-pink-50';
    phaseDesc = 'Hormones drop, uterine shedding starts. Prioritize rest and cozy herbal teas.';
  } else if (diffDays >= periodLength && diffDays < 13) {
    currentPhase = 'Follicular Phase';
    phaseColor = 'from-teal-400 to-emerald-400 text-teal-600 bg-teal-50';
    phaseDesc = 'Estrogen is rising, physical energy is boosting. Perfect for creative project planning.';
  } else if (diffDays >= 13 && diffDays <= 16) {
    currentPhase = 'Ovulation Phase';
    phaseColor = 'from-amber-400 to-orange-400 text-amber-600 bg-amber-50';
    phaseDesc = 'Your fertility window is peak. Higher confidence and peak estrogen levels.';
  } else {
    currentPhase = 'Luteal Phase';
    phaseColor = 'from-purple-400 to-indigo-500 text-purple-600 bg-purple-50';
    phaseDesc = 'Progesterone dominates. Focus on complex carbs, slow yoga, and deep sleep.';
  }

  const daysToNext = cycleLength - diffDays;
  const progressPercent = Math.min(100, (diffDays / cycleLength) * 100);

  // Daily Quote Pool
  const quotes = [
    "Your body is a temple of deep wisdom. Sync your routines with your biological rhythms.",
    "True healing begins when we listen closely to what our body is saying.",
    "Rest is not laziness; it is a clinical necessity during your cycle transitions.",
    "Nourish your nervous system, hydrate often, and breathe out the stress."
  ];
  const dailyQuote = quotes[diffDays % quotes.length];

  // Upcoming consultations
  const activeConsults = consultations.filter(c => c.status === 'upcoming');

  return (
    <div className="space-y-8 pb-10 relative">
      
      {/* Dynamic Hello Greeting Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Hello, {user.name} <span className="animate-pulse">✨</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Welcome to your safe sanctuary. Your biological clock is at <span className="font-bold text-pink-600 bg-pink-100/60 px-2 py-0.5 rounded-md">Day {diffDays + 1}</span> of your cycle.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 text-pink-600 font-bold text-xs flex items-center gap-2 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-pink-500" /> {timeStr || '10:42 AM'}
          </div>
          <div className="px-4 py-2 bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 text-purple-600 font-bold text-xs flex items-center gap-2 shadow-sm">
            <Medal className="w-3.5 h-3.5 text-purple-500" /> Streak: {user.streak || 1} Days
          </div>
        </div>
      </div>

      {/* Primary Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cycle Wheel Center Piece (Col-7) */}
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-md rounded-[40px] p-8 border border-white/80 shadow-xl shadow-pink-100/10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-pink-300/10 rounded-full blur-2xl" />
          
          {/* Wheel Indicator */}
          <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
            {/* Outer dotted track */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="82" fill="none" stroke="#fae8ff" strokeWidth="8" />
              <circle 
                cx="96" 
                cy="96" 
                r="82" 
                fill="none" 
                stroke="url(#cycleGrad)" 
                strokeWidth="10" 
                strokeDasharray="515" 
                strokeDashoffset={515 - (515 * progressPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="cycleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Inside Content */}
            <div className="text-center space-y-1 z-10 bg-white rounded-full w-36 h-36 flex flex-col items-center justify-center shadow-md border border-pink-50/50">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day</span>
              <span className="text-5xl font-black text-slate-800 tracking-tight">{diffDays + 1}</span>
              <span className="text-xs text-pink-500 font-bold">{daysToNext} days to next</span>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="space-y-4 flex-grow">
            <div className={`inline-block px-4 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-gradient-to-r ${phaseColor} shadow-sm border border-white/25`}>
              {currentPhase}
            </div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">
              {currentPhase === 'Menstrual Phase' ? 'Be Gentle with Your Energy' : 'Empowered and Creative!'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {phaseDesc}
            </p>
            <div className="flex gap-3 pt-1">
              <button 
                id="btn-log-period-dash"
                onClick={() => onNavigate('period-tracker')}
                className="px-5 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-lg shadow-pink-200/50 hover:scale-[1.03] transition-all cursor-pointer"
              >
                Log Today's Symptoms
              </button>
              <button 
                id="btn-ai-chat-dash"
                onClick={() => onNavigate('ai-chatbot')}
                className="px-5 py-2.5 rounded-full bg-white/90 hover:bg-purple-50 text-purple-600 border border-purple-100 font-bold text-xs shadow-sm hover:scale-[1.03] transition-all cursor-pointer"
              >
                Ask AI Coach
              </button>
            </div>
          </div>
        </div>

        {/* Quick Click Loggers: Water & Active Tracking (Col-5) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
          
          {/* Water Tracker Card */}
          <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-4 relative overflow-hidden flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-sm border border-blue-100/40">
                  <Droplet className="w-5 h-5 fill-current" />
                </div>
                <span className="font-bold text-slate-800 text-sm">Hydration Log</span>
              </div>
              <span className="text-xs text-slate-400 font-bold">Goal: 2.0L</span>
            </div>

            <div className="flex justify-between items-baseline mt-2">
              <div className="text-3xl font-black text-blue-600 tracking-tight">
                {quickWater} <span className="text-xs font-semibold text-slate-400">ml logged</span>
              </div>
              <div className="text-xs text-slate-500 font-bold">
                {Math.round((quickWater / 2000) * 100)}% Complete
              </div>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-2.5 bg-blue-100/50 rounded-full overflow-hidden mt-1">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, (quickWater / 2000) * 100)}%` }}
              />
            </div>

            <div className="flex gap-2 mt-2">
              <button 
                id="btn-add-water-250"
                onClick={() => handleAddWater(250)}
                className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs transition flex items-center justify-center gap-1 shadow-sm border border-blue-100/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> 250 ml
              </button>
              <button 
                id="btn-add-water-500"
                onClick={() => handleAddWater(500)}
                className="flex-1 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs transition flex items-center justify-center gap-1 shadow-sm border border-blue-100/20 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> 500 ml
              </button>
            </div>
          </div>

          {/* Daily Clinic Quote Widget */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[32px] p-6 text-white shadow-xl shadow-indigo-100/30 space-y-3 relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="absolute top-0 right-0 opacity-10">
              <Quote className="w-24 h-24" />
            </div>
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-200" />
              <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-100">Daily Affirmation</span>
            </div>
            
            <p className="text-sm font-medium leading-relaxed italic z-10">
              "{dailyQuote}"
            </p>
            
            <span className="text-[9px] text-pink-200 font-bold uppercase tracking-wider">— HerSphere Medical Board</span>
          </div>

        </div>
      </div>

      {/* Row 2: Secondary Features Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Upcoming Consultations Slots (Col-5) */}
        <div className="md:col-span-5 bg-white/60 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Your Consultations</h3>
            <button 
              id="btn-view-all-consults-dash"
              onClick={() => onNavigate('consultations')} 
              className="text-xs text-pink-600 font-bold hover:underline cursor-pointer"
            >
              View History
            </button>
          </div>

          {activeConsults.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center py-6 text-center space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-400 shadow-sm border border-pink-100/40">
                <Heart className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-500 font-semibold max-w-[200px]">
                No pending clinic consults scheduled. Ready to book?
              </p>
              <button 
                id="btn-book-consult-dash"
                onClick={() => onNavigate('consultations')}
                className="text-xs px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-600 font-bold shadow-sm transition border border-pink-100/30 cursor-pointer"
              >
                Book Now
              </button>
            </div>
          ) : (
            <div className="space-y-3 flex-grow">
              {activeConsults.slice(0, 2).map((c, i) => (
                <div key={i} className="p-3 bg-purple-50/50 rounded-2xl border border-purple-100/50 flex justify-between items-center text-xs shadow-sm">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800">{c.doctorName}</div>
                    <div className="text-slate-400 text-[10px] font-semibold">{c.specialty}</div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="font-bold text-purple-600">{c.date}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{c.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-white/80 pt-3">
            <button 
              id="btn-sos-dash"
              onClick={() => onNavigate('emergency')}
              className="w-full py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-sm border border-rose-100/40 cursor-pointer"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-500 animate-bounce" /> Emergency SOS Alert
            </button>
          </div>
        </div>

        {/* Unlocked Achievements (Col-7) */}
        <div className="md:col-span-7 bg-white/60 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Unlocked Achievements</h3>
            <span className="text-xs font-bold text-pink-600 bg-pink-100/60 border border-pink-200/50 px-3 py-1 rounded-full shadow-sm">
              {user.achievements?.length || 1} Badges
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {user.achievements?.map((ach, i) => (
              <div 
                key={i} 
                className="p-3.5 bg-white/80 rounded-2xl border border-pink-100/40 flex flex-col items-center text-center space-y-2 hover:scale-[1.03] transition-all shadow-sm"
              >
                <span className="text-2xl">{ach.icon}</span>
                <div className="space-y-0.5">
                  <div className="font-bold text-xs text-slate-800 line-clamp-1">{ach.title}</div>
                  <div className="text-[10px] text-slate-400 font-semibold line-clamp-1">{ach.description}</div>
                </div>
              </div>
            ))}
            
            {/* Locked Badge engagement slot */}
            <div className="p-3.5 bg-slate-100/20 rounded-2xl border border-dashed border-slate-300/60 flex flex-col items-center justify-center text-center space-y-1 opacity-75">
              <span className="text-xl text-slate-400">🔒</span>
              <div className="font-bold text-[10px] text-slate-400">Locked Badge</div>
              <div className="text-[9px] text-slate-400 font-medium">Log 3 days consecutive</div>
            </div>
          </div>
        </div>

      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Period Tracker', icon: '📅', view: 'period-tracker' },
          { label: 'Hygiene Hub', icon: '📚', view: 'hygiene-hub' },
          { label: 'AI Wellness Bot', icon: '✨', view: 'ai-chatbot' },
          { label: 'Wellness Tracker', icon: '🧘‍♀️', view: 'daily-wellness' }
        ].map((item, i) => (
          <button
            key={i}
            id={`btn-quick-act-${i}`}
            onClick={() => onNavigate(item.view)}
            className="p-4 bg-white/70 hover:bg-white backdrop-blur-md rounded-2xl border border-white/85 shadow-sm hover:shadow-md hover:border-pink-200/50 transition-all duration-300 flex items-center gap-3 text-left cursor-pointer"
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="space-y-0.5">
              <div className="font-bold text-xs text-slate-800">{item.label}</div>
              <div className="text-[10px] text-slate-400 font-semibold">Go to tab</div>
            </div>
          </button>
        ))}
      </div>

      {/* Background decoration layer to adhere to Design HTML */}
      <div className="fixed bottom-0 right-0 p-8 pointer-events-none opacity-10">
        <span className="text-9xl">🦋</span>
      </div>

    </div>
  );
}
