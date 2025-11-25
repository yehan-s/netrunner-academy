import React, { useEffect, useMemo, useState } from 'react';
import { STORY_THREADS, StoryMessage } from '../storylines';
import { NavigationRail } from './wechat/NavigationRail';
import { ThreadListPanel } from './wechat/ThreadListPanel';
import { StoryProgressController } from './wechat/StoryProgressController';
import { StoryPreviewPanel } from './wechat/StoryPreviewPanel';
import { StoryChatPanel } from './wechat/StoryChatPanel';
import { useWeChatStoryState } from './wechat/useWeChatStoryState';
import { ViewMode } from './wechat/types';

interface WeChatStoryAppProps {
  onOpenCase: (id: string) => void;
  onClose: () => void;
  completedCases: string[];
}

const DEFAULT_SESSION_ID = 'group_incident';

export const WeChatStoryApp: React.FC<WeChatStoryAppProps> = ({
  onOpenCase,
  onClose,
  completedCases,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('chat');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(DEFAULT_SESSION_ID);
  const [previewThreadId, setPreviewThreadId] = useState<string>(STORY_THREADS[0]?.id || '');

  const { state, activeThread, currentProgress, sessions, gating, clueSyncList, actions } =
    useWeChatStoryState(completedCases);

  useEffect(() => {
    if (!state.activeThreadId) {
      setViewMode('stories');
    } else {
      setPreviewThreadId(state.activeThreadId);
    }
  }, [state.activeThreadId]);

  useEffect(() => {
    if (viewMode !== 'chat') return;
    if (sessions.length === 0) return;
    const sessionExists = sessions.some(s => s.id === selectedSessionId);
    if (!sessionExists) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [viewMode, sessions, selectedSessionId]);

  const previewThread = useMemo(
    () => STORY_THREADS.find(t => t.id === previewThreadId) || STORY_THREADS[0] || null,
    [previewThreadId],
  );

  const activeSession = useMemo(
    () => sessions.find(s => s.id === selectedSessionId) || sessions[0] || null,
    [sessions, selectedSessionId],
  );

  const handleStartStory = (storyId: string) => {
    actions.startStory(storyId);
    setSelectedSessionId(DEFAULT_SESSION_ID);
    setViewMode('chat');
  };

  const handleQuitStory = () => {
    actions.quitStory();
    setSelectedSessionId(DEFAULT_SESSION_ID);
    setViewMode('stories');
  };

  const handlePreviewStory = (storyId: string) => {
    setPreviewThreadId(storyId);
    setViewMode('stories');
  };

  const syncClueForMessage = (message: StoryMessage) => {
    if (!activeThread) return;
    actions.syncClue(activeThread, message);
  };

  const handleProgressSync = () => {
    if (!activeThread || !gating.lastMessage) return;
    actions.syncClue(activeThread, gating.lastMessage);
  };

  const showStoryPreview = viewMode === 'stories';
  const showChatView = viewMode === 'chat';

  return (
    <div className="flex h-full w-full bg-[#f5f5f5] text-gray-900 rounded-xl shadow-2xl overflow-hidden border border-[#333]/10 font-sans animate-in fade-in zoom-in-95 duration-300">
      <NavigationRail viewMode={viewMode} onChange={setViewMode} onClose={onClose} />

      <div className="flex flex-col shrink-0">
        <ThreadListPanel
          viewMode={viewMode}
          sessions={sessions}
          selectedSessionId={selectedSessionId}
          onSelectSession={setSelectedSessionId}
          onRequestStorySelection={() => setViewMode('stories')}
          previewThreadId={previewThreadId}
          onPreviewThread={handlePreviewStory}
          onStartStory={handleStartStory}
          activeThreadId={state.activeThreadId}
          progressByThreadId={state.progressByThreadId}
        />
        {showChatView && activeThread && (
          <StoryProgressController
            activeThread={activeThread}
            currentProgress={currentProgress}
            gating={gating}
            onAdvance={actions.advance}
            onSyncClue={handleProgressSync}
          />
        )}
      </div>

      <div className="flex-1 flex flex-col bg-[#f2f2f2] min-w-0 relative">
        {showStoryPreview ? (
          <StoryPreviewPanel
            thread={previewThread}
            progress={previewThread ? state.progressByThreadId[previewThread.id] || 0 : 0}
            isActive={state.activeThreadId === previewThread?.id}
            onStart={() => previewThread && handleStartStory(previewThread.id)}
            onQuit={handleQuitStory}
          />
        ) : (
          <StoryChatPanel
            activeThread={activeThread}
            activeSession={activeSession}
            clueSyncList={clueSyncList}
            completedCases={completedCases}
            onOpenCase={onOpenCase}
            onQuitStory={handleQuitStory}
            onSyncClue={syncClueForMessage}
            onShowStories={() => setViewMode('stories')}
          />
        )}
      </div>
    </div>
  );
};
