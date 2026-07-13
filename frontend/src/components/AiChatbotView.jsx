/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Sparkles, 
  Trash2, 
  Mic, 
  Volume2, 
  AlertCircle, 
  ArrowDownCircle, 
  Clock, 
  CornerDownRight, 
  BookOpen 
} from 'lucide-react';

export default function AiChatbotView() {
  const [messages, setMessages] = useState([
    {
      id: 'm-init',
      role: 'model',
      content: "Hello! I am your private HerSphere AI wellness guide. I am trained in evidence-based gynecology, endocrinology, nutritional health, and mindfulness.\n\nYou can ask me anything about your cycle phases, PCOS/PCOD management protocols, cramps relief, hygiene products, or emotional wellbeing.\n\n*Note: I am designed for educational guidance and cannot replace clinical diagnostics.*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const chatEndRef = useRef(null);

  // Suggestion Prompts
  const suggestions = [
    "What are natural clinical remedies for severe cramps?",
    "Explain follicular phase vs luteal phase energy differences.",
    "I was diagnosed with PCOS. What diet protocols help?",
    "Is a silicone menstrual cup safe for beginners?"
  ];

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: 'm-usr-' + Math.random().toString(36).substring(2, 11),
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Package up full history for conversational memory
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, history })
      });
      const data = await res.json();

      if (res.ok) {
        setMessages(prev => [...prev, {
          id: 'm-bot-' + Math.random().toString(36).substring(2, 11),
          role: 'model',
          content: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error || 'Failed to chat');
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: 'm-err-' + Math.random().toString(36).substring(2, 11),
        role: 'model',
        content: `⚠️ Failed to sync with Gemini AI server. Please confirm your internet connection. (Details: ${err.message || 'Server timeout'})`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSpeechInput = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      // Simulate listening and typing after 2.5 seconds
      setTimeout(() => {
        setIsListening(false);
        setInput("Could you outline a 10-minute restorative yoga routine for luteal cramps?");
      }, 2500);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your confidential chat logs?')) {
      setMessages([
        {
          id: 'm-init',
          role: 'model',
          content: "Chat history cleared. How can I help support your biology today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
      
      {/* Suggestions Sidebar (Col-4) */}
      <div className="lg:col-span-4 bg-white/70 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-xl shadow-pink-100/5 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-white/80">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-slate-850 text-sm">Suggested Prompts</h3>
              <p className="text-[10px] text-slate-400 font-semibold">Instant medical guides</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-semibold">
            Click any clinical question below to query our private educational model instantly:
          </p>

          <div className="space-y-2.5">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                id={`btn-chat-sug-${i}`}
                type="button"
                onClick={() => handleSendMessage(sug)}
                className="w-full text-left p-3 rounded-2xl bg-white/40 hover:bg-white border border-white/60 hover:border-pink-300 shadow-sm text-xs font-bold text-slate-700 leading-snug transition-all flex gap-1.5 cursor-pointer"
              >
                <CornerDownRight className="w-3.5 h-3.5 text-pink-500 flex-shrink-0 mt-0.5" />
                <span>{sug}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Doctor disclaimer notice */}
        <div className="p-4 bg-purple-50 border border-purple-100/50 rounded-2xl flex items-start gap-2 text-[10px] text-purple-700 font-semibold mt-4">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Disclaimer:</strong> This AI provides educational guidance only and is not a substitute for professional medical advice, checkups, or emergency care.
          </p>
        </div>
      </div>

      {/* Main Chat Area (Col-8) */}
      <div className="lg:col-span-8 bg-white/70 backdrop-blur-md rounded-[32px] border border-white/80 shadow-xl shadow-pink-100/5 overflow-hidden flex flex-col h-[520px] justify-between relative">
        
        {/* Chat top info header */}
        <div className="px-6 py-4 border-b border-white/80 bg-white/40 backdrop-blur-md flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-400 to-purple-400 flex items-center justify-center text-white font-bold text-sm">
              ✨
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">HerSphere Gemini Intelligence</h3>
              <p className="text-[10px] text-emerald-500 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Online & Fully Encrypted
              </p>
            </div>
          </div>

          <button
            id="btn-clear-chat-log"
            onClick={handleClearHistory}
            className="p-2 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Speech Logs Body Container */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4 scrollbar-none bg-gradient-to-b from-white/30 to-pink-50/10">
          <AnimatePresence initial={false}>
            {messages.map((m) => {
              const isBot = m.role === 'model';
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] rounded-[24px] p-4 text-xs leading-relaxed space-y-1.5 ${
                    isBot 
                      ? 'bg-purple-50/80 backdrop-blur-md text-purple-950 rounded-tl-none border border-purple-100/50' 
                      : 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-tr-none shadow-md shadow-pink-200/20 font-medium'
                  }`}>
                    {/* Render content support basic formatters */}
                    <div className="whitespace-pre-wrap space-y-2">
                      {m.content.split('\n').map((line, idx) => {
                        // Render lists
                        if (line.startsWith('* ') || line.startsWith('- ')) {
                          return <li key={idx} className="ml-2 list-disc font-medium">{line.substring(2)}</li>;
                        }
                        // Bold parsing
                        if (line.includes('**')) {
                          const parts = line.split('**');
                          return (
                            <p key={idx} className="font-medium">
                              {parts.map((p, i) => i % 2 === 1 ? <strong key={i} className="font-black">{p}</strong> : p)}
                            </p>
                          );
                        }
                        return <p key={idx} className="font-medium">{line}</p>;
                      })}
                    </div>
                    <div className={`text-[9px] text-right ${isBot ? 'text-purple-400' : 'text-pink-100'} font-bold`}>
                      {m.timestamp}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing Loading indicator bubble */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-purple-50/80 backdrop-blur-md border border-purple-100/50 rounded-[24px] rounded-tl-none p-4 text-xs flex items-center gap-1.5">
                <span className="text-purple-500 font-extrabold animate-pulse">Gemini thinking</span>
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-100" />
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-200" />
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce delay-300" />
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Text Form Area */}
        <div className="p-4 border-t border-white/80 bg-white/40 backdrop-blur-md relative z-10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} 
            className="flex items-center gap-2"
          >
            <button
              id="btn-voice-input"
              type="button"
              onClick={handleSpeechInput}
              className={`p-3 rounded-2xl border transition flex-shrink-0 cursor-pointer ${
                isListening 
                  ? 'bg-red-50 border-red-300 text-red-500 animate-pulse' 
                  : 'bg-white/50 border-white/40 hover:bg-white text-slate-400 hover:text-slate-600'
              }`}
              title={isListening ? "Listening..." : "Dictate Prompt"}
            >
              <Mic className="w-4.5 h-4.5" />
            </button>

            <input
              type="text"
              placeholder={isListening ? "Dictating..." : "Ask her about cycle, PCOS protocols..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className="flex-grow pl-4 pr-12 py-3 rounded-2xl bg-white/50 border border-white/40 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:bg-white text-xs transition text-slate-800"
            />

            <button
              id="btn-chat-submit"
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow hover:opacity-90 transition disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4 fill-current" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
