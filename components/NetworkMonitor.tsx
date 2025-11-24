
import React, { useState, useEffect, useRef } from 'react';
import { NetworkRequest, CaseStudy } from '../types';
import { X, Ban, Settings, ChevronDown, Filter, Search, PanelBottom, PanelRight, FileCode, Eye, Sidebar, Wifi, Download, Upload, PanelLeft } from 'lucide-react';
import { ObjectExplorer } from './ObjectExplorer';

interface NetworkMonitorProps {
  requests: NetworkRequest[];
  onClear: () => void;
  dockSide: 'bottom' | 'right';
  onDockChange: (side: 'bottom' | 'right') => void;
  onClose: () => void;
  activeCase?: CaseStudy;
  onConsoleCommand?: (cmd: string) => void;
}

export const NetworkMonitor: React.FC<NetworkMonitorProps> = ({ 
    requests, 
    onClear, 
    dockSide, 
    onDockChange, 
    onClose,
    activeCase,
    onConsoleCommand
}) => {
  const [mainTab, setMainTab] = useState<'Elements' | 'Console' | 'Sources' | 'Network' | 'Performance'>('Network');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeInspectorTab, setActiveInspectorTab] = useState<'Headers' | 'Response' | 'Preview'>('Headers');
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  
  // Network Toolbar State
  const [isRecording, setIsRecording] = useState(true);
  const [preserveLog, setPreserveLog] = useState(false);
  const [disableCache, setDisableCache] = useState(false);
  const [throttling, setThrottling] = useState('No throttling');
  const [filterText, setFilterText] = useState('');

  // Console State
  const [consoleInput, setConsoleInput] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<{type:'in'|'out'|'err'|'warn'|'info', data: any}[]>([]);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const handleTabSwitch = (tab: typeof mainTab) => {
    setMainTab(tab);
    if (typeof window !== 'undefined') {
      (window as any).__netrunnerDevtoolsTab = tab;
    }
  };

  useEffect(() => {
      if(mainTab === 'Console') consoleEndRef.current?.scrollIntoView();
  }, [consoleLogs, mainTab]);

  const handleConsoleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if(!consoleInput.trim()) return;
      
      const cmd = consoleInput.trim();
      setConsoleLogs(prev => [...prev, { type: 'in', data: cmd }]);
      setConsoleInput('');

      // Simulate Execution & Object Return
      setTimeout(() => {
          if (onConsoleCommand) onConsoleCommand(cmd);
          
          try {
             // --- SIMULATED JS RUNTIME FOR CONSOLE ---
             let result: any = undefined;
             
             if (cmd === 'window.appConfig' || cmd === 'appConfig') {
                 result = {
                     version: "1.0.2",
                     env: "production",
                     currentUser: { id: 8842, username: "guest_user", isAdmin: false }
                 };
             } 
             else if (cmd === 'window' || cmd === 'this') {
                 result = {
                     location: { href: activeCase?.initialUrl, protocol: 'https:', host: 'virtual-env', pathname: '/app' },
                     document: { title: activeCase?.title, body: "HTMLElement...", domain: 'virtual-env' },
                     localStorage: { _store: { license_status: "expired" }, length: 1 },
                     appConfig: { version: "1.0.2", currentUser: { isAdmin: false } },
                     navigator: { userAgent: "NetRunner/1.0 Chrome/120.0.0.0" }
                 };
             }
             else if (cmd.includes('localStorage.getItem')) {
                 result = "expired"; 
                 if(cmd.includes('premium')) result = "premium";
             }
             else if (cmd === '_internal') {
                 result = { enableBeta: "f () { [native code] }", _secret_key: "beta_v2" };
             }
             else if (cmd.startsWith('doHash')) {
                 result = "md5_simulated_hash_99281";
             } 
             else if (cmd === 'currentUser') {
                 result = { name: "Guest", id: 7721 }; 
             }
             else if (cmd.includes('Object.prototype')) {
                 result = true;
             }
             else if (cmd === 'clear') {
                 setConsoleLogs([]);
                 return;
             }
             else {
                 result = undefined; 
             }

             setConsoleLogs(prev => [...prev, { type: 'out', data: result }]);

          } catch(e) {
              setConsoleLogs(prev => [...prev, { type: 'err', data: "Uncaught ReferenceError: " + cmd + " is not defined" }]);
          }
      }, 50);
  };

  useEffect(() => {
    console.log('[NetworkMonitor] mainTab changed to', mainTab);
  }, [mainTab]);

  const selectedRequest = requests.find((r) => r.id === selectedId);

  const getStatusColor = (status: number) => {
      if (status >= 400) return 'text-red-400';
      if (status >= 300) return 'text-yellow-400';
      return 'text-green-400';
  };

  const getInitiator = (type: string) => {
      if (type === 'img') return 'index.html';
      if (type === 'css') return 'index.html';
      if (type === 'script') return 'index.html';
      return 'script.js';
  };

  return (
    <div className="flex flex-col h-full bg-[#242424] text-[#a8a8a8] font-sans text-xs w-full min-w-0">
      
      {/* --- ROW 1: TAB BAR & WINDOW CONTROLS --- */}
      <div className="flex h-[28px] shrink-0 bg-[#202124] w-full z-20 relative border-b border-[#35363a]">
        {/* Left: Tabs Container */}
        <div className="flex-1 flex items-center overflow-hidden min-w-0">
             {['Elements', 'Console', 'Sources', 'Network', 'Performance', 'Memory', 'Application'].map((tab) => (
                <div 
                    key={tab}
                    data-testid={tab === 'Console' ? 'devtools-tab-console' : undefined}
                    onClick={() => setMainTab(tab as any)}
                    className={`px-3 h-full flex items-center cursor-default border-b-2 text-[12px] transition-colors whitespace-nowrap ${
                        mainTab === tab 
                        ? 'border-[#8ab4f8] text-[#e8eaed] bg-[#202124]' 
                        : 'border-transparent text-[#a8a8a8] hover:bg-[#35363a] hover:text-[#d1d1d1]'
                    }`}
                >
                    {tab}
                </div>
            ))}
        </div>

        {/* Right: Window Controls */}
        <div className="flex items-center gap-0.5 pr-1 pl-2 h-full bg-[#202124] shrink-0 z-10">
             <button className="p-1 hover:bg-[#35363a] rounded text-[#a8a8a8]"><Settings size={14}/></button>
             <div className="w-[1px] h-3.5 bg-[#494c50] mx-1"></div>
             <button onClick={() => onDockChange('bottom')} className={`p-1 rounded hover:bg-[#35363a] ${dockSide === 'bottom' ? 'text-blue-400' : ''}`}><PanelBottom size={14} /></button>
             <button onClick={() => onDockChange('right')} className={`p-1 rounded hover:bg-[#35363a] ${dockSide === 'right' ? 'text-blue-400' : ''}`}><PanelRight size={14} /></button>
            <button
              onClick={onClose}
              aria-label="关闭 DevTools"
              title="关闭 DevTools"
              className="p-1 hover:bg-red-900/50 hover:text-red-400 rounded ml-1"
            >
              <X size={14} />
            </button>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#242424] overflow-hidden">
        
        {/* VIEW: NETWORK */}
        {mainTab === 'Network' && (
            <>
                {/* Network Toolbar (Pixel Perfect) */}
                <div className="h-[28px] bg-[#242424] border-b border-[#494c50] flex items-center px-1 gap-0.5 shrink-0 w-full overflow-hidden text-[12px] text-[#a8a8a8]">
                    {/* Group 1: Controls */}
                    <button 
                        onClick={() => setIsRecording(!isRecording)}
                        className={`p-1 rounded hover:bg-[#35363a] ${isRecording ? 'text-red-500' : 'text-gray-500'}`}
                        title={isRecording ? "Stop recording network log" : "Record network log"}
                    >
                        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-500'}`}></div>
                    </button>
                    <button onClick={onClear} className="p-1 rounded hover:bg-[#35363a] text-[#a8a8a8]" title="Clear">
                        <Ban size={16} className="transform rotate-90 text-gray-400"/>
                    </button>
                    
                    <div className="h-4 w-[1px] bg-[#494c50] mx-1"></div>
                    
                    {/* Group 2: Filter */}
                    <div className="flex items-center bg-[#242424] rounded h-5 flex-1 max-w-xs border border-transparent hover:border-[#494c50] focus-within:border-[#494c50] transition-colors px-1">
                        <Filter size={12} className={`shrink-0 ${filterText ? 'text-red-400' : 'text-gray-500'} mr-1`} />
                        <input 
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                            placeholder="Filter" 
                            className="bg-transparent outline-none w-full text-[#e8eaed] placeholder-gray-500 min-w-0 text-[11px]" 
                        />
                    </div>
                    <button className="p-1 rounded hover:bg-[#35363a] text-[#a8a8a8]"><Search size={14}/></button>

                    <div className="h-4 w-[1px] bg-[#494c50] mx-1"></div>

                    {/* Group 3: Options */}
                    <label className="flex items-center gap-1 px-1 hover:bg-[#35363a] rounded cursor-pointer select-none">
                        <input type="checkbox" checked={preserveLog} onChange={() => setPreserveLog(!preserveLog)} className="accent-blue-500 w-3 h-3"/>
                        <span className="whitespace-nowrap">Preserve log</span>
                    </label>
                    <label className="flex items-center gap-1 px-1 hover:bg-[#35363a] rounded cursor-pointer select-none">
                        <input type="checkbox" checked={disableCache} onChange={() => setDisableCache(!disableCache)} className="accent-blue-500 w-3 h-3"/>
                        <span className="whitespace-nowrap">Disable cache</span>
                    </label>

                    <div className="h-4 w-[1px] bg-[#494c50] mx-1"></div>

                    {/* Group 4: Throttling */}
                    <div className="flex items-center gap-1 hover:bg-[#35363a] px-1 rounded cursor-pointer text-[#e8eaed]">
                        <span>{throttling}</span>
                        <ChevronDown size={10} />
                    </div>

                    <div className="flex-1"></div>

                    {/* Group 5: End Icons */}
                    <button className="p-1 rounded hover:bg-[#35363a] text-[#a8a8a8]"><Wifi size={14}/></button>
                    <button className="p-1 rounded hover:bg-[#35363a] text-[#a8a8a8]"><Upload size={14}/></button>
                    <button className="p-1 rounded hover:bg-[#35363a] text-[#a8a8a8]"><Download size={14}/></button>
                </div>

                <div className={`flex-1 flex overflow-hidden ${dockSide === 'right' ? 'flex-col' : 'flex-row'}`}>
                    {/* Request List Table */}
                    <div className={`${selectedRequest && isInspectorOpen ? (dockSide === 'right' ? 'h-1/2 border-b border-[#494c50]' : 'w-1/2 border-r border-[#494c50]') : 'w-full h-full'} flex flex-col min-h-0`}>
                        <div className="flex-1 overflow-y-auto bg-[#242424] relative" style={{ scrollbarGutter: 'stable' }}>
                             {/* Table Header */}
                            <div className="flex bg-[#242424] border-b border-[#494c50] text-[#a8a8a8] font-medium shrink-0 sticky top-0 z-10 text-[11px] h-[21px]">
                                <div className="w-[20%] pl-2 border-r border-[#494c50] h-full flex items-center hover:bg-[#35363a]">Name</div>
                                <div className="w-[10%] pl-2 border-r border-[#494c50] h-full flex items-center hover:bg-[#35363a]">Status</div>
                                <div className="w-[10%] pl-2 border-r border-[#494c50] h-full flex items-center hover:bg-[#35363a]">Type</div>
                                <div className="w-[15%] pl-2 border-r border-[#494c50] h-full flex items-center hover:bg-[#35363a]">Initiator</div>
                                <div className="w-[10%] pl-2 border-r border-[#494c50] h-full flex items-center hover:bg-[#35363a]">Size</div>
                                <div className="w-[10%] pl-2 border-r border-[#494c50] h-full flex items-center hover:bg-[#35363a]">Time</div>
                                <div className="flex-1 pl-2 h-full flex items-center hover:bg-[#35363a]">Waterfall</div>
                            </div>

                            {/* Table Rows */}
                            {requests.map((req, idx) => (
                                <div key={req.id} onClick={() => { setSelectedId(req.id); setIsInspectorOpen(true); }} className={`flex cursor-default h-[21px] text-[11px] group border-b border-transparent ${selectedId === req.id ? 'bg-[#0d3a5e] text-white' : idx % 2 === 0 ? 'bg-[#242424] hover:bg-[#2a2d31]' : 'bg-[#292929] hover:bg-[#2a2d31]'}`}>
                                    <div className="w-[20%] h-full pl-2 truncate border-r border-[#494c50] flex items-center gap-1.5">
                                        {req.type === 'xhr' || req.type === 'fetch' ? <span className="text-yellow-500 text-[9px] font-bold">{'{;}'}</span> : 
                                         req.type === 'img' ? <span className="text-purple-400 text-[9px]">IMG</span> :
                                         <span className="text-blue-400 text-[9px]">DOC</span>}
                                        {req.url.split('/').pop()?.split('?')[0] || req.url}
                                    </div>
                                    <div className={`w-[10%] h-full pl-2 border-r border-[#494c50] flex items-center ${getStatusColor(req.status)}`}>{req.status || 'pending'}</div>
                                    <div className="w-[10%] h-full pl-2 border-r border-[#494c50] text-[#a8a8a8] lowercase truncate flex items-center">{req.type}</div>
                                    <div className="w-[15%] h-full pl-2 border-r border-[#494c50] text-[#a8a8a8] truncate flex items-center hover:underline cursor-pointer">{getInitiator(req.type)}</div>
                                    <div className="w-[10%] h-full pl-2 border-r border-[#494c50] text-[#a8a8a8] flex items-center">{req.size > 0 ? req.size + ' B' : '(memory)'}</div>
                                    <div className="w-[10%] h-full pl-2 border-r border-[#494c50] text-[#a8a8a8] flex items-center">{req.time} ms</div>
                                    <div className="flex-1 h-full px-2 flex items-center gap-2">
                                         <div className="flex-1 h-1.5 bg-[#35363a] rounded-sm relative overflow-hidden">
                                            <div className="absolute top-0 bottom-0 rounded-sm bg-[#8ab4f8] opacity-80" style={{ left: `${(req.time % 50)}%`, width: `${Math.max(5, req.time % 40)}%` }}></div>
                                         </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Inspector Panel */}
                    {selectedRequest && isInspectorOpen && (
                        <div className={`${dockSide === 'right' ? 'h-1/2' : 'w-1/2'} flex flex-col bg-[#242424] min-h-0 min-w-0 border-l border-[#494c50]`}>
                            <div className="flex bg-[#242424] border-b border-[#494c50] shrink-0 items-center justify-between pr-1">
                                <div className="flex">
                                    {['Headers', 'Preview', 'Response', 'Initiator', 'Timing'].map(tab => (
                                        <button key={tab} onClick={() => setActiveInspectorTab(tab as any)} className={`px-3 py-1 border-b-[2px] transition-colors text-[11px] ${activeInspectorTab === tab ? 'border-[#8ab4f8] text-[#e8eaed] bg-[#202124]' : 'border-transparent text-[#a8a8a8] hover:bg-[#35363a]'}`}>{tab}</button>
                                    ))}
                                </div>
                                <button onClick={() => setIsInspectorOpen(false)} className="p-1 hover:bg-[#35363a] rounded text-gray-400"><X size={12}/></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-0 font-mono text-[11px] text-[#d4d4d4]" style={{ scrollbarGutter: 'stable' }}>
                                {activeInspectorTab === 'Headers' && (
                                    <div className="pb-4">
                                        <details open className="group">
                                            <summary className="flex items-center gap-1 px-2 py-1 bg-[#202124] border-b border-[#494c50] font-bold text-[#a8a8a8] cursor-pointer hover:bg-[#35363a]">
                                                <span className="group-open:rotate-90 transition-transform text-[10px]">▶</span> General
                                            </summary>
                                            <div className="p-2 pl-4 space-y-1">
                                                <div><span className="text-[#898989] select-none">Request URL: </span> <span className="text-[#e8eaed] break-all">{selectedRequest.url}</span></div>
                                                <div><span className="text-[#898989] select-none">Request Method: </span> <span className="text-[#e8eaed]">{selectedRequest.method}</span></div>
                                                <div><span className="text-[#898989] select-none">Status Code: </span> <span className="text-[#e8eaed] flex items-center gap-1"><div className={`w-2 h-2 rounded-full ${selectedRequest.status >= 400 ? 'bg-red-500' : 'bg-green-500'}`}></div> {selectedRequest.status}</span></div>
                                            </div>
                                        </details>
                                        
                                        <details open className="group mt-1">
                                            <summary className="flex items-center gap-1 px-2 py-1 bg-[#202124] border-b border-[#494c50] font-bold text-[#a8a8a8] cursor-pointer hover:bg-[#35363a]">
                                                <span className="group-open:rotate-90 transition-transform text-[10px]">▶</span> Response Headers
                                            </summary>
                                            <div className="p-2 pl-4 space-y-1">
                                                {Object.entries(selectedRequest.responseHeaders).map(([k,v]) => (
                                                    <div key={k}><span className="text-[#898989] select-none">{k}: </span> <span className="text-[#e8eaed] break-all">{v}</span></div>
                                                ))}
                                            </div>
                                        </details>

                                        <details open className="group mt-1">
                                            <summary className="flex items-center gap-1 px-2 py-1 bg-[#202124] border-b border-[#494c50] font-bold text-[#a8a8a8] cursor-pointer hover:bg-[#35363a]">
                                                <span className="group-open:rotate-90 transition-transform text-[10px]">▶</span> Request Headers
                                            </summary>
                                            <div className="p-2 pl-4 space-y-1">
                                                {Object.entries(selectedRequest.requestHeaders).map(([k,v]) => (
                                                    <div key={k}><span className="text-[#898989] select-none">{k}: </span> <span className="text-[#e8eaed] break-all">{v}</span></div>
                                                ))}
                                            </div>
                                        </details>
                                    </div>
                                )}
                                {activeInspectorTab === 'Preview' && (
                                    <div className="p-2 whitespace-pre-wrap break-all">
                                        {(() => {
                                            try {
                                                const parsed = JSON.parse(selectedRequest.responseBody || '{}');
                                                return <ObjectExplorer data={parsed} theme="chrome" />;
                                            } catch(e) {
                                                return selectedRequest.responseBody;
                                            }
                                        })()}
                                    </div>
                                )}
                                {activeInspectorTab === 'Response' && <div className="p-2 whitespace-pre-wrap break-all">{selectedRequest.responseBody}</div>}
                            </div>
                        </div>
                    )}
                </div>
            </>
        )}

        {/* VIEW: SOURCES */}
        {mainTab === 'Sources' && (
            <div className="flex h-full min-h-0 overflow-hidden">
                <div className="w-56 border-r border-[#333] bg-[#202124] flex flex-col shrink-0">
                    <div className="h-[28px] flex items-center px-2 border-b border-[#494c50] text-[11px] font-bold text-[#a8a8a8]">Page</div>
                    <div className="flex-1 p-2">
                         <div className="flex items-center gap-1 text-[11px] text-[#e8eaed] mb-2"><FileCode size={12} className="text-yellow-400"/> top</div>
                         <div className="pl-4 flex items-center gap-1 text-[11px] text-[#e8eaed]"><div className="w-3 h-3 bg-purple-400/20 rounded-sm text-purple-400 flex items-center justify-center text-[8px]">☁</div> localhost</div>
                         <div className="pl-8 flex items-center gap-1 text-[11px] text-[#e8eaed] bg-[#0d3a5e] -mx-2 px-2 py-0.5"><span className="text-yellow-400">JS</span> script.js</div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col bg-[#242424] font-mono text-[12px] min-w-0 min-h-0 overflow-hidden">
                    <div className="flex-1 overflow-auto relative text-[#d4d4d4]">
                        <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#242424] border-r border-[#494c50] text-[#858585] text-right pr-2 pt-2 select-none">
                            {(activeCase?.sourceCode || '// No source available').split('\n').map((_, i) => (
                                <div key={i} className="leading-5">{i + 1}</div>
                            ))}
                        </div>
                        <div className="pl-12 pt-2 pr-4 pb-4 leading-5 whitespace-pre text-[#e8eaed]">
                            {activeCase?.sourceCode || '// Source code not available for this level'}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: CONSOLE (PIXEL PERFECT) */}
        {mainTab === 'Console' && (
            <div className="flex flex-col h-full font-mono text-[11px] bg-[#242424]">
                {/* Console Toolbar */}
                <div className="h-[28px] bg-[#242424] border-b border-[#494c50] flex items-center px-1 gap-1 shrink-0 w-full text-[#a8a8a8]">
                     <button className="p-1 hover:bg-[#35363a] rounded text-[#a8a8a8]"><PanelLeft size={14} /></button>
                     <button onClick={() => setConsoleLogs([])} className="p-1 hover:bg-[#35363a] rounded text-[#a8a8a8]"><Ban size={16} className="transform rotate-90 text-gray-400"/></button>
                     <div className="h-4 w-[1px] bg-[#494c50] mx-1"></div>
                     
                     <div className="flex items-center gap-1 px-2 py-0.5 hover:bg-[#35363a] rounded cursor-pointer">
                         <span className="text-[#e8eaed]">top</span>
                         <ChevronDown size={10}/>
                     </div>
                     
                     <div className="h-4 w-[1px] bg-[#494c50] mx-1"></div>
                     <Eye size={14} className="text-gray-400 mx-1 hover:text-[#e8eaed] cursor-pointer" />
                     
                     <div className="flex items-center bg-[#242424] rounded h-5 flex-1 max-w-xs px-1">
                        <Filter size={12} className="text-gray-500 mr-1" />
                        <input placeholder="Filter" className="bg-transparent outline-none text-[#e8eaed] placeholder-gray-500 flex-1 min-w-0" />
                     </div>

                     <div className="flex-1"></div>
                     <div className="flex items-center text-[#a8a8a8] hover:bg-[#35363a] px-2 rounded cursor-pointer gap-1">
                         <span>Default levels</span> <ChevronDown size={10} />
                     </div>
                </div>

                {/* Log Area */}
                <div 
                    className="flex-1 overflow-y-auto bg-[#242424] p-0 pb-1 cursor-text" 
                    onClick={() => document.getElementById('console-input')?.focus()}
                >
                    {consoleLogs.map((log, i) => (
                        <div key={i} className={`flex border-b border-[#494c50]/30 py-0.5 px-1 group relative ${
                            log.type === 'err' ? 'bg-[#290000] border-[#5c0000] text-[#ff8080]' : 
                            log.type === 'in' ? 'text-white border-transparent' : 'text-[#e8eaed] border-transparent'
                        }`}>
                            {/* Log Icon/Marker */}
                            <div className="w-5 shrink-0 text-right mr-1.5 select-none relative top-[1px]">
                                {log.type === 'in' && <span className="text-[#8ab4f8] font-bold text-[10px]">{'>'}</span>}
                                {log.type === 'out' && <span className="text-[#9ca0a4] font-bold text-[10px] opacity-80">{'<'}</span>}
                                {log.type === 'err' && <div className="inline-block w-3 h-3 bg-[#ff8080] rounded-full text-black text-[9px] font-bold text-center leading-3 relative -top-0.5">x</div>}
                            </div>
                            
                            {/* Log Content */}
                            <div className="flex-1 break-all leading-5">
                                {log.type === 'out' && typeof log.data === 'object' ? (
                                    <ObjectExplorer data={log.data} theme="chrome" />
                                ) : (
                                    <span className={`${log.type === 'out' && typeof log.data === 'undefined' ? 'text-[#7f7f7f]' : ''}`}>{String(log.data)}</span>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Active Input Line */}
                    <div className="flex items-start px-1 py-0.5 border-b border-transparent">
                        <span className="text-[#8ab4f8] font-bold text-[10px] w-5 text-right mr-1.5 shrink-0 mt-[2px]">{'>'}</span>
                        <form onSubmit={handleConsoleSubmit} className="flex-1">
                            <input 
                                id="console-input"
                                className="w-full bg-transparent outline-none text-[#e8eaed] font-mono h-5 leading-5 placeholder-transparent"
                                value={consoleInput}
                                onChange={(e) => setConsoleInput(e.target.value)}
                                autoComplete="off"
                                autoFocus
                            />
                        </form>
                    </div>
                    <div ref={consoleEndRef}></div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};
