import React from 'react';

interface TypingIndicatorProps {
  sender: string;
  avatarColor?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  sender,
  avatarColor = 'bg-blue-600',
}) => {
  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div
        className={`w-9 h-9 rounded-md shrink-0 flex items-center justify-center text-xs font-medium text-white shadow-sm ${avatarColor}`}
      >
        {sender[0]}
      </div>
      <div className="flex flex-col items-start">
        <span className="text-[10px] text-gray-400 mb-1 ml-0.5 select-none">{sender}</span>
        <div className="px-4 py-3 bg-white rounded-[6px] border border-[#ededed] shadow-sm">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </div>
  );
};
