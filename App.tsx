'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CASE_STUDIES } from './constants';
import { NetworkRequest } from './types';
import { NetworkMonitor } from './components/NetworkMonitor';
import { VirtualBrowser, BrowserToolbar } from './components/VirtualBrowser';
import { TaskSidebar } from './components/TaskSidebar';
import { ReqableSimulator } from './components/ReqableSimulator';
import { DocsViewer } from './components/DocsViewer';
import { WeChatStoryApp } from './components/WeChatStoryApp';
import {
  LayoutTemplate,
  Globe,
  CheckCircle,
  ArrowRight,
  Book,
  MessageCircle,
  FolderPlus,
  Image as ImageIcon,
  RefreshCw,
  Monitor
} from 'lucide-react';
import { ContextMenu } from './components/ContextMenu';
import { useDevToolsResize } from './hooks/useDevToolsResize';
import {
  buildBackendResponse,
  buildInitialRequests,
} from './engine/networkEngine';
import { getActiveBreakpointRules, matchesBreakpointRule } from './components/reqable/BreakpointRules';
import { applyRewriteRules } from './components/reqable/RewriteRules';
import { applyMapLocalRule } from './components/reqable/MapLocalRules';
import { shouldBlockRequest } from './components/reqable/GatewayRules';
import { applyMirrorRule } from './components/reqable/MirrorRules';
import { loadRequestHistory, saveRequestHistory, clearRequestHistory } from './utils/historyManager';
import { applyScriptRules, addScriptLog } from './utils/scriptEngine';
import { getThrottleConfig, calculateThrottledTime, shouldDropPacket } from './components/reqable/NetworkThrottle';
import { checkAccessControl } from './components/reqable/AccessControl';
import { getTurboModeConfig, shouldBlockResource } from './components/reqable/TurboMode';
import { matchReverseProxyRule, applyReverseProxy } from './components/reqable/ReverseProxy';

type ActiveApp = 'browser' | 'reqable' | 'split' | 'docs' | 'wechat';

declare global {
  interface Window {
    netrunnerOpenApp?: (app: ActiveApp) => void;
  }
}

