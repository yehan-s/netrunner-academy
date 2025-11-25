import React, { useState } from 'react';
import { ChevronRight, ChevronDown, FileSearch, CheckCircle2, Clock } from 'lucide-react';

export interface ClueItem {
  id: string;
  title: string;
  timestamp: string;
  caseId: string;
  summary: string;
  synced: boolean;
}

interface ClueBoardProps {
  clues: ClueItem[];
  completedCases: string[];
  onClueClick?: (clue: ClueItem) => void;
}

export const ClueBoard: React.FC<ClueBoardProps> = ({
  clues,
  completedCases,
  onClueClick,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const syncedClues = clues.filter((c) => c.synced);
  const pendingClues = clues.filter((c) => !c.synced && completedCases.includes(c.caseId));

  if (clues.length === 0) {
    return null;
  }

  return (
    <div className="border-l border-gray-200 bg-gray-50 w-64 flex flex-col">
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between px-3 py-2 bg-white border-b border-gray-200 cursor-pointer hover:bg-gray-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <FileSearch size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">线索面板</span>
          <span className="text-xs text-gray-400">({syncedClues.length}/{clues.length})</span>
        </div>
        {isExpanded ? (
          <ChevronDown size={16} className="text-gray-400" />
        ) : (
          <ChevronRight size={16} className="text-gray-400" />
        )}
      </div>

      {/* 线索列表 */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {clues.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-4">
              暂无线索
            </div>
          ) : (
            <>
              {/* 待同步线索 */}
              {pendingClues.length > 0 && (
                <div className="mb-3">
                  <div className="text-[10px] text-amber-600 font-medium mb-1 flex items-center gap-1">
                    <Clock size={10} />
                    待同步 ({pendingClues.length})
                  </div>
                  {pendingClues.map((clue) => (
                    <ClueCard
                      key={clue.id}
                      clue={clue}
                      status="pending"
                      onClick={() => onClueClick?.(clue)}
                    />
                  ))}
                </div>
              )}

              {/* 已同步线索 */}
              {syncedClues.length > 0 && (
                <div>
                  <div className="text-[10px] text-green-600 font-medium mb-1 flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    已同步 ({syncedClues.length})
                  </div>
                  {syncedClues.map((clue) => (
                    <ClueCard
                      key={clue.id}
                      clue={clue}
                      status="synced"
                      onClick={() => onClueClick?.(clue)}
                    />
                  ))}
                </div>
              )}

              {/* 未完成任务的线索（灰色） */}
              {clues.filter((c) => !c.synced && !completedCases.includes(c.caseId)).length > 0 && (
                <div>
                  <div className="text-[10px] text-gray-400 font-medium mb-1">
                    待解锁
                  </div>
                  {clues
                    .filter((c) => !c.synced && !completedCases.includes(c.caseId))
                    .map((clue) => (
                      <ClueCard
                        key={clue.id}
                        clue={clue}
                        status="locked"
                      />
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

interface ClueCardProps {
  clue: ClueItem;
  status: 'synced' | 'pending' | 'locked';
  onClick?: () => void;
}

const ClueCard: React.FC<ClueCardProps> = ({ clue, status, onClick }) => {
  const statusStyles = {
    synced: 'bg-green-50 border-green-200 hover:bg-green-100',
    pending: 'bg-amber-50 border-amber-200 hover:bg-amber-100 cursor-pointer',
    locked: 'bg-gray-100 border-gray-200 opacity-50',
  };

  return (
    <div
      className={`p-2 rounded border text-xs mb-1 transition-colors ${statusStyles[status]}`}
      onClick={status !== 'locked' ? onClick : undefined}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="font-medium text-gray-700 line-clamp-1">{clue.title}</span>
        <span className="text-[10px] text-gray-400 shrink-0">{clue.timestamp}</span>
      </div>
      <p className="text-gray-500 mt-1 line-clamp-2">{clue.summary}</p>
      {status === 'synced' && (
        <div className="flex items-center gap-1 mt-1 text-green-600">
          <CheckCircle2 size={10} />
          <span className="text-[10px]">已同步到群聊</span>
        </div>
      )}
      {status === 'pending' && (
        <div className="flex items-center gap-1 mt-1 text-amber-600">
          <Clock size={10} />
          <span className="text-[10px]">点击同步线索</span>
        </div>
      )}
    </div>
  );
};
