import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Server, X, Plus, Trash2, Edit2, ArrowRight } from 'lucide-react';
import { ReverseProxyRule } from '../../types';

interface ReverseProxyProps {
  onClose: () => void;
}

const STORAGE_KEY = 'netrunner_reverse_proxy_rules';

// Load rules from localStorage
const loadRules = (): ReverseProxyRule[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save rules to localStorage
const saveRules = (rules: ReverseProxyRule[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

// Get active reverse proxy rules
export const getActiveReverseProxyRules = (): ReverseProxyRule[] => {
  return loadRules().filter(r => r.enabled);
};

// Match URL against reverse proxy rules
export const matchReverseProxyRule = (url: string): ReverseProxyRule | null => {
  const rules = getActiveReverseProxyRules();
  
  for (const rule of rules) {
    const pattern = rule.listenPath
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*');
    const regex = new RegExp(`^${pattern}`);
    
    if (regex.test(url)) {
      return rule;
    }
  }
  
  return null;
};

// Apply reverse proxy transformation
export const applyReverseProxy = (url: string, rule: ReverseProxyRule): string => {
  if (rule.rewritePath) {
    // Remove the matched path prefix and append to target
    const pattern = rule.listenPath.replace(/\*/g, '');
    const path = url.replace(new RegExp(`^${pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&')}`), '');
    return rule.targetUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '');
  }
  return rule.targetUrl;
};

const ReverseProxy: React.FC<ReverseProxyProps> = ({ onClose }) => {
  const [rules, setRules] = useState<ReverseProxyRule[]>([]);
  const [editingRule, setEditingRule] = useState<ReverseProxyRule | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formListenPath, setFormListenPath] = useState('');
  const [formTargetUrl, setFormTargetUrl] = useState('');
  const [formRewritePath, setFormRewritePath] = useState(true);
  const [formDescription, setFormDescription] = useState('');
  const [formAddHeaders, setFormAddHeaders] = useState<{ key: string; value: string }[]>([]);
  const [formRemoveHeaders, setFormRemoveHeaders] = useState<string[]>([]);
  const [newHeaderKey, setNewHeaderKey] = useState('');
  const [newHeaderValue, setNewHeaderValue] = useState('');
  const [newRemoveHeader, setNewRemoveHeader] = useState('');

  useEffect(() => {
    setRules(loadRules());
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormListenPath('');
    setFormTargetUrl('');
    setFormRewritePath(true);
    setFormDescription('');
    setFormAddHeaders([]);
    setFormRemoveHeaders([]);
    setEditingRule(null);
    setIsAdding(false);
  };

  const handleSaveRule = () => {
    if (!formName.trim() || !formListenPath.trim() || !formTargetUrl.trim()) {
      alert('规则名称、监听路径和目标 URL 不能为空');
      return;
    }

    const addHeaders: Record<string, string> = {};
    formAddHeaders.forEach(h => {
      if (h.key.trim()) addHeaders[h.key.trim()] = h.value;
    });

    if (editingRule) {
      const updated = rules.map(r =>
        r.id === editingRule.id
          ? {
              ...r,
              name: formName,
              listenPath: formListenPath,
              targetUrl: formTargetUrl,
              rewritePath: formRewritePath,
              description: formDescription,
              addHeaders,
              removeHeaders: formRemoveHeaders,
            }
          : r
      );
      setRules(updated);
      saveRules(updated);
    } else {
      const newRule: ReverseProxyRule = {
        id: Date.now().toString(),
        name: formName,
        enabled: true,
        listenPath: formListenPath,
        targetUrl: formTargetUrl,
        rewritePath: formRewritePath,
        description: formDescription || undefined,
        addHeaders,
        removeHeaders: formRemoveHeaders,
      };
      const updated = [...rules, newRule];
      setRules(updated);
      saveRules(updated);
    }

    resetForm();
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('确定要删除这条规则吗？')) {
      const updated = rules.filter(r => r.id !== id);
      setRules(updated);
      saveRules(updated);
    }
  };

  const handleToggleEnabled = (id: string) => {
    const updated = rules.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setRules(updated);
    saveRules(updated);
  };

  const handleEditRule = (rule: ReverseProxyRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormListenPath(rule.listenPath);
    setFormTargetUrl(rule.targetUrl);
    setFormRewritePath(rule.rewritePath);
    setFormDescription(rule.description || '');
    setFormAddHeaders(Object.entries(rule.addHeaders).map(([key, value]) => ({ key, value })));
    setFormRemoveHeaders(rule.removeHeaders);
    setIsAdding(false);
  };

  const handleAddNew = () => {
    resetForm();
    setIsAdding(true);
  };

  const handleAddHeader = () => {
    if (!newHeaderKey.trim()) return;
    setFormAddHeaders([...formAddHeaders, { key: newHeaderKey.trim(), value: newHeaderValue }]);
    setNewHeaderKey('');
    setNewHeaderValue('');
  };

  const handleRemoveAddHeader = (index: number) => {
    setFormAddHeaders(formAddHeaders.filter((_, i) => i !== index));
  };

  const handleAddRemoveHeader = () => {
    if (!newRemoveHeader.trim()) return;
    if (formRemoveHeaders.includes(newRemoveHeader.trim())) return;
    setFormRemoveHeaders([...formRemoveHeaders, newRemoveHeader.trim()]);
    setNewRemoveHeader('');
  };

  const content = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-3">
            <Server className="text-[#4ec9b0]" size={24} />
            <div>
              <h2 className="text-xl font-bold text-[#4ec9b0]">反向代理</h2>
              <p className="text-xs text-gray-400">配置请求转发规则</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Add New Button */}
          {!isAdding && !editingRule && (
            <button
              onClick={handleAddNew}
              className="w-full py-2 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
            >
              + 添加反向代理规则
            </button>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingRule) && (
            <div className="bg-[#252526] border border-[#3c3c3c] rounded p-4 space-y-4">
              <h3 className="text-lg font-semibold text-[#4ec9b0]">
                {editingRule ? '编辑规则' : '新建规则'}
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">规则名称</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white focus:border-[#4ec9b0] focus:outline-none"
                    placeholder="例: API 代理"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">监听路径 (支持 * 通配符)</label>
                  <input
                    type="text"
                    value={formListenPath}
                    onChange={e => setFormListenPath(e.target.value)}
                    className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white focus:border-[#4ec9b0] focus:outline-none"
                    placeholder="例: /api/*"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">目标 URL</label>
                <input
                  type="text"
                  value={formTargetUrl}
                  onChange={e => setFormTargetUrl(e.target.value)}
                  className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white focus:border-[#4ec9b0] focus:outline-none"
                  placeholder="例: https://backend.example.com"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formRewritePath}
                    onChange={e => setFormRewritePath(e.target.checked)}
                    className="accent-[#4ec9b0] w-4 h-4"
                  />
                  <span className="text-sm text-gray-300">重写路径</span>
                </label>
                <span className="text-xs text-gray-500">
                  (将匹配的路径附加到目标 URL)
                </span>
              </div>

              {/* Preview */}
              {formListenPath && formTargetUrl && (
                <div className="bg-black/30 rounded p-3">
                  <div className="text-xs text-gray-400 mb-1">转发预览</div>
                  <div className="flex items-center gap-2 text-sm">
                    <code className="text-orange-400">{formListenPath}</code>
                    <ArrowRight size={14} className="text-gray-500" />
                    <code className="text-green-400">{formTargetUrl}</code>
                  </div>
                </div>
              )}

              {/* Add Headers */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">添加请求头</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newHeaderKey}
                    onChange={e => setNewHeaderKey(e.target.value)}
                    className="flex-1 bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                    placeholder="Header 名称"
                  />
                  <input
                    type="text"
                    value={newHeaderValue}
                    onChange={e => setNewHeaderValue(e.target.value)}
                    className="flex-1 bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                    placeholder="Header 值"
                  />
                  <button
                    onClick={handleAddHeader}
                    className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {formAddHeaders.length > 0 && (
                  <div className="space-y-1">
                    {formAddHeaders.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm bg-[#2d2d30] px-3 py-1.5 rounded">
                        <span className="text-[#4ec9b0]">{h.key}:</span>
                        <span className="text-gray-300 flex-1">{h.value}</span>
                        <button
                          onClick={() => handleRemoveAddHeader(i)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Remove Headers */}
              <div>
                <label className="block text-sm text-gray-300 mb-2">移除请求头</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newRemoveHeader}
                    onChange={e => setNewRemoveHeader(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddRemoveHeader()}
                    className="flex-1 bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
                    placeholder="例: X-Forwarded-For"
                  />
                  <button
                    onClick={handleAddRemoveHeader}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {formRemoveHeaders.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formRemoveHeaders.map(h => (
                      <span
                        key={h}
                        className="flex items-center gap-1 px-2 py-1 bg-red-900/30 text-red-400 rounded text-sm"
                      >
                        {h}
                        <button
                          onClick={() => setFormRemoveHeaders(formRemoveHeaders.filter(x => x !== h))}
                          className="hover:text-red-300"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">描述 (可选)</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white focus:border-[#4ec9b0] focus:outline-none resize-none"
                  rows={2}
                  placeholder="例: 将 /api 请求转发到后端服务器"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSaveRule}
                  className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded transition"
                >
                  {editingRule ? '保存修改' : '添加规则'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 py-2 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded transition"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Rules List */}
          {rules.length === 0 && !isAdding && !editingRule ? (
            <div className="text-center py-8 text-gray-400">
              暂无反向代理规则，点击上方按钮添加规则
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className={`bg-[#252526] border rounded p-3 transition ${
                    rule.enabled
                      ? 'border-[#3c3c3c] hover:border-[#4ec9b0]/50'
                      : 'border-gray-600/30 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggleEnabled(rule.id)}
                      className="mt-1 accent-[#4ec9b0] w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Server className="text-[#4ec9b0] flex-shrink-0" size={16} />
                        <span className="font-semibold text-white truncate">{rule.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-300">
                        <code className="bg-black/30 px-1 rounded text-orange-400">{rule.listenPath}</code>
                        <ArrowRight size={12} className="text-gray-500" />
                        <code className="bg-black/30 px-1 rounded text-green-400 truncate">{rule.targetUrl}</code>
                      </div>
                      {rule.description && (
                        <div className="text-xs text-gray-400 mt-1">{rule.description}</div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="text-[#4ec9b0] hover:text-[#3db89f] text-sm"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tips */}
          <div className="bg-[#252526]/50 border border-gray-700 rounded p-3">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">使用提示</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 反向代理可将前端请求转发到不同的后端服务器</li>
              <li>• 支持通配符 * 匹配路径</li>
              <li>• 可添加/移除请求头以修改转发的请求</li>
              <li>• 常用于开发环境中解决跨域问题</li>
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

export default ReverseProxy;
