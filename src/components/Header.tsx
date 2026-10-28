import React from 'react';
import { ScreenTab } from '../types';

interface HeaderProps {
  currentTab: ScreenTab;
  onOpenProfile?: () => void;
  isDesktopView: boolean;
  onToggleDesktopView: () => void;
}

const TAB_TITLES: Record<ScreenTab, string> = {
  today: 'Today',
  workouts: 'Workouts',
  nutrition: 'Nutrition',
  analytics: 'Analytics',
  coach: 'Coach',
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenProfile,
  isDesktopView,
  onToggleDesktopView,
}) => {
  return (
    <header className="fixed top-0 w-full z-50 pt-safe bg-[#131315]/85 backdrop-blur-xl border-b border-[#201f22] shadow-[0_1px_12px_rgba(0,0,0,0.5)]">
      <div className="h-16 px-4 max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand & Tab Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <img
              alt="Kinetic Obsidian Logo"
              className="h-8 w-auto object-contain shrink-0"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuA9mAGSXM6XxcStCr8x2sOQ9sOGwOvw4TT1OX6Oh-wCWBeK9AER2vpHh-pIWRez-enIb3WHF0KR_X8oOHc2GTzKNh6qYYAnOrLAlaTSXiRUOG9qOOk7M_mvWMBD0GaMfkRQoBpHM73foungg5SDFcS97JMjLzZxihTXwNUX31Ka1v1xBQ9giQTR3f-YbkevrFvWC4eQSly7YJFeIZPBJAK_MLwg6b24FjFmgWN--FENq97tOQK6rN-B"
              onError={(e) => {
                // High-visibility SVG fallback if network blocked
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-[#e5e1e4] uppercase select-none">
              {TAB_TITLES[currentTab]}
            </span>
          </div>
        </div>

        {/* Right Tools: View Mode Toggle, Streak, Avatar */}
        <div className="flex items-center gap-2.5">
          {/* Desktop/Mobile Cockpit View Switcher */}
          <button
            onClick={onToggleDesktopView}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#201f22] border border-[#353437] text-[#e0c0b1] hover:text-[#e5e1e4] hover:border-[#f97316]/50 transition-all cursor-pointer"
            title="Toggle between Mobile App View and Desktop Performance Cockpit"
          >
            <span className="material-symbols-outlined text-[16px] text-[#4cd7f6]">
              {isDesktopView ? 'smartphone' : 'desktop_windows'}
            </span>
            <span className="hidden md:inline">
              {isDesktopView ? 'Mobile Stack' : 'Desktop Cockpit'}
            </span>
          </button>

          {/* 14D Streak */}
          <div className="flex items-center gap-1 bg-[#2a2a2c]/90 px-3 py-1 rounded-full shadow-[0_0_12px_rgba(249,115,22,0.25)] border border-[#f97316]/30">
            <span className="material-symbols-outlined text-[#f97316] text-[18px]">
              local_fire_department
            </span>
            <span className="font-['Space_Grotesk'] text-xs font-bold text-[#f97316] tracking-wider">
              14D
            </span>
          </div>

          {/* Profile Trigger */}
          <button
            onClick={onOpenProfile}
            className="flex items-center justify-center p-1 min-w-[40px] min-h-[40px] rounded-full hover:ring-2 hover:ring-[#94de2d]/40 transition-all cursor-pointer"
            title="Alex Rivera - Elite Hybrid Athlete"
          >
            <img
              alt="Alex Rivera"
              className="w-8 h-8 rounded-full object-cover border border-[#353437]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbd0KDP_KEJI9bh4vtwgom7cUjQt6jNzoLGjkv6UPkH6d2nEv8VdLrkXCWLFpf2T39DdctzEVMmQr18UrsJVTSc0csI3MY7_9jV_8W2iO1uCapEXe6Zgrl8bkvEJPvVZBOwYo3IM2AP2sC-ylfc8sEvPeWOViiumgHMkJIdLDx9VByMLAledy8c2LvrShjPQh1HbEOjw5d87Pf9sEGGs_rTKyZ9G-BfHDDwm01QPFidQLJJDXzOBgw"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
