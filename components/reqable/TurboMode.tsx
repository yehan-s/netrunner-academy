import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Zap, X, Image, FileCode, Type, Palette, Archive, Database, Cpu } from 'lucide-react';
import { TurboModeConfig } from '../../types';

interface TurboModeProps {
  onClose: () => void;
}

const STORAGE_KEY = 'netrunner_turbo_mode';

const DEFAULT_CONFIG: TurboModeConfig = {
  enabled: false,
  disableImages: false,
  disableScripts: false,
  disableFonts: false,
  disableStylesheets: false,
  compressionLevel: 'none',
  cacheEnabled: true,
  maxConcurrentRequests: 6,
};

// Load config from localStorage
const loadConfig = (): TurboModeConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
};

// Save config to localStorage
const saveConfig = (config: TurboModeConfig) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// Get current turbo mode config
export const getTurboModeConfig = (): TurboModeConfig => {
  return loadConfig();
};

// Check if turbo mode is enabled
export const isTurboModeEnabled = (): boolean => {
  return loadConfig().enabled;
};

// Check if a resource type should be blocked
export const shouldBlockResource = (type: string, config: TurboModeConfig): boolean => {
  if (!config.enabled) return false;
  
  switch (type) {
    case 'img':
    case 'image':
      return config.disableImages;
    case 'script':
      return config.disableScripts;
    case 'font':
      return config.disableFonts;
    case 'css':
    case 'stylesheet':
      return config.disableStylesheets;
    default:
      return false;
  }
};

