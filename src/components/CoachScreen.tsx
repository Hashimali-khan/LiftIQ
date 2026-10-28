import React, { useState } from 'react';
import { CoachChatMessage } from '../types';
import { INITIAL_COACH_MESSAGES } from '../data/mockData';

export const CoachScreen: React.FC = () => {
  const [activeSegment, setActiveSegment] = useState<'ai' | 'plateau' | 'overload'>('ai');
  const [showAdaptationBanner, setShowAdaptationBanner] = useState<boolean>(true);
  const [messages, setMessages] = useState<CoachChatMessage[]>(INITIAL_COACH_MESSAGES);
  const [inputValue, setInputValue] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [swapToast, setSwapToast] = useState<string | null>(null);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: CoachChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({
            role: m.sender === 'ai' ? 'assistant' : 'user',
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (data && data.reply) {
        const aiMsg: CoachChatMessage = {
          id: `msg-ai-${Date.now()}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: data.reply,
          subType: data.metrics ? 'telemetry' : undefined,
          telemetryData: data.metrics
            ? {
                shoulderRecov: data.metrics.shoulderRecovery || 72,
                tricepLoad: data.metrics.tricepLoad || 8.5,
                actionLabel: data.metrics.recommendation || 'Apply Biomechanical Directive',
              }
            : undefined,
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.warn('API coach error, using instant sports bio feedback');
    } finally {
      setIsTyping(false);
    }
  };

  const handleApplySwap = (label: string) => {
    setSwapToast(`Routine updated: "${label}" successfully committed to Friday session!`);
    setTimeout(() => setSwapToast(null), 3000);
  };

  return (
    <div className="flex flex-col w-full max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto pb-36 pt-2">
      {/* Segmented Control Bar */}
      <section className="px-4 sticky top-16 z-20 backdrop-blur-xl bg-[#131315]/80 py-2">
        <div className="flex items-center p-1 bg-[#1c1b1d] border border-[#2a2a2c] rounded-full gap-1 shadow-inner">
          <button
            onClick={() => setActiveSegment('ai')}
            className={`flex-1 py-2 px-3 rounded-full font-['Space_Grotesk'] text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSegment === 'ai'
                ? 'bg-[#2a2a2c] text-[#e5e1e4] font-bold shadow-[0_0_16px_rgba(249,115,22,0.2)] border border-[#f97316]/30'
                : 'text-[#a78b7d] hover:text-[#e5e1e4]'
            }`}
          >
            <span
              className="material-symbols-outlined text-[#f97316] text-[16px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span>AI Coach</span>
          </button>

          <button
            onClick={() => setActiveSegment('plateau')}
            className={`flex-1 py-2 px-3 rounded-full font-['Space_Grotesk'] text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSegment === 'plateau'
                ? 'bg-[#2a2a2c] text-[#e5e1e4] font-bold border border-[#353437]'
                : 'text-[#a78b7d] hover:text-[#e5e1e4]'
            }`}
          >
            <span>Plateau</span>
            <span className="px-1.5 py-0.5 rounded-full bg-[#93000a] text-[#ffdad6] font-['Space_Grotesk'] text-[10px] font-bold leading-none">
              2
            </span>
          </button>

          <button
            onClick={() => setActiveSegment('overload')}
            className={`flex-1 py-2 px-3 rounded-full font-['Space_Grotesk'] text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeSegment === 'overload'
                ? 'bg-[#2a2a2c] text-[#e5e1e4] font-bold border border-[#353437]'
                : 'text-[#a78b7d] hover:text-[#e5e1e4]'
            }`}
          >
            <span>Overload Plan</span>
          </button>
        </div>
      </section>

      {/* Coach High-Performance Ambient Header / Biometric Banner */}
      {showAdaptationBanner && (
        <div className="px-4 mb-3">
          <div className="relative overflow-hidden rounded-2xl bg-[#1c1b1d] border border-[#f97316]/30 p-3.5 shadow-md">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#f97316]/10 blur-2xl pointer-events-none" />
            <div className="flex items-start gap-3 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#f97316]/20 border border-[#f97316]/40 flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(249,115,22,0.3)]">
                <span className="material-symbols-outlined text-[#f97316] text-[18px]">bolt</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest text-[#f97316] font-bold">
                    Live Adaptation Engine
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#94de2d] shadow-[0_0_8px_#94de2d] animate-pulse" />
                </div>
                <p className="text-xs text-[#e5e1e4] leading-snug">
                  <span className="font-semibold text-[#acf847]">Progressive Overload Detected:</span>{' '}
                  Ready to increase Bench Press by{' '}
                  <span className="text-[#f97316] font-bold">+2.5kg</span> based on RIR trends.
                </p>
              </div>
              <button
                onClick={() => setShowAdaptationBanner(false)}
                className="shrink-0 text-[#a78b7d] hover:text-[#e5e1e4] p-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routine Swap Toast Notification */}
      {swapToast && (
        <div className="px-4 mb-2">
          <div className="bg-[#94de2d]/20 border border-[#94de2d] text-[#94de2d] px-3.5 py-2 rounded-xl text-xs flex items-center gap-2 font-['Space_Grotesk'] font-semibold">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{swapToast}</span>
          </div>
        </div>
      )}

      {/* Chat Log Conversation Canvas */}
      <div className="px-4 flex flex-col gap-4 flex-1">
        {/* Meta Session Timestamp */}
        <div className="flex items-center justify-center gap-2 py-1 opacity-60">
          <span className="h-px bg-[#2a2a2c] flex-1" />
          <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase tracking-widest font-semibold">
            Post-Push Session 14 • 18:42
          </span>
          <span className="h-px bg-[#2a2a2c] flex-1" />
        </div>

        {/* Messages */}
        {messages.map((msg) => {
          if (msg.sender === 'user') {
            return (
              <div key={msg.id} className="flex flex-col items-end ml-auto max-w-[85%]">
                <div className="bg-[#2a2a2c] text-[#e5e1e4] p-3.5 rounded-2xl rounded-tr-sm shadow-sm border border-[#353437]">
                  <p className="text-xs sm:text-sm leading-snug">{msg.content}</p>
                </div>
                <div className="flex items-center gap-1 mt-1 pr-1">
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d]">
                    {msg.timestamp}
                  </span>
                  <span className="material-symbols-outlined text-[#f97316] text-[14px]">
                    done_all
                  </span>
                </div>
              </div>
            );
          }

          // AI Message
          return (
            <div key={msg.id} className="flex gap-2.5 items-start max-w-[94%]">
              {/* AI Emblem */}
              <div className="w-9 h-9 rounded-full bg-[#2a2a2c] border border-[#f97316]/40 flex items-center justify-center shrink-0 shadow-[0_0_14px_rgba(249,115,22,0.35)] relative">
                <span
                  className="material-symbols-outlined text-[#f97316] text-[20px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  neurology
                </span>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#94de2d] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#102000] text-[10px] font-bold">
                    check
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-['Space_Grotesk'] text-xs text-[#e5e1e4] uppercase tracking-wider font-bold">
                    Vortex AI
                  </span>
                  <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d]">
                    {msg.subType === 'telemetry' ? 'Strain Synthesis' : 'Kinetic Bio-Engine'}
                  </span>
                </div>

                <div className="bg-[#1c1b1d] border border-[#2a2a2c] p-4 rounded-2xl rounded-tl-sm shadow-[0_0_20px_rgba(249,115,22,0.1)] text-[#e5e1e4] flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#f97316] via-[#94de2d] to-transparent opacity-80" />

                  <p className="text-xs sm:text-sm leading-relaxed text-[#e5e1e4] whitespace-pre-line">
                    {msg.content}
                  </p>

                  {/* Optional Sparkline Card */}
                  {msg.subType === 'sparkline' && msg.sparklineData && (
                    <div className="bg-[#201f22] border border-[#353437] p-3 rounded-xl flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-[#2a2a2c] flex items-center justify-center shrink-0 text-[#f97316]">
                            <span className="material-symbols-outlined text-[18px]">trending_up</span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase tracking-wider truncate">
                              {msg.sparklineData.label}
                            </div>
                            <div className="font-['Space_Grotesk'] text-lg font-bold text-[#acf847] leading-none mt-0.5">
                              {msg.sparklineData.value}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="px-2 py-0.5 rounded-full bg-[#7ac100]/20 text-[#acf847] font-['Space_Grotesk'] text-[9px] font-bold uppercase">
                            {msg.sparklineData.tag}
                          </span>
                          <span className="text-[10px] text-[#a78b7d] mt-0.5">
                            {msg.sparklineData.sublabel}
                          </span>
                        </div>
                      </div>

                      {/* Sparkline SVG */}
                      <div className="w-full h-12 relative flex items-end">
                        <svg
                          className="w-full h-10 overflow-visible"
                          fill="none"
                          viewBox="0 0 280 48"
                        >
                          <defs>
                            <linearGradient id="sparkGlow" x1="0" x2="0" y1="0" y2="48">
                              <stop stopColor="#f97316" stopOpacity="0.35" />
                              <stop offset="1" stopColor="#f97316" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="sparkLine" x1="0" x2="280" y1="0" y2="0">
                              <stop stopColor="#94de2d" />
                              <stop offset="0.6" stopColor="#f97316" />
                              <stop offset="1" stopColor="#ffb690" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0 38 Q 40 36 70 30 T 140 24 T 210 14 T 280 4 L 280 48 L 0 48 Z"
                            fill="url(#sparkGlow)"
                          />
                          <path
                            d="M0 38 Q 40 36 70 30 T 140 24 T 210 14 T 280 4"
                            fill="none"
                            stroke="url(#sparkLine)"
                            strokeLinecap="round"
                            strokeWidth="2.5"
                          />
                          <circle cx="280" cy="4" fill="#94de2d" r="4" />
                        </svg>
                      </div>
                    </div>
                  )}

                  {/* Optional Telemetry Card */}
                  {msg.subType === 'telemetry' && msg.telemetryData && (
                    <div className="flex flex-col gap-2.5">
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div className="bg-[#201f22] border border-[#353437] p-2.5 rounded-xl flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase">
                              Shoulder Recov.
                            </span>
                            <span className="material-symbols-outlined text-[#f97316] text-[14px]">
                              vital_signs
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
                              {msg.telemetryData.shoulderRecov}
                            </span>
                            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d]">%</span>
                          </div>
                          <div className="w-full bg-[#353437] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#f97316] h-full rounded-full"
                              style={{ width: `${msg.telemetryData.shoulderRecov}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-[#201f22] border border-[#353437] p-2.5 rounded-xl flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase">
                              Tricep RPE Load
                            </span>
                            <span className="material-symbols-outlined text-[#94de2d] text-[14px]">
                              speed
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="font-['Space_Grotesk'] text-lg font-bold text-[#acf847]">
                              {msg.telemetryData.tricepLoad}
                            </span>
                            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d]">
                              / 10
                            </span>
                          </div>
                          <div className="w-full bg-[#353437] rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-[#94de2d] h-full rounded-full shadow-[0_0_8px_#94de2d]"
                              style={{ width: `${(msg.telemetryData.tricepLoad / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleApplySwap(msg.telemetryData?.actionLabel || 'Auto-Swap')}
                        className="mt-1 w-full py-2.5 px-3 rounded-xl bg-[#2a2a2c] hover:bg-[#39393b] border border-[#353437] flex items-center justify-between text-[#e5e1e4] transition-colors cursor-pointer"
                      >
                        <span className="font-['Space_Grotesk'] text-xs uppercase tracking-wider text-[#94de2d] font-bold flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                          {msg.telemetryData.actionLabel}
                        </span>
                        <span className="material-symbols-outlined text-[#a78b7d] text-[18px]">
                          chevron_right
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#f97316] font-['Space_Grotesk'] font-semibold pl-12 animate-pulse">
            <span className="material-symbols-outlined text-[18px]">neurology</span>
            <span>Synthesizing biomechanical feedback...</span>
          </div>
        )}

        {/* Suggested Follow-up Chips */}
        <div className="flex flex-col gap-2 mt-2 mb-1">
          <div className="flex items-center gap-1.5 text-[#a78b7d] pl-1">
            <span className="material-symbols-outlined text-[16px] text-[#f97316]">lightbulb</span>
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-widest font-bold">
              Recommended Inquiries
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => handleSendMessage('Adjust Friday Workout based on my shoulder strain')}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-[#1c1b1d] border border-[#2a2a2c] hover:border-[#94de2d]/40 text-[#e5e1e4] text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span className="text-[#94de2d]">✦</span>
              <span>Adjust Friday Workout</span>
            </button>
            <button
              onClick={() => handleSendMessage('Analyze Tricep Fatigue and recovery rate')}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-[#1c1b1d] border border-[#2a2a2c] hover:border-[#f97316]/40 text-[#e5e1e4] text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span className="text-[#f97316]">⚡</span>
              <span>Analyze Tricep Fatigue</span>
            </button>
            <button
              onClick={() => handleSendMessage('Should I schedule a diet refeed this weekend?')}
              className="whitespace-nowrap px-3.5 py-1.5 rounded-full bg-[#1c1b1d] border border-[#2a2a2c] hover:border-[#4cd7f6]/40 text-[#e5e1e4] text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all shrink-0 cursor-pointer"
            >
              <span className="text-[#4cd7f6]">🥗</span>
              <span>Diet Refeed Advice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Fixed Chat Input HUD */}
      <div className="fixed bottom-20 inset-x-0 z-40 px-4 pointer-events-none">
        <div className="pointer-events-auto bg-[#0e0e10]/95 backdrop-blur-2xl p-1.5 rounded-full border border-[#353437] shadow-[0_8px_32px_rgba(0,0,0,0.8)] flex items-center gap-2 max-w-lg md:max-w-xl mx-auto">
          {/* Attachment Trigger */}
          <button
            onClick={() => handleSendMessage('Analyzing telemetry log screenshot...')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#a78b7d] hover:text-[#e5e1e4] hover:bg-[#201f22] transition-colors shrink-0 cursor-pointer"
            title="Upload workout video or telemetry"
          >
            <span className="material-symbols-outlined text-[20px]">attach_file</span>
          </button>

          {/* Text Input */}
          <div className="flex-1 relative flex items-center min-w-0">
            <input
              className="w-full bg-transparent text-[#e5e1e4] placeholder:text-[#a78b7d] text-xs sm:text-sm px-2 py-2 outline-none"
              placeholder="Ask coach anything (nutrition, form, programming)..."
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
          </div>

          {/* Voice Input */}
          <button
            onClick={() => handleSendMessage('Evaluate my RPE from today bench press sets')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#a78b7d] hover:text-[#f97316] hover:bg-[#201f22] transition-colors shrink-0 cursor-pointer"
            title="Voice Input"
          >
            <span className="material-symbols-outlined text-[20px]">mic</span>
          </button>

          {/* Send Button */}
          <button
            onClick={() => handleSendMessage()}
            className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#f97316] to-[#94de2d] flex items-center justify-center text-[#0e0e10] shadow-[0_0_18px_rgba(249,115,22,0.45)] hover:shadow-[0_0_24px_rgba(148,222,45,0.6)] active:scale-95 transition-all shrink-0 cursor-pointer"
            title="Send Query"
          >
            <span className="material-symbols-outlined font-bold text-[20px]">arrow_upward</span>
          </button>
        </div>
      </div>
    </div>
  );
};
