import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapLocalRule } from '../../types';

interface MapLocalRulesProps {
  onClose: () => void;
}

// LocalStorage key
const STORAGE_KEY = 'netrunner_maplocal_rules';

// Load rules from LocalStorage
const loadRules = (): MapLocalRule[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save rules to LocalStorage
const saveRules = (rules: MapLocalRule[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

// URL pattern matching (support wildcard *)
export const matchesMapLocalRule = (url: string, pattern: string): boolean => {
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
};

// Get active Map Local rules
export const getActiveMapLocalRules = (): MapLocalRule[] => {
  return loadRules().filter(r => r.enabled);
};

// Apply Map Local rules to a URL
export const applyMapLocalRule = (url: string): { content: string; contentType: string } | null => {
  const rules = getActiveMapLocalRules();
  for (const rule of rules) {
    if (matchesMapLocalRule(url, rule.urlPattern)) {
      return {
        content: rule.localContent,
        contentType: rule.contentType
      };
    }
  }
  return null;
};

const MapLocalRules: React.FC<MapLocalRulesProps> = ({ onClose }) => {
  const [rules, setRules] = useState<MapLocalRule[]>([]);
  const [editingRule, setEditingRule] = useState<MapLocalRule | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrlPattern, setFormUrlPattern] = useState('');
  const [formLocalContent, setFormLocalContent] = useState('');
  const [formContentType, setFormContentType] = useState('application/json');

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
              localContent: formLocalContent,
              contentType: formContentType
            }
          : r
      );
      setRules(updated);
      saveRules(updated);
      setEditingRule(null);
    } else {
      // Add new rule
      const newRule: MapLocalRule = {
        id: Date.now().toString(),
        name: formName,
        urlPattern: formUrlPattern,
        localContent: formLocalContent,
        contentType: formContentType,
        enabled: true
      };
      const updated = [...rules, newRule];
      setRules(updated);
      saveRules(updated);
      setIsAdding(false);
    }

    // Reset form
    setFormName('');
    setFormUrlPattern('');
    setFormLocalContent('');
    setFormContentType('application/json');
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('确定要删除该规则吗？')) {
      const updated = rules.filter(r => r.id !== id);
      setRules(updated);
      saveRules(updated);
    }
  };

  const handleToggleRule = (id: string) => {
    const updated = rules.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r));
    setRules(updated);
    saveRules(updated);
  };

  const handleEditRule = (rule: MapLocalRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormUrlPattern(rule.urlPattern);
    setFormLocalContent(rule.localContent);
    setFormContentType(rule.contentType);
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setIsAdding(false);
    setFormName('');
    setFormUrlPattern('');
    setFormLocalContent('');
    setFormContentType('application/json');
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingRule(null);
    setFormName('');
    setFormUrlPattern('');
    setFormLocalContent('');
    setFormContentType('application/json');
  };

  const content = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#1a1a2e] border border-cyan-500/30 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <h2 className="text-xl font-bold text-cyan-400">Map Local 规则</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
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
                  placeholder="例: 本地 API Mock"
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
                  placeholder="例: https://api.example.com/users/*"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">内容类型</label>
                <select
                  value={formContentType}
                  onChange={e => setFormContentType(e.target.value)}
                  className="w-full bg-[#0f1419] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="application/json">application/json</option>
                  <option value="text/html">text/html</option>
                  <option value="text/plain">text/plain</option>
                  <option value="application/xml">application/xml</option>
                  <option value="text/javascript">text/javascript</option>
                  <option value="text/css">text/css</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">本地内容</label>
                <textarea
                  value={formLocalContent}
                  onChange={e => setFormLocalContent(e.target.value)}
                  className="w-full bg-[#0f1419] border border-gray-600 rounded px-3 py-2 text-white focus:border-cyan-500 focus:outline-none font-mono text-sm"
                  rows={10}
                  placeholder={
                    formContentType === 'application/json'
                      ? '{\n  "message": "本地模拟数据",\n  "data": []\n}'
                      : formContentType === 'text/html'
                      ? '<html><body>本地页面</body></html>'
                      : '本地文本内容'
                  }
                />
              </div>

              <div className="flex gap-2">
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
          {rules.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              暂无 Map Local 规则，点击上方按钮添加规则
            </div>
          ) : (
            <div className="space-y-2">
              {rules.map(rule => (
                <div
                  key={rule.id}
                  className={`bg-[#16213e] border rounded p-3 ${
                    rule.enabled ? 'border-cyan-500/30' : 'border-gray-600/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <input
                          type="checkbox"
                          checked={rule.enabled}
                          onChange={() => handleToggleRule(rule.id)}
                          className="w-4 h-4"
                        />
                        <span className="font-semibold text-white">{rule.name}</span>
                        <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded">
                          {rule.contentType}
                        </span>
                      </div>
                      <div className="text-sm text-gray-300 ml-6">
                        匹配: <code className="bg-black/30 px-1 rounded">{rule.urlPattern}</code>
                      </div>
                      <div className="text-xs text-gray-400 ml-6 mt-1 line-clamp-2 font-mono">
                        {rule.localContent.substring(0, 100)}
                        {rule.localContent.length > 100 ? '...' : ''}
                      </div>
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

export default MapLocalRules;
