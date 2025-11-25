import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MessageCircle, FolderGit2, Settings, MoreHorizontal, FileText } from 'lucide-react';
import { StoryThread, StoryMessage } from '../../storylines';
import { ChatSession, cleanStoryText, CURRENT_USER } from './useWeChatStoryState';
import { TypingIndicator } from './TypingIndicator';
import { ClueBoard, ClueItem } from './ClueBoard';

// 角色头像颜色映射
const SENDER_AVATAR_COLORS: Record<string, string> = {
  '同事': 'bg-blue-600',
  '安全负责人': 'bg-red-600',
  '产品': 'bg-purple-600',
  '运维': 'bg-orange-600',
  '客服': 'bg-teal-600',
  '老板': 'bg-amber-700',
};

const getSenderAvatarColor = (sender: string): string => {
  return SENDER_AVATAR_COLORS[sender] || 'bg-gray-600';
};

interface StoryChatPanelProps {
  activeThread: StoryThread | null;
  activeSession: ChatSession | null;
  clueSyncList: string[];
  completedCases: string[];
  onOpenCase: (caseId: string) => void;
  onQuitStory: () => void;
  onSyncClue: (message: StoryMessage) => void;
  onShowStories: () => void;
}

export const StoryChatPanel: React.FC<StoryChatPanelProps> = ({
  activeThread,
  activeSession,
  clueSyncList,
  completedCases,
  onOpenCase,
  onQuitStory,
  onSyncClue,
  onShowStories,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingState, setTypingState] = useState<{ isTyping: boolean; sender: string } | null>(null);
  const [newMessageId, setNewMessageId] = useState<string | null>(null);
  const prevMessageCountRef = useRef<number>(0);

  // 检测新消息并触发 typing 动画
  useEffect(() => {
    if (!activeSession?.messages.length) return;
    
    const currentCount = activeSession.messages.length;
    const prevCount = prevMessageCountRef.current;
    
    if (currentCount > prevCount && prevCount > 0) {
      const newMsg = activeSession.messages[currentCount - 1];
      // 只为非"你"的消息显示 typing
      if (newMsg.sender !== CURRENT_USER) {
        const delay = newMsg.typingDelay ?? 800;
        setTypingState({ isTyping: true, sender: newMsg.sender });
        setNewMessageId(null);
        
        const timer = setTimeout(() => {
          setTypingState(null);
          setNewMessageId(newMsg.id);
          // 清除新消息高亮
          setTimeout(() => setNewMessageId(null), 500);
        }, delay);
        
        return () => clearTimeout(timer);
      } else {
        setNewMessageId(newMsg.id);
        setTimeout(() => setNewMessageId(null), 500);
      }
    }
    
    prevMessageCountRef.current = currentCount;
  }, [activeSession?.messages.length, activeSession?.id]);

  // 生成线索数据
  const clueItems = useMemo<ClueItem[]>(() => {
    if (!activeThread) return [];
    
    return activeThread.messages
      .filter((msg) => msg.requiresClueSync && msg.targetCaseId)
      .map((msg) => {
        const clueKey = msg.clueKey || msg.id;
        return {
          id: clueKey,
          title: msg.targetCaseId?.replace('story_', '').replace(/_/g, ' ') || '未知任务',
          timestamp: msg.timestamp || '',
          caseId: msg.targetCaseId!,
          summary: cleanStoryText(msg.text).slice(0, 50) + '...',
          synced: clueSyncList.includes(clueKey),
        };
      });
  }, [activeThread, clueSyncList]);

  // 线索面板显示状态
  const [showClueBoard, setShowClueBoard] = useState(true);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages.length, activeSession?.id, typingState]);

  if (!activeThread || !activeSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#dcdcdc] bg-[#f2f2f2]">
        <div className="w-24 h-24 bg-[#e6e6e6] rounded-full flex items-center justify-center mb-6">
          <MessageCircle size={48} className="text-[#d1d1d1] ml-1 mt-1" />
        </div>
        <p className="text-gray-400 text-sm font-medium">未选择会话</p>
        <button onClick={onShowStories} className="text-xs text-blue-500 mt-2 hover:underline">
          返回剧情列表
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 min-h-0">
      {/* 聊天主区域 */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-16 border-b border-[#e7e7e7] flex items-center justify-between px-6 shrink-0 bg-[#f5f5f5]">
          <div className="font-medium text-[16px] text-black flex items-center gap-1.5">
            {activeSession.title}
            {activeSession.type === 'group' && <span className="text-gray-500 text-sm font-normal">(34)</span>}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onQuitStory}
              className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-white transition-colors"
            >
              退出剧情
            </button>
          <button className="text-gray-600 hover:text-black">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {activeSession.messages
          .filter((msg) => !(typingState?.isTyping && msg.id === activeSession.messages[activeSession.messages.length - 1]?.id && msg.sender !== CURRENT_USER))
          .map((msg, index) => {
          const isMe = msg.sender === CURRENT_USER;
          const displayText = cleanStoryText(msg.text);
          const clueKey = msg.clueKey || msg.id;
          const messageClueSynced = clueSyncList.includes(clueKey);
          const caseDone = msg.targetCaseId ? completedCases.includes(msg.targetCaseId) : false;
          const isNewMessage = msg.id === newMessageId;

          return (
            <div 
              key={`${msg.id}-${index}`} 
              className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} group ${isNewMessage ? 'animate-in fade-in slide-in-from-bottom-2 duration-300' : ''}`}
            >
              <div
                className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center text-xs font-medium text-white cursor-pointer shadow-sm ${
                  isMe ? 'bg-gray-200 overflow-hidden' : getSenderAvatarColor(msg.sender)
                }`}
              >
                {isMe ? (
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                    alt="Me"
                    className="w-full h-full"
                  />
                ) : (
                  msg.sender[0]
                )}
              </div>

              <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                <div className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                  {!isMe && activeSession.type === 'group' && (
                    <span className="text-[10px] text-gray-400 ml-0.5 select-none">{msg.sender}</span>
                  )}
                  {msg.timestamp && (
                    <span className="text-[10px] text-gray-300 select-none">{msg.timestamp}</span>
                  )}
                </div>

                <div
                  className={`px-3 py-2.5 text-[14px] leading-relaxed relative break-words shadow-sm ${
                    isMe
                      ? 'bg-[#95ec69] text-black rounded-[6px]'
                      : 'bg-white text-black rounded-[6px] border border-[#ededed]'
                  }`}
                >
                  {displayText}
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
                      <span
                        className={`text-[11px] ${
                          messageClueSynced
                            ? 'text-green-600'
                            : caseDone
                              ? 'text-amber-600'
                              : 'text-gray-500'
                        }`}
                      >
                        {messageClueSynced ? '线索已同步' : caseDone ? '完成任务后请同步线索' : '完成任务后可同步线索'}
                      </span>
                      {caseDone && !messageClueSynced && (
                        <button
                          onClick={() => onSyncClue(msg)}
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
        
        {typingState?.isTyping && (
          <TypingIndicator 
            sender={typingState.sender} 
            avatarColor={getSenderAvatarColor(typingState.sender)}
          />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="h-[160px] border-t border-[#e7e7e7] bg-[#f5f5f5] flex flex-col shrink-0">
        <div className="h-10 flex items-center px-5 gap-5 text-[#5d5d5d]">
          <span className="opacity-40 cursor-default hover:opacity-60 transition-opacity">
            <MessageCircle size={20} />
          </span>
          <span className="opacity-40 cursor-default hover:opacity-60 transition-opacity">
            <FolderGit2 size={20} />
          </span>
          <span className="opacity-40 cursor-default hover:opacity-60 transition-opacity">
            <Settings size={20} />
          </span>
        </div>
        <div className="flex-1 px-6 py-1 text-sm text-gray-400 italic cursor-not-allowed select-none font-light">
          由于当前处于剧情回放模式，无法手动发送消息...
        </div>
        <div className="h-14 flex items-center justify-end px-6 pb-2">
          <button className="bg-[#e9e9e9] text-[#b2b2b2] px-6 py-1.5 text-sm rounded-[4px] cursor-not-allowed font-medium">
            发送(S)
          </button>
        </div>
      </div>
      </div>

      {/* 线索面板 */}
      {clueItems.length > 0 && showClueBoard && (
        <ClueBoard
          clues={clueItems}
          completedCases={completedCases}
          onClueClick={(clue) => {
            // 找到对应的消息并触发同步
            const msg = activeThread?.messages.find(
              (m) => (m.clueKey || m.id) === clue.id
            );
            if (msg && !clue.synced && completedCases.includes(clue.caseId)) {
              onSyncClue(msg);
            }
          }}
        />
      )}
    </div>
  );
};
