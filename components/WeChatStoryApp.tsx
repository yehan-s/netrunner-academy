import React, { useEffect, useState, useMemo, useRef } from 'react';
import { STORY_THREADS, StoryThread, StoryMessage } from '../storylines';
import {
  MessageCircle,
  Users,
  Settings,
  Search,
  FolderGit2,
  Power,
  ChevronLeft,
  MoreHorizontal,
  FileText,
  Smartphone,
  Tag,
  PlayCircle,
  ListTree,
  Info,
} from 'lucide-react';

const STORAGE_KEY = 'netrunner_wechat_state_v3';

// --- Types ---

interface PersistedState {
  activeThreadId: string | null;
  progressByThreadId: Record<string, number>;
  clueSyncByThreadId: Record<string, string[]>;
}

interface ChatSession {
  id: string;
  type: 'group' | 'private';
  title: string;
  members?: string[];
  messages: StoryMessage[];
  lastMessage: StoryMessage | null;
  unreadCount: number;
  avatarColor: string;
}

type ViewMode = 'chat' | 'contacts' | 'stories';

// --- Helper Logic ---

const CURRENT_USER = '你';

const getSessionId = (msg: StoryMessage): string => {
  if (msg.text.startsWith('【群聊】')) return 'group_incident';
  if (msg.text.startsWith('【私聊】')) {
    return msg.sender === CURRENT_USER ? 'unknown_target' : `private_${msg.sender}`;
  }
  return 'group_incident';
};

const getSessionTitle = (sessionId: string, msg: StoryMessage): string => {
  if (sessionId === 'group_incident') return '线上事故处理群 (34)';
  if (sessionId.startsWith('private_')) return msg.sender;
  return '未知会话';
};

// --- Component ---

interface WeChatStoryAppProps {
  onOpenCase: (id: string) => void;
  onClose: () => void;
  completedCases: string[];
}

