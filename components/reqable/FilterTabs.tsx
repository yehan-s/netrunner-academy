import React from 'react';
import { Search } from 'lucide-react';

export type ContentFilter = 
  | 'All' | 'Http' | 'Https' | 'Websocket' 
  | 'HTTP1' | 'HTTP2' 
  | 'JSON' | 'XML' | 'Text' | 'HTML' | 'JS' 
  | '图片' | '媒体' | '二进制'
  | '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

interface FilterTabsProps {
  activeFilter: ContentFilter;
  onFilterChange: (filter: ContentFilter) => void;
  searchText: string;
  onSearchChange: (text: string) => void;
}

const FILTER_GROUPS: { filters: ContentFilter[]; separator?: boolean }[] = [
  { filters: ['All'] },
  { filters: ['Http', 'Https', 'Websocket'], separator: true },
  { filters: ['HTTP1', 'HTTP2'], separator: true },
  { filters: ['JSON', 'XML', 'Text', 'HTML', 'JS'], separator: true },
  { filters: ['图片', '媒体', '二进制'], separator: true },
  { filters: ['1xx', '2xx', '3xx', '4xx', '5xx'], separator: true },
];

export const FilterTabs: React.FC<FilterTabsProps> = ({
  activeFilter,
  onFilterChange,
  searchText,
  onSearchChange
}) => {
  return (
    <div className="h-8 bg-[#1e1e1e] border-b border-[#3c3c3c] flex items-center px-2 gap-0 overflow-x-auto">
      {/* 过滤器标签 */}
      <div className="flex items-center gap-0 overflow-x-auto scrollbar-thin">
        {FILTER_GROUPS.map((group, groupIdx) => (
          <React.Fragment key={groupIdx}>
            {group.separator && groupIdx > 0 && (
              <div className="w-px h-3 bg-[#3c3c3c] mx-1 shrink-0" />
            )}
            {group.filters.map((filter) => (
              <button
                key={filter}
                onClick={() => onFilterChange(filter)}
                className={`px-2 py-1 text-[11px] whitespace-nowrap transition-colors relative ${
                  activeFilter === filter
                    ? 'text-[#cccccc] font-medium'
                    : 'text-[#858585] hover:text-[#cccccc]'
                }`}
              >
                {filter}
                {/* 选中下划线 */}
                {activeFilter === filter && (
                  <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-[#4ec9b0] rounded-full" />
                )}
              </button>
            ))}
          </React.Fragment>
        ))}
      </div>

      <div className="flex-1 min-w-[20px]" />

      {/* 搜索框 */}
      <div className="relative shrink-0">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#858585]" />
        <input
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Filter..."
          className="bg-[#2d2d30] border border-[#3c3c3c] rounded pl-7 pr-3 py-1 text-[11px] text-[#cccccc] outline-none focus:border-[#4ec9b0] w-32 placeholder-[#858585]"
        />
      </div>
    </div>
  );
};

export default FilterTabs;
