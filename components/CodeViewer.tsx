import React from 'react';

interface CodeViewerProps {
  code: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#d4d4d4] font-mono text-sm">
      {/* Tabs */}
      <div className="flex bg-[#252526] border-b border-black">
        <div className="px-4 py-2 bg-[#1e1e1e] border-t-2 border-blue-500 text-white flex items-center gap-2">
          <span className="text-yellow-400">JS</span>
          logic.js
        </div>
        <div className="px-4 py-2 text-gray-500 italic">
          (read-only)
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-auto relative">
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-[#1e1e1e] border-r border-[#333] text-[#858585] text-right pr-2 pt-4 select-none">
          {code.split('\n').map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
        </div>
        <div className="pl-12 pt-4 pr-4 pb-4 leading-6 whitespace-pre">
            {code}
        </div>
      </div>
    </div>
  );
};