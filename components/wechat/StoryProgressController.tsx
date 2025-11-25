import React from 'react';
import { StoryThread } from '../../storylines';
import { StoryGatingState } from './useWeChatStoryState';

interface StoryProgressControllerProps {
  activeThread: StoryThread;
  currentProgress: number;
  gating: StoryGatingState;
  onAdvance: () => void;
  onSyncClue: () => void;
}

export const StoryProgressController: React.FC<StoryProgressControllerProps> = ({
  activeThread,
  currentProgress,
  gating,
  onAdvance,
  onSyncClue,
}) => {
  return (
    <div className="p-4 border-t border-[#d1d1d1] bg-[#f5f5f5]">
      {gating.requiresClueSync &&
        gating.isLastCaseCompleted &&
        !gating.lastClueSynced &&
        gating.lastMessage?.targetCaseId && (
          <div className="mb-3 text-xs text-amber-800 bg-amber-100 border border-amber-200 rounded px-3 py-2 flex items-center justify-between gap-3">
            <span>任务 {gating.lastMessage.targetCaseId} 已完成，请先同步线索到微信群。</span>
            <button
              onClick={onSyncClue}
              className="text-xs bg-amber-500 text-white px-3 py-1 rounded"
            >
              同步线索
            </button>
          </div>
        )}

      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-medium text-gray-600">剧情进度</span>
        <span className="text-[10px] text-gray-400 font-mono">
          {currentProgress}/{activeThread.messages.length}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-3 overflow-hidden">
        <div
          className="bg-[#07c160] h-full transition-all duration-500"
          style={{ width: `${(currentProgress / activeThread.messages.length) * 100}%` }}
        />
      </div>
      <button
        onClick={onAdvance}
        disabled={gating.isAtEnd || gating.isBlocking}
        className="w-full bg-[#07c160] hover:bg-[#06ad56] disabled:bg-gray-300 disabled:text-gray-500 text-white text-sm py-2 rounded-md font-medium transition-colors shadow-sm active:scale-95 transform"
      >
        {gating.isAtEnd ? '剧情已全部解锁' : gating.reason || '下一条消息'}
      </button>
    </div>
  );
};
