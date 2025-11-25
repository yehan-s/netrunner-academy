import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Ban, CheckCircle, X, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { AccessControlRule } from '../../types';

interface AccessControlProps {
  onClose: () => void;
}

const STORAGE_KEY = 'netrunner_access_control_rules';

// Load rules from localStorage
const loadRules = (): AccessControlRule[] => {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save rules to localStorage
const saveRules = (rules: AccessControlRule[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

// Pattern matching with wildcard support
export const matchesPattern = (value: string, pattern: string): boolean => {
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`, 'i');
  return regex.test(value);
};

// Extract domain from URL
const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
};

// Get active access control rules
export const getActiveAccessControlRules = (): AccessControlRule[] => {
  return loadRules().filter(r => r.enabled);
};

// Check if a request should be allowed based on access control rules
export const checkAccessControl = (url: string): { allowed: boolean; rule?: AccessControlRule } => {
  const rules = getActiveAccessControlRules();
  const domain = extractDomain(url);

  // First, check whitelist rules
  const whitelistRules = rules.filter(r => r.type === 'whitelist');
  if (whitelistRules.length > 0) {
    // If whitelist exists, only allow if matched
    for (const rule of whitelistRules) {
      const valueToMatch = rule.matchType === 'domain' ? domain : url;
      if (matchesPattern(valueToMatch, rule.pattern)) {
        return { allowed: true, rule };
      }
    }
    // If whitelist exists but not matched, block
    return { allowed: false };
  }

  // Then, check blacklist rules
  const blacklistRules = rules.filter(r => r.type === 'blacklist');
  for (const rule of blacklistRules) {
    const valueToMatch = rule.matchType === 'domain' ? domain : url;
    if (matchesPattern(valueToMatch, rule.pattern)) {
      return { allowed: false, rule };
    }
  }

  // Default: allow
  return { allowed: true };
};

const AccessControl: React.FC<AccessControlProps> = ({ onClose }) => {
  const [rules, setRules] = useState<AccessControlRule[]>([]);
  const [editingRule, setEditingRule] = useState<AccessControlRule | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formPattern, setFormPattern] = useState('');
  const [formType, setFormType] = useState<'blacklist' | 'whitelist'>('blacklist');
  const [formMatchType, setFormMatchType] = useState<'domain' | 'url' | 'ip'>('domain');
  const [formDescription, setFormDescription] = useState('');

  useEffect(() => {
    setRules(loadRules());
  }, []);

  const handleSaveRule = () => {
    if (!formName.trim() || !formPattern.trim()) {
      alert('规则名称和匹配模式不能为空');
      return;
    }

    if (editingRule) {
      const updated = rules.map(r =>
        r.id === editingRule.id
          ? {
              ...r,
              name: formName,
              pattern: formPattern,
              type: formType,
              matchType: formMatchType,
              description: formDescription,
            }
          : r
      );
      setRules(updated);
      saveRules(updated);
    } else {
      const newRule: AccessControlRule = {
        id: Date.now().toString(),
        name: formName,
        pattern: formPattern,
        type: formType,
        matchType: formMatchType,
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

  const handleEditRule = (rule: AccessControlRule) => {
    setEditingRule(rule);
    setFormName(rule.name);
    setFormPattern(rule.pattern);
    setFormType(rule.type);
    setFormMatchType(rule.matchType);
    setFormDescription(rule.description || '');
    setIsAdding(false);
  };

  const handleCancelEdit = () => {
    setEditingRule(null);
    setIsAdding(false);
    setFormName('');
    setFormPattern('');
    setFormType('blacklist');
    setFormMatchType('domain');
    setFormDescription('');
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditingRule(null);
    setFormName('');
    setFormPattern('');
    setFormType('blacklist');
    setFormMatchType('domain');
    setFormDescription('');
  };

  const blacklistRules = rules.filter(r => r.type === 'blacklist');
  const whitelistRules = rules.filter(r => r.type === 'whitelist');

  const content = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-3">
            <Shield className="text-[#4ec9b0]" size={24} />
            <div>
              <h2 className="text-xl font-bold text-[#4ec9b0]">访问控制</h2>
              <p className="text-xs text-gray-400">黑名单/白名单规则管理</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Stats */}
        <div className="p-4 bg-[#252526] border-b border-[#3c3c3c] grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{rules.length}</div>
            <div className="text-xs text-gray-400">总规则数</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{blacklistRules.length}</div>
            <div className="text-xs text-gray-400">黑名单</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{whitelistRules.length}</div>
            <div className="text-xs text-gray-400">白名单</div>
          </div>
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
            <div className="bg-[#252526] border border-[#3c3c3c] rounded p-4 space-y-3">
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
                    placeholder="例: 屏蔽广告域名"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">规则类型</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as 'blacklist' | 'whitelist')}
                    className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white focus:border-[#4ec9b0] focus:outline-none"
                  >
                    <option value="blacklist">黑名单 (阻止)</option>
                    <option value="whitelist">白名单 (仅允许)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">匹配类型</label>
                  <select
                    value={formMatchType}
                    onChange={e => setFormMatchType(e.target.value as 'domain' | 'url' | 'ip')}
                    className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white focus:border-[#4ec9b0] focus:outline-none"
                  >
                    <option value="domain">域名</option>
                    <option value="url">完整 URL</option>
                    <option value="ip">IP 地址</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-300 mb-1">
                    匹配模式 (支持 * 通配符)
                  </label>
                  <input
                    type="text"
                    value={formPattern}
                    onChange={e => setFormPattern(e.target.value)}
                    className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white focus:border-[#4ec9b0] focus:outline-none"
                    placeholder={
                      formMatchType === 'domain' ? '例: *.ads.com' :
                      formMatchType === 'url' ? '例: https://ads.example.com/*' :
                      '例: 192.168.1.*'
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">描述 (可选)</label>
                <textarea
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white focus:border-[#4ec9b0] focus:outline-none resize-none"
                  rows={2}
                  placeholder="例: 屏蔽所有广告相关域名"
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

          {/* Info Box */}
          {whitelistRules.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded p-3 text-sm">
              <div className="flex items-center gap-2 text-yellow-400 font-medium mb-1">
                <ShieldAlert size={16} />
                白名单模式已启用
              </div>
              <p className="text-yellow-200/70 text-xs">
                当存在白名单规则时，只有匹配白名单的请求才会被允许，其他所有请求将被阻止。
              </p>
            </div>
          )}

          {/* Rules List */}
          {rules.length === 0 && !isAdding && !editingRule ? (
            <div className="text-center py-8 text-gray-400">
              暂无访问控制规则，点击上方按钮添加规则
            </div>
          ) : (
            <div className="space-y-2">
              {/* Whitelist Section */}
              {whitelistRules.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                    <ShieldCheck size={16} />
                    白名单规则
                  </h4>
                  {whitelistRules.map(rule => (
                    <RuleItem
                      key={rule.id}
                      rule={rule}
                      onToggle={handleToggleEnabled}
                      onEdit={handleEditRule}
                      onDelete={handleDeleteRule}
                    />
                  ))}
                </div>
              )}

              {/* Blacklist Section */}
              {blacklistRules.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                    <Ban size={16} />
                    黑名单规则
                  </h4>
                  {blacklistRules.map(rule => (
                    <RuleItem
                      key={rule.id}
                      rule={rule}
                      onToggle={handleToggleEnabled}
                      onEdit={handleEditRule}
                      onDelete={handleDeleteRule}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tips */}
          <div className="bg-[#252526]/50 border border-gray-700 rounded p-3 mt-4">
            <h4 className="text-xs font-semibold text-gray-400 mb-2">使用提示</h4>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• <strong>黑名单</strong>: 匹配的请求将被阻止</li>
              <li>• <strong>白名单</strong>: 仅允许匹配的请求，其他全部阻止</li>
              <li>• 白名单优先级高于黑名单</li>
              <li>• 支持通配符 * 匹配任意字符</li>
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

// Rule Item Component
const RuleItem: React.FC<{
  rule: AccessControlRule;
  onToggle: (id: string) => void;
  onEdit: (rule: AccessControlRule) => void;
  onDelete: (id: string) => void;
}> = ({ rule, onToggle, onEdit, onDelete }) => (
  <div
    className={`bg-[#252526] border rounded p-3 transition mb-2 ${
      rule.enabled
        ? rule.type === 'whitelist'
          ? 'border-green-500/30 hover:border-green-500/50'
          : 'border-red-500/30 hover:border-red-500/50'
        : 'border-gray-600/30 opacity-60'
    }`}
  >
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        checked={rule.enabled}
        onChange={() => onToggle(rule.id)}
        className="mt-1 accent-[#4ec9b0] w-4 h-4"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {rule.type === 'whitelist' ? (
            <CheckCircle className="text-green-400 flex-shrink-0" size={16} />
          ) : (
            <Ban className="text-red-400 flex-shrink-0" size={16} />
          )}
          <span className="font-semibold text-white truncate">{rule.name}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            rule.type === 'whitelist'
              ? 'bg-green-900/30 text-green-400'
              : 'bg-red-900/30 text-red-400'
          }`}>
            {rule.type === 'whitelist' ? '白名单' : '黑名单'}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">
            {rule.matchType === 'domain' ? '域名' : rule.matchType === 'url' ? 'URL' : 'IP'}
          </span>
        </div>
        <div className="text-sm text-gray-300">
          匹配: <code className="bg-black/30 px-1 rounded">{rule.pattern}</code>
        </div>
        {rule.description && (
          <div className="text-xs text-gray-400 mt-1">{rule.description}</div>
        )}
      </div>
      <div className="flex gap-2 ml-4">
        <button
          onClick={() => onEdit(rule)}
          className="text-[#4ec9b0] hover:text-[#3db89f] text-sm"
        >
          编辑
        </button>
        <button
          onClick={() => onDelete(rule.id)}
          className="text-red-400 hover:text-red-300 text-sm"
        >
          删除
        </button>
      </div>
    </div>
  </div>
);

export default AccessControl;
