import React from 'react';
import { Rocket, Lock, FileText, Play, Trash2 } from 'lucide-react';
import { NetworkRequest } from '../../types';

// URL 高亮显示组件
const HighlightedUrl: React.FC<{ url: string; isSelected: boolean }> = ({ url, isSelected }) => {
  try {
    const urlObj = new URL(url);
    const host = urlObj.host;
    const path = urlObj.pathname + urlObj.search;
    
    if (isSelected) {
      return <span className="text-white">{url}</span>;
    }
    
    return (
      <>
        <span className="text-[#4ec9b0]">{urlObj.protocol}//</span>
        <span className="text-[#4ec9b0]">{host}</span>
        <span className="text-[#cccccc]">{path}</span>
      </>
    );
  } catch {
    return <span className={isSelected ? 'text-white' : 'text-[#cccccc]'}>{url}</span>;
  }
};

export interface TrafficListProps {
  filteredRequests: NetworkRequest[];
  selectedRequestId: string | null;
  onSelectRequest: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, reqId: string) => void;
  onResumeRequest: (id: string) => void;
  onDropRequest: (id: string) => void;
  getMethodColor: (method: string) => string;
  getStatusColor: (status: number) => string;
  getHighlightColor?: (request: NetworkRequest) => string | null;
  formatSize: (bytes: number) => string;
  formatTime: (ms: number) => string;
}

export const TrafficList: React.FC<TrafficListProps> = ({
  filteredRequests,
  selectedRequestId,
  onSelectRequest,
  onContextMenu,
  onResumeRequest,
  onDropRequest,
  getMethodColor,
  getStatusColor,
  getHighlightColor,
  formatSize,
  formatTime
}) => {
  return (
    <>
      {/* Header Row */}
      <div className="h-7 bg-[#252526] border-b border-[#3c3c3c] flex items-center text-[11px] text-[#858585] px-2 font-medium select-none">
        <div className="w-12 text-center border-r border-[#3c3c3c]/50">ID</div>
        <div className="w-8 text-center border-r border-[#3c3c3c]/50">Icon</div>
        <div className="w-16 pl-2 border-r border-[#3c3c3c]/50">Method</div>
        <div className="flex-1 pl-2 border-r border-[#3c3c3c]/50">URL</div>
        <div className="w-16 text-center border-r border-[#3c3c3c]/50">Status</div>
        <div className="w-16 text-center border-r border-[#3c3c3c]/50">Size</div>
        <div className="w-16 text-center">Time</div>
      </div>

      {/* Request List */}
      <div className="flex-1 overflow-y-auto bg-[#1e1e1e]">
        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
            <Rocket size={48} className="mb-2" />
            <span className="text-xs">Waiting for traffic...</span>
          </div>
        ) : (
          filteredRequests.map((req, idx) => {
            const isSelected = selectedRequestId === req.id;
            const isPaused = req.isPaused;
            const highlightColor = getHighlightColor?.(req);

            // Priority: Selected > Paused > Highlight > Default (Reqable 风格)
            const bgColor = isSelected
              ? 'bg-[#37373d] border-l-2 border-l-[#4ec9b0]'
              : isPaused
              ? 'bg-[#3a1d1d]'
              : highlightColor
              ? ''
              : 'hover:bg-[#2a2d2e]';

            return (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onContextMenu(e, req.id);
                }}
                className={`h-[26px] flex items-center text-[12px] border-b border-[#3c3c3c]/30 cursor-pointer font-mono group ${bgColor} ${isSelected ? 'text-white' : 'text-[#cccccc]'}`}
                style={highlightColor && !isSelected && !isPaused ? { backgroundColor: highlightColor } : undefined}
              >
                <div className="w-12 text-center text-[10px] opacity-70 flex items-center justify-center gap-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'animate-pulse bg-[#f48771]' : ''}`} style={{ backgroundColor: isPaused ? '#f48771' : getStatusColor(req.status || 0) }}></div>
                  {idx + 1}
                </div>

                <div className="w-8 flex items-center justify-center opacity-70">
                  {req.url.startsWith('https') ? <Lock size={10} className="text-[#4ec9b0]" /> : <FileText size={10} />}
                </div>

                <div className={`w-16 pl-2 font-bold ${isSelected ? 'text-white' : getMethodColor(req.method)}`}>
                  {req.method}
                </div>

                <div className="flex-1 pl-2 truncate pr-2" title={req.url}>
                  <HighlightedUrl url={req.url} isSelected={isSelected} />
                </div>

                <div className="w-16 text-center text-[11px]" style={{ color: isSelected ? 'white' : getStatusColor(req.status || 0) }}>
                  {isPaused ? (
                    <div className="flex justify-center gap-1">
                      <button onClick={(e) => { e.stopPropagation(); onResumeRequest(req.id); }} className="p-0.5 bg-[#4ec9b0] text-black rounded hover:brightness-110"><Play size={10} fill="currentColor" /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDropRequest(req.id); }} className="p-0.5 bg-[#f48771] text-black rounded hover:brightness-110"><Trash2 size={10} /></button>
                    </div>
                  ) : (req.status || '...')}
                </div>

                <div className="w-16 text-center text-[10px] opacity-70">{formatSize(req.size || 0)}</div>
                <div className="w-16 text-center text-[10px] opacity-70">{formatTime(req.time || 0)}</div>
              </div>
            )
          })
        )}
      </div>
    </>
  );
};
