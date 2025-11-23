import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { Send } from 'lucide-react';

interface GameTerminalProps {
  logs: LogEntry[];
  onAskAI: (query: string) => void;
  loadingAI: boolean;
  onSubmitFlag: (flag: string) => void;
}

export const GameTerminal: React.FC<GameTerminalProps> = ({ logs, onAskAI, loadingAI, onSubmitFlag }) => {
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Check if it looks like a flag submission
    // Since AI is disabled, we treat almost everything as a flag attempt or system command
    onSubmitFlag(input);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col bg-black font-mono text-sm border-t border-gray-800">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-1 bg-gray-900 border-b border-gray-800 text-xs text-gray-500 uppercase">
        <span>系统终端 (System Terminal)</span>
        <span>v1.0.5 (Offline Mode)</span>
      </div>

      {/* Logs Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <span className="text-gray-600 shrink-0">[{log.timestamp.toLocaleTimeString()}]</span>
            {log.source === 'AI' && <span className="text-purple-400 font-bold shrink-0">AI_CORE:</span>}
            {log.source === 'SYSTEM' && <span className="text-yellow-500 font-bold shrink-0">系统:</span>}
            {log.source === 'GAME' && <span className="text-blue-400 font-bold shrink-0">任务:</span>}
            <span className={`${
                log.source === 'AI' ? 'text-purple-200' : 
                log.source === 'SYSTEM' ? 'text-gray-300' : 'text-white'
            }`}>
              {log.message}
            </span>
          </div>
        ))}
        {loadingAI && (
          <div className="flex gap-2">
             <span className="text-gray-600 shrink-0">[{new Date().toLocaleTimeString()}]</span>
             <span className="text-purple-400 font-bold shrink-0">AI_CORE:</span>
             <span className="text-purple-200 animate-pulse">正在尝试连接...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-2 bg-gray-900 border-t border-gray-800 flex gap-2">
        <div className="relative flex-1">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-green-500 font-bold">{'>'}</span>
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-black border border-gray-700 rounded pl-6 pr-2 py-2 text-green-500 focus:outline-none focus:border-green-500 placeholder-gray-700"
            placeholder="输入 Flag 提交..."
            />
        </div>
        <button 
            type="submit"
            className="bg-green-800 hover:bg-green-700 text-white px-4 rounded flex items-center gap-2"
        >
            <Send size={16} />
        </button>
      </form>
    </div>
  );
};