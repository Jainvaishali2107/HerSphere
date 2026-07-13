/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  ChevronRight, 
  Star, 
  MapPin, 
  FileText, 
  X, 
  AlertCircle 
} from 'lucide-react';

export default function ConsultationView({ 
  consultations, 
  onConsultationBooked,
  onConsultationStatusChanged
}) {
  const [activeSpecialty, setActiveSpecialty] = useState('Gynecologist');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  const [intakeNotes, setIntakeNotes] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successConsultation, setSuccessConsultation] = useState(null);

  const specialties = ['Gynecologist', 'Nutritionist', 'Psychologist', 'Counsellor'];

  // Practitioner list
  const doctors = [
    {
      id: 'doc-1',
      name: 'Dr. Sarah Patel, MD',
      specialty: 'Gynecologist',
      rating: '4.9 (184 reviews)',
      experience: '12 years exp',
      fees: '$80/session',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=400&auto=format&fit=crop',
      about: 'Specializes in adolescent gynecology, PCOS regulation, endometriosis management, and menstrual cycle disorders.'
    },
    {
      id: 'doc-2',
      name: 'Dr. Evelyn Martinez, OB/GYN',
      specialty: 'Gynecologist',
      rating: '4.8 (112 reviews)',
      experience: '9 years exp',
      fees: '$95/session',
      avatar: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?q=80&w=400&auto=format&fit=crop',
      about: 'Dedicated to reproductive endocrinology, fertility mapping, safe hygiene protocols, and pelvic wellness.'
    },
    {
      id: 'doc-3',
      name: 'Elena Rostova, CNS',
      specialty: 'Nutritionist',
      rating: '4.9 (156 reviews)',
      experience: '8 years exp',
      fees: '$60/session',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
      about: 'PCOS/PCOD therapeutic dietitian. Focuses on low-GI insulin sensitizing recipes and anti-inflammatory meals.'
    },
    {
      id: 'doc-4',
      name: 'Dr. Sophia Vance, PhD',
      specialty: 'Psychologist',
      rating: '5.0 (204 reviews)',
      experience: '14 years exp',
      fees: '$110/session',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
      about: 'Specializes in women\'s cognitive behavioral therapy (CBT), PMS/PMDD mood tracking, stress alleviation, and sleep science.'
    },
    {
      id: 'doc-5',
      name: 'Aisha K., MSW',
      specialty: 'Counsellor',
      rating: '4.7 (94 reviews)',
      experience: '6 years exp',
      fees: '$50/session',
      avatar: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?q=80&w=400&auto=format&fit=crop',
      about: 'Compassionate maternal peer counselor, puberty alignment mentor, and holistic lifestyle guide.'
    }
  ];

  const filteredDoctors = doctors.filter(d => d.specialty === activeSpecialty);
  const activeConsultations = consultations.filter(c => c.status === 'upcoming');

  const availableSlots = [
    '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'
  ];

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedDoctor || !bookingDate || !bookingTime) return;
    setLoading(true);

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: selectedDoctor.name,
          specialty: selectedDoctor.specialty,
          date: bookingDate,
          time: bookingTime,
          notes: intakeNotes
        })
      });
      const data = await res.json();
      if (res.ok) {
        onConsultationBooked(data.consultation);
        setSuccessConsultation(data.consultation);
        setSelectedDoctor(null);
        setIntakeNotes('');
        setBookingDate('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelConsult = async (id) => {
    if (confirm('Cancel this specialty appointment?')) {
      try {
        const res = await fetch(`/api/consultations/${id}/cancel`, { method: 'POST' });
        const data = await res.json();
        if (res.ok) {
          onConsultationStatusChanged(id, data.consultation);
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
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Specialty Consultations</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Book dedicated virtual consultations with licensed OB/GYNs, nutritional guides, and therapists.</p>
      </div>

      {/* Specialty Tabs Selector */}
      <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-none">
        {specialties.map((spec) => (
          <button
            key={spec}
            id={`btn-spec-tab-${spec}`}
            onClick={() => { setActiveSpecialty(spec); setSelectedDoctor(null); }}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm border cursor-pointer ${
              activeSpecialty === spec 
                ? 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/25' 
                : 'bg-white/50 border-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            {spec}s
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Hand: Doctors List Card (Col-7) */}
        <div className="lg:col-span-7 space-y-6">
          <h3 className="font-extrabold text-slate-800 text-sm">Available {activeSpecialty}s</h3>
          
          <div className="space-y-4">
            {filteredDoctors.map((doc) => (
              <div 
                key={doc.id}
                id={`doc-row-${doc.id}`}
                className="bg-white/70 backdrop-blur-md rounded-3xl p-5 border border-white/80 shadow-xl shadow-pink-100/5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:shadow-lg transition"
              >
                <div className="flex gap-4 items-center">
                  <img 
                    src={doc.avatar} 
                    alt={doc.name} 
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover shadow-inner"
                  />
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-900 text-base">{doc.name}</h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                      <span className="font-bold text-slate-850">{doc.rating}</span>
                      <span>•</span>
                      <span>{doc.experience}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 italic max-w-sm font-medium">{doc.about}</p>
                  </div>
                </div>

                <div className="text-right space-y-2 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between border-t border-white/80 sm:border-0 pt-3 sm:pt-0">
                  <span className="font-black text-slate-800 text-sm">{doc.fees}</span>
                  <button
                    id={`btn-select-doc-${doc.id}`}
                    onClick={() => { setSelectedDoctor(doc); setSuccessConsultation(null); }}
                    className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 font-bold text-xs transition cursor-pointer"
                  >
                    Select Slot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Hand: Intake/Booking/Confirmation Panel (Col-5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Success Overlay Panel */}
          {successConsultation && (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-emerald-50 rounded-[32px] p-6 border border-emerald-100 text-center space-y-4 shadow-inner"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto">
                <CheckCircle2 className="w-6 h-6 fill-current" />
              </div>
              <h3 className="font-black text-emerald-900 text-base">Booking Finalized!</h3>
              <p className="text-xs text-emerald-700 leading-relaxed max-w-xs mx-auto">
                Your virtual consultation slot is locked. An invitation details summary has been recorded in your logs list below.
              </p>
              <div className="p-3.5 bg-white rounded-2xl text-left border border-emerald-100/60 text-xs space-y-1">
                <div className="font-bold text-slate-800">Doctor: {successConsultation.doctorName}</div>
                <div className="text-slate-400">Specialty: {successConsultation.specialty}</div>
                <div className="text-slate-800 font-medium">Date/Time: {successConsultation.date} at {successConsultation.time}</div>
              </div>
              <button
                id="btn-dismiss-success-booking"
                onClick={() => setSuccessConsultation(null)}
                className="text-xs text-emerald-600 hover:underline font-bold cursor-pointer"
              >
                Book another slot
              </button>
            </motion.div>
          )}

          {/* Booking Inputs */}
          {selectedDoctor && !successConsultation && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-6"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest font-extrabold text-purple-600">Scheduler</span>
                  <h3 className="font-black text-slate-900 text-base">Book {selectedDoctor.name}</h3>
                </div>
                <button 
                  id="btn-close-booking-panel"
                  onClick={() => setSelectedDoctor(null)} 
                  className="p-1.5 bg-white/50 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-4">
                
                {/* Date select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Consultation Date</label>
                  <input 
                    type="date"
                    required
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} // Future dates only!
                    className="w-full bg-white/50 rounded-xl border border-white/60 p-2.5 focus:outline-none focus:ring-1 focus:ring-purple-300 text-xs font-bold text-slate-800"
                  />
                </div>

                {/* Time slot pick */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Hourly Time Slot</label>
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        id={`btn-slot-select-${slot.replace(':', '-')}`}
                        type="button"
                        onClick={() => setBookingTime(slot)}
                        className={`py-2 rounded-xl text-[10px] font-bold border transition cursor-pointer ${
                          bookingTime === slot 
                            ? 'bg-purple-50 text-purple-600 border-purple-300' 
                            : 'bg-white/50 text-slate-600 border-white/40 hover:bg-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Patient Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Symptoms or Concerns</label>
                  <textarea
                    value={intakeNotes}
                    onChange={(e) => setIntakeNotes(e.target.value)}
                    placeholder="Briefly describe what you would like to discuss (e.g. PCOS symptoms, menstrual irregularities, mood changes)..."
                    rows={3}
                    className="w-full bg-white/50 rounded-xl border border-white/40 p-3 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white text-xs leading-relaxed text-slate-800"
                  />
                </div>

                <button
                  id="btn-confirm-appointment"
                  type="submit"
                  disabled={loading || !bookingDate}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-200/25 hover:opacity-90 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Securing slot...' : `Confirm Booking (${selectedDoctor.fees})`}
                </button>

              </form>
            </motion.div>
          )}

          {/* No doctor selected default screen */}
          {!selectedDoctor && !successConsultation && (
            <div className="bg-white/50 backdrop-blur-md rounded-[32px] p-6 text-center py-12 border border-white/85 shadow-xl shadow-pink-100/5 space-y-4">
              <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-slate-800 text-sm">Select practitioner</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto font-medium">
                Click "Select Slot" next to any doctor profile to select clinical dates and lock your online consultation.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Consultations History Panel */}
      <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-4">
        <h3 className="font-bold text-slate-800 text-sm">Your Consultations Logbook</h3>
        
        {consultations.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold italic text-center py-6">
            No consultations registered yet. Schedule your first appointment above!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500 border-collapse">
              <thead>
                <tr className="border-b border-white/80 text-[10px] uppercase font-bold text-slate-400">
                  <th className="py-3 px-2">Practitioner</th>
                  <th className="py-3 px-2">Medical Specialism</th>
                  <th className="py-3 px-2">Reserved Date</th>
                  <th className="py-3 px-2">Reserved Slot</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2">Intake Concern</th>
                  <th className="py-3 px-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {consultations.map((c) => (
                  <tr key={c.id} className="hover:bg-white/40 transition">
                    <td className="py-3 px-2 font-bold text-slate-800">{c.doctorName}</td>
                    <td className="py-3 px-2 text-slate-600">{c.specialty}</td>
                    <td className="py-3 px-2 font-semibold text-slate-700">{c.date}</td>
                    <td className="py-3 px-2 font-semibold text-slate-700">{c.time}</td>
                    <td className="py-3 px-2 capitalize">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                        c.status === 'upcoming' ? 'bg-purple-50 text-purple-600 border border-purple-100/60' :
                        c.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/60' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 italic max-w-xs truncate text-slate-500" title={c.notes}>
                      {c.notes || '—'}
                    </td>
                    <td className="py-3 px-2 text-right">
                      {c.status === 'upcoming' && (
                        <button
                          id={`btn-cancel-consult-${c.id}`}
                          onClick={() => handleCancelConsult(c.id)}
                          className="text-xs text-red-500 font-bold hover:underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      {c.status !== 'upcoming' && (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
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
