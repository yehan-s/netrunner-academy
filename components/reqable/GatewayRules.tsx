import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Shield, ShieldOff, X } from 'lucide-react';
import { GatewayRule } from '../../types';

interface GatewayRulesProps {
  onClose: () => void;
}

// LocalStorage key
const STORAGE_KEY = 'netrunner_gateway_rules';

// Load rules from LocalStorage
const loadRules = (): GatewayRule[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save rules to LocalStorage
const saveRules = (rules: GatewayRule[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

// URL pattern matching (support wildcard *)
export const matchesGatewayRule = (url: string, pattern: string): boolean => {
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
};

// Get active Gateway rules
export const getActiveGatewayRules = (): GatewayRule[] => {
  return loadRules().filter(r => r.enabled);
};

// Check if a request should be blocked
export const shouldBlockRequest = (url: string): boolean => {
  const rules = getActiveGatewayRules();

  // Check block rules first
  const blockRules = rules.filter(r => r.action === 'block');
  for (const rule of blockRules) {
    if (matchesGatewayRule(url, rule.urlPattern)) {
      // Check if there's an allow rule that overrides this
      const allowRules = rules.filter(r => r.action === 'allow');
      const hasAllowOverride = allowRules.some(r => matchesGatewayRule(url, r.urlPattern));
      if (!hasAllowOverride) {
        return true; // Block the request
      }
    }
  }

  return false; // Allow the request
};

const GatewayRules: React.FC<GatewayRulesProps> = ({ onClose }) => {
  const [rules, setRules] = useState<GatewayRule[]>([]);
  const [editingRule, setEditingRule] = useState<GatewayRule | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrlPattern, setFormUrlPattern] = useState('');
  const [formAction, setFormAction] = useState<'block' | 'allow'>('block');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    setRules(loadRules());
  }, []);

  const handleSaveRule = () => {
    if (!formName.trim() || !formUrlPattern.trim()) {
      alert('规则名称和 URL 匹配模式不能为空');
      return;
    }

    if (editingRule) {
      // Edit existing rule
      const updated = rules.map(r =>
        r.id === editingRule.id
          ? {
              ...r,
              name: formName,
              urlPattern: formUrlPattern,
              action: formAction,
              description: formDescription,
            }
          : r
      );
      setRules(updated);
      saveRules(updated);
    } else {
      // Add new rule
      const newRule: GatewayRule = {
        id: Date.now().toString(),
        name: formName,
        urlPattern: formUrlPattern,
        action: formAction,
        enabled: true,
        description: formDescription || undefined,
      };
      const updated = [...rules, newRule];
      setRules(updated);
      saveRules(updated);
    }

    handleCancelEdit();
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

  const handleEditRule = (rule: GatewayRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormUrlPattern(rule.urlPattern);
    setFormAction(rule.action);
    setFormDescription(rule.description || '');
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setIsAdding(false);
    setFormName('');
    setFormUrlPattern('');
    setFormAction('block');
    setFormDescription('');
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingRule(null);
    setFormName('');
    setFormUrlPattern('');
    setFormAction('block');
    setFormDescription('');
  };

  const content = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#1a1a2e] border border-cyan-500/30 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <Shield className="text-cyan-400" size={24} />
            <h2 className="text-xl font-bold text-cyan-400">网关规则</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
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
              + 添加新规则
            </button>
          )}

          {/* Add/Edit Form */}
          {(isAdding || editingRule) && (
            <div className="bg-[#16213e] border border-cyan-500/20 rounded p-4 space-y-3">
              <h3 className="text-lg font-semibold text-cyan-400">
                {editingRule ? '编辑规则' : '新建规则'}
              </h3>

              <div>
                <label className="block text-sm text-gray-300 mb-1">规则名称</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="w-full bg-[#0f1419] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="例: 屏蔽广告"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  URL 匹配模式 (支持 * 通配符)
                </label>
                <input
                  type="text"
                  value={formUrlPattern}
                  onChange={e => setFormUrlPattern(e.target.value)}
                  className="w-full bg-[#0f1419] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="例: https://ads.example.com/*"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">操作类型</label>
                <select
                  value={formAction}
                  onChange={e => setFormAction(e.target.value as 'block' | 'allow')}
                  className="w-full bg-[#0f1419] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="block">阻止 (Block)</option>
                  <option value="allow">允许 (Allow - 白名单)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  描述 (可选)
                </label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-[#0f1419] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none resize-none"
                  rows={2}
                  placeholder="例: 屏蔽所有广告域名"
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
                  onClick={handleCancelEdit}
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
              暂无网关规则，点击上方按钮添加规则
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className={`bg-[#16213e] border rounded p-3 transition ${
                    rule.enabled
                      ? 'border-cyan-500/30 hover:border-cyan-500/50'
                      : 'border-gray-600/30 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggleEnabled(rule.id)}
                      className="mt-1 accent-cyan-500 w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {rule.action === 'block' ? (
                          <ShieldOff className="text-red-400 flex-shrink-0" size={16} />
                        ) : (
                          <Shield className="text-green-400 flex-shrink-0" size={16} />
                        )}
                        <span className="font-semibold text-white truncate">
                          {rule.name}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            rule.action === 'block'
                              ? 'bg-red-900/30 text-red-400'
                              : 'bg-green-900/30 text-green-400'
                          }`}
                        >
                          {rule.action === 'block' ? '阻止' : '允许'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300">
                        匹配: <code className="bg-black/30 px-1 rounded">{rule.urlPattern}</code>
                      </div>
                      {rule.description && (
                        <div className="text-xs text-gray-400 mt-1">{rule.description}</div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditRule(rule)}
                        className="text-cyan-400 hover:text-cyan-300 text-sm"
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
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/30 flex justify-end">
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

export default GatewayRules;
