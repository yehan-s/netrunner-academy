
import React, { useState, useEffect } from 'react';
import { CASE_STUDIES } from './constants';
import { NetworkRequest } from './types';
import { NetworkMonitor } from './components/NetworkMonitor';
import { VirtualBrowser, BrowserToolbar } from './components/VirtualBrowser';
import { TaskSidebar } from './components/TaskSidebar';
import { ReqableSimulator } from './components/ReqableSimulator';
import { DocsViewer } from './components/DocsViewer';
import { LayoutTemplate, Globe, CheckCircle, ArrowRight, Book } from 'lucide-react';
import { useDevToolsResize } from './hooks/useDevToolsResize';
import { buildBackendResponse, buildInitialRequests } from './engine/networkEngine';

export default function App() {
  // --- OS STATE ---
  const [activeApp, setActiveApp] = useState<'browser' | 'reqable' | 'split' | 'docs'>('split');
  const [activeCaseId, setActiveCaseId] = useState(CASE_STUDIES[0].id);
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [completedCases, setCompletedCases] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);

  // --- BROWSER STATE ---
  const [isDevToolsOpen, setIsDevToolsOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    devToolsConfig,
    setDevToolsConfig,
    startResizing,
  } = useDevToolsResize({ size: 300, side: 'bottom' });

  // --- REQABLE STATE ---
  const [breakpointActive, setBreakpointActive] = useState(false);
  const [activeRules, setActiveRules] = useState<{rewrite: boolean, script: boolean, mapLocal: boolean}>({ rewrite: false, script: false, mapLocal: false });

  const activeCase = CASE_STUDIES.find(c => c.id === activeCaseId) || CASE_STUDIES[0];

  // --- INITIAL TRAFFIC SIMULATION ---
  const triggerInitialTraffic = (caseId: string) => {
      const newRequests = buildInitialRequests(caseId);
      setRequests(newRequests);
  };

  useEffect(() => {
      triggerInitialTraffic(activeCaseId);
  }, [activeCaseId]);

  const handleRefresh = () => {
      setIsRefreshing(true);
      // 模拟真实浏览器的刷新延迟（300-500ms）
      setTimeout(() => {
          triggerInitialTraffic(activeCaseId);
          setTimeout(() => setIsRefreshing(false), 200); // 延迟关闭动画，让用户看到完整的旋转效果
      }, 300);
  };

  const handleNavigate = (req: NetworkRequest) => {
    if (breakpointActive) {
        const pausedReq = { ...req, isPaused: true, status: 0 };
        setRequests(prev => [...prev, pausedReq]);
    } else {
        setRequests(prev => [...prev, req]);
        if(req.type === 'fetch' || req.type === 'xhr' || req.type === 'img') {
             processBackendLogic(req);
        }
    }
    
    if (activeCaseId === 'case_09' && req.url.includes('dashboard') && req.status === 200) {
        triggerSuccess();
    }
  };

  const handleReqableComposer = (req: NetworkRequest) => {
      processBackendLogic(req);
  };

  const handleResumeRequest = (id: string, modifiedBody?: string) => {
      const pendingReq = requests.find(r => r.id === id);
      if (!pendingReq) return;
      setRequests(prev => prev.filter(r => r.id !== id));
      const newReq = { ...pendingReq, requestBody: modifiedBody || pendingReq.requestBody, isPaused: false };
      setRequests(prev => [...prev, newReq]); 
      processBackendLogic(newReq);
  };

  const handleDropRequest = (id: string) => {
      setRequests(prev => prev.filter(r => r.id !== id));
  };

  const handleConsoleCommand = (cmd: string) => {
      const cleanCmd = cmd.replace(/\s/g,'');
      
      // REVERSE ENGINEERING LOGIC
      if (activeCaseId === 'case_10' && cleanCmd.includes('appConfig.currentUser.isAdmin=true')) triggerSuccess();
      if (activeCaseId === 'case_11' && cmd.includes('_internal.enableBeta()')) triggerSuccess();
      if (activeCaseId === 'case_12' && cmd.includes('makeRequest')) triggerSuccess(); 
      if (activeCaseId === 'case_25' && cleanCmd.includes('clearTimeout(window.securityTimer)')) {
          const timerDisplay = document.getElementById('timer-display');
          if(timerDisplay) {
              timerDisplay.innerText = "STOPPED";
              timerDisplay.className = "text-5xl font-bold text-green-500 mb-6 font-mono";
          }
          triggerSuccess();
      }
      if (activeCaseId === 'case_26' && cmd.includes('localStorage.setItem') && cmd.includes('premium')) {
          const msg = document.getElementById('license-msg');
          if(msg) { msg.innerText = "Current Status: PREMIUM ACTIVATED"; msg.className = "mt-4 text-sm text-green-500 font-bold"; }
          triggerSuccess();
      }
      if (activeCaseId === 'case_28' && (cleanCmd.includes('setInterval=function') || cleanCmd.includes('setInterval=()'))) {
          const msg = document.getElementById('sys-msg');
          if(msg) { msg.innerText = "Status: PROTECTION BYPASSED"; msg.className = "mt-4 text-xs text-green-600"; }
          const btn = document.getElementById('sys-unlock-btn') as HTMLButtonElement;
          if(btn) {
              btn.disabled = false;
              btn.innerText = "SYSTEM UNLOCKED";
              btn.className = "bg-green-600 text-white px-8 py-4 rounded font-bold hover:bg-green-500";
          }
      }
      if (activeCaseId === 'case_29' && (cleanCmd.includes('submitData=function') || cleanCmd.includes('submitData=') )) {
          setTimeout(() => triggerSuccess(), 1000);
      }
      if (activeCaseId === 'case_30' && cleanCmd.includes('Object.prototype.isAdmin=true')) {
          const btn = document.getElementById('proto-login-btn');
          if(btn) {
               btn.innerText = "Access Granted (Admin)";
               btn.className = "w-full bg-green-600 text-white py-2 rounded font-bold";
          }
      }
  };

  const processBackendLogic = (req: NetworkRequest) => {
     if(req.status !== 0 && req.status !== undefined) return; 

     const { response, shouldTriggerSuccess } = buildBackendResponse(
       activeCaseId,
       req,
       activeRules,
     );
     
     setTimeout(() => {
         setRequests(prev => prev.map(r => r.id === req.id ? response : r));
     }, 100);

     if (shouldTriggerSuccess) {
       triggerSuccess();
     }
  };

  const triggerSuccess = () => {
      if (!completedCases.includes(activeCaseId)) {
          setCompletedCases(prev => [...prev, activeCaseId]);
          setShowSuccess(true);
      }
  };

  const nextLevel = () => {
      const idx = CASE_STUDIES.findIndex(c => c.id === activeCaseId);
      if (idx < CASE_STUDIES.length - 1) {
          setActiveCaseId(CASE_STUDIES[idx + 1].id);
          setRequests([]);
          setShowSuccess(false);
          setBreakpointActive(false);
          setActiveRules({ rewrite: false, script: false, mapLocal: false });
          // 保持当前视图布局，不强制重置为 split
      }
  };

  const handleDocsNavigation = (caseId: string) => {
      setActiveCaseId(caseId);
      // 从 Docs 跳转到关卡时，如果用户之前在 docs 模式，则切换到 split 方便查看
      if (activeApp === 'docs') {
          setActiveApp('split');
      }
  };

  return (
    <div className="h-screen w-full bg-[#0d1117] flex overflow-hidden font-sans text-slate-200">
      
      {/* Sidebar is hidden in Docs mode to give full width */}
      {activeApp !== 'docs' && (
        <TaskSidebar 
            caseStudy={activeCase} 
            allCases={CASE_STUDIES} 
            onSelectCase={(id) => { setActiveCaseId(id); setRequests([]); setShowSuccess(false); }} 
        />
      )}

      {/* Desktop Environment */}
      <div className="flex-1 flex flex-col relative bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
        
        {/* Success Modal */}
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#1e1e1e] p-8 rounded-2xl border-2 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.5)] flex flex-col items-center text-center max-w-md w-full mx-4">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                 <CheckCircle size={40} className="text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 tracking-wider">MISSION ACCOMPLISHED</h2>
              <p className="text-gray-400 mb-8 font-mono text-sm">System vulnerability exploited successfully.</p>
              <button onClick={nextLevel} className="bg-green-600 hover:bg-green-500 text-white text-lg font-bold py-3 px-10 rounded-full flex items-center gap-2">
                Next Level <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* App Window Container */}
        <div className="flex-1 p-4 flex gap-4 overflow-hidden relative z-10">
            
            {/* App: DOCS CENTER */}
            {activeApp === 'docs' && (
                 <div className="w-full h-full bg-[#0d1117] rounded-lg shadow-2xl overflow-hidden border border-slate-600">
                     <DocsViewer onNavigateToLevel={handleDocsNavigation} />
                 </div>
            )}

            {/* App: BROWSER & REQABLE (GAME MODE) */}
            {activeApp !== 'docs' && (
                <>
                    {(activeApp === 'browser' || activeApp === 'split') && (
                        <div id="browser-window" className={`flex flex-col rounded-lg shadow-2xl overflow-hidden border border-slate-600 bg-white relative z-20 ${activeApp === 'split' ? 'w-1/2' : 'w-full'}`}>
                            <BrowserToolbar activeCase={activeCase} onOpenDevTools={() => setIsDevToolsOpen(true)} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
                            <div className={`flex flex-1 min-h-0 overflow-hidden ${devToolsConfig.side === 'right' ? 'flex-row' : 'flex-col'}`}>
                                <div className="flex-1 relative min-h-0 min-w-0 bg-gray-100">
                                    <VirtualBrowser activeCase={activeCase} onNavigate={handleNavigate} onRefresh={handleRefresh}/>
                                </div>
                                {isDevToolsOpen && (
                                    <>
                                        <div onMouseDown={startResizing} className={`${devToolsConfig.side === 'bottom' ? 'h-1 cursor-row-resize w-full' : 'w-1 cursor-col-resize h-full'} bg-gray-300 hover:bg-blue-500 transition-colors z-30 flex-shrink-0`}></div>
                                        <div style={{ height: devToolsConfig.side === 'bottom' ? devToolsConfig.size : 'auto', width: devToolsConfig.side === 'right' ? devToolsConfig.size : 'auto', flexShrink: 0 }} className="bg-[#242424] overflow-hidden flex flex-col relative z-20 border-l border-t border-gray-400 shadow-xl">
                                            <NetworkMonitor requests={requests} onClear={() => setRequests([])} dockSide={devToolsConfig.side} onDockChange={(side) => setDevToolsConfig(prev => ({ ...prev, side }))} onClose={() => setIsDevToolsOpen(false)} activeCase={activeCase} onConsoleCommand={handleConsoleCommand} />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {(activeApp === 'reqable' || activeApp === 'split') && (
                        <div className={`flex flex-col bg-[#1a1b26] rounded-lg shadow-2xl overflow-hidden border border-yellow-900/30 ${activeApp === 'split' ? 'w-1/2' : 'w-full'}`}>
                            <ReqableSimulator requests={requests} onClear={() => setRequests([])} onComposerSend={handleReqableComposer} breakpointActive={breakpointActive} toggleBreakpoint={() => setBreakpointActive(!breakpointActive)} onResumeRequest={handleResumeRequest} onDropRequest={handleDropRequest} onRuleEnable={(type, enabled) => setActiveRules(prev => ({ ...prev, [type]: enabled }))} />
                        </div>
                    )}
                </>
            )}
        </div>

        {/* macOS Style Dock */}
        <div className="h-24 shrink-0 flex justify-center items-end pb-4 z-50">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 flex gap-4 shadow-2xl">
                
                <button onClick={() => setActiveApp(activeApp === 'browser' ? 'split' : 'browser')} className={`group relative p-1 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110`}>
                    <div className={`w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10 ${activeApp === 'browser' ? 'ring-2 ring-white/30' : ''}`}><Globe size={24}/></div>
                    {/* Tooltip skipped for brevity */}
                </button>

                <button onClick={() => setActiveApp(activeApp === 'reqable' ? 'split' : 'reqable')} className={`group relative p-1 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110`}>
                    <div className={`w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center text-black font-bold shadow-lg border border-white/10 ${activeApp === 'reqable' ? 'ring-2 ring-white/30' : ''}`}>RQ</div>
                </button>

                <button onClick={() => setActiveApp('docs')} className={`group relative p-1 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110`}>
                    <div className={`w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10 ${activeApp === 'docs' ? 'ring-2 ring-white/30' : ''}`}><Book size={24}/></div>
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10 shadow-xl translate-y-2 group-hover:translate-y-0">Docs Center</div>
                    {activeApp === 'docs' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"></div>}
                </button>

                <div className="w-[1px] bg-white/20 mx-1 my-1"></div>

                <button onClick={() => setActiveApp('split')} className={`group relative p-1 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110`}>
                    <div className={`w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center text-white shadow-lg border border-slate-500 ${activeApp === 'split' ? 'ring-2 ring-white/30' : ''}`}><LayoutTemplate size={24}/></div>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
