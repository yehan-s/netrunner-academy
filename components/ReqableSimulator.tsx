import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { NetworkRequest } from '../types';
import { downloadHAR, convertFromHAR } from '../utils/harConverter';
import { ContextMenu } from './reqable/ContextMenu';
import { KeyValEditor } from './reqable/KeyValEditor';
import { SidebarIcon, FilterChip } from './reqable/UIHelpers';
import { TrafficList } from './reqable/TrafficList';
import { TrafficDetail } from './reqable/TrafficDetail';
import { Composer } from './reqable/Composer';
import { SSLCertDialog } from './reqable/SSLCertDialog';
import { BreakpointDialog } from './reqable/BreakpointDialog';
import { BreakpointRules } from './reqable/BreakpointRules';
import { RewriteRules } from './reqable/RewriteRules';
import MapLocalRules from './reqable/MapLocalRules';
import GatewayRules from './reqable/GatewayRules';
import MirrorRules from './reqable/MirrorRules';
import HighlightRules, { getHighlightColor } from './reqable/HighlightRules';
import { ScriptEditor } from './reqable/ScriptEditor';
import NetworkThrottle from './reqable/NetworkThrottle';
import DiffViewer from './reqable/DiffViewer';
import AccessControl from './reqable/AccessControl';
import ProxyTerminal from './reqable/ProxyTerminal';
import TurboMode from './reqable/TurboMode';
import ReverseProxy from './reqable/ReverseProxy';
import { ProxyStatusBar } from './reqable/ProxyStatusBar';
import { TabBar, Tab } from './reqable/TabBar';
import { FilterTabs } from './reqable/FilterTabs';
import { StatusBar } from './reqable/StatusBar';
import { Explorer, useExplorerActions } from './reqable/Explorer';
import { CollectionManager, SaveToCollectionDialog, CollectionItem } from './reqable/CollectionManager';
import { Toolbox } from './reqable/Toolbox';
import {
  Play, Shield, Trash2, Search, Layers, PenTool, Settings, Code, Highlighter,
  ChevronRight, Star, Bookmark, Globe, FolderTree,
  Monitor, Clock, FileText, Hash, ArrowUpDown, MoreVertical,
  Plus, X, Send, Copy, RefreshCw, Zap, Circle, Square, Lock,
  Repeat, ExternalLink, Download, Eye, ChevronDown, Activity,
  Minus, CheckSquare, ToggleLeft, ToggleRight, Loader2, Check,
  AlertCircle, ArrowDown, ArrowUp, ArrowRight, Rocket, Calculator, Wrench, Smartphone, Wifi,
  Filter, Pause, FileJson, List, Table, History, MoreHorizontal,
  Gauge, GitCompare, Ban, Terminal, Server
} from 'lucide-react';
import { ObjectExplorer } from './ObjectExplorer';

// --- Theme Constants (匹配真实 Reqable 配色) ---
const COLORS = {
  bg: '#1e1e1e', // Main Background (Reqable 深灰)
  sidebar: '#252526', // Left Slim Sidebar
  panel: '#1e1e1e', // Panels
  header: '#252526', // Top bars
  border: '#3c3c3c',
  accent: '#4ec9b0', // Reqable Green (主强调色)
  text: '#cccccc',
  textDim: '#858585',
  selection: '#37373d', // 选中行背景
  hover: '#2a2d2e',
  green: '#4ec9b0',
  blue: '#569cd6',
  yellow: '#dcdcaa',
  orange: '#ce9178',
  red: '#f48771',
};

interface ReqableSimulatorProps {
  requests: NetworkRequest[];
  onClear: () => void;
  onComposerSend: (req: NetworkRequest) => void;
  breakpointActive: boolean;
  toggleBreakpoint: () => void;
  onResumeRequest: (id: string, modifiedBody?: string) => void;
  onDropRequest: (id: string) => void;
  onRuleEnable?: (type: 'rewrite' | 'script' | 'mapLocal', enabled: boolean) => void;
  onImportRequests?: (reqs: NetworkRequest[]) => void;
}

type MainView = 'traffic' | 'composer' | 'api_test' | 'script';
type ScriptTab = 'code' | 'console';
type ContentFilter = 'All' | 'Http' | 'Https' | 'Websocket' | 'HTTP1' | 'HTTP2' | 'JSON' | 'XML' | 'Text' | 'HTML' | 'JS' | '图片' | '媒体' | '二进制';

// --- Helper Components ---

