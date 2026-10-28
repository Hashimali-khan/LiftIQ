import React from 'react';
import { ScreenTab } from '../types';

interface NavigationProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const tabs: { id: ScreenTab; label: string; icon: string }[] = [
    { id: 'today', label: 'Today', icon: 'bolt' },
    { id: 'workouts', label: 'Workouts', icon: 'fitness_center' },
    { id: 'nutrition', label: 'Nutrition', icon: 'nutrition' },
    { id: 'analytics', label: 'Analytics', icon: 'monitoring' },
    { id: 'coach', label: 'Coach', icon: 'auto_awesome' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-50 pb-safe bg-[#131315]/90 backdrop-blur-2xl border-t border-[#201f22] shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
      <div className="flex justify-around items-center h-20 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center min-w-[52px] min-h-[48px] w-14 h-14 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-[#94de2d] font-bold drop-shadow-[0_0_16px_rgba(148,222,45,0.4)] scale-105'
                  : 'text-[#e0c0b1]/70 hover:text-[#e5e1e4] hover:bg-[#201f22]/40'
              }`}
            >
              <span
                className="material-symbols-outlined text-[24px]"
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {tab.icon}
              </span>
              <span className="font-['Space_Grotesk'] text-[11px] tracking-wide mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
