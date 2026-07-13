/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  ThumbsUp, 
  AlertTriangle, 
  Send, 
  User, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  X,
  Lock,
  Smile
} from 'lucide-react';

export default function CommunityView({ 
  posts, 
  onPostCreated, 
  onPostLiked,
  onCommentAdded
}) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [showAddPost, setShowAddPost] = useState(false);
  
  // Post Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [isAnonymous, setIsAnonymous] = useState(true);
  
  const [commentingPostId, setCommentingPostId] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const categories = ['All', 'General', 'PCOS/PCOD', 'Pregnancy', 'Period Talk', 'Mental Health', 'Support'];

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;
    setLoading(true);
    setSuccessMsg('');

    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          category: newCategory,
          isAnonymous
        })
      });
      const data = await res.json();
      if (res.ok) {
        onPostCreated(data.post);
        setSuccessMsg('Your story has been safely published to the sisterhood board!');
        setNewTitle('');
        setNewContent('');
        setIsAnonymous(true);
        setTimeout(() => {
          setSuccessMsg('');
          setShowAddPost(false);
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        onPostLiked(postId, data.liked, data.likes);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      const res = await fetch(`/api/community/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newCommentText })
      });
      const data = await res.json();
      if (res.ok) {
        onCommentAdded(postId, data.comment);
        setNewCommentText('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportPost = async (postId) => {
    try {
      const res = await fetch(`/api/community/posts/${postId}/report`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert('Post flagged for community standards review. Our clinical moderators will audit this post within 12 hours.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(p => p.category === activeCategory);

  const activePostForComments = posts.find(p => p.id === commentingPostId);

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Anonymous Sisterhood Board</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Connect with peer groups, share menstrual stories anonymously, and enjoy compassionate mutual peer advice.</p>
        </div>
        
        <button
          id="btn-trigger-add-post"
          onClick={() => setShowAddPost(!showAddPost)}
          className="px-6 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow hover:shadow-lg transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Share Your Story
        </button>
      </div>

      {/* Specialty categories scroll */}
      <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            id={`btn-comm-cat-${cat.replace('/', '-')}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm border cursor-pointer ${
              activeCategory === cat 
                ? 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/25' 
                : 'bg-white/50 border-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left hand Column: Posts List (Col-8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Post Form Panel */}
          <AnimatePresence>
            {showAddPost && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-4 overflow-hidden"
              >
                <div className="flex justify-between items-center pb-2 border-b border-white/80">
                  <h3 className="font-extrabold text-slate-800 text-sm">Write a supportive post</h3>
                  <button 
                    id="btn-close-post-form"
                    onClick={() => setShowAddPost(false)} 
                    className="p-1 bg-white/50 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {successMsg && (
                  <div className="bg-emerald-50 text-emerald-600 border border-emerald-100 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> {successMsg}
                  </div>
                )}

                <form onSubmit={handleCreatePost} className="space-y-4">
                  
                  {/* Title and Category Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Post Title</label>
                      <input 
                        type="text"
                        required
                        placeholder="e.g. My PCOS recovery story..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-white/50 border border-white/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-300 text-xs font-bold text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-400">Category Tag</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-white/50 border border-white/60 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-pink-300 text-xs font-bold text-slate-800"
                      >
                        {categories.slice(1).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400">Your Experience</label>
                    <textarea
                      required
                      placeholder="Write openly. Support peer members. We strictly prohibit clinical advice or cyber-bullying."
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      rows={4}
                      className="w-full bg-white/50 border border-white/60 rounded-2xl p-3.5 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white text-xs leading-relaxed text-slate-800"
                    />
                  </div>

                  {/* Anonymous Selector Toggle */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-baseline border-t border-white/80 pt-3">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="chk-anon"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="rounded accent-pink-500 cursor-pointer"
                      />
                      <label htmlFor="chk-anon" className="text-xs text-slate-600 font-bold flex items-center gap-1 cursor-pointer">
                        <Lock className="w-3.5 h-3.5 text-pink-500" /> Post Anonymously as "Anonymous Butterfly"
                      </label>
                    </div>

                    <button
                      id="btn-publish-story-submit"
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-sm shadow-pink-200/30 transition cursor-pointer"
                    >
                      {loading ? 'Publishing...' : 'Publish story'}
                    </button>
                  </div>

                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Posts Feed lists */}
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12 bg-white/70 backdrop-blur-md rounded-[32px] border border-white/80 shadow-xl shadow-pink-100/5">
              <p className="text-slate-400 font-medium italic text-sm">No posts in this category yet. Be the first to share your story!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => (
                <div 
                  key={post.id}
                  id={`post-card-${post.id}`}
                  className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-4 transition hover:shadow-lg hover:shadow-pink-100/10"
                >
                  
                  {/* Top Header metadata */}
                  <div className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{post.authorAvatar || '🌸'}</span>
                      <div className="space-y-0.5">
                        <div className="font-extrabold text-slate-800">{post.authorName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          {new Date(post.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    <span className="bg-pink-50 border border-pink-100/50 text-pink-600 font-extrabold px-3 py-1 rounded-full text-[9px] uppercase tracking-wide">
                      {post.category}
                    </span>
                  </div>

                  {/* Title and Content text */}
                  <div className="space-y-2">
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">{post.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Actions counters */}
                  <div className="flex gap-4 border-t border-white/80 pt-3 text-xs text-slate-500 font-semibold">
                    
                    <button
                      id={`btn-like-post-${post.id}`}
                      onClick={() => handleLikePost(post.id)}
                      className="flex items-center gap-1.5 hover:text-pink-500 transition cursor-pointer"
                    >
                      <ThumbsUp className="w-4 h-4 text-pink-500" /> <span>{post.likes} Likes</span>
                    </button>

                    <button
                      id={`btn-comment-drawer-trigger-${post.id}`}
                      onClick={() => setCommentingPostId(post.id)}
                      className="flex items-center gap-1.5 hover:text-purple-600 transition cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-purple-500" /> <span>{post.comments?.length || 0} Comments</span>
                    </button>

                    <button
                      id={`btn-report-post-${post.id}`}
                      onClick={() => handleReportPost(post.id)}
                      className="flex items-center gap-1.5 ml-auto text-slate-300 hover:text-red-500 transition cursor-pointer"
                      title="Report Post"
                    >
                      <AlertTriangle className="w-4 h-4" /> <span className="hidden sm:inline">Report</span>
                    </button>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right hand Column: Comment Drawer Thread (Col-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          <AnimatePresence mode="wait">
            {activePostForComments ? (
              <motion.div 
                key={activePostForComments.id}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 space-y-4 h-[480px] flex flex-col justify-between"
              >
                
                {/* Header info */}
                <div className="flex justify-between items-center pb-2 border-b border-white/80">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">Comments thread</h4>
                    <p className="text-[10px] text-slate-400 font-semibold line-clamp-1">{activePostForComments.title}</p>
                  </div>
                  <button 
                    id="btn-close-comments-drawer"
                    onClick={() => setCommentingPostId(null)} 
                    className="p-1 bg-white/50 hover:bg-white rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Comment feeds logs */}
                <div className="flex-grow overflow-y-auto space-y-3.5 scrollbar-none py-1">
                  {activePostForComments.comments?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center font-medium pt-8">No responses yet. Be the first to leave supportive advice!</p>
                  ) : (
                    activePostForComments.comments.map((comm) => (
                      <div key={comm.id} className="p-3 bg-white/40 rounded-2xl border border-white/60 space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span className="text-slate-700 flex items-center gap-1 font-extrabold">
                            <span>{comm.authorAvatar || '🌸'}</span> {comm.authorName}
                          </span>
                          <span>
                            {new Date(comm.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">{comm.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Comment Input */}
                <form onSubmit={(e) => handleAddComment(e, activePostForComments.id)} className="flex gap-2 items-center pt-2 border-t border-white/80">
                  <input 
                    type="text"
                    required
                    placeholder="Write support..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-grow bg-white/50 border border-white/40 rounded-xl pl-3 pr-2 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-pink-300 text-slate-800"
                  />
                  <button
                    id="btn-comment-submit"
                    type="submit"
                    disabled={!newCommentText.trim()}
                    className="p-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-sm shadow-pink-200/20 transition disabled:opacity-40 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 fill-current" />
                  </button>
                </form>

              </motion.div>
            ) : (
              <div className="bg-white/50 backdrop-blur-md rounded-[32px] p-6 text-center py-12 border border-white/85 shadow-xl shadow-pink-100/5 space-y-4">
                <div className="w-12 h-12 rounded-full bg-pink-50/80 flex items-center justify-center text-pink-500 mx-auto">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm">Review Peer Feedbacks</h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Click on any post's "Comments" count in the feed list to see other women's stories, insights, or clinical responses.
                </p>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
