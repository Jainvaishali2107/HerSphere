/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplet, 
  Moon, 
  Flame, 
  Smile, 
  PenTool, 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Volume2, 
  VolumeX,
  BookOpen
} from 'lucide-react';

export default function DailyWellnessView({ wellnessTracker, onUpdateWellness }) {
  // Localized Tracker states synced from props
  const [water, setWater] = useState(wellnessTracker.waterIntake || 0);
  const [sleep, setSleep] = useState(wellnessTracker.sleepHours || 7);
  const [exercise, setExercise] = useState(wellnessTracker.exerciseMinutes || 0);
  const [journal, setJournal] = useState(wellnessTracker.journalEntry || '');
  const [mood, setMood] = useState(wellnessTracker.mood || 'calm');
  
  // Meditation Timer States
  const [meditationTime, setMeditationTime] = useState(180); // Default 3 mins (180s)
  const [timeLeft, setTimeLeft] = useState(180);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio Context references for Zen Synthesizer
  const audioCtxRef = useRef(null);
  const oscRef1 = useRef(null);
  const oscRef2 = useRef(null);
  const gainRef = useRef(null);

  const [savingLog, setSavingLog] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Synchronize state when wellnessTracker changes
  useEffect(() => {
    setWater(wellnessTracker.waterIntake || 0);
    setSleep(wellnessTracker.sleepHours || 7);
    setExercise(wellnessTracker.exerciseMinutes || 0);
    setJournal(wellnessTracker.journalEntry || '');
    setMood(wellnessTracker.mood || 'calm');
  }, [wellnessTracker]);

  // Sync Timer choices
  const selectTimerDuration = (seconds) => {
    setMeditationTime(seconds);
    setTimeLeft(seconds);
    setIsTimerRunning(false);
    stopZenMusic();
  };

  // Meditation timer loop
  useEffect(() => {
    let timerId;
    if (isTimerRunning && timeLeft > 0) {
      timerId = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      playZenMusic();
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      stopZenMusic();
      handleCompletedMeditation();
    } else {
      stopZenMusic();
    }

    return () => {
      clearInterval(timerId);
    };
  }, [isTimerRunning, timeLeft]);

  // Clean up Audio Context on unmount
  useEffect(() => {
    return () => {
      stopZenMusic();
    };
  }, []);

  // Web Audio Zen Synth Generator Engine (Generates genuine warm, calming, binaural chords!)
  const playZenMusic = () => {
    if (isMuted) {
      stopZenMusic();
      return;
    }
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (!oscRef1.current) {
        // Master Volume Gain
        gainRef.current = ctx.createGain();
        gainRef.current.gain.setValueAtTime(0.12, ctx.currentTime);
        gainRef.current.connect(ctx.destination);

        // Warm drone chord oscillator 1 (110Hz - A2 frequency)
        oscRef1.current = ctx.createOscillator();
        oscRef1.current.type = 'sine';
        oscRef1.current.frequency.setValueAtTime(110, ctx.currentTime);
        oscRef1.current.connect(gainRef.current);
        oscRef1.current.start();

        // Warm harmonic oscillator 2 (165Hz - E3 frequency, perfect fifth)
        oscRef2.current = ctx.createOscillator();
        oscRef2.current.type = 'sine';
        oscRef2.current.frequency.setValueAtTime(165, ctx.currentTime);
        oscRef2.current.connect(gainRef.current);
        oscRef2.current.start();
      }
    } catch (e) {
      console.error('Binaural Zen Synth failed to initialize on user browser config.', e);
    }
  };

  const stopZenMusic = () => {
    try {
      if (oscRef1.current) {
        oscRef1.current.stop();
        oscRef1.current.disconnect();
        oscRef1.current = null;
      }
      if (oscRef2.current) {
        oscRef2.current.stop();
        oscRef2.current.disconnect();
        oscRef2.current = null;
      }
      if (gainRef.current) {
        gainRef.current.disconnect();
        gainRef.current = null;
      }
    } catch (e) {
      // already stopped
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (nextMute) {
      stopZenMusic();
    } else if (isTimerRunning) {
      playZenMusic();
    }
  };

  const handleCompletedMeditation = async () => {
    const mins = Math.round(meditationTime / 60);
    try {
      const res = await fetch('/api/wellness/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meditationMinutes: mins })
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateWellness(data.tracker);
        alert(`Congratulations! You have completed a highly restorative ${mins}-minute mindful meditation!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Sync state variables to DB
  const handleSaveTrackers = async () => {
    setSavingLog(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/wellness/tracker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waterIntake: water,
          sleepHours: sleep,
          exerciseMinutes: exercise,
          journalEntry: journal,
          mood
        })
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateWellness(data.tracker);
        setSuccessMsg('Wellness parameters securely saved to HerSphere database!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingLog(false);
    }
  };

  // Time formatters
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Daily Wellness Hub</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Nourish your nervous system, track critical metrics, write reflections, and enjoy ambient mindful meditation.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Main Grid: Trackers Left, Meditation Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Trackers Board Column (Col-7) */}
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-6">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            📊 Today's Wellness Log
          </h3>

          <div className="space-y-6">
            
            {/* Water Tracker Detailed */}
            <div className="p-4 bg-blue-50/40 rounded-2xl border border-white/80 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 font-bold text-blue-700 text-xs">
                  <Droplet className="w-4.5 h-4.5 fill-current" /> Fluid Water Intake
                </div>
                <span className="text-xs text-slate-500 font-bold">{water} / 2000 ml</span>
              </div>

              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  id="btn-sub-water-250"
                  onClick={() => setWater(prev => Math.max(0, prev - 250))}
                  className="w-10 h-10 rounded-xl bg-white/60 hover:bg-white border border-blue-100 text-blue-600 font-bold text-lg transition flex items-center justify-center cursor-pointer"
                >
                  -
                </button>
                
                {/* Horizontal Progress bar */}
                <div className="flex-grow h-3 bg-blue-50 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300"
                    style={{ width: `${Math.min(100, (water / 2000) * 100)}%` }}
                  />
                </div>

                <button
                  type="button"
                  id="btn-add-water-250-det"
                  onClick={() => setWater(prev => prev + 250)}
                  className="w-10 h-10 rounded-xl bg-white/60 hover:bg-white border border-blue-100 text-blue-600 font-bold text-lg transition flex items-center justify-center cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Sleep Slider */}
            <div className="p-4 bg-purple-50/40 rounded-2xl border border-white/80 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 font-bold text-purple-700 text-xs">
                  <Moon className="w-4.5 h-4.5" /> Sleep Duration
                </div>
                <span className="text-xs text-slate-500 font-bold">{sleep} hours logged</span>
              </div>

              <input 
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={sleep}
                onChange={(e) => setSleep(Number(e.target.value))}
                className="w-full accent-purple-600 h-1.5 bg-purple-100 rounded-lg cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>4 hrs (Heavy)</span>
                <span>8 hrs (Optimal Rest)</span>
                <span>12 hrs</span>
              </div>
            </div>

            {/* Active Minutes Logger */}
            <div className="p-4 bg-rose-50/40 rounded-2xl border border-white/80 space-y-3 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5 font-bold text-rose-700 text-xs">
                  <Flame className="w-4.5 h-4.5" /> Exercise active time
                </div>
                <span className="text-xs text-slate-500 font-bold">{exercise} active minutes</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, 45].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    id={`btn-add-exercise-${mins}`}
                    onClick={() => setExercise(prev => prev + mins)}
                    className="py-2 rounded-xl bg-white/60 hover:bg-white border border-rose-100 text-rose-600 font-bold text-xs transition cursor-pointer"
                  >
                    +{mins} Min
                  </button>
                ))}
              </div>
            </div>

            {/* Personal Reflective Journal */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <PenTool className="w-4 h-4 text-slate-400" /> Private Reflective Journal entry
              </label>
              <textarea
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                placeholder="Write down any physical changes, cravings, emotional states, or positive thoughts you would like to remember..."
                rows={4}
                className="w-full bg-white/50 border border-white/40 rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white text-xs leading-relaxed text-slate-800"
              />
            </div>

            <button
              id="btn-save-wellness-trackers"
              type="button"
              onClick={handleSaveTrackers}
              disabled={savingLog}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-md shadow-pink-200/25 hover:opacity-95 transition disabled:opacity-50 cursor-pointer"
            >
              {savingLog ? 'Saving parameters...' : 'Securely Commit Wellness Parameters'}
            </button>

          </div>
        </div>

        {/* Mindful Meditation Timer Column (Col-5) */}
        <div className="lg:col-span-5 bg-gradient-to-tr from-purple-950 via-indigo-950 to-slate-900 rounded-[32px] p-6 text-white text-center flex flex-col justify-between space-y-8 relative overflow-hidden shadow-xl border border-indigo-900/60">
          
          {/* Cosmic visual ambient elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/25 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/15 rounded-full blur-2xl" />

          {/* Header info */}
          <div className="space-y-1 relative z-10">
            <div className="flex justify-between items-center text-xs text-indigo-200 font-semibold px-2">
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-pink-300 animate-spin" /> Mindful Serenity Drone
              </span>
              <button
                id="btn-toggle-mute-med"
                onClick={toggleMute}
                className="p-1.5 rounded-full hover:bg-white/10 text-indigo-200 transition cursor-pointer"
                title={isMuted ? "Unmute" : "Mute Soundscapes"}
              >
                {isMuted ? <VolumeX className="w-4.5 h-4.5" /> : <Volume2 className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Main Visual Clock Countdown Timer */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center z-10">
            {/* Outer Progress circle */}
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="88" cy="88" r="76" fill="none" stroke="#1e1b4b" strokeWidth="6" />
              <circle 
                cx="88" 
                cy="88" 
                r="76" 
                fill="none" 
                stroke="#d946ef" 
                strokeWidth="8" 
                strokeDasharray="477"
                strokeDashoffset={477 - (477 * timeLeft) / meditationTime}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            
            {/* Inside Numbers */}
            <div className="text-center space-y-1 bg-indigo-950/40 rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-inner border border-indigo-900/40 backdrop-blur-sm">
              <span className="text-3xl font-black tracking-tight font-mono">{formatTimer(timeLeft)}</span>
              <span className="text-[9px] uppercase tracking-wider text-indigo-300 font-bold">Time remaining</span>
            </div>
          </div>

          {/* Timer controls */}
          <div className="space-y-4 relative z-10">
            <div className="flex justify-center gap-4">
              <button
                id="btn-toggle-timer"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition shadow cursor-pointer ${
                  isTimerRunning ? 'bg-amber-500 hover:bg-amber-600' : 'bg-pink-500 hover:bg-pink-600'
                }`}
              >
                {isTimerRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                id="btn-reset-timer"
                onClick={() => { setTimeLeft(meditationTime); setIsTimerRunning(false); stopZenMusic(); }}
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-4 gap-2 px-4">
              {[
                { label: '1m', secs: 60 },
                { label: '3m', secs: 180 },
                { label: '5m', secs: 300 },
                { label: '10m', secs: 600 }
              ].map((pre) => (
                <button
                  key={pre.label}
                  id={`btn-preset-timer-${pre.label}`}
                  onClick={() => selectTimerDuration(pre.secs)}
                  className={`py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    meditationTime === pre.secs 
                      ? 'bg-white text-indigo-950 border-white font-extrabold' 
                      : 'bg-transparent text-indigo-200 border-indigo-800/60 hover:bg-white/10'
                  }`}
                >
                  {pre.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[10px] text-indigo-300 leading-relaxed font-semibold">
            *Relax your posture, close your eyes, and inhale slowly. Calm warm synth notes will emit to help steady your vagal nervous system.*
          </p>

        </div>

      </div>

    </div>
  );
}
