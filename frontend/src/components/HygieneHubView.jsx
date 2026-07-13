/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Video, 
  ChevronLeft, 
  Share2, 
  Sparkles,
  Award
} from 'lucide-react';

export default function HygieneHubView({ articles, onBookmarkToggled }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState(articles);
  const [activeArticle, setActiveArticle] = useState(null);
  
  // Tab categories
  const categories = [
    { id: '', label: 'All Guides' },
    { id: 'understanding-periods', label: 'Understanding Periods' },
    { id: 'pcos-pcod', label: 'PCOS & PCOD' },
    { id: 'hygiene-products', label: 'Hygiene Products' },
    { id: 'myths', label: 'Menstrual Myths' }
  ];

  // Load / Refetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory) queryParams.append('category', selectedCategory);
        if (searchQuery) queryParams.append('search', searchQuery);
        
        const res = await fetch(`/api/articles?${queryParams.toString()}`);
        const data = await res.json();
        if (res.ok) {
          setFilteredArticles(data.articles);
        }
      } catch (e) {
        console.error('Error fetching articles', e);
      }
    };

    fetchArticles();
  }, [selectedCategory, searchQuery, articles]);

  const handleToggleBookmark = async (e, art) => {
    e.stopPropagation();
    try {
      const res = await fetch('/api/articles/bookmark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: art.id })
      });
      const data = await res.json();
      if (res.ok) {
        onBookmarkToggled(art.id, data.bookmarked);
        // Also update local filtered list state
        setFilteredArticles(prev => prev.map(a => a.id === art.id ? { ...a, bookmarked: data.bookmarked } : a));
        if (activeArticle && activeArticle.id === art.id) {
          setActiveArticle(prev => prev ? { ...prev, bookmarked: data.bookmarked } : null);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      <AnimatePresence mode="wait">
        {!activeArticle ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Menstrual Hygiene Hub</h1>
                <p className="text-slate-500 font-medium text-sm mt-1">Search doctor-reviewed guidebooks, understand puberty, and debunk age-old period taboos.</p>
              </div>
              
              {/* Search bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search articles, PCOS tips..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white/50 border border-white/60 focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm transition shadow-sm text-slate-800"
                />
              </div>
            </div>

            {/* Category selection tabs */}
            <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  id={`btn-hub-cat-${cat.id || 'all'}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm border cursor-pointer ${
                    selectedCategory === cat.id 
                      ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/25' 
                      : 'bg-white/50 border-white/60 text-slate-600 hover:bg-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Article Grid cards */}
            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 bg-white/50 backdrop-blur-md rounded-3xl border border-white/80 shadow-xl shadow-pink-100/5">
                <p className="text-slate-550 font-medium italic">No matches found for your current search filters. Try checking spelling or switching categories!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArticles.map((art) => (
                  <div 
                    key={art.id}
                    id={`art-card-${art.id}`}
                    onClick={() => setActiveArticle(art)}
                    className="bg-white/70 backdrop-blur-md rounded-[32px] overflow-hidden border border-white/80 hover:border-white shadow-xl shadow-pink-100/5 hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between cursor-pointer"
                  >
                    
                    {/* Cover image wrapper */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={art.coverImage} 
                        alt={art.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      
                      {/* Doctor approval sticker */}
                      {art.doctorApproved && (
                        <span className="absolute top-4 left-4 bg-emerald-500/90 text-white text-[9px] uppercase font-bold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 fill-current" /> Doctor Verified
                        </span>
                      )}

                      {/* Bookmark Button */}
                      <button
                        id={`btn-bookmark-card-${art.id}`}
                        onClick={(e) => handleToggleBookmark(e, art)}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-pink-500 shadow hover:scale-110 transition cursor-pointer"
                      >
                        {art.bookmarked ? <BookmarkCheck className="w-4.5 h-4.5 fill-current" /> : <Bookmark className="w-4.5 h-4.5" />}
                      </button>
                    </div>

                    {/* Meta and titles */}
                    <div className="p-6 flex-grow space-y-3 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase tracking-wider font-extrabold text-pink-500">
                          {art.category.replace('-', ' ')}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-pink-600 transition">
                          {art.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                          {art.excerpt}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-white/60 pt-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {art.readTime}
                        </span>
                        
                        {art.videoUrl && (
                          <span className="flex items-center gap-1 text-purple-500">
                            <Video className="w-3.5 h-3.5" /> Watch Guide
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-3xl mx-auto bg-white/80 backdrop-blur-md rounded-[40px] border border-white/80 shadow-2xl overflow-hidden space-y-6"
          >
            {/* Nav Back Header */}
            <div className="p-6 border-b border-white/60 flex justify-between items-center bg-white/20">
              <button 
                id="btn-back-hub-list"
                onClick={() => setActiveArticle(null)}
                className="flex items-center gap-1 text-xs text-slate-600 hover:text-pink-600 font-bold transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Hygiene Hub
              </button>

              <div className="flex items-center gap-2">
                <button 
                  id="btn-bookmark-detail"
                  onClick={(e) => handleToggleBookmark(e, activeArticle)}
                  className="px-4 py-2 rounded-full border border-white/60 hover:bg-white text-pink-500 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  {activeArticle.bookmarked ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 fill-current" /> Bookmarked
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4" /> Bookmark
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Large Cover Hero */}
            <div className="h-64 sm:h-80 w-full relative">
              <img 
                src={activeArticle.coverImage} 
                alt={activeArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                <span className="bg-pink-500/90 text-[9px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full text-white">
                  {activeArticle.category.replace('-', ' ')}
                </span>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                  {activeArticle.title}
                </h2>
              </div>
            </div>

            {/* Reading Container Body */}
            <div className="p-6 sm:p-10 space-y-8">
              
              {/* Doctor validation box */}
              {activeArticle.doctorApproved && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-3">
                  <Award className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-xs text-emerald-800">Doctor & Gynecologist Approved Guide</div>
                    <p className="text-[10px] text-emerald-600 leading-relaxed">
                      This information was medically written by licensed pediatricians and maternal healthcare advisors to align with evidence-based medicine.
                    </p>
                  </div>
                </div>
              )}

              {/* Rich Text body */}
              <div className="prose prose-pink max-w-none text-sm text-slate-650 leading-relaxed space-y-4 whitespace-pre-wrap font-medium">
                {activeArticle.content}
              </div>

              {/* Embedded video player (if YouTube link is provided!) */}
              {activeArticle.videoUrl && (
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-500" /> Embedded Doctor Tutorial Playback
                  </h4>
                  <div className="aspect-video w-full rounded-[24px] overflow-hidden border border-white/60 shadow-md bg-black">
                    <iframe 
                      src={activeArticle.videoUrl} 
                      title="YouTube video player" 
                      frameBorder="0" 
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                </div>
              )}

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