export const ReqableSimulator: React.FC<ReqableSimulatorProps> = ({
  requests,
  onClear,
  onComposerSend,
  breakpointActive,
  toggleBreakpoint,
  onResumeRequest,
  onDropRequest,
  onRuleEnable,
  onImportRequests
}) => {
  // --- State ---
  const [activeSidebarItem, setActiveSidebarItem] = useState<'traffic' | 'collections' | 'history' | 'script' | 'toolbox'>('traffic');

  // Panel resize state
  const [leftPanelWidth, setLeftPanelWidth] = useState(55); // percentage
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle panel resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftPanelWidth(Math.min(Math.max(newWidth, 20), 80)); // Clamp between 20% and 80%
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Tabs
  const [tabs, setTabs] = useState<{ id: string, type: 'traffic' | 'composer' | 'script', title: string, data?: any }[]>([
    { id: 'tab-traffic', type: 'traffic', title: '调试' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-traffic');

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContentFilter>('All');
  const [searchText, setSearchText] = useState('');
  const [isRecording, setIsRecording] = useState(true);

  // Explorer State
  const [showExplorer, setShowExplorer] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedBookmark, setSelectedBookmark] = useState<string | null>(null);
  const { addBookmarkFromUrl, addFavoriteFromRequest } = useExplorerActions();

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, reqId: string } | null>(null);

  // Composer initial data (for "Edit in Composer" feature)
  const [composerInitialData, setComposerInitialData] = useState<{
    method?: string;
    url?: string;
    body?: string;
    headers?: { key: string, value: string, enabled: boolean }[];
  }>({});

  // SSL Certificate Dialog State
  const [showSSLDialog, setShowSSLDialog] = useState(false);

  // Breakpoint Dialog State
  const [pausedRequest, setPausedRequest] = useState<NetworkRequest | null>(null);
  
  // Breakpoint Rules Dialog State
  const [showBreakpointRules, setShowBreakpointRules] = useState(false);
  
  // Rewrite Rules Dialog State
  const [showRewriteRules, setShowRewriteRules] = useState(false);
  
  // Map Local Rules Dialog State
  const [showMapLocalRules, setShowMapLocalRules] = useState(false);

  // Gateway Rules Dialog State
  const [showGatewayRules, setShowGatewayRules] = useState(false);

  // Mirror Rules Dialog State
  const [showMirrorRules, setShowMirrorRules] = useState(false);

  // Script Editor Dialog State
  const [showScriptEditor, setShowScriptEditor] = useState(false);

  // Save to Collection Dialog State
  const [saveToCollectionRequest, setSaveToCollectionRequest] = useState<NetworkRequest | null>(null);

  // Highlight Rules Dialog State
  const [showHighlightRules, setShowHighlightRules] = useState(false);

  // Network Throttle Dialog State
  const [showNetworkThrottle, setShowNetworkThrottle] = useState(false);

  // Diff Viewer Dialog State
  const [showDiffViewer, setShowDiffViewer] = useState(false);

  // Access Control Dialog State
  const [showAccessControl, setShowAccessControl] = useState(false);

  // Proxy Terminal Dialog State
  const [showProxyTerminal, setShowProxyTerminal] = useState(false);

  // Turbo Mode Dialog State
  const [showTurboMode, setShowTurboMode] = useState(false);

  // Reverse Proxy Dialog State
  const [showReverseProxy, setShowReverseProxy] = useState(false);

  // HAR Import
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportHAR = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const har = JSON.parse(text);
      const importedRequests = convertFromHAR(har);
      
      if (onImportRequests) {
        onImportRequests(importedRequests);
      } else {
        // Fallback: use onComposerSend to add requests one by one
        importedRequests.forEach(req => onComposerSend(req));
      }

      // Reset input
      e.target.value = '';
    } catch (error) {
      alert('Failed to import HAR file. Please check the file format.');
      console.error('HAR import error:', error);
    }
  };

  const activeTab = tabs.find(t => t.id === activeTabId) || tabs[0];

  // Auto-detect paused requests and show breakpoint dialog
  useEffect(() => {
    const paused = requests.find(r => r.isPaused && !pausedRequest);
    if (paused) {
      setPausedRequest(paused);
    }
  }, [requests, pausedRequest]);

  // Breakpoint Dialog Actions
  const handleBreakpointContinue = (modifiedRequest: Partial<NetworkRequest>) => {
    if (!pausedRequest) return;
    const updatedRequest = {
      ...pausedRequest,
      ...modifiedRequest,
      isPaused: false
    };
    onResumeRequest(pausedRequest.id, modifiedRequest.requestBody);
    setPausedRequest(null);
  };

  const handleBreakpointContinueWithoutChanges = () => {
    if (!pausedRequest) return;
    onResumeRequest(pausedRequest.id);
    setPausedRequest(null);
  };

  const handleBreakpointBlock = () => {
    if (!pausedRequest) return;
    onDropRequest(pausedRequest.id);
    setPausedRequest(null);
  };

  // Actions
  const handleNewComposerTab = () => {
    const newId = `tab-comp-${Date.now()}`;
    setTabs(prev => [...prev, { id: newId, type: 'composer', title: 'New Request' }]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length === 1) return;
    const idx = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
    if (id === activeTabId) {
      setActiveTabId(newTabs[Math.max(0, idx - 1)].id);
    }
  };

  const selectedRequest = useMemo(() =>
    requests.find(r => r.id === selectedRequestId) || null
    , [requests, selectedRequestId]);

  // Filter Logic
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      // Search filter
      if (searchText) {
        const lower = searchText.toLowerCase();
        if (!req.url.toLowerCase().includes(lower) && !req.method.toLowerCase().includes(lower)) return false;
      }
      
      // Domain filter (from Explorer)
      if (selectedDomain) {
        try {
          const hostname = new URL(req.url).hostname;
          if (hostname !== selectedDomain) return false;
        } catch {
          return false;
        }
      }
      
      // Bookmark filter (URL pattern)
      if (selectedBookmark) {
        const pattern = selectedBookmark.replace(/\*/g, '.*').replace(/\?/g, '.');
        const regex = new RegExp(`^${pattern}$`, 'i');
        if (!regex.test(req.url)) return false;
      }
      
      // Content type filters
      if (filter === 'All') return true;
      if (filter === 'Http') return req.url.startsWith('http:') && !req.url.startsWith('ws');
      if (filter === 'Https') return req.url.startsWith('https:') && !req.url.startsWith('wss');
      if (filter === 'Websocket') return req.url.startsWith('ws');
      if (filter === 'JSON') return (req.responseHeaders['content-type'] || '').includes('json');
      if (filter === 'HTML') return (req.responseHeaders['content-type'] || '').includes('html');
      if (filter === 'JS') return (req.responseHeaders['content-type'] || '').includes('javascript');
      if (filter === '图片') return (req.responseHeaders['content-type'] || '').includes('image');
      return true;
    });
  }, [requests, filter, searchText, selectedDomain, selectedBookmark]);

  // --- UI Helpers ---

  const getMethodColor = (m: string) => {
    if (m === 'GET') return 'text-[#4ec9b0]';
    if (m === 'POST') return 'text-[#ce9178]';
    if (m === 'PUT') return 'text-[#569cd6]';
    if (m === 'DELETE') return 'text-[#f48771]';
    return 'text-[#cccccc]';
  };

  const getStatusColor = (s: number) => {
    if (s >= 200 && s < 300) return '#4ec9b0'; // Green
    if (s >= 300 && s < 400) return '#dcdcaa'; // Yellow
    if (s >= 400) return '#f48771'; // Red
    return '#888888';
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return ms + 'ms';
    return (ms / 1000).toFixed(2) + 's';
  };

  // --- Main Render ---

  return (
    <div className="h-full flex bg-[#1e1e1e] text-[#cccccc] font-sans select-none overflow-hidden" onClick={() => setContextMenu(null)}>

      {/* 1. Activity Bar (Left Slim Sidebar) */}
      <div className="w-[50px] bg-[#252526] flex flex-col items-center py-3 border-r border-[#3c3c3c] shrink-0 z-20">
        <SidebarIcon icon={Activity} active={activeSidebarItem === 'traffic' && !showExplorer} onClick={() => { setActiveSidebarItem('traffic'); setShowExplorer(false); }} color="#4ec9b0" />
        <SidebarIcon icon={Globe} active={showExplorer} onClick={() => setShowExplorer(!showExplorer)} color="#569cd6" />
        <SidebarIcon icon={FolderTree} active={activeSidebarItem === 'collections'} onClick={() => { setActiveSidebarItem('collections'); setShowExplorer(false); }} color="#dcb67a" />
        <SidebarIcon icon={History} active={activeSidebarItem === 'history'} onClick={() => { setActiveSidebarItem('history'); setShowExplorer(false); }} color="#ce9178" />
        <SidebarIcon icon={Code} active={activeSidebarItem === 'script'} onClick={() => { setActiveSidebarItem('script'); setShowExplorer(false); }} color="#4ec9b0" />
        <SidebarIcon icon={Wrench} active={activeSidebarItem === 'toolbox'} onClick={() => { setActiveSidebarItem('toolbox'); setShowExplorer(false); }} color="#c586c0" />
        <div className="flex-1" />
        <SidebarIcon icon={Settings} active={false} onClick={() => setShowSSLDialog(true)} />
      </div>

      {/* Explorer Panel */}
      {showExplorer && activeSidebarItem === 'traffic' && (
        <Explorer
          requests={requests}
          onSelectRequest={(id) => setSelectedRequestId(id)}
          onFilterByDomain={setSelectedDomain}
          onFilterByBookmark={setSelectedBookmark}
          selectedDomain={selectedDomain}
          selectedBookmark={selectedBookmark}
        />
      )}

      {/* 1.5 Side Panel (Explorer) */}
      {activeSidebarItem !== 'traffic' && (
        <div className="w-[250px] bg-[#252526] border-r border-[#3c3c3c] flex flex-col min-h-0">
          <div className="h-9 flex items-center px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#3c3c3c] shrink-0">
            {activeSidebarItem === 'collections' && 'Collections'}
            {activeSidebarItem === 'history' && 'History'}
            {activeSidebarItem === 'script' && 'Scripts'}
            {activeSidebarItem === 'toolbox' && 'Toolbox'}
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {activeSidebarItem === 'collections' && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-2 py-1 text-gray-300 hover:bg-[#37373d] rounded cursor-pointer text-xs" onClick={handleNewComposerTab}>
                  <FolderTree size={14} className="text-[#dcb67a]" />
                  <span>My API Project</span>
                </div>
                <div className="pl-6 flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-2 py-1 text-gray-400 hover:bg-[#37373d] rounded cursor-pointer text-xs" onClick={() => {
                    setComposerInitialData({
                      url: 'https://api.example.com/users',
                      method: 'GET',
                      body: '',
                      headers: [{ key: '', value: '', enabled: true }]
                    });
                    handleNewComposerTab();
                  }}>
                    <span className="text-[10px] font-bold text-[#4ec9b0]">GET</span>
                    <span>List Users</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 text-gray-400 hover:bg-[#37373d] rounded cursor-pointer text-xs" onClick={() => {
                    setComposerInitialData({
                      url: 'https://api.example.com/login',
                      method: 'POST',
                      body: '',
                      headers: [{ key: '', value: '', enabled: true }]
                    });
                    handleNewComposerTab();
                  }}>
                    <span className="text-[10px] font-bold text-[#ce9178]">POST</span>
                    <span>Login</span>
                  </div>
                </div>
              </div>
            )}

            {activeSidebarItem === 'script' && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 px-2 py-1 text-gray-300 hover:bg-[#37373d] rounded cursor-pointer text-xs" onClick={() => {
                  const newId = `tab-script-${Date.now()}`;
                  setTabs(prev => [...prev, { id: newId, type: 'script', title: 'auth_hook.py', data: { code: '# Python Script\ndef onRequest(context, request):\n    # Add auth header\n    request.headers["Authorization"] = "Bearer token"\n    return request' } }]);
                  setActiveTabId(newId);
                }}>
                  <FileText size={14} className="text-[#4ec9b0]" />
                  <span>auth_hook.py</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1 text-gray-300 hover:bg-[#37373d] rounded cursor-pointer text-xs" onClick={() => {
                  const newId = `tab-script-${Date.now()}`;
                  setTabs(prev => [...prev, { id: newId, type: 'script', title: 'log_response.py', data: { code: '# Python Script\ndef onResponse(context, response):\n    print(response.status)\n    return response' } }]);
                  setActiveTabId(newId);
                }}>
                  <FileText size={14} className="text-[#4ec9b0]" />
                  <span>log_response.py</span>
                </div>
              </div>
            )}

            {activeSidebarItem === 'history' && (
              <div className="text-xs text-gray-500 text-center mt-4">No history yet</div>
            )}

            {activeSidebarItem === 'toolbox' && (
              <div className="text-xs text-gray-500 text-center mt-4">Select a tool from the main panel</div>
            )}
          </div>
        </div>
      )}

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">

        {/* 2.1 Top Header - Reqable 风格顶部栏 */}
        <div className="h-11 bg-[#252526] border-b border-[#3c3c3c] flex items-center px-3 gap-2 shrink-0">
          {/* 代理状态栏 */}
          <ProxyStatusBar
            isRecording={isRecording}
            onToggleRecording={() => setIsRecording(!isRecording)}
          />

          <div className="flex-1" />

          {/* 工具栏 - 按功能分组 */}
          <div className="flex items-center gap-0.5">
            {/* 调试工具组 */}
            <button
              data-testid="reqable-tab-composer"
              onClick={handleNewComposerTab}
              className="p-1.5 text-[#858585] hover:text-[#cccccc] rounded hover:bg-[#37373d] transition-colors"
              title="Composer"
            >
              <PenTool size={15} />
            </button>
            <button
              onClick={toggleBreakpoint}
              className={`p-1.5 rounded hover:bg-[#37373d] transition-colors ${breakpointActive ? 'text-[#f48771] bg-[#37373d]' : 'text-[#858585] hover:text-[#cccccc]'}`}
              title="Breakpoints"
            >
              <Pause size={15} fill={breakpointActive ? "currentColor" : "none"} />
            </button>
            
            <div className="w-px h-4 bg-[#3c3c3c] mx-1" />
            
            {/* 规则配置组 */}
            <button onClick={() => setShowBreakpointRules(true)} className="p-1.5 text-[#858585] hover:text-[#cccccc] rounded hover:bg-[#37373d]" title="Breakpoint Rules"><List size={15} /></button>
            <button onClick={() => setShowRewriteRules(true)} className="p-1.5 text-[#858585] hover:text-[#cccccc] rounded hover:bg-[#37373d]" title="Rewrite"><RefreshCw size={15} /></button>
            <button onClick={() => setShowMapLocalRules(true)} className="p-1.5 text-[#858585] hover:text-[#cccccc] rounded hover:bg-[#37373d]" title="Map Local"><FolderTree size={15} /></button>
            <button onClick={() => setShowGatewayRules(true)} className="p-1.5 text-[#858585] hover:text-[#cccccc] rounded hover:bg-[#37373d]" title="Gateway"><Shield size={15} /></button>
            
            <div className="w-px h-4 bg-[#3c3c3c] mx-1" />
            
            {/* 高级功能组 */}
            <button onClick={() => setShowMirrorRules(true)} className="p-1.5 text-[#858585] hover:text-[#cccccc] rounded hover:bg-[#37373d]" title="Mirror"><ArrowRight size={15} /></button>
            <button onClick={() => setShowHighlightRules(true)} className="p-1.5 text-[#858585] hover:text-[#cccccc] rounded hover:bg-[#37373d]" title="Highlight"><Highlighter size={15} /></button>
            <button onClick={() => setShowNetworkThrottle(true)} className="p-1.5 text-[#858585] hover:text-[#cccccc] rounded hover:bg-[#37373d]" title="Throttle"><Gauge size={15} /></button>
            <button onClick={() => setShowDiffViewer(true)} className="p-1.5 text-[#858585] hover:text-[#cccccc] rounded hover:bg-[#37373d]" title="Diff"><GitCompare size={15} /></button>
            
            <div className="w-px h-4 bg-[#3c3c3c] mx-1" />
            
            {/* 导入导出组 */}
            <button onClick={() => downloadHAR(requests)} className="p-1.5 text-[#858585] hover:text-[#cccccc] rounded hover:bg-[#37373d]" title="Export HAR"><Download size={15} /></button>
            <button onClick={handleImportHAR} className="p-1.5 text-[#858585] hover:text-[#cccccc] rounded hover:bg-[#37373d]" title="Import HAR"><FileJson size={15} /></button>
          </div>
          
          {/* Hidden File Input for HAR Import */}
          <input 
            ref={fileInputRef}
            type="file"
            accept=".har,application/json"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* 清空按钮 */}
          <button 
            onClick={onClear} 
            className="p-1.5 text-[#858585] hover:text-[#f48771] rounded hover:bg-[#37373d] transition-colors ml-1"
            title="Clear"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* 2.2 Tab Bar - 使用新组件 */}
        <TabBar
          tabs={tabs as Tab[]}
          activeTabId={activeTabId}
          requestCount={filteredRequests.length}
          onSelectTab={setActiveTabId}
          onCloseTab={(id) => {
            if (tabs.length > 1) {
              const newTabs = tabs.filter(t => t.id !== id);
              setTabs(newTabs);
              if (activeTabId === id) {
                setActiveTabId(newTabs[0].id);
              }
            }
          }}
          onNewTab={handleNewComposerTab}
        />

        {/* 2.3 Main Workspace */}
        {activeTab.type === 'traffic' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Filters - 使用新的 FilterTabs 组件 */}
            <FilterTabs
              activeFilter={filter}
              onFilterChange={(f) => setFilter(f as ContentFilter)}
              searchText={searchText}
              onSearchChange={setSearchText}
            />

            {/* Traffic List & Details Split */}
            <div ref={containerRef} className="flex-1 flex min-h-0 relative">

              {/* LEFT PANE: Request List Table */}
              <div 
                className="flex flex-col min-w-0 border-r border-[#3c3c3c]"
                style={{ width: selectedRequest ? `${leftPanelWidth}%` : '100%' }}
              >
                <TrafficList
                  filteredRequests={filteredRequests}
                  selectedRequestId={selectedRequestId}
                  onSelectRequest={(id) => setSelectedRequestId(id)}
                  onContextMenu={(e, reqId) => setContextMenu({ x: e.clientX, y: e.clientY, reqId })}
                  onResumeRequest={onResumeRequest}
                  onDropRequest={onDropRequest}
                  getMethodColor={getMethodColor}
                  getStatusColor={getStatusColor}
                  getHighlightColor={getHighlightColor}
                  formatSize={formatSize}
                  formatTime={formatTime}
                />
              </div>

              {/* RESIZE HANDLE */}
              {selectedRequest && (
                <div
                  onMouseDown={handleMouseDown}
                  className={`w-1 cursor-col-resize hover:bg-[#4ec9b0]/50 active:bg-[#4ec9b0] transition-colors z-10 ${isDragging ? 'bg-[#4ec9b0]' : 'bg-transparent'}`}
                  style={{ marginLeft: '-2px', marginRight: '-2px' }}
                />
              )}

              {/* RIGHT PANE: Inspector (Details) */}
              {selectedRequest && (
                <TrafficDetail
                  selectedRequest={selectedRequest}
                  getMethodColor={getMethodColor}
                  getStatusColor={getStatusColor}
                  formatSize={formatSize}
                />
              )}
            </div>

            {/* 底部状态栏 */}
            <StatusBar
              totalCount={filteredRequests.length}
              selectedCount={selectedRequest ? 1 : 0}
              protocol={selectedRequest?.protocol}
              statusCode={selectedRequest?.status}
            />
          </div>
        )}

        {/* 2.4 Composer View */}
        {activeTab.type === 'composer' && (
          <Composer
            onSend={onComposerSend}
            onSwitchToTraffic={() => setActiveTabId('tab-traffic')}
            onSaveToCollection={(req) => setSaveToCollectionRequest(req)}
            getMethodColor={getMethodColor}
            initialMethod={composerInitialData.method}
            initialUrl={composerInitialData.url}
            initialBody={composerInitialData.body}
            initialHeaders={composerInitialData.headers}
          />
        )}

        {/* 2.5 Script Editor View */}
        {activeTab.type === 'script' && (
          <div className="flex-1 flex flex-col bg-[#1e1e1e] min-h-0">
            <div className="flex-1 relative">
              <textarea
                className="w-full h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-xs p-4 resize-none outline-none"
                value={activeTab.data?.code || ''}
                onChange={(e) => {
                  const newTabs = tabs.map(t => t.id === activeTabId ? { ...t, data: { ...t.data, code: e.target.value } } : t);
                  setTabs(newTabs);
                }}
                spellCheck={false}
              />
              <div className="absolute bottom-4 right-4 bg-[#252526] border border-[#333] rounded px-4 py-2 text-xs text-gray-400 shadow-xl">
                Python 3.9 Environment
              </div>
            </div>
          </div>
        )}

        {/* 2.5 Script View */}
        {activeSidebarItem === 'script' && (
          <div className="flex-1 flex flex-col bg-[#1e1e1e] min-h-0">
            <div className="h-12 bg-[#252526] border-b border-[#333] flex items-center px-4 shrink-0 justify-between">
              <span className="font-bold text-[#cccccc] text-sm">Scripting Console</span>
              <button
                onClick={() => setShowScriptEditor(true)}
                className="px-3 py-1 bg-[#0e639c] hover:bg-[#1177bb] text-xs text-white rounded border border-[#0e639c] flex items-center gap-2"
              >
                <Plus size={12} /> Manage Scripts
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto flex flex-col items-center justify-center">
              <div className="text-center">
                <Code size={48} className="text-[#3c3c3c] mx-auto mb-4" />
                <div className="text-sm text-gray-400 mb-2">No Scripts Configured</div>
                <div className="text-xs text-gray-500 mb-4">
                  Scripts can intercept and modify HTTP requests/responses
                </div>
                <button
                  onClick={() => setShowScriptEditor(true)}
                  className="px-4 py-2 bg-[#333] hover:bg-[#444] text-xs text-white rounded border border-[#444] flex items-center gap-2 mx-auto"
                >
                  <Plus size={12} /> Create Script
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2.6 Collections View */}
        {activeSidebarItem === 'collections' && (
          <div className="flex-1 flex flex-col bg-[#1e1e1e] min-h-0">
            <CollectionManager
              onOpenRequest={(item: CollectionItem) => {
                // 打开请求到 Composer
                const newTab = {
                  id: `tab-composer-${Date.now()}`,
                  type: 'composer' as const,
                  title: item.name || 'Composer',
                  data: {
                    method: item.method,
                    url: item.url,
                    headers: item.headers ? Object.entries(item.headers).map(([key, value]) => ({ key, value, enabled: true })) : [],
                    body: item.body
                  }
                };
                setTabs(prev => [...prev, newTab]);
                setActiveTabId(newTab.id);
              }}
              onSendRequest={(req) => {
                // 直接发送请求
                setComposerInitialData({
                  method: req.method,
                  url: req.url,
                  body: req.requestBody,
                  headers: req.requestHeaders ? Object.entries(req.requestHeaders).map(([key, value]) => ({ key, value, enabled: true })) : []
                });
                const newTab = {
                  id: `tab-composer-${Date.now()}`,
                  type: 'composer' as const,
                  title: 'Quick Send'
                };
                setTabs(prev => [...prev, newTab]);
                setActiveTabId(newTab.id);
              }}
            />
          </div>
        )}

        {/* 2.7 Toolbox View */}
        {activeSidebarItem === 'toolbox' && (
          <div className="flex-1 flex flex-col bg-[#1e1e1e] min-h-0">
            <Toolbox />
          </div>
        )}

      </div>

      {/* 3. Bottom Status Bar */}
      <div className="absolute bottom-0 w-full h-6 bg-[#007acc] flex items-center px-3 text-[10px] text-white z-30">
        <span>{isRecording ? '● Recording' : '○ Paused'}</span>
        <div className="w-px h-3 bg-white/30 mx-3" />
        <span>{requests.length} requests</span>
        {selectedRequest && (
          <>
            <div className="w-px h-3 bg-white/30 mx-3" />
            <span>{formatSize(selectedRequest.size || 0)} / {selectedRequest.time || 0}ms</span>
          </>
        )}
        <div className="flex-1" />
        <span className="mr-4">UTF-8</span>
        <span>{breakpointActive ? '⬤ Breakpoint Active' : 'Breakpoint Off'}</span>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          actions={[
            {
              label: 'Copy URL',
              onClick: () => {
                const req = requests.find(r => r.id === contextMenu.reqId);
                if (req) navigator.clipboard.writeText(req.url);
              },
              icon: Copy
            },
            {
              label: 'Copy cURL',
              onClick: () => {
                const req = requests.find(r => r.id === contextMenu.reqId);
                if (req) {
                  let curl = `curl -X ${req.method} "${req.url}"`;
                  Object.entries(req.requestHeaders || {}).forEach(([k, v]) => {
                    curl += ` -H "${k}: ${v}"`;
                  });
                  if (req.requestBody) {
                    curl += ` -d '${req.requestBody}'`;
                  }
                  navigator.clipboard.writeText(curl);
                }
              },
              icon: Code
            },
            {
              label: 'Repeat Request',
              onClick: () => {
                const req = requests.find(r => r.id === contextMenu.reqId);
                if (req) {
                  // Clone and resend
                  const newReq = { ...req, id: 'rep-' + Date.now(), status: 0, time: 0, size: 0, timestamp: Date.now() };
                  onComposerSend(newReq);
                }
              },
              icon: Repeat
            },
            {
              label: 'Edit in Composer', onClick: () => {
                const req = requests.find(r => r.id === contextMenu.reqId);
                if (req) {
                  // Populate headers
                  const headers = Object.entries(req.requestHeaders || {}).map(([key, value]) => ({ key, value: value as string, enabled: true }));
                  if (headers.length === 0) headers.push({ key: '', value: '', enabled: true });

                  setComposerInitialData({
                    url: req.url,
                    method: req.method,
                    body: req.requestBody || '',
                    headers
                  });

                  handleNewComposerTab();
                }
              }, icon: PenTool
            },
            {
              label: 'Add to Bookmark',
              onClick: () => {
                const req = requests.find(r => r.id === contextMenu.reqId);
                if (req) addBookmarkFromUrl(req.url);
              },
              icon: Bookmark
            },
            {
              label: 'Add to Favorite',
              onClick: () => {
                const req = requests.find(r => r.id === contextMenu.reqId);
                if (req) addFavoriteFromRequest(req);
              },
              icon: Star
            },
            {
              label: 'Save to Collection',
              onClick: () => {
                const req = requests.find(r => r.id === contextMenu.reqId);
                if (req) setSaveToCollectionRequest(req);
              },
              icon: FolderTree
            },
            { label: 'Delete', onClick: () => onDropRequest(contextMenu.reqId), icon: Trash2, shortcut: 'Del' }
          ]}
        />
      )}

      {/* SSL Certificate Dialog */}
      {showSSLDialog && (
        <SSLCertDialog onClose={() => setShowSSLDialog(false)} />
      )}

      {/* Breakpoint Dialog */}
      {pausedRequest && (
        <BreakpointDialog
          request={pausedRequest}
          onContinue={handleBreakpointContinue}
          onContinueWithoutChanges={handleBreakpointContinueWithoutChanges}
          onBlock={handleBreakpointBlock}
        />
      )}

      {/* Breakpoint Rules Dialog */}
      {showBreakpointRules && (
        <BreakpointRules onClose={() => setShowBreakpointRules(false)} />
      )}

      {/* Rewrite Rules Dialog */}
      {showRewriteRules && (
        <RewriteRules isOpen={showRewriteRules} onClose={() => setShowRewriteRules(false)} />
      )}

      {/* Map Local Rules Dialog */}
      {showMapLocalRules && (
        <MapLocalRules onClose={() => setShowMapLocalRules(false)} />
      )}

      {/* Gateway Rules Dialog */}
      {showGatewayRules && (
        <GatewayRules onClose={() => setShowGatewayRules(false)} />
      )}

      {/* Mirror Rules Dialog */}
      {showMirrorRules && (
        <MirrorRules onClose={() => setShowMirrorRules(false)} />
      )}

      {/* Script Editor Dialog */}
      {showScriptEditor && (
        <ScriptEditor onClose={() => setShowScriptEditor(false)} />
      )}

      {/* Highlight Rules Dialog */}
      {showHighlightRules && (
        <HighlightRules onClose={() => setShowHighlightRules(false)} />
      )}

      {/* Network Throttle Dialog */}
      {showNetworkThrottle && (
        <NetworkThrottle onClose={() => setShowNetworkThrottle(false)} />
      )}

      {/* Diff Viewer Dialog */}
      {showDiffViewer && (
        <DiffViewer requests={requests} onClose={() => setShowDiffViewer(false)} />
      )}

      {/* Access Control Dialog */}
      {showAccessControl && (
        <AccessControl onClose={() => setShowAccessControl(false)} />
      )}

      {/* Proxy Terminal Dialog */}
      {showProxyTerminal && (
        <ProxyTerminal onClose={() => setShowProxyTerminal(false)} />
      )}

      {/* Turbo Mode Dialog */}
      {showTurboMode && (
        <TurboMode onClose={() => setShowTurboMode(false)} />
      )}

      {/* Reverse Proxy Dialog */}
      {showReverseProxy && (
        <ReverseProxy onClose={() => setShowReverseProxy(false)} />
      )}

      {/* Save to Collection Dialog */}
      {saveToCollectionRequest && (
        <SaveToCollectionDialog
          request={saveToCollectionRequest}
          onClose={() => setSaveToCollectionRequest(null)}
          onSaved={() => setSaveToCollectionRequest(null)}
        />
      )}

    </div>
  );
};

// Dummy Icon for volume mute
const VolumeXIcon = ({ size }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <line x1="23" y1="9" x2="17" y2="15" />
    <line x1="17" y1="9" x2="23" y2="15" />
  </svg>
)