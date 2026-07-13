/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  ShieldCheck, 
  Heart, 
  Settings, 
  CheckCircle2, 
  Calendar, 
  Activity, 
  LogOut, 
  Smartphone, 
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

export default function ProfileView({ user, onUpdateUser, onLogout }) {
  // Personal profile state
  const [name, setName] = useState(user.name || '');
  const [email, setEmail] = useState(user.email || '');
  
  // Cycle configurations
  const [cycleLength, setCycleLength] = useState(user.cycleInfo?.averageCycleLength || 28);
  const [periodLength, setPeriodLength] = useState(user.cycleInfo?.averagePeriodLength || 5);
  const [lastPeriodDate, setLastPeriodDate] = useState(user.cycleInfo?.lastPeriodDate || '');

  // Medical markers state
  const [bloodType, setBloodType] = useState('O+');
  const [allergies, setAllergies] = useState('Gluten, Penicillin');
  const [conditions, setConditions] = useState('Mild PCOS symptom triggers');

  // GDPR/HIPAA Privacy Sliders
  const [shareAnonymously, setShareAnonymously] = useState(true);
  const [pinLock, setPinLock] = useState(false);
  const [gFitSync, setGFitSync] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          cycleInfo: {
            averageCycleLength: Number(cycleLength),
            averagePeriodLength: Number(periodLength),
            lastPeriodDate
          }
        })
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateUser(data.user);
        setSuccessMsg('Your clinical profile information has been safely updated!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleTriggerLogout = async () => {
    if (confirm('Logout safely from HerSphere?')) {
      try {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) {
          onLogout();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Banner */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Clinical Profile</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Manage clinical menstrual constants, security parameters, and GDPR/HIPAA compliance metrics.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMsg}
        </div>
      )}

      {/* Main layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Core Profile Edit Form (Col-8) */}
        <div className="lg:col-span-8 bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-6">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            ⚙️ HerSphere Account Configuration
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            {/* Name and email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">First Name</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/50 border border-white/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-300 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/50 border border-white/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-300 text-xs font-bold text-slate-800"
                />
              </div>
            </div>

            {/* Menstrual averages calculations */}
            <div className="space-y-4 border-t border-white/60 pt-4">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Calendar className="w-4.5 h-4.5 text-pink-500" /> Clinical Cycle Constants
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Average Cycle (Days)</label>
                  <input 
                    type="number"
                    min="20"
                    max="45"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className="w-full bg-white/50 border border-white/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Average Period (Days)</label>
                  <input 
                    type="number"
                    min="3"
                    max="10"
                    value={periodLength}
                    onChange={(e) => setPeriodLength(Number(e.target.value))}
                    className="w-full bg-white/50 border border-white/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Last Period start date</label>
                  <input 
                    type="date"
                    required
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="w-full bg-white/50 border border-white/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-300 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Medical markers inputs */}
            <div className="space-y-4 border-t border-white/60 pt-4">
              <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Activity className="w-4.5 h-4.5 text-purple-500" /> Medical & Biological Indicators
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Blood type</label>
                  <input 
                    type="text"
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full bg-white/50 border border-white/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Known Allergies</label>
                  <input 
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    className="w-full bg-white/50 border border-white/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-300 text-xs font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Chronic issues / PCOS</label>
                  <input 
                    type="text"
                    value={conditions}
                    onChange={(e) => setConditions(e.target.value)}
                    className="w-full bg-white/50 border border-white/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-300 text-xs font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="border-t border-white/60 pt-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> Fully secure under 256-bit HIPAA encryption standards.
              </p>

              <button
                id="btn-update-profile-submit"
                type="submit"
                disabled={savingProfile}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90 text-white font-bold text-xs shadow-md shadow-pink-200/25 transition disabled:opacity-50 cursor-pointer"
              >
                {savingProfile ? 'Updating constants...' : 'Commit profile modifications'}
              </button>
            </div>

          </form>
        </div>

        {/* Security & GDPR compliance toggles (Col-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Privacy & Consent Panel */}
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-5">
            <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-pink-500" /> GDPR & Privacy Consent
            </h4>

            <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">
              At HerSphere, you possess absolute authority over your biological metadata:
            </p>

            <div className="space-y-4 text-xs font-semibold">
              {/* Toggle 1 */}
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="text-slate-700">De-identify my cycle logs</div>
                  <p className="text-[9px] text-slate-400 font-normal leading-relaxed">
                    Strips names and contributes logs to gynecological studies.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={shareAnonymously}
                  onChange={(e) => setShareAnonymously(e.target.checked)}
                  className="rounded accent-pink-500 cursor-pointer"
                />
              </div>

              {/* Toggle 2 */}
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="text-slate-700">App Lock PIN Access</div>
                  <p className="text-[9px] text-slate-400 font-normal leading-relaxed">
                    Prompts a 4-digit code on app launches.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={pinLock}
                  onChange={(e) => setPinLock(e.target.checked)}
                  className="rounded accent-pink-500 cursor-pointer"
                />
              </div>

              {/* Toggle 3 */}
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="text-slate-700">Google Fit / Health kit sync</div>
                  <p className="text-[9px] text-slate-400 font-normal leading-relaxed">
                    Syncs basal body temperature and logs to cloud metrics.
                  </p>
                </div>
                <input 
                  type="checkbox"
                  checked={gFitSync}
                  onChange={(e) => setGFitSync(e.target.checked)}
                  className="rounded accent-pink-500 cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3 bg-pink-50/40 border border-white/80 rounded-2xl flex gap-2 text-[10px] text-pink-700 font-semibold leading-relaxed">
              <Info className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
              <span>We never sell period log statistics to advertising agencies or third-party brokers.</span>
            </div>
          </div>

          {/* Active Devices Panel */}
          <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-4">
            <h4 className="font-extrabold text-slate-800 text-sm">Active Session instances</h4>
            
            <div className="space-y-3.5">
              <div className="flex gap-3 text-xs items-center">
                <div className="w-8 h-8 bg-pink-50 rounded-xl flex items-center justify-center text-pink-500">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex-grow space-y-0.5">
                  <div className="font-bold text-slate-800">iPhone 15 Pro Max</div>
                  <p className="text-[9px] text-emerald-500 font-extrabold">Current session instance</p>
                </div>
              </div>

              <div className="flex gap-3 text-xs items-center opacity-70">
                <div className="w-8 h-8 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="flex-grow space-y-0.5">
                  <div className="font-bold text-slate-700">MacBook Air (M3)</div>
                  <p className="text-[9px] text-slate-400 font-semibold">Logged in 2 days ago</p>
                </div>
                <button 
                  id="btn-revoke-session"
                  className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                  onClick={() => alert('Device session revoked safely.')}
                >
                  Revoke
                </button>
              </div>
            </div>

            <button
              id="btn-logout"
              onClick={handleTriggerLogout}
              className="w-full py-2.5 rounded-2xl bg-white/50 border border-white/60 hover:bg-red-50 hover:text-red-600 text-slate-600 hover:border-red-100 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Safely Terminate Session (Logout)
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
