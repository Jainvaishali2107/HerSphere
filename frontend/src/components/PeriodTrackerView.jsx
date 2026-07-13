/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  Droplet, 
  Activity, 
  Smile, 
  Trash2, 
  Plus, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  FileText,
  AlertCircle
} from 'lucide-react';

export default function PeriodTrackerView({ 
  user, 
  periodLogs, 
  onLogSaved, 
  onLogDeleted,
  onUpdateUser 
}) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [flow, setFlow] = useState('medium');
  const [pain, setPain] = useState('mild');
  const [mood, setMood] = useState('calm');
  const [notes, setNotes] = useState('');
  
  // Symptoms Checklist
  const allSymptoms = [
    { id: 'cramps', label: 'Abdominal Cramps', emoji: '⚡' },
    { id: 'bloating', label: 'Bloating', emoji: '🎈' },
    { id: 'headache', label: 'Headache', emoji: '🤕' },
    { id: 'fatigue', label: 'Fatigue', emoji: '😴' },
    { id: 'acne', label: 'Acne breakout', emoji: '🧼' },
    { id: 'backache', label: 'Back Pain', emoji: '🧍‍♀️' },
    { id: 'breast', label: 'Breast Tenderness', emoji: '🌸' }
  ];
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Helper variables for cycle mathematics
  const cycleLength = user.cycleInfo?.averageCycleLength || 28;
  const periodLength = user.cycleInfo?.averagePeriodLength || 5;
  const lastPeriodStr = user.cycleInfo?.lastPeriodDate || new Date().toISOString().split('T')[0];
  const lastPeriod = new Date(lastPeriodStr);

  // Predictions
  const nextPeriodStart = new Date(lastPeriod.getTime() + cycleLength * 24 * 60 * 60 * 1000);
  const nextPeriodEnd = new Date(nextPeriodStart.getTime() + periodLength * 24 * 60 * 60 * 1000);
  const nextOvulation = new Date(nextPeriodStart.getTime() - 14 * 24 * 60 * 60 * 1000);
  
  const fertilityStart = new Date(nextOvulation.getTime() - 5 * 24 * 60 * 60 * 1000);
  const fertilityEnd = new Date(nextOvulation.getTime() + 1 * 24 * 60 * 60 * 1000);

  const formatDate = (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

  // Handle symptoms checklist selection
  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) ? prev.filter(s => s !== symptomId) : [...prev, symptomId]
    );
  };

  // Submit log
  const handleSaveLog = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/cycle/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          flow,
          pain,
          mood,
          symptoms: selectedSymptoms,
          notes
        })
      });
      const data = await res.json();
      if (res.ok) {
        onLogSaved(data.log);
        setSuccessMsg('Period metrics successfully registered in HerSphere database!');
        
        // If logged date is earlier than last logged period, update user model
        if (new Date(selectedDate) > lastPeriod) {
          const profileRes = await fetch('/api/profile/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cycleInfo: {
                ...user.cycleInfo,
                lastPeriodDate: selectedDate
              }
            })
          });
          const profileData = await profileRes.json();
          if (profileRes.ok) {
            onUpdateUser(profileData.user);
          }
        }

        // Reset inputs
        setNotes('');
        setSelectedSymptoms([]);
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchLogForDate = (dateString) => {
    setSelectedDate(dateString);
    const matched = periodLogs.find(l => l.date === dateString);
    if (matched) {
      setFlow(matched.flow);
      setPain(matched.pain);
      setMood(matched.mood);
      setSelectedSymptoms(matched.symptoms || []);
      setNotes(matched.notes || '');
    } else {
      setFlow('none');
      setPain('none');
      setMood('calm');
      setSelectedSymptoms([]);
      setNotes('');
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Cycle & Period Tracker</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Log daily parameters, analyze trends, and view smart clinical cycle forecasts.</p>
      </div>

      {/* Predicted Boxes Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white/50 backdrop-blur-md border border-white/85 rounded-3xl p-5 space-y-2 shadow-xl shadow-pink-100/5">
          <div className="flex justify-between items-center text-pink-600 font-bold text-xs uppercase tracking-wider">
            <span>Predicted Next Period</span>
            <span className="text-lg">🩸</span>
          </div>
          <div className="text-xl font-extrabold text-slate-800">
            {formatDate(nextPeriodStart)}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Predicted duration: {formatDate(nextPeriodStart)} to {formatDate(nextPeriodEnd)} ({periodLength} days)
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-md border border-white/85 rounded-3xl p-5 space-y-2 shadow-xl shadow-pink-100/5">
          <div className="flex justify-between items-center text-purple-600 font-bold text-xs uppercase tracking-wider">
            <span>Predicted Ovulation</span>
            <span className="text-lg">✨</span>
          </div>
          <div className="text-xl font-extrabold text-slate-800">
            {formatDate(nextOvulation)}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Your peak hormonal state. Egg release occurs around 14 days prior to menstruation.
          </p>
        </div>

        <div className="bg-white/50 backdrop-blur-md border border-white/85 rounded-3xl p-5 space-y-2 shadow-xl shadow-pink-100/5">
          <div className="flex justify-between items-center text-teal-600 font-bold text-xs uppercase tracking-wider">
            <span>Fertility Window</span>
            <span className="text-lg">🌸</span>
          </div>
          <div className="text-xl font-extrabold text-slate-800">
            {formatDate(fertilityStart)} - {formatDate(fertilityEnd)}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            Calculated fertility threshold spans 5 days prior to ovulation to 24 hours after.
          </p>
        </div>

      </div>

      {/* Main Grid: Calendar on Left, Logger Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Interactive Calendar Component (Col-5) */}
        <div className="lg:col-span-5 bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-white/80">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-500" /> Interactive Log Select
            </h3>
            <span className="text-xs text-slate-400 font-semibold">Click day to edit</span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400">
              <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
            </div>
            
            {/* Displaying simple rolling 28-day preview layout representing cycle */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {Array.from({ length: 28 }).map((_, index) => {
                const dayDateStr = new Date(lastPeriod.getTime() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                const displayDay = new Date(dayDateStr).getDate();
                const isSelected = dayDateStr === selectedDate;
                
                // Styling classes
                let dayStyle = 'bg-white/40 text-slate-700 hover:bg-pink-50';
                if (index < periodLength) {
                  dayStyle = 'bg-red-50 text-red-600 border border-red-100 font-bold'; // Period days
                } else if (index === 13) {
                  dayStyle = 'bg-purple-50 text-purple-600 border border-purple-100 font-bold'; // Ovulation Day
                } else if (index >= 9 && index <= 14) {
                  dayStyle = 'bg-teal-50 text-teal-600 border border-teal-100 font-semibold'; // Fertile range
                }

                if (isSelected) {
                  dayStyle = 'bg-pink-500 text-white font-bold scale-110 shadow-md shadow-pink-500/25';
                }

                return (
                  <button
                    key={index}
                    id={`btn-calendar-day-${index}`}
                    type="button"
                    onClick={() => handleFetchLogForDate(dayDateStr)}
                    className={`h-9 w-9 rounded-full flex items-center justify-center text-xs transition-all cursor-pointer ${dayStyle}`}
                    title={dayDateStr}
                  >
                    {displayDay}
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-semibold border-t border-white/80 pt-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-200" />
                <span>Logged Period Days</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-100 border border-purple-200" />
                <span>Ovulation Peak</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-100 border border-teal-200" />
                <span>Fertile Window</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span>Selected Focus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Symptoms Logger Form (Col-7) */}
        <div className="lg:col-span-7 bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5">
          <form onSubmit={handleSaveLog} className="space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-white/80">
              <h3 className="font-bold text-slate-800 text-sm">
                Symptom Log: <span className="text-pink-600 font-extrabold">{selectedDate}</span>
              </h3>
              <input 
                type="date"
                value={selectedDate}
                onChange={(e) => handleFetchLogForDate(e.target.value)}
                className="text-xs border border-slate-200 rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-pink-300 bg-white/80 backdrop-blur-md font-bold"
              />
            </div>

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {successMsg}
              </div>
            )}

            {/* Flow & Pain Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Flow Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Droplet className="w-4 h-4 text-pink-500 fill-current" /> Flow Rate
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['none', 'light', 'medium', 'heavy'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setFlow(level)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        flow === level 
                          ? 'bg-pink-50 text-pink-600 border-pink-300 shadow-sm' 
                          : 'bg-white/50 text-slate-600 border-white/40 hover:bg-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pain Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Activity className="w-4 h-4 text-purple-500" /> Pain Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['none', 'mild', 'moderate', 'severe'].map((level) => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setPain(level)}
                      className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        pain === level 
                          ? 'bg-purple-50 text-purple-600 border-purple-300 shadow-sm' 
                          : 'bg-white/50 text-slate-600 border-white/40 hover:bg-white'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Mood selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Smile className="w-4 h-4 text-amber-500" /> Dominant Emotional Mood
              </label>
              <div className="grid grid-cols-5 gap-2">
                {['calm', 'happy', 'sad', 'irritable', 'anxious'].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood(m)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                      mood === m 
                        ? 'bg-amber-50 text-amber-600 border-amber-300 shadow-sm' 
                        : 'bg-white/50 text-slate-600 border-white/40 hover:bg-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Symptoms Checklist */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Clinical Physical Symptoms
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {allSymptoms.map((symp) => {
                  const isChecked = selectedSymptoms.includes(symp.id);
                  return (
                    <button
                      key={symp.id}
                      type="button"
                      onClick={() => toggleSymptom(symp.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
                        isChecked 
                          ? 'bg-pink-50 border-pink-200 text-pink-700 font-bold' 
                          : 'bg-white/50 border-white/40 hover:bg-white'
                      }`}
                    >
                      <span>{symp.emoji}</span>
                      <span className="line-clamp-1">{symp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Personal Diary Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log physical events, body temperature, discharge density, or medication logs..."
                rows={3}
                className="w-full rounded-2xl bg-white/50 border border-white/40 p-3.5 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white text-xs text-slate-700 leading-relaxed transition"
              />
            </div>

            <button
              id="btn-save-log-submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white font-bold text-xs shadow-md shadow-pink-200/40 transition disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving Period Logs...' : 'Commit Symptoms to Secure Database'}
            </button>

          </form>
        </div>

      </div>

      {/* Historical logs table */}
      <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Your Historical Logging Logs</h3>
        
        {periodLogs.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold italic text-center py-6">
            No logged cycle parameters registered yet. Use the calendar above to save your first symptom log!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 border-collapse">
              <thead>
                <tr className="border-b border-white/80 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-2">Logged Date</th>
                  <th className="py-3 px-2">Flow rate</th>
                  <th className="py-3 px-2">Pain intensity</th>
                  <th className="py-3 px-2">Logged Mood</th>
                  <th className="py-3 px-2">Registered Symptoms</th>
                  <th className="py-3 px-2 font-semibold">Diary note</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {periodLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/40 transition">
                    <td className="py-3 px-2 font-bold text-slate-800">{log.date}</td>
                    <td className="py-3 px-2 capitalize">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        log.flow === 'heavy' ? 'bg-red-50 text-red-600 border border-red-100' :
                        log.flow === 'medium' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                        log.flow === 'light' ? 'bg-pink-50 text-pink-600 border border-pink-100' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {log.flow}
                      </span>
                    </td>
                    <td className="py-3 px-2 capitalize font-semibold text-slate-700">{log.pain}</td>
                    <td className="py-3 px-2 capitalize font-semibold text-slate-700">{log.mood}</td>
                    <td className="py-3 px-2">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {log.symptoms?.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 bg-white border border-white/80 rounded text-[9px] font-bold text-slate-500">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-2 italic max-w-xs truncate text-slate-500" title={log.notes}>
                      {log.notes || '—'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      <button
                        id={`btn-delete-log-${log.id}`}
                        onClick={async () => {
                          if (confirm('Delete this period log?')) {
                            try {
                              const res = await fetch(`/api/cycle/logs/${log.id}`, { method: 'DELETE' });
                              if (res.ok) onLogDeleted(log.id);
                            } catch (e) { console.error(e); }
                          }
                        }}
                        className="text-slate-400 hover:text-red-500 w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
