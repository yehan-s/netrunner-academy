import React, { useState } from 'react';
import { Copy, Edit2, Check, Wifi, WifiOff } from 'lucide-react';

interface ProxyStatusBarProps {
  isRecording: boolean;
  proxyHost?: string;
  proxyPort?: number;
  onToggleRecording: () => void;
}

export const ProxyStatusBar: React.FC<ProxyStatusBarProps> = ({
  isRecording,
  proxyHost = '127.0.0.1',
  proxyPort = 8888,
  onToggleRecording
}) => {
  const [copied, setCopied] = useState(false);
  const proxyAddress = `${proxyHost}:${proxyPort}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(proxyAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      {/* 代理状态指示器 */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] rounded border border-[#3c3c3c]">
        <div className={`w-2 h-2 rounded-full transition-colors ${
          isRecording 
            ? 'bg-[#4ec9b0] shadow-[0_0_6px_#4ec9b0]' 
            : 'bg-[#858585]'
        }`} />
        <span className="text-[12px] text-[#cccccc] font-mono">
          {isRecording ? 'Proxying on' : 'Proxy stopped'}
        </span>
        <span className="text-[12px] text-[#4ec9b0] font-mono font-medium">
          {proxyAddress}
        </span>
        
        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          className="p-1 text-[#858585] hover:text-[#cccccc] transition-colors"
          title="Copy proxy address"
        >
          {copied ? <Check size={12} className="text-[#4ec9b0]" /> : <Copy size={12} />}
        </button>
      </div>

      {/* Start/Stop 按钮 */}
      <button
        onClick={onToggleRecording}
        className={`h-7 px-4 text-[12px] font-semibold rounded transition-all flex items-center gap-1.5 ${
          isRecording
            ? 'bg-[#f48771] hover:bg-[#d73a3a] text-white'
            : 'bg-[#4ec9b0] hover:bg-[#3db89f] text-[#1e1e1e]'
        }`}
      >
        {isRecording ? (
          <>
            <WifiOff size={14} />
            Stop
          </>
        ) : (
          <>
            <Wifi size={14} />
            Start
          </>
        )}
      </button>
    </div>
  );
};

export default ProxyStatusBar;
