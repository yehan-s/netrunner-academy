import React from 'react';
import { X, Plus, Wifi, PenTool, Code } from 'lucide-react';

export interface Tab {
  id: string;
  type: 'traffic' | 'composer' | 'script';
  title: string;
  data?: any;
  isModified?: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  requestCount?: number;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  requestCount = 0,
  onSelectTab,
  onCloseTab,
  onNewTab
}) => {
  const getTabIcon = (type: Tab['type']) => {
    switch (type) {
      case 'traffic':
        return <Wifi size={12} />;
      case 'composer':
        return <PenTool size={12} />;
      case 'script':
        return <Code size={12} />;
    }
  };

  const getTabTitle = (tab: Tab) => {
    if (tab.type === 'traffic') {
      return `Recording${requestCount > 0 ? ` (${requestCount})` : ''}`;
    }
    return tab.title;
  };

  return (
    <div className="h-9 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-1 gap-0.5 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTabId === tab.id;
        
        return (
          <div
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative h-8 min-w-[120px] max-w-[200px] flex items-center gap-2 px-3 cursor-pointer select-none transition-colors ${
              isActive
                ? 'bg-[#1e1e1e] text-[#cccccc]'
                : 'bg-[#2d2d30] text-[#858585] hover:text-[#cccccc] hover:bg-[#37373d]'
            }`}
            style={{
              borderTop: isActive ? '2px solid #4ec9b0' : '2px solid transparent',
              borderLeft: '1px solid #3c3c3c',
              borderRight: '1px solid #3c3c3c',
            }}
          >
            {/* Tab Icon */}
            <span className={isActive ? 'text-[#4ec9b0]' : ''}>
              {getTabIcon(tab.type)}
            </span>
            
            {/* Tab Title */}
            <span className="text-[12px] truncate flex-1">
              {getTabTitle(tab)}
            </span>
            
            {/* Modified Indicator */}
            {tab.isModified && (
              <span className="w-2 h-2 rounded-full bg-[#cccccc]" />
            )}
            
            {/* Close Button - show on hover or if active */}
            {tabs.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className={`p-0.5 rounded hover:bg-[#3c3c3c] transition-colors ${
                  isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
      
      {/* New Tab Button */}
      <button
        onClick={onNewTab}
        className="w-7 h-7 flex items-center justify-center text-[#858585] hover:text-[#cccccc] hover:bg-[#37373d] rounded transition-colors ml-1"
        title="New Tab"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};

export default TabBar;
