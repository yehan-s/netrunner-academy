import { useCallback, useEffect, useMemo, useState } from 'react';
import { STORY_THREADS, StoryMessage, StoryThread } from '../../storylines';

export const STORAGE_KEY = 'netrunner_wechat_state_v3';
export const CURRENT_USER = '你';

export interface PersistedState {
  activeThreadId: string | null;
  progressByThreadId: Record<string, number>;
  clueSyncByThreadId: Record<string, string[]>;
}

export interface ChatSession {
  id: string;
  type: 'group' | 'private';
  title: string;
  messages: StoryMessage[];
  lastMessage: StoryMessage | null;
  unreadCount: number;
  avatarColor: string;
}

export interface StoryGatingState {
  isBlocking: boolean;
  reason: string | null;
  isAtEnd: boolean;
  lastMessage: StoryMessage | null;
  isLastCaseCompleted: boolean;
  requiresClueSync: boolean;
  lastClueSynced: boolean;
}

const DEFAULT_STATE: PersistedState = {
  activeThreadId: null,
  progressByThreadId: {},
  clueSyncByThreadId: {},
};

const readInitialState = (): PersistedState => {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return {
      activeThreadId: parsed.activeThreadId ?? null,
      progressByThreadId: parsed.progressByThreadId ?? {},
      clueSyncByThreadId: parsed.clueSyncByThreadId ?? {},
    };
  } catch {
    return DEFAULT_STATE;
  }
};

export const cleanStoryText = (text: string) => text.replace(/【.*?】/g, '');

const getSessionId = (msg: StoryMessage): string => {
  if (msg.text.startsWith('【群聊】')) return 'group_incident';
  if (msg.text.startsWith('【私聊】')) {
    return msg.sender === CURRENT_USER ? 'unknown_target' : `private_${msg.sender}`;
  }
  return 'group_incident';
};

const getSessionTitle = (sessionId: string, msg?: StoryMessage): string => {
  if (sessionId === 'group_incident') return '线上事故处理群 (34)';
  if (sessionId.startsWith('private_')) return msg?.sender ?? '私聊';
  return '未知会话';
};

const createSession = (sessionId: string, msg?: StoryMessage): ChatSession => ({
  id: sessionId,
  type: sessionId.includes('group') ? 'group' : 'private',
  title: getSessionTitle(sessionId, msg),
  messages: [],
  lastMessage: null,
  unreadCount: 0,
  avatarColor: sessionId.includes('group') ? 'bg-blue-600' : 'bg-indigo-500',
});

const buildSessions = (thread: StoryThread | null, progress: number): ChatSession[] => {
  if (!thread) return [];

  const visibleMessages = thread.messages.slice(0, progress);
  const sessionMap = new Map<string, ChatSession>();
  sessionMap.set('group_incident', createSession('group_incident'));

  let lastTarget = 'group_incident';

  visibleMessages.forEach((msg, index) => {
    let sessionId = getSessionId(msg);

    if (sessionId === 'unknown_target') {
      let resolved: string | null = null;
      for (let i = index - 1; i >= 0; i--) {
        const prevMsg = visibleMessages[i];
        const prevId = getSessionId(prevMsg);
        if (prevId !== 'group_incident' && prevId !== 'unknown_target') {
          resolved = prevId;
          break;
        }
      }
      sessionId =
        resolved || (lastTarget !== 'unknown_target' ? lastTarget : 'group_incident');
    }

    lastTarget = sessionId;

    if (!sessionMap.has(sessionId)) {
      sessionMap.set(sessionId, createSession(sessionId, msg));
    }

    const session = sessionMap.get(sessionId)!;
    session.messages.push(msg);
    session.lastMessage = msg;
  });

  return Array.from(sessionMap.values());
};

export const useWeChatStoryState = (completedCases: string[]) => {
  const [state, setState] = useState<PersistedState>(() => readInitialState());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const activeThread = useMemo(
    () => STORY_THREADS.find(t => t.id === state.activeThreadId) || null,
    [state.activeThreadId],
  );

  const currentProgress = useMemo(() => {
    if (!activeThread) return 0;
    return state.progressByThreadId[activeThread.id] || 0;
  }, [activeThread, state.progressByThreadId]);

  const sessions = useMemo(
    () => buildSessions(activeThread, currentProgress),
    [activeThread, currentProgress],
  );

  const lastUnlockedMessage = useMemo(() => {
    if (!activeThread || currentProgress === 0) return null;
    return activeThread.messages[currentProgress - 1] ?? null;
  }, [activeThread, currentProgress]);

  const lastMsgCaseId = lastUnlockedMessage?.targetCaseId;
  const isLastCaseCompleted = !!(
    lastMsgCaseId && completedCases.includes(lastMsgCaseId)
  );
  const lastClueKey = lastUnlockedMessage
    ? lastUnlockedMessage.clueKey || lastUnlockedMessage.id
    : null;
  const clueSyncList = activeThread
    ? state.clueSyncByThreadId[activeThread.id] || []
    : [];
  const lastClueSynced = !!(lastClueKey && clueSyncList.includes(lastClueKey));

  const isAtEnd = useMemo(() => {
    if (!activeThread) return false;
    return currentProgress >= activeThread.messages.length;
  }, [activeThread, currentProgress]);

  const requiresClueSync = !!lastUnlockedMessage?.requiresClueSync;

  const isBlockingNext =
    !!activeThread &&
    currentProgress > 0 &&
    ((lastMsgCaseId && !isLastCaseCompleted) ||
      (requiresClueSync && isLastCaseCompleted && !lastClueSynced));

  const blockingReason = useMemo(() => {
    if (!activeThread || currentProgress === 0) return null;
    if (lastMsgCaseId && !isLastCaseCompleted) return '请先完成上一个任务';
    if (requiresClueSync && isLastCaseCompleted && !lastClueSynced)
      return '请先同步线索';
    return null;
  }, [
    activeThread,
    currentProgress,
    isLastCaseCompleted,
    lastClueSynced,
    lastMsgCaseId,
    requiresClueSync,
  ]);

  const gating: StoryGatingState = {
    isBlocking: Boolean(isBlockingNext),
    reason: blockingReason,
    isAtEnd,
    lastMessage: lastUnlockedMessage ?? null,
    isLastCaseCompleted,
    requiresClueSync,
    lastClueSynced,
  };

  const advance = useCallback(() => {
    if (!activeThread) return;
    if (gating.isBlocking || gating.isAtEnd) return;
    const next = currentProgress + 1;
    setState(prev => ({
      ...prev,
      progressByThreadId: {
        ...prev.progressByThreadId,
        [activeThread.id]: next,
      },
    }));
  }, [activeThread, currentProgress, gating.isBlocking, gating.isAtEnd]);

  const startStory = useCallback((storyId: string) => {
    setState(prev => ({
      ...prev,
      activeThreadId: storyId,
      progressByThreadId: {
        ...prev.progressByThreadId,
        [storyId]: Math.max(prev.progressByThreadId[storyId] || 0, 1),
      },
    }));
  }, []);

  const quitStory = useCallback(() => {
    setState(prev => ({ ...prev, activeThreadId: null }));
  }, []);

  const syncClue = useCallback((thread: StoryThread, message: StoryMessage) => {
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
  }, [completedCases]);

  return {
    state,
    activeThread,
    currentProgress,
    sessions,
    gating,
    clueSyncList,
    actions: {
      advance,
      startStory,
      quitStory,
      syncClue,
    },
  };
};
