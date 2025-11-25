import React from 'react';
import { Info, Tag, ListTree, PlayCircle } from 'lucide-react';
import { StoryThread } from '../../storylines';

interface StoryPreviewPanelProps {
  thread: StoryThread | null;
  progress: number;
  isActive: boolean;
  onStart: () => void;
  onQuit: () => void;
}

export const StoryPreviewPanel: React.FC<StoryPreviewPanelProps> = ({
  thread,
  progress,
  isActive,
  onStart,
  onQuit,
}) => {
  if (!thread) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        暂无可选剧情
      </div>
    );
  }

  return (
    <div className="flex-1 p-10 overflow-y-auto">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow border border-gray-200 p-8 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-gray-500 uppercase tracking-wide flex items-center gap-2">
              <Info size={14} /> 剧情简介
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mt-1">{thread.title}</h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">{thread.intro}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">场景数</div>
            <div className="text-3xl font-bold text-gray-900">{thread.scenes}</div>
            <div className="text-xs text-gray-400">消息节点</div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {thread.tags.map(tag => (
            <span
              key={tag}
              className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1"
            >
              <Tag size={10} /> {tag}
            </span>
          ))}
        </div>
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1 flex items-center gap-2">
            <ListTree size={14} /> 剧情摘要
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{thread.summary}</p>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            已推进 {progress} / {thread.messages.length} 条消息
          </div>
          <div className="flex gap-3">
            {isActive && (
              <button
                onClick={onQuit}
                className="text-sm px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-white transition-colors"
              >
                退出剧情
              </button>
            )}
            <button
              onClick={onStart}
              className="flex items-center gap-2 bg-[#07c160] px-5 py-2 text-sm text-white rounded-md shadow hover:bg-[#06ad56]"
            >
              <PlayCircle size={16} />
              {isActive ? '继续当前剧情' : progress > 0 ? '继续剧情' : '开始剧情'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
