import { useState, useRef, useEffect, useCallback } from 'react'
import type { Page, OfficerWorkspaceData } from '../types'
import { apiFetch } from '@/lib/session'

interface SourceItem {
  type: 'complaint' | 'budget' | 'analysis' | 'department';
  id: string;
  title?: string;
  page?: number;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  sources?: SourceItem[];
  timestamp: string;
  isError?: boolean;
}

interface Props {
  data?: OfficerWorkspaceData | null;
  navigate: (p: Page) => void;
}

const quickQuestions = [
  "How many active complaints do I have?",
  "Show my highest priority complaints",
  "What are the recurring problems?",
  "Summarize my department",
  "What budget schemes are relevant?",
];

export default function AIAssistant({ data, navigate }: Props) {
  const officerName = data?.officer?.name || "Officer";
  const department = data?.officer?.department || "Water Supply Department";

  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string>('')
  const chatBottomRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: `Hello ${officerName}. I am your AI Civic Assistant connected to your ${department} workspace. You can ask me about complaints, priorities, funding, budgets, root causes, and department performance.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  // Scroll to bottom on new messages or loading state change
  const scrollToBottom = useCallback(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  const sendQuery = async (queryText: string) => {
    if (!queryText.trim() || loading) return

    const userMsgId = `user_${Date.now()}`
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: queryText.trim(),
      timestamp: timeStr,
    }

    setMessages((prev) => [...prev, userMessage])
    setPrompt('')
    setLoading(true)

    try {
      const res = await apiFetch('/api/officer/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText.trim(),
          conversationId: conversationId || undefined,
        }),
      })

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`)
      }

      const json = await res.json()

      if (json.success && json.answer) {
        if (json.conversationId) setConversationId(json.conversationId)

        const aiMessage: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: json.answer,
          sources: Array.isArray(json.sources) ? json.sources : [],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }

        setMessages((prev) => [...prev, aiMessage])
      } else {
        throw new Error(json.message || 'I don\'t have enough data in the current workspace to answer that.')
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text: err.message || 'Unable to connect to the AI administrative assistant.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    void sendQuery(prompt)
  }

  const handleClear = () => {
    setMessages([
      {
        id: `init_${Date.now()}`,
        sender: 'ai',
        text: `Hello ${officerName}. I am your AI Civic Assistant connected to your ${department} workspace. Conversation memory reset.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setConversationId('')
  }

  return (
    <div className="p-6 space-y-6 max-w-screen-xl flex flex-col h-[calc(100vh-80px)]">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>AI Administrative Assistant</h1>
          <p className="mt-1 text-sm" style={{ color: '#64748B' }}>
            Data-grounded conversational agent connected to live MongoDB &amp; <strong>{department}</strong> records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="px-3.5 py-1.5 rounded-xl border text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            style={{ borderColor: '#E2E8F0' }}
          >
            Clear Conversation
          </button>
        </div>
      </div>

      {/* Main Chat Box */}
      <div className="flex-1 rounded-2xl border bg-white p-5 flex flex-col overflow-hidden shadow-sm" style={{ borderColor: '#E2E8F0' }}>
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-2">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-1.5 mb-1 px-1">
                <span className="text-[10px] font-bold text-slate-400">
                  {m.sender === 'user' ? officerName : 'Civic Assistant AI'}
                </span>
                <span className="text-[10px] text-slate-300">•</span>
                <span className="text-[10px] text-slate-400">{m.timestamp}</span>
              </div>

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                    : m.isError
                    ? 'bg-rose-50 text-rose-800 rounded-bl-none border border-rose-200'
                    : 'bg-slate-50 text-slate-800 rounded-bl-none border border-slate-200 shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed font-sans">{m.text}</div>

                {/* Source Citations */}
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80 text-[11px] space-y-1">
                    <div className="font-bold text-slate-500 uppercase tracking-wider text-[9px] mb-1">
                      Verified Data Sources:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {m.sources.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 font-medium"
                        >
                          <span>{s.type === 'complaint' ? '📄 Complaint:' : s.type === 'budget' ? '💰 Budget:' : '📊 Analysis:'}</span>
                          <strong className="text-indigo-600">{s.id}</strong>
                          {s.page ? <span className="text-slate-400">(Doc p.{s.page})</span> : null}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading Pulse State */}
          {loading && (
            <div className="flex flex-col items-start">
              <div className="text-[10px] font-bold text-slate-400 mb-1 px-1">Civic Assistant AI</div>
              <div className="bg-slate-50 border border-slate-200 text-slate-600 p-4 rounded-2xl rounded-bl-none text-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                <span>Analyzing MongoDB workspace data &amp; synthesizing answer…</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Questions Bar */}
        {messages.length <= 2 && !loading && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-2">
            <span className="text-[11px] font-bold text-slate-400 self-center mr-1">Quick Prompts:</span>
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => void sendQuery(q)}
                className="px-3 py-1.5 rounded-xl border bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-xs text-slate-600 transition-all cursor-pointer"
                style={{ borderColor: '#E2E8F0' }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t flex gap-2" style={{ borderColor: '#F1F5F9' }}>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask about ${department} complaints, budget allocations, or priorities…`}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl border text-xs outline-none focus:border-indigo-600 disabled:bg-slate-50 disabled:text-slate-400"
            style={{ borderColor: '#E2E8F0' }}
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="px-6 py-3 rounded-xl text-xs font-semibold text-white cursor-pointer hover:opacity-95 disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            {loading ? 'Thinking…' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  )
}
