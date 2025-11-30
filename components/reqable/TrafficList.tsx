import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Rocket, Lock, FileText, Play, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { NetworkRequest } from '../../types';

// 列配置类型
export interface ColumnConfig {
  id: string;
  label: string;
  width: number;
  minWidth: number;
  visible: boolean;
  sortable: boolean;
}

// 默认列配置
const DEFAULT_COLUMNS: ColumnConfig[] = [
  { id: 'status_indicator', label: '', width: 24, minWidth: 24, visible: true, sortable: false },
  { id: 'id', label: 'ID', width: 50, minWidth: 40, visible: true, sortable: true },
  { id: 'icon', label: '', width: 32, minWidth: 32, visible: true, sortable: false },
  { id: 'method', label: 'Method', width: 70, minWidth: 50, visible: true, sortable: true },
  { id: 'protocol', label: 'Protocol', width: 70, minWidth: 50, visible: false, sortable: true },
  { id: 'host', label: 'Host', width: 150, minWidth: 80, visible: false, sortable: true },
  { id: 'url', label: 'URL', width: 0, minWidth: 100, visible: true, sortable: true }, // flex-1
  { id: 'status', label: 'Code', width: 60, minWidth: 50, visible: true, sortable: true },
  { id: 'size', label: 'Size', width: 70, minWidth: 50, visible: true, sortable: true },
  { id: 'time', label: 'Time', width: 70, minWidth: 50, visible: true, sortable: true },
  { id: 'remote_address', label: 'Remote', width: 120, minWidth: 80, visible: false, sortable: true },
];

// 从 localStorage 加载列配置
const loadColumnConfig = (): ColumnConfig[] => {
  try {
    const saved = localStorage.getItem('reqable_columns');
    if (saved) {
      const parsed = JSON.parse(saved);
      // 合并默认列和保存的配置
      return DEFAULT_COLUMNS.map(col => {
        const savedCol = parsed.find((c: ColumnConfig) => c.id === col.id);
        return savedCol ? { ...col, ...savedCol } : col;
      });
    }
  } catch {}
  return DEFAULT_COLUMNS;
};

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

// 状态指示灯组件
const StatusIndicator: React.FC<{ status: number; isPaused?: boolean }> = ({ status, isPaused }) => {
  let color = '#858585'; // 灰色 - 进行中
  
  if (isPaused) {
    color = '#f48771'; // 红色 - 暂停
  } else if (status >= 200 && status < 400) {
    color = '#4ec9b0'; // 绿色 - 成功
  } else if (status >= 400 || status === 0) {
    color = status === 0 ? '#858585' : '#f48771'; // 灰色进行中 / 红色失败
  }
  
  return (
    <div 
      className={`w-2 h-2 rounded-full ${isPaused ? 'animate-pulse' : ''}`}
      style={{ backgroundColor: color }}
    />
  );
};

