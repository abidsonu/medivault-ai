import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  FileCheck,
  ShieldAlert,
  Loader2,
  Calendar,
  FileText,
  User,
  Quote,
} from 'lucide-react';
import { useApp } from '../context/AppContext.js';

export const AiAssistantView: React.FC = () => {
  const { state, activeMember, sendMessageToAssistant, t } = useApp();

  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!state || !activeMember) return null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.chatHistory, isSending]);

  const handleSend = async (queryText?: string) => {
    const q = (queryText || input).trim();
    if (!q || isSending) return;

    setInput('');
    setIsSending(true);
    try {
      await sendMessageToAssistant(q);
    } finally {
      setIsSending(false);
    }
  };

  const samplePrompts = [
    'What was my latest hemoglobin level?',
    'Compare my last three CBC reports.',
    'Has my cholesterol changed over the last six months?',
    'Show my previous thyroid test results.',
    'What medicines are listed in my latest prescription?',
    'What questions should I ask my doctor at my next appointment?',
  ];

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-6 h-[calc(100vh-6rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 leading-none">
              <span>MediVault Assistant</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                Grounded in Records
              </span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              Accessing verified health records for <strong>{activeMember.name}</strong>
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
          Citations Enforced
        </div>
      </div>

      {/* Chat Messages Box */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        {state.chatHistory.map((msg, idx) => {
          const isAssistant = msg.sender === 'assistant';

          return (
            <div
              key={msg.id || idx}
              className={`flex gap-3 text-xs leading-relaxed ${
                isAssistant ? 'items-start' : 'items-start flex-row-reverse'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  isAssistant
                    ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                    : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                }`}
              >
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-2xl space-y-2.5 p-4 rounded-2xl ${
                  isAssistant
                    ? 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                    : 'bg-teal-600 text-white shadow-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Citations block */}
                {isAssistant && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                      <Quote className="w-3 h-3" /> Supporting Record Citations
                    </span>
                    <div className="space-y-1">
                      {msg.citations.map((cite, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1.5 text-[11px] font-mono text-teal-800 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/40 px-2 py-0.5 rounded border border-teal-200/50 dark:border-teal-800/50"
                        >
                          <FileCheck className="w-3 h-3 text-teal-600" />
                          <span>
                            {cite.documentTitle} · {cite.testDate}
                            {cite.parameter ? ` (${cite.parameter}: ${cite.value || ''})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-10">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
            <span>Consulting clinical records and preparing answer with citations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap pl-1">
          Suggestions:
        </span>
        {samplePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-500 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 whitespace-nowrap transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 shadow-xs"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={`Ask about ${activeMember.name}'s medical records, test results, or medications...`}
          className="flex-1 text-xs px-3 py-2 bg-transparent focus:outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="p-2 rounded-xl text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-40 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Educational Disclaimer */}
      <div className="text-[11px] text-slate-400 text-center px-4 shrink-0">
        MediVault Assistant cites your uploaded records for educational guidance. It does not provide medical diagnoses or replace licensed physicians.
      </div>
    </div>
  );
};
