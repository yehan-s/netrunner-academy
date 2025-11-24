import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, X } from 'lucide-react';
import { MirrorRule } from '../../types';

interface MirrorRulesProps {
  onClose: () => void;
}

// LocalStorage key
const STORAGE_KEY = 'netrunner_mirror_rules';

// Load rules from LocalStorage
const loadRules = (): MirrorRule[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save rules to LocalStorage
const saveRules = (rules: MirrorRule[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

// URL pattern matching (support wildcard *)
const matchesMirrorPattern = (url: string, pattern: string): boolean => {
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
};

// Get active Mirror rules
export const getActiveMirrorRules = (): MirrorRule[] => {
  return loadRules().filter(r => r.enabled);
};

// Apply mirror rule to URL
export const applyMirrorRule = (url: string): string | null => {
  const rules = getActiveMirrorRules();

  for (const rule of rules) {
    if (matchesMirrorPattern(url, rule.sourcePattern)) {
      try {
        const urlObj = new URL(url);
        const targetObj = new URL(rule.targetDomain);

        // Preserve path and search from original URL
        targetObj.pathname = urlObj.pathname;
        targetObj.search = urlObj.search;
        targetObj.hash = urlObj.hash;

        return targetObj.toString();
      } catch {
        // Invalid URL, skip this rule
        continue;
      }
    }
  }

  return null; // No matching rule
};

const MirrorRules: React.FC<MirrorRulesProps> = ({ onClose }) => {
  const [rules, setRules] = useState<MirrorRule[]>([]);
  const [editingRule, setEditingRule] = useState<MirrorRule | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formSourcePattern, setFormSourcePattern] = useState('');
  const [formTargetDomain, setFormTargetDomain] = useState('');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    setRules(loadRules());
  }, []);

  const handleSaveRule = () => {
    if (!formName.trim() || !formSourcePattern.trim() || !formTargetDomain.trim()) {
      alert('规则名称、源 URL 模式和目标域名不能为空');
      return;
    }

    // Validate targetDomain is a valid URL
    try {
      new URL(formTargetDomain);
    } catch {
      alert('目标域名格式无效，请输入完整的 URL（如 https://api.test.com）');
      return;
    }

    if (editingRule) {
      // Edit existing rule
      const updated = rules.map(r =>
        r.id === editingRule.id
          ? {
              ...r,
              name: formName,
              sourcePattern: formSourcePattern,
              targetDomain: formTargetDomain,
              description: formDescription,
            }
          : r
      );
      setRules(updated);
      saveRules(updated);
    } else {
      // Add new rule
      const newRule: MirrorRule = {
        id: Date.now().toString(),
        name: formName,
        sourcePattern: formSourcePattern,
        targetDomain: formTargetDomain,
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

  const handleEditRule = (rule: MirrorRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormSourcePattern(rule.sourcePattern);
    setFormTargetDomain(rule.targetDomain);
    setFormDescription(rule.description || '');
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setIsAdding(false);
    setFormName('');
    setFormSourcePattern('');
    setFormTargetDomain('');
    setFormDescription('');
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingRule(null);
    setFormName('');
    setFormSourcePattern('');
    setFormTargetDomain('');
    setFormDescription('');
  };

  const content = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#1a1a2e] border border-cyan-500/30 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <ArrowRight className="text-cyan-400" size={24} />
            <h2 className="text-xl font-bold text-cyan-400">镜像规则</h2>
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
                  placeholder="例: 生产环境映射到测试"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  源 URL 模式 (支持 * 通配符)
                </label>
                <input
                  type="text"
                  value={formSourcePattern}
                  onChange={e => setFormSourcePattern(e.target.value)}
                  className="w-full bg-[#0f1419] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="例: https://api.production.com/*"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  目标域名
                </label>
                <input
                  type="text"
                  value={formTargetDomain}
                  onChange={e => setFormTargetDomain(e.target.value)}
                  className="w-full bg-[#0f1419] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  placeholder="例: https://api.test.com"
                />
                <p className="text-xs text-gray-500 mt-1">
                  路径和参数会自动保留，只替换域名部分
                </p>
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
                  placeholder="例: 将生产 API 重定向到测试环境"
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
              暂无镜像规则，点击上方按钮添加规则
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
                        <span className="font-semibold text-white truncate">
                          {rule.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">源:</span>
                          <code className="bg-black/30 px-1 rounded text-xs flex-1 truncate">
                            {rule.sourcePattern}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <ArrowRight size={12} className="text-cyan-400 ml-6" />
                          <span className="text-gray-500">目标:</span>
                          <code className="bg-black/30 px-1 rounded text-xs flex-1 truncate">
                            {rule.targetDomain}
                          </code>
                        </div>
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

export default MirrorRules;