export default function App() {
  // --- OS STATE ---
  const [activeApp, setActiveApp] = useState<ActiveApp>('split');
  const [isAppTransitioning, setIsAppTransitioning] = useState(false);
  const [activeCaseId, setActiveCaseId] = useState(
    CASE_STUDIES.find(c => c.id === 'case_01')?.id || CASE_STUDIES[0].id,
  );
  const [requests, setRequests] = useState<NetworkRequest[]>([]);
  const [completedCases, setCompletedCases] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [desktopMenu, setDesktopMenu] = useState<{ x: number, y: number } | null>(null);

  // Smooth app switching handler
  const handleAppSwitch = useCallback((newApp: ActiveApp) => {
    if (newApp === activeApp) return;
    setIsAppTransitioning(true);
    setActiveApp(newApp);
    setTimeout(() => setIsAppTransitioning(false), 200);
  }, [activeApp]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.netrunnerOpenApp = handleAppSwitch;
    return () => {
      if (window.netrunnerOpenApp === handleAppSwitch) {
        delete window.netrunnerOpenApp;
      }
    };
  }, [handleAppSwitch]);

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
  const [activeRules, setActiveRules] = useState<{ rewrite: boolean, script: boolean, mapLocal: boolean }>({ rewrite: false, script: false, mapLocal: false });

  const activeCase = CASE_STUDIES.find(c => c.id === activeCaseId) || CASE_STUDIES[0];

  // --- COMPLETED CASES PERSISTENCE (包括 Story 关卡进度) ---
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('netrunner_completed_cases_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setCompletedCases(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        'netrunner_completed_cases_v1',
        JSON.stringify(completedCases),
      );
    } catch {
      // ignore quota errors
    }
  }, [completedCases]);

  // --- REQUEST HISTORY PERSISTENCE ---
  // Load history on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedHistory = loadRequestHistory();
    if (savedHistory.length > 0) {
      setRequests(savedHistory);
    }
  }, []);

  // Save history whenever requests change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (requests.length > 0) {
      saveRequestHistory(requests);
    }
  }, [requests]);

  // Clear history function
  const handleClearHistory = useCallback(() => {
    setRequests([]);
    clearRequestHistory();
  }, []);

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
    // 1. Apply mirror rules FIRST (highest priority - changes URL)
    const mirroredUrl = applyMirrorRule(req.url);
    const mirroredReq = mirroredUrl ? { ...req, url: mirroredUrl } : req;

    // 2. Apply rewrite rules
    const rewrittenReq = applyRewriteRules(mirroredReq);

    // 3. Apply script rules (request phase)
    const scriptedReq = applyScriptRules(rewrittenReq, 'request', addScriptLog);

    // 4. Check gateway blocking rules
    const isBlocked = shouldBlockRequest(scriptedReq.url);
    if (isBlocked) {
      const blockedReq = {
        ...scriptedReq,
        status: 403,
        statusText: 'Blocked by Gateway Rule',
        time: 0,
        responseBody: '',
      };
      setRequests(prev => [...prev, blockedReq]);
      return; // Stop processing blocked request
    }

    // Check breakpoint rules
    const activeRules = getActiveBreakpointRules();
    const shouldPause = breakpointActive || activeRules.some(rule => {
      if (rule.type === 'request' || rule.type === 'both') {
        return matchesBreakpointRule(scriptedReq.url, rule.urlPattern);
      }
      return false;
    });

    if (shouldPause) {
      const pausedReq = { ...scriptedReq, isPaused: true, status: 0 };
      setRequests(prev => [...prev, pausedReq]);
    } else {
      setRequests(prev => [...prev, scriptedReq]);
      if (scriptedReq.type === 'fetch' || scriptedReq.type === 'xhr' || scriptedReq.type === 'img') {
        processBackendLogic(scriptedReq);
      }
    }

    if (activeCaseId === 'case_09' && scriptedReq.url.includes('dashboard') && scriptedReq.status === 200) {
      triggerSuccess();
    }
  };

  const handleReqableComposer = (req: NetworkRequest) => {
    // 1. Apply mirror rules FIRST (highest priority - changes URL)
    const mirroredUrl = applyMirrorRule(req.url);
    const mirroredReq = mirroredUrl ? { ...req, url: mirroredUrl } : req;

    // 2. Apply rewrite rules
    const rewrittenReq = applyRewriteRules(mirroredReq);

    // 3. Apply script rules (request phase)
    const scriptedReq = applyScriptRules(rewrittenReq, 'request', addScriptLog);

    // 4. Check gateway blocking rules
    const isBlocked = shouldBlockRequest(scriptedReq.url);
    if (isBlocked) {
      const blockedReq = {
        ...scriptedReq,
        status: 403,
        statusText: 'Blocked by Gateway Rule',
        time: 0,
        responseBody: '',
      };
      setRequests(prev => [...prev, blockedReq]);
      return; // Stop processing blocked request
    }

    // Check breakpoint rules
    const activeRules = getActiveBreakpointRules();
    const shouldPause = breakpointActive || activeRules.some(rule => {
      if (rule.type === 'request' || rule.type === 'both') {
        return matchesBreakpointRule(scriptedReq.url, rule.urlPattern);
      }
      return false;
    });

    if (shouldPause) {
      const pausedReq = { ...scriptedReq, isPaused: true, status: 0 };
      setRequests(prev => [...prev, pausedReq]);
    } else {
      setRequests(prev => [...prev, scriptedReq]);
      processBackendLogic(scriptedReq);
    }
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

  const handleImportRequests = (importedReqs: NetworkRequest[]) => {
    // Add imported requests to the request list
    setRequests(prev => [...prev, ...importedReqs]);
  };

  const handleConsoleCommand = (cmd: string) => {
    const cleanCmd = cmd.replace(/\s/g, '');
    const normalizedCmd = cleanCmd.toLowerCase();

    // REVERSE ENGINEERING LOGIC
    if (activeCaseId === 'case_10' && cleanCmd.includes('appConfig.currentUser.isAdmin=true')) triggerSuccess();
    if (activeCaseId === 'case_11' && cmd.includes('_internal.enableBeta()')) triggerSuccess();
    if (activeCaseId === 'case_12' && cmd.includes('makeRequest')) triggerSuccess();
    if (activeCaseId === 'story_incident_feature_flag_patch' && normalizedCmd.includes('featureflags.forcelegacyflow(true)')) {
      const flagStatus = document.getElementById('feature-flag-status');
      if (flagStatus) {
        flagStatus.innerHTML = '状态：forceLegacyFlow(true)';
        flagStatus.className = 'text-3xl font-black text-emerald-400 mt-2';
      }
      triggerSuccess();
    }
    if (activeCaseId === 'case_25' && cleanCmd.includes('clearTimeout(window.securityTimer)')) {
      const timerDisplay = document.getElementById('timer-display');
      if (timerDisplay) {
        timerDisplay.innerText = "STOPPED";
        timerDisplay.className = "text-5xl font-bold text-green-500 mb-6 font-mono";
      }
      triggerSuccess();
    }
    if (activeCaseId === 'case_26' && cmd.includes('localStorage.setItem') && cmd.includes('premium')) {
      const msg = document.getElementById('license-msg');
      if (msg) { msg.innerText = "Current Status: PREMIUM ACTIVATED"; msg.className = "mt-4 text-sm text-green-500 font-bold"; }
      triggerSuccess();
    }
    if (activeCaseId === 'case_28' && (cleanCmd.includes('setInterval=function') || cleanCmd.includes('setInterval=()'))) {
      const msg = document.getElementById('sys-msg');
      if (msg) { msg.innerText = "Status: PROTECTION BYPASSED"; msg.className = "mt-4 text-xs text-green-600"; }
      const btn = document.getElementById('sys-unlock-btn') as HTMLButtonElement;
      if (btn) {
        btn.disabled = false;
        btn.innerText = "SYSTEM UNLOCKED";
        btn.className = "bg-green-600 text-white px-8 py-4 rounded font-bold hover:bg-green-500";
      }
    }
    if (activeCaseId === 'case_29' && (cleanCmd.includes('submitData=function') || cleanCmd.includes('submitData='))) {
      setTimeout(() => triggerSuccess(), 1000);
    }
    if (activeCaseId === 'case_30' && cleanCmd.includes('Object.prototype.isAdmin=true')) {
      const btn = document.getElementById('proto-login-btn');
      if (btn) {
        btn.innerText = "Access Granted (Admin)";
        btn.className = "w-full bg-green-600 text-white py-2 rounded font-bold";
      }
    }
  };

  const processBackendLogic = (req: NetworkRequest) => {
    if (req.status !== 0 && req.status !== undefined) return;

    // 1. Check Access Control rules
    const accessResult = checkAccessControl(req.url);
    if (!accessResult.allowed) {
      const blockedResponse: NetworkRequest = {
        ...req,
        status: 403,
        statusText: 'Blocked by Access Control',
        responseHeaders: { 'x-blocked-by': 'access-control', 'x-rule': accessResult.rule?.name || 'unknown' },
        responseBody: JSON.stringify({ error: 'Access denied', rule: accessResult.rule?.name }),
        time: 0,
      };
      setRequests(prev => prev.map(r => r.id === req.id ? blockedResponse : r));
      return;
    }

    // 2. Check Turbo Mode resource blocking
    const turboConfig = getTurboModeConfig();
    if (turboConfig.enabled && shouldBlockResource(req.type || '', turboConfig)) {
      const blockedResponse: NetworkRequest = {
        ...req,
        status: 0,
        statusText: 'Blocked by Turbo Mode',
        responseHeaders: { 'x-blocked-by': 'turbo-mode', 'x-resource-type': req.type || 'unknown' },
        responseBody: '',
        time: 0,
      };
      setRequests(prev => prev.map(r => r.id === req.id ? blockedResponse : r));
      return;
    }

    // 3. Apply Reverse Proxy rules (URL transformation)
    let processedReq = req;
    const reverseProxyRule = matchReverseProxyRule(req.url);
    if (reverseProxyRule) {
      const newUrl = applyReverseProxy(req.url, reverseProxyRule);
      processedReq = {
        ...req,
        url: newUrl,
        requestHeaders: {
          ...req.requestHeaders,
          'x-reverse-proxy': reverseProxyRule.name,
          'x-original-url': req.url,
        }
      };
    }

    // 4. Check Throttle packet loss
    const throttleConfig = getThrottleConfig();
    if (throttleConfig.enabled && shouldDropPacket(throttleConfig)) {
      const droppedResponse: NetworkRequest = {
        ...processedReq,
        status: 0,
        statusText: 'Packet Lost (Throttle)',
        responseHeaders: { 'x-throttle': 'packet-loss' },
        responseBody: '',
        time: throttleConfig.latency,
      };
      setTimeout(() => {
        setRequests(prev => prev.map(r => r.id === req.id ? droppedResponse : r));
      }, throttleConfig.latency);
      return;
    }

    const { response, shouldTriggerSuccess } = buildBackendResponse(
      activeCaseId,
      processedReq,
      activeRules,
    );

    // Apply Map Local rules to override response
    const mapLocalResult = applyMapLocalRule(response.url);
    let finalResponse = response;
    
    if (mapLocalResult) {
      finalResponse = {
        ...response,
        responseBody: mapLocalResult.content,
        responseHeaders: {
          ...response.responseHeaders,
          'content-type': mapLocalResult.contentType
        }
      };
    }

    // 3. Calculate throttled delay
    const baseDelay = 100;
    const responseSize = finalResponse.responseBody?.length || 0;
    const throttledDelay = throttleConfig.enabled 
      ? calculateThrottledTime(baseDelay, responseSize, throttleConfig)
      : baseDelay;

    setTimeout(() => {
      // Apply script rules (response phase)
      const scriptedResponse = applyScriptRules(finalResponse, 'response', addScriptLog);
      // Add throttle indicator to response if throttled
      const finalWithThrottle = throttleConfig.enabled ? {
        ...scriptedResponse,
        time: throttledDelay,
        responseHeaders: {
          ...scriptedResponse.responseHeaders,
          'x-throttle-profile': throttleConfig.name,
        }
      } : scriptedResponse;
      setRequests(prev => prev.map(r => r.id === req.id ? finalWithThrottle : r));
    }, throttledDelay);

    if (shouldTriggerSuccess) {
      if (activeCaseId === 'story_incident_gray_release') {
        const statusEl = document.getElementById('gray-status');
        if (statusEl) {
          statusEl.innerHTML = 'disabled';
          statusEl.className = 'text-2xl font-black text-emerald-300';
        }
      }
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
      handleAppSwitch('split');
    }
  };

  return (
    <div className="h-screen w-full bg-[#0d1117] flex overflow-hidden font-sans text-slate-200" onClick={() => setDesktopMenu(null)}>

      {/* Sidebar ... */}
      {activeApp !== 'docs' && activeApp !== 'wechat' && (
        <TaskSidebar
          caseStudy={activeCase}
          allCases={CASE_STUDIES}
          onSelectCase={(id) => { setActiveCaseId(id); setRequests([]); setShowSuccess(false); }}
        />
      )}

      {/* Desktop Environment */}
      <div
        className="flex-1 flex flex-col relative bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"
        onContextMenu={(e) => {
          if (e.target === e.currentTarget) {
            e.preventDefault();
            setDesktopMenu({ x: e.clientX, y: e.clientY });
          }
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none"></div>

        {desktopMenu && (
          <ContextMenu
            x={desktopMenu.x}
            y={desktopMenu.y}
            onClose={() => setDesktopMenu(null)}
            actions={[
              { label: 'New Folder', onClick: () => { }, icon: FolderPlus, disabled: true },
              { label: 'Get Info', onClick: () => { }, icon: Monitor, disabled: true },
              { separator: true, label: '', onClick: () => { } },
              { label: 'Change Wallpaper...', onClick: () => { }, icon: ImageIcon, disabled: true },
              { separator: true, label: '', onClick: () => { } },
              { label: 'Refresh', onClick: () => window.location.reload(), icon: RefreshCw },
            ]}
          />
        )}

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
          {/* App: WeChat Story Mode */}
          {activeApp === 'wechat' && (
            <div className={`w-full h-full app-container ${isAppTransitioning ? 'app-container-exit' : ''}`}>
              <WeChatStoryApp
                onOpenCase={(caseId) => {
                  setActiveCaseId(caseId);
                  setRequests([]);
                  setShowSuccess(false);
                  setBreakpointActive(false);
                  setActiveRules({ rewrite: false, script: false, mapLocal: false });
                  handleAppSwitch('split');
                }}
                completedCases={completedCases}
                onClose={() => handleAppSwitch('split')}
              />
            </div>
          )}

          {/* App: DOCS CENTER */}
          {activeApp === 'docs' && (
            <div className={`w-full h-full bg-[#0d1117] rounded-lg shadow-2xl overflow-hidden border border-slate-600 app-container ${isAppTransitioning ? 'app-container-exit' : ''}`}>
              <DocsViewer onNavigateToLevel={handleDocsNavigation} />
            </div>
          )}

          {/* App: BROWSER & REQABLE (GAME MODE) */}
          {activeApp !== 'docs' && activeApp !== 'wechat' && (
            <>
              {(activeApp === 'browser' || activeApp === 'split') && (
                <div id="browser-window" className={`flex flex-col rounded-lg shadow-2xl overflow-hidden border border-slate-600 bg-white relative z-20 ${activeApp === 'split' ? 'w-1/2' : 'w-full'} transition-all duration-500 ease-in-out app-container ${isAppTransitioning ? 'app-container-exit' : ''}`}>
                  <BrowserToolbar activeCase={activeCase} onOpenDevTools={() => setIsDevToolsOpen(true)} onRefresh={handleRefresh} isRefreshing={isRefreshing} />
                  <div className={`flex flex-1 min-h-0 overflow-hidden ${devToolsConfig.side === 'right' ? 'flex-row' : 'flex-col'}`}>
                    <div className="flex-1 relative min-h-0 min-w-0 bg-gray-100">
                      <VirtualBrowser activeCase={activeCase} onNavigate={handleNavigate} onRefresh={handleRefresh} onOpenDevTools={() => setIsDevToolsOpen(true)} />
                    </div>
                    {isDevToolsOpen && (
                      <>
                        <div onMouseDown={startResizing} className={`${devToolsConfig.side === 'bottom' ? 'h-1 cursor-row-resize w-full' : 'w-1 cursor-col-resize h-full'} bg-gray-300 hover:bg-blue-500 transition-colors z-30 flex-shrink-0`}></div>
                        <div style={{ height: devToolsConfig.side === 'bottom' ? devToolsConfig.size : 'auto', width: devToolsConfig.side === 'right' ? devToolsConfig.size : 'auto', flexShrink: 0 }} className="bg-[#242424] overflow-hidden flex flex-col relative z-20 border-l border-t border-gray-400 shadow-xl">
                          <NetworkMonitor requests={requests} onClear={handleClearHistory} dockSide={devToolsConfig.side} onDockChange={(side) => setDevToolsConfig(prev => ({ ...prev, side }))} onClose={() => setIsDevToolsOpen(false)} activeCase={activeCase} onConsoleCommand={handleConsoleCommand} />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {(activeApp === 'reqable' || activeApp === 'split') && (
                <div className={`flex flex-col bg-[#1a1b26] rounded-lg shadow-2xl overflow-hidden border border-yellow-900/30 ${activeApp === 'split' ? 'w-1/2' : 'w-full'} transition-all duration-500 ease-in-out app-container ${isAppTransitioning ? 'app-container-exit' : ''}`}>
                  <ReqableSimulator requests={requests} onClear={handleClearHistory} onComposerSend={handleReqableComposer} breakpointActive={breakpointActive} toggleBreakpoint={() => setBreakpointActive(!breakpointActive)} onResumeRequest={handleResumeRequest} onDropRequest={handleDropRequest} onRuleEnable={(type, enabled) => setActiveRules(prev => ({ ...prev, [type]: enabled }))} onImportRequests={handleImportRequests} />
                </div>
              )}
            </>
          )}
        </div>

        {/* macOS Style Dock */}
        <div className="h-24 shrink-0 flex justify-center items-end pb-4 z-50">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-4 py-2 flex gap-4 shadow-2xl">

            <button onClick={() => handleAppSwitch(activeApp === 'browser' ? 'split' : 'browser')} className={`group relative p-1 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110`}>
              <div className={`w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10 ${activeApp === 'browser' ? 'ring-2 ring-white/30' : ''}`}><Globe size={24} /></div>
              {/* Tooltip skipped for brevity */}
            </button>

            <button onClick={() => handleAppSwitch(activeApp === 'reqable' ? 'split' : 'reqable')} className={`group relative p-1 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110`}>
              <div className={`w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center text-black font-bold shadow-lg border border-white/10 ${activeApp === 'reqable' ? 'ring-2 ring-white/30' : ''}`}>RQ</div>
            </button>

            <button
              aria-label="WeChat 剧情模式"
              onClick={() => handleAppSwitch('wechat')}
              className={`group relative p-1 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10 ${activeApp === 'wechat' ? 'ring-2 ring-white/30' : ''}`}><MessageCircle size={24} /></div>
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10 shadow-xl translate-y-2 group-hover:translate-y-0">WeChat · 剧情模式</div>
              {activeApp === 'wechat' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"></div>}
            </button>

            <button onClick={() => handleAppSwitch('docs')} className={`group relative p-1 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110`}>
              <div className={`w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg border border-white/10 ${activeApp === 'docs' ? 'ring-2 ring-white/30' : ''}`}><Book size={24} /></div>
              <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap backdrop-blur-sm border border-white/10 shadow-xl translate-y-2 group-hover:translate-y-0">Docs Center</div>
              {activeApp === 'docs' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_5px_white]"></div>}
            </button>

            <div className="w-[1px] bg-white/20 mx-1 my-1"></div>

            <button onClick={() => handleAppSwitch('split')} className={`group relative p-1 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-110`}>
              <div className={`w-12 h-12 bg-slate-700 rounded-2xl flex items-center justify-center text-white shadow-lg border border-slate-500 ${activeApp === 'split' ? 'ring-2 ring-white/30' : ''}`}><LayoutTemplate size={24} /></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
