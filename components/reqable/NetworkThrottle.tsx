import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Gauge, X, Wifi, WifiOff, Signal, SignalLow, SignalMedium, Zap } from 'lucide-react';
import { ThrottleConfig } from '../../types';

interface NetworkThrottleProps {
  onClose: () => void;
}

const STORAGE_KEY = 'netrunner_throttle_config';

// Preset network conditions (similar to Chrome DevTools)
const PRESETS: ThrottleConfig[] = [
  {
    id: 'no-throttle',
    name: 'No Throttling',
    enabled: false,
    downloadSpeed: 0,
    uploadSpeed: 0,
    latency: 0,
    packetLoss: 0,
    isPreset: true,
  },
  {
    id: 'offline',
    name: 'Offline',
    enabled: true,
    downloadSpeed: 0,
    uploadSpeed: 0,
    latency: 0,
    packetLoss: 100,
    isPreset: true,
  },
  {
    id: 'slow-3g',
    name: 'Slow 3G',
    enabled: true,
    downloadSpeed: 50, // 400 Kbps = 50 KB/s
    uploadSpeed: 50,
    latency: 2000,
    packetLoss: 0,
    isPreset: true,
  },
  {
    id: 'fast-3g',
    name: 'Fast 3G',
    enabled: true,
    downloadSpeed: 187, // 1.5 Mbps = 187 KB/s
    uploadSpeed: 94,
    latency: 562,
    packetLoss: 0,
    isPreset: true,
  },
  {
    id: 'slow-4g',
    name: 'Slow 4G',
    enabled: true,
    downloadSpeed: 500, // 4 Mbps
    uploadSpeed: 375,
    latency: 150,
    packetLoss: 0,
    isPreset: true,
  },
  {
    id: 'fast-4g',
    name: 'Fast 4G / LTE',
    enabled: true,
    downloadSpeed: 5000, // 40 Mbps
    uploadSpeed: 3750,
    latency: 28,
    packetLoss: 0,
    isPreset: true,
  },
  {
    id: 'wifi',
    name: 'Regular WiFi',
    enabled: true,
    downloadSpeed: 3750, // 30 Mbps
    uploadSpeed: 1875,
    latency: 10,
    packetLoss: 0,
    isPreset: true,
  },
];

// Load config from localStorage
const loadConfig = (): ThrottleConfig => {
  if (typeof window === 'undefined') return PRESETS[0];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : PRESETS[0];
  } catch {
    return PRESETS[0];
  }
};

// Save config to localStorage
const saveConfig = (config: ThrottleConfig) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// Get current throttle config (for use in other components)
export const getThrottleConfig = (): ThrottleConfig => {
  return loadConfig();
};

// Calculate simulated request time based on throttle config
export const calculateThrottledTime = (originalTime: number, size: number, config: ThrottleConfig): number => {
  if (!config.enabled || config.id === 'no-throttle') {
    return originalTime;
  }

  // If offline or 100% packet loss, return timeout
  if (config.packetLoss >= 100) {
    return -1; // Indicates request failed
  }

  let totalTime = originalTime;

  // Add latency
  totalTime += config.latency;

  // Calculate download time based on speed limit
  if (config.downloadSpeed > 0) {
    const downloadTimeMs = (size / 1024 / config.downloadSpeed) * 1000;
    totalTime += downloadTimeMs;
  }

  return Math.round(totalTime);
};

// Check if request should fail due to packet loss
export const shouldDropPacket = (config: ThrottleConfig): boolean => {
  if (!config.enabled || config.packetLoss <= 0) {
    return false;
  }
  return Math.random() * 100 < config.packetLoss;
};

