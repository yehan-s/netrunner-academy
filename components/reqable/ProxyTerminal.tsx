import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Terminal, X, Plus, Trash2, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { ProxyConfig } from '../../types';

interface ProxyTerminalProps {
  onClose: () => void;
}

const STORAGE_KEY = 'netrunner_proxy_config';

const DEFAULT_CONFIG: ProxyConfig = {
  enabled: false,
  host: '127.0.0.1',
  port: 8888,
  protocol: 'http',
  requireAuth: false,
  username: '',
  password: '',
  bypassList: ['localhost', '127.0.0.1', '*.local'],
};

// Load config from localStorage
const loadConfig = (): ProxyConfig => {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? { ...DEFAULT_CONFIG, ...JSON.parse(stored) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
};

// Save config to localStorage
const saveConfig = (config: ProxyConfig) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// Get current proxy config
export const getProxyConfig = (): ProxyConfig => {
  return loadConfig();
};

// Generate proxy URL string
export const getProxyUrl = (config: ProxyConfig): string => {
  if (!config.enabled) return '';
  
  let url = `${config.protocol}://`;
  if (config.requireAuth && config.username) {
    url += `${config.username}:${config.password || ''}@`;
  }
  url += `${config.host}:${config.port}`;
  return url;
};

// Generate shell export commands
const generateShellCommands = (config: ProxyConfig): string => {
  const proxyUrl = getProxyUrl(config);
  if (!proxyUrl) return '# Proxy is disabled';

  return `# HTTP Proxy
export http_proxy="${proxyUrl}"
export HTTP_PROXY="${proxyUrl}"

# HTTPS Proxy
export https_proxy="${proxyUrl}"
export HTTPS_PROXY="${proxyUrl}"

# No Proxy (bypass list)
export no_proxy="${config.bypassList.join(',')}"
export NO_PROXY="${config.bypassList.join(',')}"`;
};

const ProxyTerminal: React.FC<ProxyTerminalProps> = ({ onClose }) => {
  const [config, setConfig] = useState<ProxyConfig>(DEFAULT_CONFIG);
  const [showPassword, setShowPassword] = useState(false);
  const [newBypass, setNewBypass] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setConfig(loadConfig());
  }, []);

  const handleSave = () => {
    saveConfig(config);
  };

  const handleToggleEnabled = () => {
    const newConfig = { ...config, enabled: !config.enabled };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleAddBypass = () => {
    if (!newBypass.trim()) return;
    if (config.bypassList.includes(newBypass.trim())) return;
    
    const newConfig = {
      ...config,
      bypassList: [...config.bypassList, newBypass.trim()],
    };
    setConfig(newConfig);
    saveConfig(newConfig);
    setNewBypass('');
  };

  const handleRemoveBypass = (item: string) => {
    const newConfig = {
      ...config,
      bypassList: config.bypassList.filter(b => b !== item),
    };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const handleCopyCommands = () => {
    navigator.clipboard.writeText(generateShellCommands(config));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateConfig = (updates: Partial<ProxyConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    saveConfig(newConfig);
  };

  const content = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-3">
            <Terminal className="text-[#4ec9b0]" size={24} />
            <div>
              <h2 className="text-xl font-bold text-[#4ec9b0]">代理终端</h2>
              <p className="text-xs text-gray-400">配置系统代理设置</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Status Bar */}
        <div className="p-4 bg-[#252526] border-b border-[#3c3c3c]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${config.enabled ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
              <span className="text-white font-medium">
                代理状态: {config.enabled ? '已启用' : '已禁用'}
              </span>
            </div>
            <button
              onClick={handleToggleEnabled}
              className={`px-4 py-1.5 rounded text-sm font-medium transition ${
                config.enabled
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {config.enabled ? '禁用代理' : '启用代理'}
            </button>
          </div>
          {config.enabled && (
            <div className="mt-2 text-sm text-[#4ec9b0] font-mono bg-black/30 px-3 py-2 rounded">
              {getProxyUrl(config)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Basic Settings */}
          <div className="bg-[#252526] border border-gray-700 rounded p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">基本设置</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">协议</label>
                <select
                  value={config.protocol}
                  onChange={e => updateConfig({ protocol: e.target.value as 'http' | 'https' | 'socks5' })}
                  className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                >
                  <option value="http">HTTP</option>
                  <option value="https">HTTPS</option>
                  <option value="socks5">SOCKS5</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">主机</label>
                <input
                  type="text"
                  value={config.host}
                  onChange={e => updateConfig({ host: e.target.value })}
                  className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                  placeholder="127.0.0.1"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">端口</label>
                <input
                  type="number"
                  value={config.port}
                  onChange={e => updateConfig({ port: parseInt(e.target.value) || 8888 })}
                  className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                  placeholder="8888"
                />
              </div>
            </div>
          </div>

          {/* Authentication */}
          <div className="bg-[#252526] border border-gray-700 rounded p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300">认证设置</h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.requireAuth}
                  onChange={e => updateConfig({ requireAuth: e.target.checked })}
                  className="accent-[#4ec9b0] w-4 h-4"
                />
                <span className="text-xs text-gray-400">需要认证</span>
              </label>
            </div>
            
            {config.requireAuth && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">用户名</label>
                  <input
                    type="text"
                    value={config.username || ''}
                    onChange={e => updateConfig({ username: e.target.value })}
                    className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                    placeholder="username"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">密码</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={config.password || ''}
                      onChange={e => updateConfig({ password: e.target.value })}
                      className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 pr-10 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                      placeholder="password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bypass List */}
          <div className="bg-[#252526] border border-gray-700 rounded p-4 space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">绕过列表 (不使用代理)</h3>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={newBypass}
                onChange={e => setNewBypass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddBypass()}
                className="flex-1 bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                placeholder="例: *.local, 192.168.*"
              />
              <button
                onClick={handleAddBypass}
                className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {config.bypassList.map(item => (
                <span
                  key={item}
                  className="flex items-center gap-1 px-2 py-1 bg-gray-700 rounded text-sm text-gray-300"
                >
                  {item}
                  <button
                    onClick={() => handleRemoveBypass(item)}
                    className="text-gray-400 hover:text-red-400"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Shell Commands */}
          <div className="bg-[#252526] border border-gray-700 rounded p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-300">Shell 环境变量</h3>
              <button
                onClick={handleCopyCommands}
                className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded transition"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? '已复制' : '复制'}
              </button>
            </div>
            <pre className="bg-[#2d2d30] p-3 rounded text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap">
              {generateShellCommands(config)}
            </pre>
          </div>

          {/* Tips */}
          <div className="bg-[#252526]/50 border border-gray-700 rounded p-3">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">使用提示</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 复制 Shell 命令到终端可快速配置系统代理</li>
              <li>• 绕过列表支持通配符 * 匹配</li>
              <li>• SOCKS5 协议适用于更多场景</li>
              <li>• 认证信息会保存在本地，请注意安全</li>
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

export default ProxyTerminal;
