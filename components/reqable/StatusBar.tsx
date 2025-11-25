import React from 'react';

interface StatusBarProps {
  totalCount: number;
  selectedCount: number;
  protocol?: string;
  statusCode?: number;
}

const getStatusColor = (status: number): string => {
  if (status >= 500) return '#f48771';
  if (status >= 400) return '#ce9178';
  if (status >= 300) return '#569cd6';
  if (status >= 200) return '#4ec9b0';
  if (status >= 100) return '#858585';
  return '#858585';
};

export const StatusBar: React.FC<StatusBarProps> = ({
  totalCount,
  selectedCount,
  protocol,
  statusCode
}) => {
  return (
    <div className="h-6 bg-[#252526] border-t border-[#3c3c3c] flex items-center px-3 text-[11px] text-[#858585] shrink-0">
      {/* 左侧：请求统计 */}
      <div className="flex items-center gap-1">
        <span>{totalCount} items</span>
        {selectedCount > 0 && (
          <span className="text-[#cccccc]">({selectedCount} selected)</span>
        )}
      </div>

      <div className="flex-1" />

      {/* 右侧：协议和状态码标签 */}
      <div className="flex items-center gap-2">
        {protocol && (
          <span className="px-1.5 py-0.5 bg-[#37373d] rounded text-[10px] text-[#cccccc] font-mono">
            {protocol}
          </span>
        )}
        {statusCode && statusCode > 0 && (
          <span 
            className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
            style={{ 
              backgroundColor: `${getStatusColor(statusCode)}20`,
              color: getStatusColor(statusCode)
            }}
          >
            {statusCode}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatusBar;