const NetworkThrottle: React.FC<NetworkThrottleProps> = ({ onClose }) => {
  const [config, setConfig] = useState<ThrottleConfig>(PRESETS[0]);
  const [isCustom, setIsCustom] = useState(false);
  const [customDownload, setCustomDownload] = useState('1000');
  const [customUpload, setCustomUpload] = useState('500');
  const [customLatency, setCustomLatency] = useState('100');
  const [customPacketLoss, setCustomPacketLoss] = useState('0');

  useEffect(() => {
    const loaded = loadConfig();
    setConfig(loaded);
    if (!loaded.isPreset) {
      setIsCustom(true);
      setCustomDownload(String(loaded.downloadSpeed));
      setCustomUpload(String(loaded.uploadSpeed));
      setCustomLatency(String(loaded.latency));
      setCustomPacketLoss(String(loaded.packetLoss));
    }
  }, []);

  const handleSelectPreset = (preset: ThrottleConfig) => {
    setConfig(preset);
    setIsCustom(false);
    saveConfig(preset);
  };

  const handleApplyCustom = () => {
    const customConfig: ThrottleConfig = {
      id: 'custom',
      name: 'Custom',
      enabled: true,
      downloadSpeed: parseInt(customDownload) || 0,
      uploadSpeed: parseInt(customUpload) || 0,
      latency: parseInt(customLatency) || 0,
      packetLoss: Math.min(100, Math.max(0, parseInt(customPacketLoss) || 0)),
      isPreset: false,
    };
    setConfig(customConfig);
    saveConfig(customConfig);
  };

  const handleDisable = () => {
    const noThrottle = PRESETS[0];
    setConfig(noThrottle);
    setIsCustom(false);
    saveConfig(noThrottle);
  };

  const getPresetIcon = (preset: ThrottleConfig) => {
    switch (preset.id) {
      case 'offline':
        return <WifiOff size={18} className="text-red-400" />;
      case 'slow-3g':
        return <SignalLow size={18} className="text-orange-400" />;
      case 'fast-3g':
        return <SignalMedium size={18} className="text-yellow-400" />;
      case 'slow-4g':
        return <Signal size={18} className="text-yellow-400" />;
      case 'fast-4g':
        return <Signal size={18} className="text-green-400" />;
      case 'wifi':
        return <Wifi size={18} className="text-[#4ec9b0]" />;
      default:
        return <Zap size={18} className="text-gray-400" />;
    }
  };

  const formatSpeed = (kbps: number): string => {
    if (kbps === 0) return 'Unlimited';
    if (kbps >= 1000) return `${(kbps / 1000).toFixed(1)} MB/s`;
    return `${kbps} KB/s`;
  };

  const content = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-3">
            <Gauge className="text-[#4ec9b0]" size={24} />
            <div>
              <h2 className="text-xl font-bold text-[#4ec9b0]">网络节流</h2>
              <p className="text-xs text-gray-400">模拟不同网络环境</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Status */}
        <div className="p-4 bg-[#252526] border-b border-[#3c3c3c]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {config.enabled && config.id !== 'no-throttle' ? (
                <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-green-400" />
              )}
              <span className="text-white font-medium">
                当前状态: {config.enabled && config.id !== 'no-throttle' ? config.name : '无节流'}
              </span>
            </div>
            {config.enabled && config.id !== 'no-throttle' && (
              <button
                onClick={handleDisable}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition"
              >
                禁用节流
              </button>
            )}
          </div>
          {config.enabled && config.id !== 'no-throttle' && (
            <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-400">下载</div>
                <div className="text-[#4ec9b0] font-mono">{formatSpeed(config.downloadSpeed)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">上传</div>
                <div className="text-[#4ec9b0] font-mono">{formatSpeed(config.uploadSpeed)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">延迟</div>
                <div className="text-[#4ec9b0] font-mono">{config.latency} ms</div>
              </div>
              <div className="text-center">
                <div className="text-gray-400">丢包</div>
                <div className="text-[#4ec9b0] font-mono">{config.packetLoss}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Presets */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">预设配置</h3>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded border transition text-left ${
                    config.id === preset.id && !isCustom
                      ? 'bg-[#4ec9b0]/20 border-[#4ec9b0]'
                      : 'bg-[#252526] border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getPresetIcon(preset)}
                    <span className="text-white font-medium">{preset.name}</span>
                  </div>
                  {preset.id !== 'no-throttle' && (
                    <div className="text-xs text-gray-400 flex gap-3">
                      <span>↓ {formatSpeed(preset.downloadSpeed)}</span>
                      <span>{preset.latency}ms</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Config */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 mb-3">自定义配置</h3>
            <div className="bg-[#252526] border border-gray-600 rounded p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">下载速度 (KB/s)</label>
                  <input
                    type="number"
                    value={customDownload}
                    onChange={e => setCustomDownload(e.target.value)}
                    className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                    placeholder="0 = 无限制"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">上传速度 (KB/s)</label>
                  <input
                    type="number"
                    value={customUpload}
                    onChange={e => setCustomUpload(e.target.value)}
                    className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                    placeholder="0 = 无限制"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">延迟 (ms)</label>
                  <input
                    type="number"
                    value={customLatency}
                    onChange={e => setCustomLatency(e.target.value)}
                    className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                    placeholder="添加到每个请求"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">丢包率 (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={customPacketLoss}
                    onChange={e => setCustomPacketLoss(e.target.value)}
                    className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                    placeholder="0-100"
                  />
                </div>
              </div>
              <button
                onClick={handleApplyCustom}
                className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
              >
                应用自定义配置
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-[#252526]/50 border border-gray-700 rounded p-3">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">使用提示</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• <strong>Slow 3G</strong>: 模拟旧版移动网络，测试加载状态</li>
              <li>• <strong>Offline</strong>: 测试离线功能和错误处理</li>
              <li>• <strong>丢包率</strong>: 模拟不稳定网络，测试重试机制</li>
              <li>• 节流设置会影响所有模拟请求的响应时间</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#3c3c3c] flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-6 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default NetworkThrottle;
