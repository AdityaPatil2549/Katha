import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Brain, Bot, User, Loader2 } from 'lucide-react';
import { geminiService } from '@/services/GeminiService';
import { useStoriesStore, useMomentsStore } from '@/store';

interface Message {
  id: string;
  role: 'user' | 'ai';
  text: string;
}

export function SmritiChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'ai',
      text: "I am your Smriti Engine. I have analyzed your cinematic journey. Ask me anything about your taste, recurring themes, or what you should watch next.",
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { stories } = useStoriesStore();
  const { moments } = useMomentsStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Build a quick context from the user's stories and moments
      const contextStr = `
        User's library has ${stories.length} stories. 
        Recent stories: ${stories.slice(-5).map(s => s.title).join(', ')}. 
        They have saved ${moments.length} emotional moments.
        Based on this, act as a philosophical and insightful AI companion named Smriti Engine. 
        Answer the user's prompt: ${userMessage.text}
      `;
      
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'chat', userData: contextStr }) 
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      if (!data || data.error) {
         throw new Error(data?.error || 'Smriti Engine returned null or error');
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: data.result || "I am reflecting on your journey..."
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "⚠️ My cognitive link to the Smriti Engine was interrupted. Please check your network or API keys."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="glass-card shadow-glass rounded-card flex flex-col h-[500px] border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent-cyan/10 flex items-center justify-center border border-accent-cyan/30 shadow-[0_0_15px_rgba(0,242,254,0.3)]">
          <Brain className="w-5 h-5 text-accent-cyan" />
        </div>
        <div>
          <h3 className="font-bold text-white tracking-wide flex items-center gap-2">
            Smriti Engine
            <Sparkles className="w-3 h-3 text-accent-cyan" />
          </h3>
          <p className="text-xs text-secondary">AI Reflection Layer</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.role === 'user' 
                  ? 'bg-accent-primary/20 border-accent-primary/40 text-accent-primary' 
                  : 'bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan'
              }`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'user'
                  ? 'bg-accent-primary/20 border border-accent-primary/20 text-white shadow-[0_0_15px_rgba(139,92,246,0.15)] rounded-tr-none'
                  : 'bg-black/40 border border-white/10 text-secondary shadow-soft rounded-tl-none'
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-accent-cyan/20 border-accent-cyan/40 text-accent-cyan">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-black/40 border border-white/10 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-accent-cyan" />
                <span className="text-xs text-secondary font-medium">Reflecting...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about your journey..."
            className="w-full bg-black/40 border border-white/10 rounded-full py-3 pl-4 pr-12 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/50 transition-all shadow-inner"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="absolute right-2 p-2 rounded-full bg-accent-cyan text-black hover:bg-white hover:shadow-[0_0_15px_rgba(0,242,254,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
