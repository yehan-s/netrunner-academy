import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { BreakpointRule } from '../../types';
import { Plus, X, Edit2, Trash2, Check, AlertCircle } from 'lucide-react';

interface BreakpointRulesProps {
  onClose: () => void;
}

const STORAGE_KEY = 'reqable_breakpoint_rules';

// Load rules from localStorage
const loadRules = (): BreakpointRule[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save rules to localStorage
const saveRules = (rules: BreakpointRule[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

export const BreakpointRules: React.FC<BreakpointRulesProps> = ({ onClose }) => {
  const [rules, setRules] = useState<BreakpointRule[]>(loadRules);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<BreakpointRule>>({
    name: '',
    urlPattern: '',
    type: 'request',
    enabled: true
  });

  // Sync rules to localStorage
  useEffect(() => {
    saveRules(rules);
  }, [rules]);

  const handleAddRule = () => {
    if (!formData.name?.trim() || !formData.urlPattern?.trim()) {
      alert('请填写规则名称和 URL 模式');
      return;
    }

    const newRule: BreakpointRule = {
      id: `bp-rule-${Date.now()}`,
      name: formData.name,
      urlPattern: formData.urlPattern,
      type: formData.type || 'request',
      enabled: formData.enabled !== false
    };

    setRules(prev => [...prev, newRule]);
    setFormData({ name: '', urlPattern: '', type: 'request', enabled: true });
  };

  const handleEditRule = (rule: BreakpointRule) => {
    setEditingId(rule.id);
    setFormData(rule);
  };

  const handleUpdateRule = () => {
    if (!formData.name?.trim() || !formData.urlPattern?.trim()) {
      alert('请填写规则名称和 URL 模式');
      return;
    }

    setRules(prev => prev.map(r => r.id === editingId ? { ...r, ...formData } as BreakpointRule : r));
    setEditingId(null);
    setFormData({ name: '', urlPattern: '', type: 'request', enabled: true });
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('确定要删除此规则？')) {
      setRules(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleToggleEnabled = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const content = (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-[9999]" onClick={onClose}>
      <div
        className="bg-[#252526] rounded-lg shadow-2xl w-[700px] max-h-[80vh] flex flex-col border border-[#3e3e42]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#3e3e42]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#4ec9b0]/10 flex items-center justify-center">
              <AlertCircle size={20} className="text-[#4ec9b0]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">断点规则</h2>
              <p className="text-xs text-gray-400">自动拦截匹配 URL 模式的请求</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#3e3e42] rounded transition-colors text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Rule Form */}
        <div className="px-6 py-4 border-b border-[#3e3e42] bg-[#1e1e1e]">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            {editingId ? '编辑规则' : '添加规则'}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">规则名称</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例: 拦截登录请求"
                className="w-full bg-[#252526] border border-[#3e3e42] rounded px-3 py-1.5 text-sm text-white outline-none focus:border-[#4ec9b0]"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">URL 模式 (支持 *)</label>
              <input
                type="text"
                value={formData.urlPattern || ''}
                onChange={e => setFormData(prev => ({ ...prev, urlPattern: e.target.value }))}
                placeholder="例: */api/login"
                className="w-full bg-[#252526] border border-[#3e3e42] rounded px-3 py-1.5 text-sm text-white outline-none focus:border-[#4ec9b0]"
              />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">拦截类型</label>
              <select
                value={formData.type || 'request'}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as BreakpointRule['type'] }))}
                className="bg-[#252526] border border-[#3e3e42] rounded px-3 py-1.5 text-sm text-white outline-none focus:border-[#4ec9b0]"
              >
                <option value="request">Request</option>
                <option value="response">Response</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div className="flex items-center gap-2 mt-5">
              <input
                type="checkbox"
                id="rule-enabled"
                checked={formData.enabled !== false}
                onChange={e => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                className="w-4 h-4 rounded border-[#3e3e42] bg-[#252526] checked:bg-[#4ec9b0]"
              />
              <label htmlFor="rule-enabled" className="text-sm text-gray-300 cursor-pointer">
                启用规则
              </label>
            </div>

            <div className="flex-1" />

            {editingId ? (
              <div className="flex gap-2 mt-5">
                <button
                  onClick={handleUpdateRule}
                  className="px-4 py-1.5 bg-[#4ec9b0] hover:bg-[#3db89f] text-black text-sm font-bold rounded transition-colors"
                >
                  <Check size={14} className="inline mr-1" />
                  更新
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: '', urlPattern: '', type: 'request', enabled: true });
                  }}
                  className="px-4 py-1.5 bg-[#3e3e42] hover:bg-[#4e4e52] text-white text-sm rounded transition-colors"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddRule}
                className="px-4 py-1.5 bg-[#4ec9b0] hover:bg-[#3db89f] text-black text-sm font-bold rounded transition-colors mt-5"
              >
                <Plus size={14} className="inline mr-1" />
                添加
              </button>
            )}
          </div>
        </div>

        {/* Rules List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {rules.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-gray-600 mb-3" />
              <p className="text-sm text-gray-500">暂无断点规则</p>
              <p className="text-xs text-gray-600 mt-1">添加规则以自动拦截匹配的请求</p>
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className={`p-3 rounded border ${
                    rule.enabled
                      ? 'bg-[#1e1e1e] border-[#3e3e42] hover:border-[#4ec9b0]/50'
                      : 'bg-[#252526] border-[#333] opacity-60'
                  } transition-all group`}
                >
                  <div className="flex items-start gap-3">
                    {/* Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={rule.enabled}
                        onChange={() => handleToggleEnabled(rule.id)}
                      />
                      <div className="w-9 h-5 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4ec9b0]"></div>
                    </label>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{rule.name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rule.type === 'request' ? 'bg-blue-500/20 text-blue-400' :
                          rule.type === 'response' ? 'bg-green-500/20 text-green-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {rule.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-1 font-mono text-xs text-gray-400 truncate">
                        {rule.urlPattern}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="p-1.5 hover:bg-[#3e3e42] rounded text-gray-400 hover:text-white transition-colors"
                        title="编辑"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1.5 hover:bg-[#3e3e42] rounded text-gray-400 hover:text-red-400 transition-colors"
                        title="删除"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#3e3e42] bg-[#1e1e1e] flex items-center justify-between">
          <div className="text-xs text-gray-500">
            共 {rules.length} 条规则，已启用 {rules.filter(r => r.enabled).length} 条
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#3e3e42] hover:bg-[#4e4e52] text-white text-sm rounded transition-colors"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

// Export utility function for URL matching
export const matchesBreakpointRule = (url: string, pattern: string): boolean => {
  // Convert wildcard pattern to regex
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&') // Escape special regex chars
    .replace(/\*/g, '.*'); // Convert * to .*
  
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
};

// Export utility function to get active breakpoint rules
export const getActiveBreakpointRules = (): BreakpointRule[] => {
  return loadRules().filter(r => r.enabled);
};
