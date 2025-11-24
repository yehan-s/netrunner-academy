import React from 'react';
import type { LucideIcon } from 'lucide-react';

export interface SidebarIconProps {
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  color?: string;
}

export const SidebarIcon: React.FC<SidebarIconProps> = ({ icon: Icon, active, onClick, color }) => (
  <button
    onClick={onClick}
    className={`w-10 h-10 flex items-center justify-center mb-1 transition-colors relative group ${active ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
  >
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-yellow-500 rounded-r-sm" />}
    <Icon size={20} strokeWidth={1.5} color={active && color ? color : undefined} />
  </button>
);

export interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-2.5 py-0.5 text-[11px] rounded-[3px] transition-colors whitespace-nowrap ${active
      ? 'bg-[#3a3a3a] text-white font-medium border border-gray-600'
      : 'text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a]'
      }`}
  >
    {label}
  </button>
);
