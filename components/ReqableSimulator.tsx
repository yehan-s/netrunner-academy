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
import {
  Play, Shield, Trash2, Search, Layers, PenTool, Settings, Code, Highlighter,
  ChevronRight, Star, Bookmark, Globe, FolderTree,
  Monitor, Clock, FileText, Hash, ArrowUpDown, MoreVertical,
  Plus, X, Send, Copy, RefreshCw, Zap, Circle, Square, Lock,
  Repeat, ExternalLink, Download, Eye, ChevronDown, Activity,
  Minus, CheckSquare, ToggleLeft, ToggleRight, Loader2, Check,
  AlertCircle, ArrowDown, ArrowUp, ArrowRight, Rocket, Calculator, Wrench, Smartphone, Wifi,
  Filter, Pause, FileJson, List, Table, History, MoreHorizontal
} from 'lucide-react';
import { ObjectExplorer } from './ObjectExplorer';

// --- Theme Constants (Pixel Peeping) ---
const COLORS = {
  bg: '#181818', // Main Background
  sidebar: '#202020', // Left Slim Sidebar
  panel: '#1e1e1e', // Panels
  header: '#252526', // Top bars
  border: '#333333',
  accent: '#fcd34d', // Reqable Yellow
  text: '#cccccc',
  textDim: '#888888',
  selection: '#264f78', // VS Code style selection
  hover: '#2a2d2e',
  green: '#4ec9b0',
  blue: '#569cd6',
  yellow: '#dcdcaa',
  orange: '#ce9178',
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
  const [activeSidebarItem, setActiveSidebarItem] = useState<'traffic' | 'collections' | 'history' | 'script'>('traffic');

  // Tabs
  const [tabs, setTabs] = useState<{ id: string, type: 'traffic' | 'composer' | 'script', title: string, data?: any }[]>([
    { id: 'tab-traffic', type: 'traffic', title: '调试' }
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-traffic');

  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [filter, setFilter] = useState<ContentFilter>('All');
  const [searchText, setSearchText] = useState('');
  const [isRecording, setIsRecording] = useState(true);

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

  // Highlight Rules Dialog State
  const [showHighlightRules, setShowHighlightRules] = useState(false);

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
      if (searchText) {
        const lower = searchText.toLowerCase();
        if (!req.url.toLowerCase().includes(lower) && !req.method.toLowerCase().includes(lower)) return false;
      }
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
  }, [requests, filter, searchText]);

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
      <div className="w-[50px] bg-[#252526] flex flex-col items-center py-3 border-r border-[#111] shrink-0 z-20">
        <SidebarIcon icon={Activity} active={activeSidebarItem === 'traffic'} onClick={() => setActiveSidebarItem('traffic')} color="#fcd34d" />
        <SidebarIcon icon={FolderTree} active={activeSidebarItem === 'collections'} onClick={() => setActiveSidebarItem('collections')} color="#569cd6" />
        <SidebarIcon icon={History} active={activeSidebarItem === 'history'} onClick={() => setActiveSidebarItem('history')} color="#ce9178" />
        <SidebarIcon icon={Code} active={activeSidebarItem === 'script'} onClick={() => setActiveSidebarItem('script')} color="#4ec9b0" />
        <div className="flex-1" />
        <SidebarIcon icon={Wrench} active={false} onClick={() => {}} />
        <SidebarIcon icon={Settings} active={false} onClick={() => setShowSSLDialog(true)} />
      </div>

      {/* 1.5 Side Panel (Explorer) */}
      {activeSidebarItem !== 'traffic' && (
        <div className="w-[250px] bg-[#252526] border-r border-[#111] flex flex-col min-h-0">
          <div className="h-9 flex items-center px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-[#111] shrink-0">
            {activeSidebarItem === 'collections' && 'Collections'}
            {activeSidebarItem === 'history' && 'History'}
            {activeSidebarItem === 'script' && 'Scripts'}
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
          </div>
        </div>
      )}

      {/* 2. Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">

        {/* 2.1 Top Header */}
        <div className="h-12 bg-[#252526] border-b border-[#111] flex items-center px-3 gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] rounded-full border border-[#333] shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-[#4ec9b0] shadow-[0_0_5px_#4ec9b0]' : 'bg-gray-500'}`} />
            <span className="text-[11px] font-medium text-gray-300 tracking-wide">
              Proxying on 127.0.0.1:8888
            </span>
            <AlertCircle size={12} className="text-yellow-500 ml-1" />
            <Smartphone size={12} className="text-gray-400 ml-1" />
            <PenTool size={12} className="text-gray-400" />
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-1 mr-2">
            <button
              data-testid="reqable-tab-composer"
              onClick={handleNewComposerTab}
              className="p-1.5 text-gray-400 hover:text-[#fcd34d] rounded hover:bg-[#333] transition-colors"
              title="New Composer Tab"
            >
              <PenTool size={16} />
            </button>
            <div className="w-px h-4 bg-[#333] mx-1" />
            <button
              onClick={toggleBreakpoint}
              className={`p-1.5 rounded hover:bg-[#333] transition-colors ${breakpointActive ? 'text-[#f48771] bg-[#333]' : 'text-gray-400 hover:text-white'}`}
              title="Toggle Breakpoints"
            >
              <Pause size={16} fill={breakpointActive ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => setShowBreakpointRules(true)}
              className="p-1.5 text-gray-400 hover:text-[#fcd34d] rounded hover:bg-[#333] transition-colors"
              title="Breakpoint Rules"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setShowRewriteRules(true)}
              className="p-1.5 text-gray-400 hover:text-[#fcd34d] rounded hover:bg-[#333] transition-colors"
              title="Rewrite Rules"
            >
              <RefreshCw size={16} />
            </button>
            <button
              onClick={() => setShowMapLocalRules(true)}
              className="p-1.5 text-gray-400 hover:text-[#fcd34d] rounded hover:bg-[#333] transition-colors"
              title="Map Local Rules"
            >
              <FolderTree size={16} />
            </button>
            <div className="w-px h-4 bg-[#333] mx-1" />
            <button
              onClick={() => setShowGatewayRules(true)}
              className="p-1.5 text-gray-400 hover:text-[#fcd34d] rounded hover:bg-[#333] transition-colors"
              title="Gateway Rules"
            >
              <Shield size={16} />
            </button>
            <button
              onClick={() => setShowMirrorRules(true)}
              className="p-1.5 text-gray-400 hover:text-[#fcd34d] rounded hover:bg-[#333] transition-colors"
              title="Mirror Rules"
            >
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => setShowHighlightRules(true)}
              className="p-1.5 text-gray-400 hover:text-[#fcd34d] rounded hover:bg-[#333] transition-colors"
              title="Highlight Rules"
            >
              <Highlighter size={16} />
            </button>
            <button className="p-1.5 text-gray-400 hover:text-white rounded hover:bg-[#333]"><Filter size={16} /></button>
            <button 
              onClick={() => downloadHAR(requests)}
              className="p-1.5 text-gray-400 hover:text-[#fcd34d] rounded hover:bg-[#333] transition-colors"
              title="Export as HAR"
            >
              <Download size={16} />
            </button>
            <button 
              onClick={handleImportHAR}
              className="p-1.5 text-gray-400 hover:text-[#fcd34d] rounded hover:bg-[#333] transition-colors"
              title="Import HAR"
            >
              <FileJson size={16} />
            </button>
          </div>
          
          {/* Hidden File Input for HAR Import */}
          <input 
            ref={fileInputRef}
            type="file"
            accept=".har,application/json"
            className="hidden"
            onChange={handleFileChange}
          />

          <button
            onClick={() => setIsRecording(!isRecording)}
            className="h-8 px-6 bg-[#fcd34d] hover:bg-[#fbbf24] text-black text-[13px] font-bold rounded-[4px] transition-colors flex items-center justify-center shadow-sm active:translate-y-0.5"
          >
            {isRecording ? '停止' : '开始'}
          </button>

          <button onClick={onClear} className="h-8 w-8 flex items-center justify-center bg-[#333] hover:bg-[#444] text-gray-300 rounded-[4px] ml-1">
            <Trash2 size={16} />
          </button>
        </div>

        {/* 2.2 Dynamic Tab Bar */}
        <div className="h-9 bg-[#252526] border-b border-[#111] flex items-center px-2 pt-1 gap-1 shrink-0 overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`relative group px-3 py-1.5 min-w-[100px] max-w-[200px] text-[12px] rounded-t border-t-2 cursor-pointer flex items-center gap-2 select-none ${activeTabId === tab.id
                ? 'bg-[#1e1e1e] text-[#fcd34d] border-[#fcd34d] font-medium'
                : 'text-gray-500 hover:text-gray-300 border-transparent hover:bg-[#333]'
                }`}
            >
              {tab.type === 'traffic' && <Wifi size={12} />}
              {tab.type === 'composer' && <PenTool size={12} />}
              {tab.type === 'script' && <Code size={12} />}
              <span className="truncate">{tab.title}</span>
              {tab.type !== 'traffic' && (
                <button
                  onClick={(e) => handleCloseTab(tab.id, e)}
                  className="ml-auto opacity-0 group-hover:opacity-100 hover:text-white"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}

          <button
            onClick={handleNewComposerTab}
            className="w-6 h-6 flex items-center justify-center text-gray-500 hover:bg-[#333] hover:text-white rounded ml-1 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* 2.3 Main Workspace */}
        {activeTab.type === 'traffic' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Filters */}
            <div className="h-9 bg-[#1e1e1e] border-b border-[#333] flex items-center px-3 gap-2 shrink-0">
              <FilterChip label="All" active={filter === 'All'} onClick={() => setFilter('All')} />
              <div className="w-px h-3 bg-[#333] mx-0.5" />
              <FilterChip label="Http" active={filter === 'Http'} onClick={() => setFilter('Http')} />
              <FilterChip label="Https" active={filter === 'Https'} onClick={() => setFilter('Https')} />
              <FilterChip label="Websocket" active={filter === 'Websocket'} onClick={() => setFilter('Websocket')} />
              <div className="w-px h-3 bg-[#333] mx-0.5" />
              <FilterChip label="JSON" active={filter === 'JSON'} onClick={() => setFilter('JSON')} />
              <FilterChip label="图片" active={filter === '图片'} onClick={() => setFilter('图片')} />

              <div className="flex-1" />

              <div className="relative">
                <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search..."
                  className="bg-[#252526] border border-[#333] rounded-full pl-7 pr-3 py-0.5 text-[11px] text-gray-300 outline-none focus:border-[#555] w-40"
                />
              </div>
            </div>

            {/* Traffic List & Details Split */}
            <div className="flex-1 flex min-h-0">

              {/* LEFT PANE: Request List Table */}
              <div className={`flex flex-col min-w-0 border-r border-[#333] ${selectedRequest ? 'w-[55%]' : 'flex-1'}`}>
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
          </div>
        )}

        {/* 2.4 Composer View */}
        {activeTab.type === 'composer' && (
          <Composer
            onSend={onComposerSend}
            onSwitchToTraffic={() => setActiveTabId('tab-traffic')}
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
                className="px-3 py-1 bg-[#333] hover:bg-[#444] text-xs text-white rounded border border-[#444] flex items-center gap-2"
              >
                <Plus size={12} /> Manage Scripts
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto">
              <div className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wider">Active Scripts</div>
              <div className="flex items-center gap-3 p-3 bg-[#252526] rounded border border-[#333] hover:border-[#4ec9b0]/50 transition-colors group">
                <div className="bg-[#2d2d2d] p-2 rounded text-[#4ec9b0] group-hover:bg-[#4ec9b0]/10">
                  <Code size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-gray-200 flex items-center gap-2">
                    Case_Logic_Bypass.py
                    <span className="px-1.5 py-0.5 rounded bg-[#333] text-[10px] text-gray-400 font-mono">*.demo</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Auto-injected by Game Engine for current level logic</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    onChange={(e) => onRuleEnable?.('script', e.target.checked)}
                    defaultChecked={false}
                  />
                  <div className="w-8 h-4 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#4ec9b0]"></div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* 2.6 Collections View */}
        {activeSidebarItem === 'collections' && (
          <div className="flex-1 flex flex-col bg-[#1e1e1e] min-h-0">
            <div className="h-12 bg-[#252526] border-b border-[#333] flex items-center px-4 shrink-0 justify-between">
              <span className="font-bold text-[#cccccc] text-sm">Collections</span>
              <div className="flex gap-1">
                <button className="p-1 hover:bg-[#333] rounded text-gray-400"><Plus size={14} /></button>
                <button className="p-1 hover:bg-[#333] rounded text-gray-400"><MoreHorizontal size={14} /></button>
              </div>
            </div>
            <div className="p-2 flex-1 overflow-auto">
              <div className="flex items-center gap-2 p-2 hover:bg-[#2a2d2e] rounded cursor-pointer text-gray-300 text-xs">
                <ChevronRight size={14} className="text-gray-500" />
                <FolderTree size={14} className="text-[#dcdcaa]" />
                <span>NetRunner API</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-[#2a2d2e] rounded cursor-pointer text-gray-300 text-xs pl-6">
                <span className="text-[#4ec9b0] font-bold text-[10px] w-8">GET</span>
                <span>User Profile</span>
              </div>
              <div className="flex items-center gap-2 p-2 hover:bg-[#2a2d2e] rounded cursor-pointer text-gray-300 text-xs pl-6">
                <span className="text-[#ce9178] font-bold text-[10px] w-8">POST</span>
                <span>Login</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 3. Bottom Status Bar */}
      <div className="absolute bottom-0 w-full h-6 bg-[#007acc] flex items-center px-3 text-[10px] text-white z-30">
        <span>Ready</span>
        <div className="flex-1" />
        <span className="mr-4">UTF-8</span>
        <span>Ln 44, Col 12</span>
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