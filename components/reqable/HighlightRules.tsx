import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Highlighter, X } from 'lucide-react';
import { HighlightRule, NetworkRequest } from '../../types';

interface HighlightRulesProps {
  onClose: () => void;
}

// LocalStorage key
const STORAGE_KEY = 'netrunner_highlight_rules';

// Predefined color palette
const COLOR_PALETTE = [
  { name: '红色', value: '#ff6b6b' },
  { name: '橙色', value: '#ff9f43' },
  { name: '黄色', value: '#ffd93d' },
  { name: '绿色', value: '#6bcf7f' },
  { name: '青色', value: '#4ecdc4' },
  { name: '蓝色', value: '#74b9ff' },
  { name: '紫色', value: '#a29bfe' },
  { name: '粉色', value: '#fd79a8' },
];

// Load rules from LocalStorage
const loadRules = (): HighlightRule[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save rules to LocalStorage
const saveRules = (rules: HighlightRule[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

// Get active Highlight rules
export const getActiveHighlightRules = (): HighlightRule[] => {
  return loadRules().filter(r => r.enabled);
};

// Check if request matches URL pattern
const matchesUrlPattern = (url: string, pattern: string): boolean => {
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
};

// Check if status matches status condition
const matchesStatusCondition = (status: number, condition: string): boolean => {
  // Handle "4xx", "5xx" patterns
  if (condition.includes('x')) {
    const prefix = condition.charAt(0);
    return status.toString().startsWith(prefix);
  }

  // Handle range "200-299"
  if (condition.includes('-')) {
    const [min, max] = condition.split('-').map(Number);
    return status >= min && status <= max;
  }

  // Handle exact match "200"
  return status === Number(condition);
};

// Check if size matches size condition
const matchesSizeCondition = (size: number, condition: string): boolean => {
  const match = condition.match(/^([><]=?)(\d+(?:\.\d+)?)(KB|MB|GB)?$/i);
  if (!match) return false;

  const [, operator, value, unit] = match;
  let threshold = parseFloat(value);

  // Convert to bytes
  if (unit) {
    const units: Record<string, number> = {
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
    };
    threshold *= units[unit.toUpperCase()] || 1;
  }

  switch (operator) {
    case '>':
      return size > threshold;
    case '>=':
      return size >= threshold;
    case '<':
      return size < threshold;
    case '<=':
      return size <= threshold;
    default:
      return false;
  }
};

// Apply highlight rules to a request
export const getHighlightColor = (request: NetworkRequest): string | null => {
  const rules = getActiveHighlightRules();

  for (const rule of rules) {
    let matches = false;

    switch (rule.condition.type) {
      case 'url':
        matches = matchesUrlPattern(request.url, rule.condition.value);
        break;
      case 'status':
        matches = matchesStatusCondition(request.status, rule.condition.value);
        break;
      case 'size':
        matches = matchesSizeCondition(request.size, rule.condition.value);
        break;
    }

    if (matches) {
      return rule.color;
    }
  }

  return null;
};

const HighlightRules: React.FC<HighlightRulesProps> = ({ onClose }) => {
  const [rules, setRules] = useState<HighlightRule[]>([]);
  const [editingRule, setEditingRule] = useState<HighlightRule | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formConditionType, setFormConditionType] = useState<'url' | 'status' | 'size'>('url');
  const [formConditionValue, setFormConditionValue] = useState('');
  const [formColor, setFormColor] = useState(COLOR_PALETTE[0].value);
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    setRules(loadRules());
  }, []);

  const handleSaveRule = () => {
    if (!formName.trim() || !formConditionValue.trim()) {
      alert('规则名称和条件值不能为空');
      return;
    }

    // Validate condition value based on type
    if (formConditionType === 'status') {
      const valid = /^\d{3}$|^\d{1}x{2}$|^\d{3}-\d{3}$/.test(formConditionValue);
      if (!valid) {
        alert('状态码格式无效，请使用 200、4xx 或 200-299 格式');
        return;
      }
    } else if (formConditionType === 'size') {
      const valid = /^[><]=?\d+(?:\.\d+)?(KB|MB|GB)?$/i.test(formConditionValue);
      if (!valid) {
        alert('大小格式无效，请使用 >1MB、<100KB 等格式');
        return;
      }
    }

    if (editingRule) {
      // Edit existing rule
      const updated = rules.map(r =>
        r.id === editingRule.id
          ? {
              ...r,
              name: formName,
              condition: { type: formConditionType, value: formConditionValue },
              color: formColor,
              description: formDescription,
            }
          : r
      );
      setRules(updated);
      saveRules(updated);
    } else {
      // Add new rule
      const newRule: HighlightRule = {
        id: Date.now().toString(),
        name: formName,
        condition: { type: formConditionType, value: formConditionValue },
        color: formColor,
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

  const handleEditRule = (rule: HighlightRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormConditionType(rule.condition.type);
    setFormConditionValue(rule.condition.value);
    setFormColor(rule.color);
    setFormDescription(rule.description || '');
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setIsAdding(false);
    setFormName('');
    setFormConditionType('url');
    setFormConditionValue('');
    setFormColor(COLOR_PALETTE[0].value);
    setFormDescription('');
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingRule(null);
    setFormName('');
    setFormConditionType('url');
    setFormConditionValue('');
    setFormColor(COLOR_PALETTE[0].value);
    setFormDescription('');
  };

  const getConditionTypeLabel = (type: 'url' | 'status' | 'size') => {
    const labels = { url: 'URL', status: '状态码', size: '大小' };
    return labels[type];
  };

  const content = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#1a1a2e] border border-cyan-500/30 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <Highlighter className="text-cyan-400" size={24} />
            <h2 className="text-xl font-bold text-cyan-400">高亮规则</h2>
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
                  placeholder="例: 高亮 4xx 错误"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">条件类型</label>
                <select
                  value={formConditionType}
                  onChange={e => setFormConditionType(e.target.value as 'url' | 'status' | 'size')}
                  className="w-full bg-[#0f1419] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="url">URL 匹配</option>
                  <option value="status">状态码</option>
                  <option value="size">响应大小</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  条件值
                  {formConditionType === 'url' && ' (支持 * 通配符)'}
                  {formConditionType === 'status' && ' (如: 200, 4xx, 200-299)'}
                  {formConditionType === 'size' && ' (如: >1MB, <100KB)'}
                </label>
                <input
                  type="text"
                  value={formConditionValue}
                  onChange={e => setFormConditionValue(e.target.value)}
                  className="w-full bg-[#0f1419] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                  placeholder={
                    formConditionType === 'url'
                      ? '例: https://api.example.com/*'
                      : formConditionType === 'status'
                      ? '例: 4xx'
                      : '例: >1MB'
                  }
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">高亮颜色</label>
                <div className="grid grid-cols-8 gap-2">
                  {COLOR_PALETTE.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setFormColor(color.value)}
                      className={`w-10 h-10 rounded border-2 transition ${
                        formColor === color.value
                          ? 'border-cyan-500 scale-110'
                          : 'border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
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
                  placeholder="例: 高亮所有客户端错误请求"
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
              暂无高亮规则，点击上方按钮添加规则
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
                        <div
                          className="w-6 h-6 rounded border border-gray-600"
                          style={{ backgroundColor: rule.color }}
                          title={`颜色: ${rule.color}`}
                        />
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">条件:</span>
                          <code className="bg-black/30 px-2 py-0.5 rounded text-xs">
                            {getConditionTypeLabel(rule.condition.type)} = {rule.condition.value}
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

export default HighlightRules;
