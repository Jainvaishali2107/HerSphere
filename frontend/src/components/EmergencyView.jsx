/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  MapPin, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X, 
  Heart, 
  Smile, 
  Activity,
  User
} from 'lucide-react';

export default function EmergencyView() {
  const [contacts, setContacts] = useState([
    { id: 'c-1', name: 'Dr. Helen Carter (OBGYN)', phone: '+1 (555) 902-1244', relation: 'Medical Advisor' },
    { id: 'c-2', name: 'Eleanor Vance (Mom)', phone: '+1 (555) 233-9110', relation: 'Guardian' }
  ]);

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelation, setNewRelation] = useState('');

  // SOS Simulation States
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [sosSent, setSosSent] = useState(false);

  // Breathing Box States
  const [breatheState, setBreatheState] = useState('Inhale');
  const [breatheProgress, setBreatheProgress] = useState(0);

  // Countdown clock for SOS
  useEffect(() => {
    let timer;
    if (sosActive && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (sosActive && countdown === 0) {
      setSosActive(false);
      setSosSent(true);
    }
    return () => clearInterval(timer);
  }, [sosActive, countdown]);

  // Breathing Guide Loop
  useEffect(() => {
    const cycle = setInterval(() => {
      setBreatheState(prev => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);

    return () => clearInterval(cycle);
  }, []);

  // Breathing Circle Animation Progress
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setBreatheProgress(prev => (prev + 1) % 100);
    }, 40);

    return () => clearInterval(progressInterval);
  }, []);

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    setContacts(prev => [
      ...prev,
      {
        id: 'c-new-' + Math.random().toString(36).substring(2, 9),
        name: newName,
        phone: newPhone,
        relation: newRelation || 'Guardian'
      }
    ]);

    setNewName('');
    setNewPhone('');
    setNewRelation('');
  };

  const handleDeleteContact = (id) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const handleTriggerSos = () => {
    setSosActive(true);
    setCountdown(5);
    setSosSent(false);
  };

  const handleCancelSos = () => {
    setSosActive(false);
  };

  const emergencyHelplines = [
    { title: 'National Domestic Violence Hotline', num: '1-800-799-7233' },
    { title: 'Maternal Mental Health Hotline', num: '1-833-852-6262' },
    { title: 'Planned Parenthood Clinical Advice', num: '1-800-230-7526' },
    { title: 'Suicide & Crisis Support Services', num: '988' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
      
      {/* SOS Giant Button Hub (Col-7) */}
      <div className="lg:col-span-7 bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-red-600 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 animate-pulse" /> Emergency SOS Control
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Instantly broadcast your geographic GPS coordinates and medical status profile to your trusted contact guardians.
          </p>
        </div>

        {/* SOS Sent Notification State */}
        {sosSent && (
          <div className="bg-red-50 text-red-600 border border-red-100 p-4 rounded-2xl text-xs space-y-2 relative">
            <button 
              id="btn-close-sos-banner"
              onClick={() => setSosSent(false)} 
              className="absolute top-3 right-3 text-red-400 hover:text-red-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="font-extrabold flex items-center gap-1.5">
              <span>🚨</span> SOS Coordinates Successfully Broadcast!
            </div>
            <p className="leading-relaxed font-semibold">
              Your <strong>exact coordinates</strong> (GPS Lat: 37.7749, Lng: -122.4194) and HerSphere medical profile cards have been sent via secure SMS API routes to your emergency guardian team.
            </p>
          </div>
        )}

        {/* Giant Trigger Ring button */}
        {!sosActive ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <button
              id="btn-trigger-sos-giant"
              onClick={handleTriggerSos}
              className="w-48 h-48 rounded-full bg-gradient-to-tr from-red-500 to-rose-600 text-white font-extrabold text-xl tracking-wider shadow-lg hover:shadow-red-500/30 border-8 border-white/80 animate-pulse hover:scale-105 transition-all flex flex-col items-center justify-center gap-1 cursor-pointer"
            >
              <span className="text-3xl">🆘</span>
              <span>TRIGGER</span>
              <span className="text-[10px] tracking-widest font-normal">PANIC SOS</span>
            </button>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Single click broadcast mechanism</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 space-y-6 bg-red-50/40 rounded-3xl border border-dashed border-red-200">
            <div className="text-center space-y-1">
              <span className="text-red-500 font-extrabold uppercase tracking-widest text-xs">Transmitting in</span>
              <div className="text-6xl font-black text-red-600 animate-bounce">{countdown}</div>
              <span className="text-xs text-slate-400">seconds...</span>
            </div>

            <button
              id="btn-cancel-sos-countdown"
              onClick={handleCancelSos}
              className="px-6 py-2.5 rounded-full bg-gray-800 text-white font-bold text-xs hover:bg-gray-900 transition shadow cursor-pointer"
            >
              Cancel SOS Broadcast
            </button>
          </div>
        )}

        {/* Emergency Contacts directory */}
        <div className="space-y-4 pt-4 border-t border-white/60">
          <h3 className="font-bold text-slate-800 text-sm">Emergency Guardian directory</h3>
          
          <div className="space-y-3">
            {contacts.map((c) => (
              <div key={c.id} className="p-3 bg-white/50 border border-white/80 rounded-2xl flex justify-between items-center text-xs shadow-sm">
                <div className="space-y-0.5">
                  <div className="font-extrabold text-slate-800 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {c.name}
                  </div>
                  <div className="text-slate-400 font-semibold">{c.phone} • {c.relation}</div>
                </div>

                <button
                  id={`btn-delete-contact-${c.id}`}
                  onClick={() => handleDeleteContact(c.id)}
                  className="text-slate-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition cursor-pointer"
                  title="Remove contact"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add contact mini-form */}
          <form onSubmit={handleAddContact} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
            <input 
              type="text"
              required
              placeholder="Guardian Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-white/50 border border-white/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-300 font-bold text-slate-800"
            />
            <input 
              type="tel"
              required
              placeholder="Guardian Phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              className="bg-white/50 border border-white/60 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-red-300 font-bold text-slate-800"
            />
            <button
              id="btn-add-contact-submit"
              type="submit"
              className="py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Save Guardian
            </button>
          </form>
        </div>

      </div>

      {/* Breathing Bubble and Helplines (Col-5) */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* De-escalation deep breathing circle */}
        <div className="bg-gradient-to-tr from-purple-950 to-indigo-950 rounded-[32px] p-6 text-white text-center space-y-6 shadow-xl border border-indigo-900/60 relative overflow-hidden">
          <div className="space-y-1">
            <h3 className="font-extrabold text-base flex items-center gap-1.5 justify-center">
              🧘‍♀️ De-escalation Breathing Box
            </h3>
            <p className="text-[10px] text-indigo-300 font-semibold leading-relaxed">
              Steady your heartbeat during acute cramping episodes or hyperventilation panic attacks.
            </p>
          </div>

          {/* Pulsing breathing bubble */}
          <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
            {/* Pulsing visual halo mapping state */}
            <div 
              className={`absolute rounded-full bg-pink-500/20 transition-all duration-4000 ease-in-out ${
                breatheState === 'Inhale' ? 'scale-125 opacity-40' :
                breatheState === 'Hold' ? 'scale-125 opacity-60' : 'scale-90 opacity-20'
              }`}
              style={{ width: '110px', height: '110px' }}
            />

            <div className="relative w-24 h-24 bg-pink-500 rounded-full flex flex-col items-center justify-center z-10 shadow-lg text-white">
              <span className="text-xs font-black tracking-widest uppercase">{breatheState}</span>
            </div>
          </div>

          <p className="text-[10px] text-indigo-200 font-semibold leading-relaxed max-w-xs mx-auto italic">
            *Coordinate your respiration with the expanding pink circle. Standard medical 4-4-4 rhythm stimulates vagus nerve relaxation.*
          </p>
        </div>

        {/* Global Helpline direct calls */}
        <div className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm">International Women Support Hotlines</h3>
          
          <div className="space-y-3">
            {emergencyHelplines.map((help, i) => (
              <a
                key={i}
                href={`tel:${help.num}`}
                className="p-3 bg-white/50 hover:bg-red-50/25 rounded-2xl border border-white/40 hover:border-red-100 flex justify-between items-center text-xs group transition"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">{help.title}</div>
                  <div className="text-red-500 font-extrabold text-[10px]">{help.num}</div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white group-hover:bg-red-50 flex items-center justify-center text-red-500 shadow-sm transition">
                  <Phone className="w-3.5 h-3.5" />
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