// 列头菜单组件
const ColumnMenu: React.FC<{
  columns: ColumnConfig[];
  position: { x: number; y: number };
  onToggle: (id: string) => void;
  onClose: () => void;
}> = ({ columns, position, onToggle, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  // 可配置的列（排除固定列）
  const configurableColumns = columns.filter(c => !['status_indicator', 'icon'].includes(c.id));
  
  return (
    <div 
      ref={menuRef}
      className="fixed bg-[#252526] border border-[#454545] rounded shadow-xl z-50 py-1 min-w-[160px]"
      style={{ left: position.x, top: position.y }}
    >
      <div className="px-3 py-1.5 text-[10px] text-[#858585] uppercase tracking-wider border-b border-[#454545]">
        Columns
      </div>
      {configurableColumns.map(col => (
        <div 
          key={col.id}
          className="px-3 py-1.5 text-[11px] text-[#cccccc] hover:bg-[#37373d] cursor-pointer flex items-center gap-2"
          onClick={() => onToggle(col.id)}
        >
          <div className={`w-3 h-3 border rounded-sm flex items-center justify-center ${col.visible ? 'bg-[#4ec9b0] border-[#4ec9b0]' : 'border-[#858585]'}`}>
            {col.visible && <span className="text-[8px] text-black font-bold">✓</span>}
          </div>
          {col.label || col.id}
        </div>
      ))}
    </div>
  );
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
  // 列配置状态
  const [columns, setColumns] = useState<ColumnConfig[]>(loadColumnConfig);
  
  // 排序状态
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // 列宽拖拽状态
  const [resizing, setResizing] = useState<{ columnId: string; startX: number; startWidth: number } | null>(null);
  
  // 列头菜单状态
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  
  // 持久化列配置
  useEffect(() => {
    localStorage.setItem('reqable_columns', JSON.stringify(columns));
  }, [columns]);
  
  // 切换列可见性
  const toggleColumn = (id: string) => {
    setColumns(prev => prev.map(col => 
      col.id === id ? { ...col, visible: !col.visible } : col
    ));
  };
  
  // 处理排序
  const handleSort = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (!column?.sortable) return;
    
    if (sortColumn === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnId);
      setSortDirection('asc');
    }
  };
  
  // 排序后的请求列表
  const sortedRequests = React.useMemo(() => {
    if (!sortColumn) return filteredRequests;
    
    return [...filteredRequests].sort((a, b) => {
      let aVal: any, bVal: any;
      
      switch (sortColumn) {
        case 'id':
          aVal = parseInt(a.id.replace(/\D/g, '')) || 0;
          bVal = parseInt(b.id.replace(/\D/g, '')) || 0;
          break;
        case 'method':
          aVal = a.method;
          bVal = b.method;
          break;
        case 'protocol':
          aVal = a.protocol || 'HTTP/1.1';
          bVal = b.protocol || 'HTTP/1.1';
          break;
        case 'host':
          try { aVal = new URL(a.url).host; } catch { aVal = ''; }
          try { bVal = new URL(b.url).host; } catch { bVal = ''; }
          break;
        case 'url':
          aVal = a.url;
          bVal = b.url;
          break;
        case 'status':
          aVal = a.status || 0;
          bVal = b.status || 0;
          break;
        case 'size':
          aVal = a.size || 0;
          bVal = b.size || 0;
          break;
        case 'time':
          aVal = a.time || 0;
          bVal = b.time || 0;
          break;
        case 'remote_address':
          aVal = a.remoteAddress || '';
          bVal = b.remoteAddress || '';
          break;
        default:
          return 0;
      }
      
      if (typeof aVal === 'string') {
        const cmp = aVal.localeCompare(bVal);
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredRequests, sortColumn, sortDirection]);
  
  // 列宽拖拽处理
  const handleResizeStart = useCallback((e: React.MouseEvent, columnId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const column = columns.find(c => c.id === columnId);
    if (column) {
      setResizing({ columnId, startX: e.clientX, startWidth: column.width });
    }
  }, [columns]);
  
  useEffect(() => {
    if (!resizing) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - resizing.startX;
      const newWidth = Math.max(resizing.startWidth + delta, columns.find(c => c.id === resizing.columnId)?.minWidth || 40);
      
      setColumns(prev => prev.map(col =>
        col.id === resizing.columnId ? { ...col, width: newWidth } : col
      ));
    };
    
    const handleMouseUp = () => {
      setResizing(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, columns]);
  
  // 右键表头菜单
  const handleHeaderContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
  };
  
  // 获取可见列
  const visibleColumns = columns.filter(c => c.visible);
  
  // 渲染单元格内容
  const renderCell = (column: ColumnConfig, req: NetworkRequest, idx: number, isSelected: boolean) => {
    switch (column.id) {
      case 'status_indicator':
        return <StatusIndicator status={req.status || 0} isPaused={req.isPaused} />;
      case 'id':
        return <span className="text-[10px] opacity-70">{idx + 1}</span>;
      case 'icon':
        return req.url.startsWith('https') 
          ? <Lock size={10} className="text-[#4ec9b0]" /> 
          : <FileText size={10} className="opacity-70" />;
      case 'method':
        return <span className={`font-bold ${isSelected ? 'text-white' : getMethodColor(req.method)}`}>{req.method}</span>;
      case 'protocol':
        return <span className="text-[10px] opacity-70">{req.protocol || 'HTTP/1.1'}</span>;
      case 'host':
        try {
          return <span className="truncate text-[#4ec9b0]">{new URL(req.url).host}</span>;
        } catch {
          return <span className="opacity-50">-</span>;
        }
      case 'url':
        return (
          <div className="truncate" title={req.url}>
            <HighlightedUrl url={req.url} isSelected={isSelected} />
          </div>
        );
      case 'status':
        if (req.isPaused) {
          return (
            <div className="flex justify-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); onResumeRequest(req.id); }} className="p-0.5 bg-[#4ec9b0] text-black rounded hover:brightness-110"><Play size={10} fill="currentColor" /></button>
              <button onClick={(e) => { e.stopPropagation(); onDropRequest(req.id); }} className="p-0.5 bg-[#f48771] text-black rounded hover:brightness-110"><Trash2 size={10} /></button>
            </div>
          );
        }
        return <span style={{ color: isSelected ? 'white' : getStatusColor(req.status || 0) }}>{req.status || '...'}</span>;
      case 'size':
        return <span className="text-[10px] opacity-70">{formatSize(req.size || 0)}</span>;
      case 'time':
        return <span className="text-[10px] opacity-70">{formatTime(req.time || 0)}</span>;
      case 'remote_address':
        return <span className="text-[10px] opacity-70 truncate">{req.remoteAddress || '-'}</span>;
      default:
        return null;
    }
  };
  
  return (
    <>
      {/* Header Row */}
      <div 
        className="h-7 bg-[#252526] border-b border-[#3c3c3c] flex items-center text-[11px] text-[#858585] font-medium select-none"
        onContextMenu={handleHeaderContextMenu}
        data-testid="traffic-list-header"
      >
        {visibleColumns.map((col, idx) => (
          <div 
            key={col.id}
            className={`relative flex items-center justify-center border-r border-[#3c3c3c]/50 h-full ${col.sortable ? 'cursor-pointer hover:bg-[#2a2d2e]' : ''}`}
            style={{ 
              width: col.id === 'url' ? undefined : col.width,
              flex: col.id === 'url' ? 1 : undefined,
              minWidth: col.minWidth
            }}
            onClick={() => handleSort(col.id)}
            data-column={col.id}
          >
            <span className="truncate px-1">{col.label}</span>
            
            {/* 排序指示器 */}
            {sortColumn === col.id && (
              <span className="ml-0.5">
                {sortDirection === 'asc' ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </span>
            )}
            
            {/* 列宽拖拽 handle */}
            {idx < visibleColumns.length - 1 && col.id !== 'url' && (
              <div
                className={`absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-[#4ec9b0] z-10 ${resizing?.columnId === col.id ? 'bg-[#4ec9b0]' : ''}`}
                onMouseDown={(e) => handleResizeStart(e, col.id)}
                data-testid="column-resizer"
              />
            )}
          </div>
        ))}
      </div>

      {/* Request List */}
      <div className="flex-1 overflow-y-auto bg-[#1e1e1e]" data-testid="traffic-list-body">
        {sortedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-30">
            <Rocket size={48} className="mb-2" />
            <span className="text-xs">Waiting for traffic...</span>
          </div>
        ) : (
          sortedRequests.map((req, idx) => {
            const isSelected = selectedRequestId === req.id;
            const isPaused = req.isPaused;
            const highlightColor = getHighlightColor?.(req);

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
                data-testid="traffic-item"
                onClick={() => onSelectRequest(req.id)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onContextMenu(e, req.id);
                }}
                className={`h-[26px] flex items-center text-[12px] border-b border-[#3c3c3c]/30 cursor-pointer font-mono group ${bgColor} ${isSelected ? 'text-white' : 'text-[#cccccc]'}`}
                style={highlightColor && !isSelected && !isPaused ? { backgroundColor: highlightColor } : undefined}
              >
                {visibleColumns.map(col => (
                  <div 
                    key={col.id}
                    className={`flex items-center justify-center border-r border-[#3c3c3c]/30 h-full overflow-hidden ${col.id === 'url' ? 'justify-start pl-2' : ''}`}
                    style={{ 
                      width: col.id === 'url' ? undefined : col.width,
                      flex: col.id === 'url' ? 1 : undefined,
                      minWidth: col.minWidth
                    }}
                    data-column={col.id}
                  >
                    {renderCell(col, req, idx, isSelected)}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>
      
      {/* Column Config Menu */}
      {menuPosition && (
        <ColumnMenu
          columns={columns}
          position={menuPosition}
          onToggle={toggleColumn}
          onClose={() => setMenuPosition(null)}
        />
      )}
    </>
  );
};
