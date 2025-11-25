import React from 'react';
import { MessageCircle, Users, Search } from 'lucide-react';
import { STORY_THREADS, StoryThread } from '../../storylines';
import { ChatSession, cleanStoryText } from './useWeChatStoryState';
import { ViewMode } from './types';

interface ThreadListPanelProps {
  viewMode: ViewMode;
  sessions: ChatSession[];
  selectedSessionId: string;
  onSelectSession: (id: string) => void;
  onRequestStorySelection: () => void;
  previewThreadId: string;
  onPreviewThread: (id: string) => void;
  onStartStory: (id: string) => void;
  activeThreadId: string | null;
  progressByThreadId: Record<string, number>;
}

const renderStoryCard = (
  thread: StoryThread,
  previewThreadId: string,
  activeThreadId: string | null,
  progressByThreadId: Record<string, number>,
  onPreviewThread: (id: string) => void,
  onStartStory: (id: string) => void,
) => {
  const progress = progressByThreadId[thread.id] || 0;
  const percent = Math.min(100, Math.floor((progress / thread.messages.length) * 100));
  const isActive = activeThreadId === thread.id;
  return (
    <div
      key={thread.id}
      onClick={() => onPreviewThread(thread.id)}
      className={`p-3 rounded-lg cursor-pointer border transition-all ${
        previewThreadId === thread.id
          ? 'bg-white border-green-500 shadow-sm'
          : 'bg-[#f0f0f0] border-transparent hover:bg-white hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold text-gray-900 mb-1">{thread.title}</div>
          <div className="text-xs text-gray-500 leading-snug line-clamp-2">
            {thread.summary}
          </div>
        </div>
        <button
          className="text-xs text-green-700 font-bold px-2 py-1 bg-green-50 rounded-md border border-green-200"
          onClick={e => {
            e.stopPropagation();
            onStartStory(thread.id);
          }}
        >
          {isActive ? '继续' : progress > 0 ? '接续' : '开始'}
        </button>
      </div>
      <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="bg-[#07c160] h-full" style={{ width: `${percent}%` }} />
      </div>
      {isActive && (
        <div className="mt-2 text-[10px] text-green-600 font-bold flex items-center gap-1">
          ● 进行中
        </div>
      )}
    </div>
  );
};

export const ThreadListPanel: React.FC<ThreadListPanelProps> = ({
  viewMode,
  sessions,
  selectedSessionId,
  onSelectSession,
  onRequestStorySelection,
  previewThreadId,
  onPreviewThread,
  onStartStory,
  activeThreadId,
  progressByThreadId,
}) => {
  return (
    <div className="w-[280px] bg-[#e6e6e6] border-r border-[#d1d1d1] flex flex-col shrink-0">
      <div className="h-16 bg-[#f5f5f5] flex items-center px-3 border-b border-[#e0e0e0] shrink-0">
        <div className="flex-1 bg-[#e2e2e2] rounded-md h-8 flex items-center px-3 text-xs text-gray-500 gap-2 group focus-within:bg-white focus-within:ring-1 focus-within:ring-green-500 transition-all">
          <Search size={14} />
          <input
            className="bg-transparent border-none outline-none w-full h-full placeholder-gray-500"
            placeholder="搜索"
          />
        </div>
        <button className="ml-3 w-8 h-8 rounded-md flex items-center justify-center text-gray-600 hover:bg-[#dcdcdc] transition-colors">
          <div className="text-xl leading-none font-light">+</div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {viewMode === 'chat' &&
          (sessions.length > 0 ? (
            sessions.map(session => {
              const isSelected = session.id === selectedSessionId;
              const lastMsgText = session.lastMessage
                ? cleanStoryText(session.lastMessage.text)
                : '';
              const isGroup = session.type === 'group';
              return (
                <div
                  key={session.id}
                  onClick={() => onSelectSession(session.id)}
                  className={`flex items-center px-3 py-3.5 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#c6c6c6]' : 'hover:bg-[#d9d9d9]'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-lg ${session.avatarColor} flex items-center justify-center text-white font-medium text-sm shrink-0 overflow-hidden shadow-sm`}
                  >
                    {isGroup ? (
                      <div className="grid grid-cols-2 gap-0.5 p-1 w-full h-full bg-gray-200">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="bg-gray-400 w-full h-full rounded-[1px]" />
                        ))}
                      </div>
                    ) : (
                      session.title[0]
                    )}
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[14px] font-normal text-black truncate">
                        {session.title}
                      </span>
                      <span className="text-[10px] text-gray-400 font-light">22:30</span>
                    </div>
                    <div className="text-[12px] text-gray-500 truncate pr-2 opacity-80">
                      {lastMsgText}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <MessageCircle size={40} className="opacity-20" />
              <span className="text-xs">暂无消息，请先选择剧情</span>
              <button
                onClick={onRequestStorySelection}
                className="text-xs text-blue-600 hover:underline mt-2"
              >
                去选择剧情
              </button>
            </div>
          ))}

        {viewMode === 'stories' && (
          <div className="p-2 space-y-2">
            <div className="px-2 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              可选剧本
            </div>
            {STORY_THREADS.map(thread =>
              renderStoryCard(
                thread,
                previewThreadId,
                activeThreadId,
                progressByThreadId,
                onPreviewThread,
                onStartStory,
              ),
            )}
          </div>
        )}

        {viewMode === 'contacts' && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Users size={48} className="opacity-10 mb-4" />
            <p className="text-sm">通讯录为空</p>
          </div>
        )}
      </div>
    </div>
  );
};
