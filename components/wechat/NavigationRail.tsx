import React from 'react';
import {
  MessageCircle,
  Users,
  FolderGit2,
  Smartphone,
  Settings,
  Power,
} from 'lucide-react';
import { ViewMode } from './types';

interface NavigationRailProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
  onClose: () => void;
}

const SidebarItem = ({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof MessageCircle;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    data-testid={`wechat-side-${label}`}
    className={`relative p-3 rounded-lg transition-colors group ${
      active ? 'text-[#07c160]' : 'text-[#979797] hover:text-[#d6d6d6]'
    }`}
    title={label}
  >
    <Icon size={24} strokeWidth={1.5} />
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#07c160] rounded-r-full" />
    )}
  </button>
);

export const NavigationRail: React.FC<NavigationRailProps> = ({
  viewMode,
  onChange,
  onClose,
}) => {
  return (
    <div className="w-[68px] bg-[#1e1e1e] flex flex-col items-center py-6 gap-2 shrink-0 z-20 draggable-region">
      <div className="w-10 h-10 rounded-lg bg-gray-300 mb-6 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
          alt="Me"
          className="w-full h-full bg-white"
        />
      </div>

      <SidebarItem
        icon={MessageCircle}
        label="微信"
        active={viewMode === 'chat'}
        onClick={() => onChange('chat')}
      />
      <SidebarItem
        icon={Users}
        label="通讯录"
        active={viewMode === 'contacts'}
        onClick={() => onChange('contacts')}
      />
      <SidebarItem
        icon={FolderGit2}
        label="剧情剧本"
        active={viewMode === 'stories'}
        onClick={() => onChange('stories')}
      />

      <div className="flex-1" />

      <SidebarItem icon={Smartphone} label="小程序" />
      <SidebarItem icon={Settings} label="设置" />

      <button
        onClick={onClose}
        className="mt-2 p-3 text-[#979797] hover:text-red-400 transition-colors"
        title="退出微信"
      >
        <Power size={20} strokeWidth={1.5} />
      </button>
    </div>
  );
};
