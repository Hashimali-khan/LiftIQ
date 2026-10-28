import React, { useState } from 'react';
import { INITIAL_WEIGHT_HISTORY } from '../data/mockData';
import { WeightRecord } from '../types';

export const AnalyticsScreen: React.FC = () => {
  const [metricTab, setMetricTab] = useState<'weight' | 'tonnage' | '1rm' | 'calories'>('weight');
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '3M' | '6M' | 'ALL'>('1M');
  const [currentWeight, setCurrentWeight] = useState<number>(78.4);
  const [inputWeight, setInputWeight] = useState<number>(78.4);
  const [standardConditions, setStandardConditions] = useState<boolean>(true);
  const [weightLogs, setWeightLogs] = useState<WeightRecord[]>(INITIAL_WEIGHT_HISTORY);
  const [savedAlert, setSavedAlert] = useState<boolean>(false);

  const handleDecrement = () => {
    setInputWeight((prev) => Math.max(30, parseFloat((prev - 0.1).toFixed(1))));
  };

  const handleIncrement = () => {
    setInputWeight((prev) => Math.min(250, parseFloat((prev + 0.1).toFixed(1))));
  };

  const handleLogWeight = () => {
    setCurrentWeight(inputWeight);
    const newRecord: WeightRecord = {
      date: new Date().toISOString().split('T')[0],
      dayLabel: 'Today',
      dayNumber: String(new Date().getDate()).padStart(2, '0'),
      weightKg: inputWeight,
      deltaKg: parseFloat((inputWeight - 78.6).toFixed(1)),
      rollingAvg7dKg: parseFloat(((inputWeight + 78.6 * 6) / 7).toFixed(1)),
      tag: standardConditions ? 'Fasted AM' : 'Non-standard',
      standardConditions,
    };
    setWeightLogs((prev) => [newRecord, ...prev]);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  return (
    <div className="flex flex-col w-full px-4 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto space-y-5 pb-32 pt-2">
      {/* Biometric Subheader */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-['Space_Grotesk'] text-[10px] text-[#ffb690] uppercase tracking-widest font-bold">
            Biometric Intelligence
          </span>
          <span className="flex items-center gap-1.5 text-[#94de2d] font-['Space_Grotesk'] text-[10px] font-bold bg-[#2a2a2c] border border-[#94de2d]/30 px-3 py-1 rounded-full">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#94de2d] animate-pulse" />
            Synched via Scale
          </span>
        </div>
        <div className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[#e5e1e4]">
          Analytics &amp; Trends
        </div>
      </section>

      {/* Metric Category Tabs */}
      <section className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        <button
          onClick={() => setMetricTab('weight')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-['Space_Grotesk'] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            metricTab === 'weight'
              ? 'bg-[#f97316] text-[#552100] shadow-[0_0_16px_rgba(249,115,22,0.3)] font-bold'
              : 'bg-[#2a2a2c] text-[#e0c0b1] hover:bg-[#353437]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">monitor_weight</span>
          Body Weight
        </button>
        <button
          onClick={() => setMetricTab('tonnage')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-['Space_Grotesk'] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            metricTab === 'tonnage'
              ? 'bg-[#f97316] text-[#552100] shadow-[0_0_16px_rgba(249,115,22,0.3)] font-bold'
              : 'bg-[#2a2a2c] text-[#e0c0b1] hover:bg-[#353437]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">fitness_center</span>
          Tonnage Volume
        </button>
        <button
          onClick={() => setMetricTab('1rm')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-['Space_Grotesk'] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            metricTab === '1rm'
              ? 'bg-[#f97316] text-[#552100] shadow-[0_0_16px_rgba(249,115,22,0.3)] font-bold'
              : 'bg-[#2a2a2c] text-[#e0c0b1] hover:bg-[#353437]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">trending_up</span>
          1RM Strength
        </button>
        <button
          onClick={() => setMetricTab('calories')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-['Space_Grotesk'] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            metricTab === 'calories'
              ? 'bg-[#f97316] text-[#552100] shadow-[0_0_16px_rgba(249,115,22,0.3)] font-bold'
              : 'bg-[#2a2a2c] text-[#e0c0b1] hover:bg-[#353437]'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">local_fire_department</span>
          Caloric Balance
        </button>
      </section>

      {/* Timeframe Selector */}
      <section className="flex items-center justify-between p-1 bg-[#0e0e10] border border-[#201f22] rounded-full">
        {(['1W', '1M', '3M', '6M', 'ALL'] as const).map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-1.5 rounded-full font-['Space_Grotesk'] text-xs font-semibold transition-all cursor-pointer ${
              timeframe === tf
                ? 'bg-[#2a2a2c] text-[#ffb690] shadow-[0_0_12px_rgba(249,115,22,0.35)] font-bold border border-[#f97316]/30'
                : 'text-[#a78b7d] hover:text-[#e5e1e4]'
            }`}
          >
            {tf}
          </button>
        ))}
      </section>

      {/* Hero Chart Card */}
      <section className="relative bg-[#201f22]/90 backdrop-blur-xl border border-[#2a2a2c] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xl overflow-hidden">
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-[#ffb690]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 bottom-0 w-48 h-48 bg-[#94de2d]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] uppercase tracking-wider font-semibold">
              Current Fasted Weight
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="font-['Space_Grotesk'] text-4xl sm:text-5xl font-bold text-[#e5e1e4] tracking-tight tabular-nums">
                {currentWeight.toFixed(1)}
              </span>
              <span className="font-['Space_Grotesk'] text-lg text-[#a78b7d] font-bold">
                kg
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#94de2d]/15 text-[#94de2d] font-['Space_Grotesk'] text-[11px] font-bold shadow-[0_0_12px_rgba(148,222,45,0.25)] border border-[#94de2d]/30">
              <span className="material-symbols-outlined text-[14px]">arrow_downward</span>
              -1.8 kg this month
            </span>
            <span className="text-xs text-[#a78b7d]">
              Target: <strong className="text-[#e5e1e4]">76.0 kg</strong>
            </span>
          </div>
        </div>

        {/* SVG Fluid Trend Curve */}
        <div className="relative w-full h-48 mt-2 flex flex-col justify-end">
          {/* Active Point Floating Tooltip */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#2a2a2c]/95 backdrop-blur-md px-3 py-1 rounded-xl border border-[#353437] shadow-[0_0_16px_rgba(0,0,0,0.8)]">
            <span className="w-2 h-2 rounded-full bg-[#f97316] shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            <span className="font-['Space_Grotesk'] text-xs text-[#e5e1e4] font-semibold">
              Wed, Oct 11:
            </span>
            <span className="font-['Space_Grotesk'] text-xs text-[#ffb690] font-bold">
              {currentWeight.toFixed(1)} kg
            </span>
            <span className="font-['Space_Grotesk'] text-xs text-[#94de2d]">(-0.2 kg)</span>
          </div>

          <svg
            className="w-full h-40 overflow-visible"
            fill="none"
            preserveAspectRatio="none"
            viewBox="0 0 340 140"
          >
            <defs>
              <linearGradient id="analyticsChartGradient" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#f97316" stopOpacity="0.38" />
                <stop offset="60%" stopColor="#94de2d" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#94de2d" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="analyticsStrokeGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="65%" stopColor="#ffb690" />
                <stop offset="100%" stopColor="#94de2d" />
              </linearGradient>
              <filter id="analyticsGlow" width="140%" height="140%" x="-20%" y="-20%">
                <feGaussianBlur result="blur" stdDeviation="3" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Grid Guideline ticks */}
            <line
              opacity="0.3"
              stroke="#353437"
              strokeDasharray="3 3"
              strokeWidth="0.8"
              x1="0"
              x2="340"
              y1="25"
              y2="25"
            />
            <line
              opacity="0.3"
              stroke="#353437"
              strokeDasharray="3 3"
              strokeWidth="0.8"
              x1="0"
              x2="340"
              y1="75"
              y2="75"
            />
            <line
              opacity="0.3"
              stroke="#353437"
              strokeDasharray="3 3"
              strokeWidth="0.8"
              x1="0"
              x2="340"
              y1="125"
              y2="125"
            />

            {/* 7-day Moving Average (Dashed Cyan) */}
            <path
              d="M 10 28 Q 70 42, 130 55 T 250 82 T 330 98"
              fill="none"
              opacity="0.85"
              stroke="#4cd7f6"
              strokeDasharray="4 4"
              strokeWidth="1.8"
            />

            {/* Area Gradient Fill */}
            <path
              d="M 10 20 C 50 35, 80 25, 120 48 C 160 70, 190 60, 230 85 C 270 95, 290 82, 330 102 L 330 140 L 10 140 Z"
              fill="url(#analyticsChartGradient)"
            />

            {/* Primary Fluid Trend Stroke */}
            <path
              d="M 10 20 C 50 35, 80 25, 120 48 C 160 70, 190 60, 230 85 C 270 95, 290 82, 330 102"
              fill="none"
              filter="url(#analyticsGlow)"
              stroke="url(#analyticsStrokeGradient)"
              strokeWidth="3"
            />

            {/* Interactive Data Points */}
            <circle cx="10" cy="20" fill="#f97316" r="3.5" />
            <circle cx="120" cy="48" fill="#f97316" r="3.5" />
            <circle cx="230" cy="85" fill="#ffb690" r="3.5" />

            {/* Active Target Point with Dual Rings */}
            <line
              opacity="0.6"
              stroke="#f97316"
              strokeDasharray="2 2"
              strokeWidth="1"
              x1="330"
              x2="330"
              y1="0"
              y2="140"
            />
            <circle cx="330" cy="102" fill="#f97316" fillOpacity="0.3" r="7" />
            <circle cx="330" cy="102" fill="#acf847" r="4" />
          </svg>

          {/* Time axis */}
          <div className="flex justify-between items-center text-[#a78b7d] font-['Space_Grotesk'] text-xs pt-2">
            <span>Sep 15</span>
            <span>Sep 23</span>
            <span>Oct 01</span>
            <span>Oct 08</span>
            <span className="text-[#ffb690] font-bold">Today</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-1 text-xs text-[#a78b7d] bg-[#0e0e10]/60 border border-[#201f22] p-3 rounded-xl font-['Space_Grotesk']">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#ffb690] rounded" />
            <span>Daily Readout</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-[#4cd7f6]" />
            <span>7D Moving Average</span>
          </div>
          <div className="flex items-center gap-1 text-[#94de2d] font-semibold">
            <span className="material-symbols-outlined text-[14px]">flag</span>
            <span>-0.45 kg/wk</span>
          </div>
        </div>
      </section>

      {/* 3 Biometric Stat Cards */}
      <section className="grid grid-cols-3 gap-2.5">
        <div className="bg-[#201f22]/80 backdrop-blur-lg border border-[#2a2a2c] rounded-2xl p-3 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] font-semibold">
              Est. Body Fat
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#ffb690]">
              pie_chart
            </span>
          </div>
          <div className="my-1.5">
            <div className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4] leading-tight">
              14.8%
            </div>
            <div className="flex items-center gap-1 text-[#94de2d] font-['Space_Grotesk'] text-[10px] font-bold mt-0.5">
              <span className="material-symbols-outlined text-[12px]">arrow_downward</span>
              -1.4%
            </div>
          </div>
          <div className="w-full bg-[#353437] rounded-full h-1">
            <div className="bg-[#94de2d] rounded-full h-1" style={{ width: '68%' }} />
          </div>
        </div>

        <div className="bg-[#201f22]/80 backdrop-blur-lg border border-[#2a2a2c] rounded-2xl p-3 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] font-semibold">
              Lean Muscle
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#94de2d]">
              fitness_center
            </span>
          </div>
          <div className="my-1.5">
            <div className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4] leading-tight">
              63.8 <span className="text-xs font-normal text-[#a78b7d]">kg</span>
            </div>
            <div className="flex items-center gap-1 text-[#94de2d] font-['Space_Grotesk'] text-[10px] font-bold mt-0.5">
              <span className="material-symbols-outlined text-[12px]">arrow_upward</span>
              +0.6 kg
            </div>
          </div>
          <div className="w-full bg-[#353437] rounded-full h-1">
            <div className="bg-[#f97316] rounded-full h-1" style={{ width: '82%' }} />
          </div>
        </div>

        <div className="bg-[#201f22]/80 backdrop-blur-lg border border-[#2a2a2c] rounded-2xl p-3 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="font-['Space_Grotesk'] text-[10px] text-[#a78b7d] font-semibold">
              7D Avg Weight
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">
              show_chart
            </span>
          </div>
          <div className="my-1.5">
            <div className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4] leading-tight">
              78.6 <span className="text-xs font-normal text-[#a78b7d]">kg</span>
            </div>
            <div className="flex items-center gap-1 text-[#4cd7f6] font-['Space_Grotesk'] text-[10px] font-bold mt-0.5">
              <span className="material-symbols-outlined text-[12px]">horizontal_rule</span>
              Smooth trend
            </div>
          </div>
          <div className="w-full bg-[#353437] rounded-full h-1">
            <div className="bg-[#4cd7f6] rounded-full h-1" style={{ width: '90%' }} />
          </div>
        </div>
      </section>

      {/* Daily Weigh-In Interactive Module */}
      <section className="relative bg-[#201f22]/85 backdrop-blur-xl border border-[#2a2a2c] rounded-2xl p-4 sm:p-5 flex flex-col gap-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#f97316] text-[20px]">
              edit_calendar
            </span>
            <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
              Daily Weigh-In
            </span>
          </div>
          <span className="font-['Space_Grotesk'] text-xs text-[#a78b7d]">Today 07:15 AM</span>
        </div>

        {/* Stepper Wells */}
        <div className="flex items-center justify-between gap-3 bg-[#0e0e10] p-2 sm:p-3 rounded-xl border border-[#201f22]">
          <button
            onClick={handleDecrement}
            className="w-12 h-12 rounded-xl bg-[#2a2a2c] text-[#e5e1e4] flex items-center justify-center active:scale-95 transition-transform border border-[#353437] shadow-sm font-['Space_Grotesk'] text-base font-bold select-none cursor-pointer"
          >
            −0.1
          </button>
          <div className="flex items-baseline justify-center gap-1.5">
            <input
              className="w-24 text-center font-['Space_Grotesk'] text-4xl font-bold bg-transparent text-[#ffb690] focus:outline-none tracking-tight tabular-nums"
              step="0.1"
              type="number"
              value={inputWeight}
              onChange={(e) => setInputWeight(parseFloat(e.target.value) || 78.4)}
            />
            <span className="font-['Space_Grotesk'] text-lg text-[#a78b7d] font-bold select-none">
              kg
            </span>
          </div>
          <button
            onClick={handleIncrement}
            className="w-12 h-12 rounded-xl bg-[#2a2a2c] text-[#e5e1e4] flex items-center justify-center active:scale-95 transition-transform border border-[#353437] shadow-sm font-['Space_Grotesk'] text-base font-bold select-none cursor-pointer"
          >
            +0.1
          </button>
        </div>

        {/* Standard Conditions Toggle Switch */}
        <div className="flex items-center justify-between bg-[#2a2a2c]/60 px-4 py-3 rounded-xl border border-[#353437]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#94de2d] text-[20px]">
              water_drop
            </span>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-semibold text-[#e5e1e4]">
                Standard Conditions
              </span>
              <span className="text-[11px] text-[#a78b7d]">
                Fasted, morning, post-bathroom
              </span>
            </div>
          </div>
          <button
            onClick={() => setStandardConditions(!standardConditions)}
            className={`w-12 h-6 flex items-center rounded-full p-0.5 transition-colors cursor-pointer ${
              standardConditions ? 'bg-[#7ac100]' : 'bg-[#353437]'
            }`}
          >
            <div
              className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${
                standardConditions ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Log Action Button */}
        <button
          onClick={handleLogWeight}
          className={`w-full py-3.5 rounded-full font-['Space_Grotesk'] text-sm font-bold uppercase tracking-wide active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer ${
            savedAlert
              ? 'bg-[#94de2d] text-[#1f3700] shadow-[0_0_24px_rgba(148,222,45,0.6)]'
              : 'bg-gradient-to-r from-[#f97316] via-[#ffb690] to-[#94de2d] text-[#0e0e10] shadow-[0_0_24px_rgba(249,115,22,0.35)]'
          }`}
        >
          <span className="material-symbols-outlined font-bold text-[20px]">
            {savedAlert ? 'task_alt' : 'check_circle'}
          </span>
          <span>{savedAlert ? 'Saved to Kinetics' : "Log Today's Weight"}</span>
        </button>
      </section>

      {/* Recent Weight Logs */}
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="font-['Space_Grotesk'] text-lg font-bold text-[#e5e1e4]">
            Recent Logs
          </span>
          <button className="font-['Space_Grotesk'] text-xs text-[#ffb690] hover:text-[#e5e1e4] flex items-center gap-1 font-semibold cursor-pointer">
            View All History
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {weightLogs.slice(0, 3).map((log, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 bg-[#201f22]/70 backdrop-blur-md border border-[#2a2a2c] rounded-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2a2a2c] border border-[#353437] flex flex-col items-center justify-center">
                  <span className="font-['Space_Grotesk'] text-[9px] text-[#a78b7d] uppercase">
                    {log.dayLabel}
                  </span>
                  <span className="font-['Space_Grotesk'] text-base font-bold text-[#e5e1e4] leading-none">
                    {log.dayNumber}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-1">
                    <span className="font-['Space_Grotesk'] text-base font-bold text-[#e5e1e4]">
                      {log.weightKg.toFixed(1)}
                    </span>
                    <span className="text-xs text-[#a78b7d]">kg</span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#353437] text-[#e0c0b1] font-['Space_Grotesk'] text-[10px] w-fit mt-0.5">
                    {log.tag}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end font-['Space_Grotesk']">
                <span
                  className={`text-xs font-bold ${
                    log.deltaKg <= 0 ? 'text-[#94de2d]' : 'text-[#ffb690]'
                  }`}
                >
                  {log.deltaKg > 0 ? `+${log.deltaKg} kg` : `${log.deltaKg} kg`}
                </span>
                <span className="text-[11px] text-[#a78b7d]">
                  7D: {log.rollingAvg7dKg.toFixed(1)} kg
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coach Feedback Box */}
      <section className="bg-[#201f22]/50 border border-[#2a2a2c] rounded-2xl p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#2a2a2c] border border-[#353437] flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[#94de2d] text-2xl">smart_toy</span>
        </div>
        <div className="flex flex-col">
          <span className="font-['Space_Grotesk'] text-xs uppercase tracking-wider text-[#94de2d] font-bold">
            Coach Feedback
          </span>
          <p className="text-xs sm:text-sm text-[#e0c0b1]/80 mt-1">
            Your rate of weight reduction is sitting perfectly at 0.5% body weight/week. Muscle preservation is confirmed through your elevated 1RM trends.
          </p>
        </div>
      </section>
    </div>
  );
};
