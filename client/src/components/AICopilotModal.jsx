import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { askCopilotAI } from '../services/geminiService';
import { Bot, X, Send, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

const suggestedQuestions = [
  "Why did Road Department receive more budget?",
  "Which ward needs immediate attention?",
  "Show unresolved complaints.",
  "Predict next week's complaint trend."
];

export default function AICopilotModal() {
  const { showCopilot, setShowCopilot } = useAppData();
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello Commissioner! I am CivicBrain AI Copilot. Ask me any question regarding ward rankings, budget allocation decisions, or predictive trend insights."
    }
  ]);
  const [loading, setLoading] = useState(false);

  if (!showCopilot) return null;

  const handleSend = async (textToSend) => {
    const text = textToSend || query;
    if (!text.trim()) return;

    setMessages(prev => [...prev, { sender: 'user', text }]);
    setQuery('');
    setLoading(true);

    const result = await askCopilotAI(text);
    setMessages(prev => [...prev, { sender: 'bot', text: result.answer }]);
    setLoading(false);
  };

  return (
    <div class="fixed bottom-5 right-5 z-50 w-96 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
      
      {/* Header */}
      <div class="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-4 border-b border-slate-700 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-400/30 flex items-center justify-center">
            <Bot class="w-4 h-4" />
          </div>
          <div>
            <h4 class="font-extrabold text-sm text-white flex items-center gap-1.5">
              CivicBrain Copilot <Sparkles class="w-3.5 h-3.5 text-amber-400" />
            </h4>
            <p class="text-[10px] text-slate-300">Executive Decision Support Assistant</p>
          </div>
        </div>
        <button 
          onClick={() => setShowCopilot(false)}
          class="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div class="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/60">
        {messages.map((m, idx) => (
          <div 
            key={idx} 
            class={`flex gap-2 text-xs ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'bot' && (
              <div class="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                AI
              </div>
            )}
            <div class={`p-3 rounded-xl max-w-[82%] leading-relaxed ${
              m.sender === 'user'
                ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none shadow-md'
            }`}>
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div class="flex items-center gap-2 text-xs text-blue-400 font-semibold p-2">
            <Bot class="w-4 h-4 animate-spin" /> Gemini thinking...
          </div>
        )}
      </div>

      {/* Suggested Quick Prompts */}
      <div class="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-1.5 overflow-x-auto">
        {suggestedQuestions.map((q, idx) => (
          <button 
            key={idx}
            onClick={() => handleSend(q)}
            class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 rounded-full border border-slate-700 whitespace-nowrap flex items-center gap-1"
          >
            <span>{q}</span> <ArrowRight class="w-2.5 h-2.5" />
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div class="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask CivicBrain AI..."
          class="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
        <button 
          onClick={() => handleSend()}
          class="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg transition"
        >
          <Send class="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