export const WeChatStoryApp: React.FC<WeChatStoryAppProps> = ({ onOpenCase, onClose, completedCases }) => {
  // --- State ---
  const [state, setState] = useState<PersistedState>(() => {
    if (typeof window === 'undefined') {
      return { activeThreadId: null, progressByThreadId: {}, clueSyncByThreadId: {} };
    }
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return { activeThreadId: null, progressByThreadId: {}, clueSyncByThreadId: {} };
      }
      const parsed = JSON.parse(raw);
      return {
        activeThreadId: parsed.activeThreadId ?? null,
        progressByThreadId: parsed.progressByThreadId ?? {},
        clueSyncByThreadId: parsed.clueSyncByThreadId ?? {},
      };
    } catch {
      return { activeThreadId: null, progressByThreadId: {}, clueSyncByThreadId: {} };
    }
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [selectedSessionId, setSelectedSessionId] = useState<string>('group_incident');
  const [previewThreadId, setPreviewThreadId] = useState<string>(
    STORY_THREADS[0]?.id || '',
  );
  
  // If no active thread, force story selection view
  useEffect(() => {
    if (!state.activeThreadId) {
      setViewMode('stories');
    } else {
      setPreviewThreadId(state.activeThreadId);
    }
  }, [state.activeThreadId]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save State
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota / access errors
    }
  }, [state]);

  // --- Derived Data ---
  
  const activeThread = STORY_THREADS.find(t => t.id === state.activeThreadId);
  const currentProgress = activeThread ? (state.progressByThreadId[activeThread.id] || 0) : 0;
  const lastUnlockedMessage =
    activeThread && currentProgress > 0
      ? activeThread.messages[currentProgress - 1]
      : null;
  const lastMsgCaseId = lastUnlockedMessage?.targetCaseId;
  const isLastCaseCompleted = !!(
    lastMsgCaseId && completedCases.includes(lastMsgCaseId)
  );
  const lastClueKey = lastUnlockedMessage
    ? lastUnlockedMessage.clueKey || lastUnlockedMessage.id
    : null;
  const lastClueSynced = !!(
    lastClueKey &&
    activeThread &&
    state.clueSyncByThreadId[activeThread.id]?.includes(lastClueKey)
  );

  const isBlockingNext =
    !!activeThread &&
    currentProgress > 0 &&
    ((lastMsgCaseId && !isLastCaseCompleted) ||
      (!!lastUnlockedMessage?.requiresClueSync &&
        isLastCaseCompleted &&
        !lastClueSynced));

  const blockingReason = (() => {
    if (!activeThread || currentProgress === 0) return null;
    if (lastMsgCaseId && !isLastCaseCompleted) return '请先完成上一个任务';
    if (
      lastUnlockedMessage?.requiresClueSync &&
      isLastCaseCompleted &&
      !lastClueSynced
    )
      return '请先同步线索';
    return null;
  })();

  const isAtEnd =
    !!activeThread && currentProgress >= (activeThread?.messages.length || 0);

  const previewThread = STORY_THREADS.find(
    t => t.id === (previewThreadId ?? STORY_THREADS[0]?.id),
  );
  
  const sessions = useMemo(() => {
    if (!activeThread) return [];

    const visibleMessages = activeThread.messages.slice(0, currentProgress);
    const sessionMap = new Map<string, ChatSession>();

    // Default Group
    sessionMap.set('group_incident', {
      id: 'group_incident',
      type: 'group',
      title: '线上事故处理群 (34)',
      messages: [],
      lastMessage: null,
      unreadCount: 0,
      avatarColor: 'bg-blue-600'
    });

    let lastTarget = 'group_incident';

    visibleMessages.forEach((msg, index) => {
      let sessionId = getSessionId(msg);
      
      // Resolve "My" private messages to the previous context
      if (sessionId === 'unknown_target') {
         // Look backwards for the last private session
         // Simple heuristic: find the last message that wasn't me, or wasn't group
         // For now, let's just stick it to the lastTarget if it was private
         // Or if lastTarget was group, and I send a private msg? That's rare in this linear story without explicit target.
         // We will assume reply to last private speaker.
         let found = false;
         for (let i = index - 1; i >= 0; i--) {
             const prevMsg = visibleMessages[i];
             const prevId = getSessionId(prevMsg);
             if (prevId !== 'group_incident' && prevId !== 'unknown_target') {
                 sessionId = prevId;
                 found = true;
                 break;
             }
         }
         if (!found) sessionId = 'group_incident'; // Fallback
      }

      lastTarget = sessionId;

      if (!sessionMap.has(sessionId)) {
        sessionMap.set(sessionId, {
          id: sessionId,
          type: sessionId.includes('group') ? 'group' : 'private',
          title: getSessionTitle(sessionId, msg),
          messages: [],
          lastMessage: null,
          unreadCount: 0,
          avatarColor: sessionId.includes('group') ? 'bg-blue-600' : 'bg-indigo-500'
        });
      }

      const session = sessionMap.get(sessionId)!;
      session.messages.push(msg);
      session.lastMessage = msg;
    });
    
    // Sort: Sessions with recent messages first? 
    // For story linearity, maybe keep the Main Group at top?
    // Let's just put the one with the LATEST message at top.
    return Array.from(sessionMap.values()).sort((a, b) => {
        // We don't have real timestamps, so we rely on the last message index in the main array?
        // Complex. Let's just keep insertion order for now to avoid jumping.
        return 0; 
    });

  }, [activeThread, currentProgress]);

  const activeSession =
    sessions.find(s => s.id === selectedSessionId) || sessions[0] || null;

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages.length, selectedSessionId, viewMode]);


  // --- Actions ---

  const handleNext = () => {
    if (!activeThread) return;
    if (isAtEnd || isBlockingNext) return;

    const newProgress = currentProgress + 1;
    setState(prev => ({
      ...prev,
      progressByThreadId: {
        ...prev.progressByThreadId,
        [activeThread.id]: newProgress,
      },
    }));
  };

  const handleStartStory = (storyId: string) => {
    setState(prev => ({
      ...prev,
      activeThreadId: storyId,
      progressByThreadId: {
        ...prev.progressByThreadId,
        [storyId]: Math.max(prev.progressByThreadId[storyId] || 0, 1),
      },
    }));
    setSelectedSessionId('group_incident');
    setViewMode('chat');
  };

  const handlePreviewStory = (storyId: string) => {
    setPreviewThreadId(storyId);
    setViewMode('stories');
  };

  const handleQuitStory = () => {
      setState(prev => ({ ...prev, activeThreadId: null }));
      setSelectedSessionId('group_incident');
      setViewMode('stories');
  };

  const handleSyncClue = (thread: StoryThread, message: StoryMessage) => {
    if (!message.targetCaseId) return;
    if (!completedCases.includes(message.targetCaseId)) return;
    const clueKey = message.clueKey || message.id;
    setState(prev => {
      const list = prev.clueSyncByThreadId[thread.id] || [];
      if (list.includes(clueKey)) return prev;
      return {
        ...prev,
        clueSyncByThreadId: {
          ...prev.clueSyncByThreadId,
          [thread.id]: [...list, clueKey],
        },
      };
    });
  };

  // Clean text tags
  const cleanText = (text: string) => text.replace(/【.*?】/g, '');

  // --- UI Sub-components ---

  const SidebarItem = ({ icon: Icon, label, active, onClick }: any) => (
      <button 
        onClick={onClick}
        data-testid={`wechat-side-${label}`}
        className={`relative p-3 rounded-lg transition-colors group ${active ? 'text-[#07c160]' : 'text-[#979797] hover:text-[#d6d6d6]'}`}
        title={label}
      >
          <Icon size={24} strokeWidth={1.5} />
          {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[#07c160] rounded-r-full" />}
      </button>
  );

  return (
    <div className="flex h-full w-full bg-[#f5f5f5] text-gray-900 rounded-xl shadow-2xl overflow-hidden border border-[#333]/10 font-sans animate-in fade-in zoom-in-95 duration-300">
      
      {/* 1. Navigation Rail (Deep Dark) */}
      <div className="w-[68px] bg-[#1e1e1e] flex flex-col items-center py-6 gap-2 shrink-0 z-20 draggable-region">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-lg bg-gray-300 mb-6 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Me" className="w-full h-full bg-white" />
        </div>

        {/* Main Tabs */}
        <SidebarItem icon={MessageCircle} label="微信" active={viewMode === 'chat'} onClick={() => setViewMode('chat')} />
        <SidebarItem icon={Users} label="通讯录" active={viewMode === 'contacts'} onClick={() => setViewMode('contacts')} />
        <SidebarItem icon={FolderGit2} label="剧情剧本" active={viewMode === 'stories'} onClick={() => setViewMode('stories')} />

        {/* Spacer */}
        <div className="flex-1" />

        {/* Bottom Actions */}
        <SidebarItem icon={Smartphone} label="小程序" />
        <SidebarItem icon={Settings} label="设置" />
        
        <button 
            onClick={onClose}
            className="mt-2 p-3 text-[#979797] hover:text-red-400 transition-colors"
            title="退出微信"
        >
            <Power size={20} strokeWidth={1.5} />
        </button>
      </div>

      {/* 2. Secondary Column (List/Menu) - Dynamic based on ViewMode */}
      <div className="w-[280px] bg-[#e6e6e6] border-r border-[#d1d1d1] flex flex-col shrink-0">
        {/* Search Header */}
        <div className="h-16 bg-[#f5f5f5] flex items-center px-3 border-b border-[#e0e0e0] shrink-0">
            <div className="flex-1 bg-[#e2e2e2] rounded-md h-8 flex items-center px-3 text-xs text-gray-500 gap-2 group focus-within:bg-white focus-within:ring-1 focus-within:ring-green-500 transition-all">
                <Search size={14} />
                <input className="bg-transparent border-none outline-none w-full h-full placeholder-gray-500" placeholder="搜索" />
            </div>
            <button className="ml-3 w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-[#dcdcdc] transition-colors">
                <div className="text-xl leading-none font-light">+</div>
            </button>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
             {viewMode === 'chat' && (
                 sessions.length > 0 ? sessions.map(session => {
                     const isSelected = session.id === selectedSessionId;
                     const lastMsgText = session.lastMessage ? cleanText(session.lastMessage.text) : '';
                     const isGroup = session.type === 'group';
                     
                     return (
                         <div 
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.id)}
                            className={`flex items-center px-3 py-3.5 cursor-pointer transition-colors ${isSelected ? 'bg-[#c6c6c6]' : 'hover:bg-[#d9d9d9]'}`}
                         >
                             <div className={`w-11 h-11 rounded-lg ${session.avatarColor} flex items-center justify-center text-white font-medium text-sm shrink-0 overflow-hidden shadow-sm`}>
                                 {isGroup ? (
                                     <div className="grid grid-cols-2 gap-0.5 p-1 w-full h-full bg-gray-200">
                                         {[1,2,3,4].map(i => <div key={i} className="bg-gray-400 w-full h-full rounded-[1px]" />)}
                                     </div>
                                 ) : (
                                    session.title[0]
                                 )}
                             </div>
                             
                             <div className="ml-3 flex-1 min-w-0">
                                 <div className="flex justify-between items-center mb-0.5">
                                     <span className="text-[14px] font-normal text-black truncate">{session.title}</span>
                                     <span className="text-[10px] text-gray-400 font-light">22:30</span>
                                 </div>
                                 <div className="text-[12px] text-gray-500 truncate pr-2 opacity-80">
                                     {lastMsgText}
                                 </div>
                             </div>
                         </div>
                     );
                 }) : (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                         <MessageCircle size={40} className="opacity-20" />
                         <span className="text-xs">暂无消息，请先选择剧情</span>
                         <button onClick={() => setViewMode('stories')} className="text-xs text-blue-600 hover:underline mt-2">去选择剧情</button>
                     </div>
                 )
             )}

             {viewMode === 'stories' && (
                 <div className="p-2 space-y-2">
                     <div className="px-2 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">可选剧本</div>
                     {STORY_THREADS.map(thread => {
                         const isActive = state.activeThreadId === thread.id;
                         const progress = state.progressByThreadId[thread.id] || 0;
                         const percent = Math.min(100, Math.floor((progress / thread.messages.length) * 100));
                         return (
                             <div 
                                key={thread.id}
                                onClick={() => handlePreviewStory(thread.id)}
                                className={`p-3 rounded-lg cursor-pointer border transition-all ${previewThreadId === thread.id ? 'bg-white border-green-500 shadow-sm' : 'bg-[#f0f0f0] border-transparent hover:bg-white hover:shadow-sm'}`}
                             >
                                 <div className="flex items-center justify-between gap-2">
                                   <div>
                                     <div className="text-sm font-bold text-gray-900 mb-1">{thread.title}</div>
                                     <div className="text-xs text-gray-500 leading-snug line-clamp-2">{thread.summary}</div>
                                   </div>
                                   <button
                                     className="text-xs text-green-700 font-bold px-2 py-1 bg-green-50 rounded-md border border-green-200"
                                     onClick={(e) => { e.stopPropagation(); handleStartStory(thread.id); }}
                                   >
                                     {isActive ? '继续' : progress > 0 ? '接续' : '开始'}
                                   </button>
                                 </div>
                                 <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                   <div className="bg-[#07c160] h-full" style={{ width: `${percent}%` }} />
                                 </div>
                                 {isActive && <div className="mt-2 text-[10px] text-green-600 font-bold flex items-center gap-1">● 进行中</div>}
                             </div>
                         )
                     })}
                 </div>
             )}

             {viewMode === 'contacts' && (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                     <Users size={48} className="opacity-10 mb-4" />
                     <p className="text-sm">通讯录为空</p>
                 </div>
             )}
        </div>
        
        {/* Story Progress Controller (Only in Chat Mode) */}
        {viewMode === 'chat' && activeThread && (
            <div className="p-4 border-t border-[#d1d1d1] bg-[#f5f5f5]">
                {lastUnlockedMessage?.requiresClueSync && isLastCaseCompleted && !lastClueSynced && (
                  <div className="mb-3 text-xs text-amber-800 bg-amber-100 border border-amber-200 rounded px-3 py-2 flex items-center justify-between gap-3">
                    <span>任务 {lastUnlockedMessage.targetCaseId} 已完成，请先同步线索到微信群。</span>
                    <button
                      onClick={() => handleSyncClue(activeThread, lastUnlockedMessage)}
                      className="text-xs bg-amber-500 text-white px-3 py-1 rounded"
                    >
                      同步线索
                    </button>
                  </div>
                )}
                <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-medium text-gray-600">剧情进度</span>
                    <span className="text-[10px] text-gray-400 font-mono">{currentProgress}/{activeThread.messages.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 overflow-hidden">
                    <div 
                        className="bg-[#07c160] h-full transition-all duration-500" 
                        style={{ width: `${(currentProgress / activeThread.messages.length) * 100}%` }}
                    />
                </div>
                <button 
                    onClick={handleNext}
                    disabled={isAtEnd || isBlockingNext}
                    className="w-full bg-[#07c160] hover:bg-[#06ad56] disabled:bg-gray-300 disabled:text-gray-500 text-white text-sm py-2 rounded-md font-medium transition-colors shadow-sm active:scale-95 transform"
                >
                    {isAtEnd
                      ? '剧情已全部解锁'
                      : blockingReason || '下一条消息'}
                </button>
            </div>
        )}
      </div>

      {/* 3. Main Stage (Chat or Detail) */}
      <div className="flex-1 flex flex-col bg-[#f2f2f2] min-w-0 relative">
         
         {/* Window Controls (Mac Style) */}
         <div className="absolute top-0 right-0 p-4 flex gap-2 z-50 opacity-0 hover:opacity-100 transition-opacity">
             {/* Fake controls just for visuals if needed, but usually sidebar has them? Actually Mac puts them on Top Left. 
                 Since we are inside a window, let's put them in the Title Bar area.
             */}
         </div>

         {viewMode === 'stories' && previewThread && (
            <div className="flex-1 p-10 overflow-y-auto">
              <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow border border-gray-200 p-8 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2">
                      <Info size={14} /> 剧情简介
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mt-1">{previewThread.title}</h2>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{previewThread.intro}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">场景数</div>
                    <div className="text-3xl font-bold text-gray-900">{previewThread.scenes}</div>
                    <div className="text-xs text-gray-400">消息节点</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {previewThread.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
                    <ListTree size={14} /> 剧情摘要
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{previewThread.summary}</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    已推进 {state.progressByThreadId[previewThread.id] || 0} / {previewThread.messages.length} 条消息
                  </div>
                  <div className="flex gap-3">
                    {state.activeThreadId === previewThread.id && (
                      <button onClick={handleQuitStory} className="text-sm px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-white transition-colors">
                        退出剧情
                      </button>
                    )}
                    <button
                      onClick={() => handleStartStory(previewThread.id)}
                      className="flex items-center gap-2 bg-[#07c160] px-5 py-2 text-sm text-white rounded-md shadow hover:bg-[#06ad56]"
                    >
                      <PlayCircle size={16} />
                      {state.activeThreadId === previewThread.id
                        ? '继续当前剧情'
                        : (state.progressByThreadId[previewThread.id] || 0) > 0
                          ? '继续剧情'
                          : '开始剧情'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
         )}

         {viewMode === 'chat' && activeThread && activeSession && (
             <>
                {/* Chat Header */}
                <div className="h-16 border-b border-[#e7e7e7] flex items-center justify-between px-6 shrink-0 bg-[#f5f5f5]">
                    <div className="font-medium text-[16px] text-black flex items-center gap-1.5">
                        {activeSession.title}
                        {activeSession.type === 'group' && <span className="text-gray-500 text-sm font-normal">(34)</span>}
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={handleQuitStory} className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-white transition-colors">退出剧情</button>
                        <button className="text-gray-600 hover:text-black"><MoreHorizontal size={20} /></button>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {activeSession.messages.map((msg, i) => {
                        const isMe = msg.sender === CURRENT_USER;
                        const displayText = cleanText(msg.text);
                        const clueKey = msg.clueKey || msg.id;
                        const syncList = state.clueSyncByThreadId[activeThread.id] || [];
                        const messageClueSynced = syncList.includes(clueKey);
                        const caseDone = msg.targetCaseId ? completedCases.includes(msg.targetCaseId) : false;
                        
                        return (
                            <div key={i} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} group`}>
                                {/* Avatar */}
                                <div className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center text-xs font-medium text-white cursor-pointer shadow-sm ${isMe ? 'bg-gray-200 overflow-hidden' : activeSession.avatarColor}`}>
                                    {isMe ? (
                                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Me" className="w-full h-full" />
                                    ) : (
                                        msg.sender[0]
                                    )}
                                </div>

                                {/* Bubble */}
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                    {!isMe && activeSession.type === 'group' && (
                                        <span className="text-[10px] text-gray-400 mb-1 ml-0.5 select-none">{msg.sender}</span>
                                    )}
                                    
                                    <div className={`
                                        px-3 py-2.5 text-[14px] leading-relaxed relative break-words shadow-sm
                                        ${isMe 
                                            ? 'bg-[#95ec69] text-black rounded-[6px]' 
                                            : 'bg-white text-black rounded-[6px] border border-[#ededed]'}
                                    `}>
                                        {displayText}
                                        {/* Action Link */}
                                        {msg.targetCaseId && (
                                           <button
                                             onClick={() => onOpenCase(msg.targetCaseId!)}
                                             className="block mt-2 text-xs text-blue-600 hover:text-blue-700 hover:underline border-t border-black/5 pt-2 w-full text-left flex items-center gap-1"
                                           >
                                             <FileText size={12} />
                                             查看任务: {msg.targetCaseId}
                                           </button>
                                         )}
                                        {msg.requiresClueSync && (
                                          <div className="mt-2 border-t border-black/5 pt-2 text-xs flex items-center justify-between gap-2">
                                            <span className={`text-[11px] ${messageClueSynced ? 'text-green-600' : caseDone ? 'text-amber-600' : 'text-gray-500'}`}>
                                              {messageClueSynced ? '线索已同步' : caseDone ? '完成任务后请同步线索' : '完成任务后可同步线索'}
                                            </span>
                                            {caseDone && !messageClueSynced && (
                                              <button
                                                onClick={() => handleSyncClue(activeThread, msg)}
                                                className="text-[11px] px-2 py-0.5 rounded bg-amber-500 text-white"
                                              >
                                                同步线索
                                              </button>
                                            )}
                                          </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area (Read Only) */}
                <div className="h-[160px] border-t border-[#e7e7e7] bg-[#f5f5f5] flex flex-col shrink-0">
                    {/* Toolbar */}
                    <div className="h-10 flex items-center px-5 gap-5 text-[#5d5d5d]">
                        <span className="opacity-40 cursor-default hover:opacity-60 transition-opacity"><MessageCircle size={20} /></span>
                        <span className="opacity-40 cursor-default hover:opacity-60 transition-opacity"><FolderGit2 size={20} /></span>
                        <span className="opacity-40 cursor-default hover:opacity-60 transition-opacity"><Settings size={20} /></span>
                    </div>
                    {/* Textarea */}
                    <div className="flex-1 px-6 py-1 text-sm text-gray-400 italic cursor-not-allowed select-none font-light">
                        由于当前处于剧情回放模式，无法手动发送消息...
                    </div>
                    {/* Footer */}
                    <div className="h-14 flex items-center justify-end px-6 pb-2">
                        <button className="bg-[#e9e9e9] text-[#b2b2b2] px-6 py-1.5 text-sm rounded-[4px] cursor-not-allowed font-medium">
                            发送(S)
                        </button>
                    </div>
                </div>
             </>
         )}

         {viewMode === 'chat' && (!activeThread || !activeSession) && (
             <div className="flex-1 flex flex-col items-center justify-center text-[#dcdcdc] bg-[#f2f2f2]">
                 <div className="w-24 h-24 bg-[#e6e6e6] rounded-full flex items-center justify-center mb-6">
                     <MessageCircle size={48} className="text-[#d1d1d1] ml-1 mt-1" />
                 </div>
                 <p className="text-gray-400 text-sm font-medium">未选择会话</p>
                 <button onClick={() => setViewMode('stories')} className="text-xs text-blue-500 mt-2 hover:underline">返回剧情列表</button>
             </div>
         )}
      </div>

    </div>
  );
};