const TurboMode: React.FC<TurboModeProps> = ({ onClose }) => {
  const [config, setConfig] = useState<TurboModeConfig>(DEFAULT_CONFIG);

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  const updateConfig = (updates: Partial<TurboModeConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleToggleEnabled = () => {
    updateConfig({ enabled: !config.enabled });
  };

  // Calculate estimated savings
  const calculateSavings = (): { percent: number; description: string } => {
    if (!config.enabled) return { percent: 0, description: '未启用' };
    
    let savings = 0;
    if (config.disableImages) savings += 40;
    if (config.disableScripts) savings += 20;
    if (config.disableFonts) savings += 10;
    if (config.disableStylesheets) savings += 15;
    
    switch (config.compressionLevel) {
      case 'low': savings += 5; break;
      case 'medium': savings += 10; break;
      case 'high': savings += 15; break;
    }
    
    return {
      percent: Math.min(savings, 85),
      description: savings > 50 ? '大幅节省' : savings > 20 ? '中等节省' : '少量节省',
    };
  };

  const savings = calculateSavings();

  const content = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-3">
            <Zap className="text-yellow-400" size={24} />
            <div>
              <h2 className="text-xl font-bold text-[#4ec9b0]">极速模式</h2>
              <p className="text-xs text-gray-400">优化性能，减少流量消耗</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="p-4 bg-[#252526] border-b border-[#3c3c3c]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${config.enabled ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-white font-medium">
                极速模式: {config.enabled ? '已启用' : '已禁用'}
              </span>
            </div>
            <button
              onClick={handleToggleEnabled}
              className={`px-4 py-1.5 rounded text-sm font-medium transition ${
                config.enabled
                  ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                  : 'bg-gray-600 hover:bg-gray-700 text-white'
              }`}
            >
              {config.enabled ? '⚡ 已开启' : '开启极速'}
            </button>
          </div>
          
          {/* Savings Indicator */}
          <div className="bg-black/30 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-400">预估流量节省</span>
              <span className="text-sm font-bold text-yellow-400">{savings.percent}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all duration-300"
                style={{ width: `${savings.percent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">{savings.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Resource Blocking */}
          <div className="bg-[#252526] border border-gray-700 rounded p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">资源过滤</h3>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-3 p-3 bg-[#2d2d30] rounded cursor-pointer hover:bg-[#1a1f2e] transition">
                <input
                  type="checkbox"
                  checked={config.disableImages}
                  onChange={e => updateConfig({ disableImages: e.target.checked })}
                  className="accent-yellow-500 w-4 h-4"
                />
                <Image size={18} className="text-blue-400" />
                <div>
                  <div className="text-sm text-white">禁用图片</div>
                  <div className="text-xs text-gray-500">节省 ~40%</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-[#2d2d30] rounded cursor-pointer hover:bg-[#1a1f2e] transition">
                <input
                  type="checkbox"
                  checked={config.disableScripts}
                  onChange={e => updateConfig({ disableScripts: e.target.checked })}
                  className="accent-yellow-500 w-4 h-4"
                />
                <FileCode size={18} className="text-yellow-400" />
                <div>
                  <div className="text-sm text-white">禁用脚本</div>
                  <div className="text-xs text-gray-500">节省 ~20%</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-[#2d2d30] rounded cursor-pointer hover:bg-[#1a1f2e] transition">
                <input
                  type="checkbox"
                  checked={config.disableFonts}
                  onChange={e => updateConfig({ disableFonts: e.target.checked })}
                  className="accent-yellow-500 w-4 h-4"
                />
                <Type size={18} className="text-purple-400" />
                <div>
                  <div className="text-sm text-white">禁用字体</div>
                  <div className="text-xs text-gray-500">节省 ~10%</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-[#2d2d30] rounded cursor-pointer hover:bg-[#1a1f2e] transition">
                <input
                  type="checkbox"
                  checked={config.disableStylesheets}
                  onChange={e => updateConfig({ disableStylesheets: e.target.checked })}
                  className="accent-yellow-500 w-4 h-4"
                />
                <Palette size={18} className="text-pink-400" />
                <div>
                  <div className="text-sm text-white">禁用样式</div>
                  <div className="text-xs text-gray-500">节省 ~15%</div>
                </div>
              </label>
            </div>
          </div>

          {/* Compression */}
          <div className="bg-[#252526] border border-gray-700 rounded p-4">
            <div className="flex items-center gap-2 mb-3">
              <Archive size={18} className="text-[#4ec9b0]" />
              <h3 className="text-sm font-semibold text-gray-300">压缩级别</h3>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['none', 'low', 'medium', 'high'] as const).map(level => (
                <button
                  key={level}
                  onClick={() => updateConfig({ compressionLevel: level })}
                  className={`py-2 px-3 rounded text-sm transition ${
                    config.compressionLevel === level
                      ? 'bg-cyan-600 text-white'
                      : 'bg-[#2d2d30] text-gray-400 hover:bg-[#1a1f2e]'
                  }`}
                >
                  {level === 'none' ? '无' : level === 'low' ? '低' : level === 'medium' ? '中' : '高'}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-[#252526] border border-gray-700 rounded p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">高级设置</h3>
            
            <label className="flex items-center justify-between p-3 bg-[#2d2d30] rounded cursor-pointer hover:bg-[#1a1f2e] transition">
              <div className="flex items-center gap-3">
                <Database size={18} className="text-green-400" />
                <div>
                  <div className="text-sm text-white">启用缓存</div>
                  <div className="text-xs text-gray-500">缓存已访问的资源</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.cacheEnabled}
                onChange={e => updateConfig({ cacheEnabled: e.target.checked })}
                className="accent-yellow-500 w-4 h-4"
              />
            </label>

            <div className="p-3 bg-[#2d2d30] rounded">
              <div className="flex items-center gap-3 mb-2">
                <Cpu size={18} className="text-orange-400" />
                <div>
                  <div className="text-sm text-white">最大并发请求</div>
                  <div className="text-xs text-gray-500">同时进行的请求数量</div>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={config.maxConcurrentRequests}
                onChange={e => updateConfig({ maxConcurrentRequests: parseInt(e.target.value) })}
                className="w-full accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span className="text-yellow-400 font-bold">{config.maxConcurrentRequests}</span>
                <span>20</span>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div className="bg-[#252526] border border-gray-700 rounded p-4">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">快速预设</h3>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => updateConfig({
                  enabled: true,
                  disableImages: false,
                  disableScripts: false,
                  disableFonts: false,
                  disableStylesheets: false,
                  compressionLevel: 'low',
                })}
                className="p-3 bg-[#2d2d30] hover:bg-[#1a1f2e] rounded transition text-center"
              >
                <div className="text-2xl mb-1">🚶</div>
                <div className="text-xs text-white">轻度优化</div>
              </button>
              <button
                onClick={() => updateConfig({
                  enabled: true,
                  disableImages: true,
                  disableScripts: false,
                  disableFonts: true,
                  disableStylesheets: false,
                  compressionLevel: 'medium',
                })}
                className="p-3 bg-[#2d2d30] hover:bg-[#1a1f2e] rounded transition text-center"
              >
                <div className="text-2xl mb-1">🏃</div>
                <div className="text-xs text-white">中度优化</div>
              </button>
              <button
                onClick={() => updateConfig({
                  enabled: true,
                  disableImages: true,
                  disableScripts: true,
                  disableFonts: true,
                  disableStylesheets: true,
                  compressionLevel: 'high',
                })}
                className="p-3 bg-[#2d2d30] hover:bg-[#1a1f2e] rounded transition text-center"
              >
                <div className="text-2xl mb-1">🚀</div>
                <div className="text-xs text-white">极限模式</div>
              </button>
            </div>
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

export default TurboMode;
