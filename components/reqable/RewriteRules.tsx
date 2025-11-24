import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Trash2, Save, ArrowRight, FileEdit, RefreshCw } from 'lucide-react';
import { RewriteRule, NetworkRequest } from '../../types';

const STORAGE_KEY = 'netrunner_rewrite_rules';

const loadRules = (): RewriteRule[] => {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : [];
};

const saveRules = (rules: RewriteRule[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

// Export utility function for URL pattern matching
export const matchesRewriteRule = (url: string, pattern: string): boolean => {
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
};

// Export function to get active rules
export const getActiveRewriteRules = (): RewriteRule[] => {
  return loadRules().filter(r => r.enabled);
};

// Export function to apply rewrite rules to a request
export const applyRewriteRules = (req: NetworkRequest): NetworkRequest => {
  const rules = getActiveRewriteRules();
  let modifiedReq = { ...req };

  for (const rule of rules) {
    if (!matchesRewriteRule(req.url, rule.urlPattern)) continue;

    switch (rule.action.type) {
      case 'redirect':
        if (rule.action.config.targetUrl) {
          modifiedReq = { ...modifiedReq, url: rule.action.config.targetUrl };
        }
        break;

      case 'modify-request-header':
        if (rule.action.config.headerKey && rule.action.config.headerValue !== undefined) {
          const headers = new Headers(Object.entries(modifiedReq.requestHeaders || {}));
          headers.set(rule.action.config.headerKey, rule.action.config.headerValue);
          modifiedReq.requestHeaders = Object.fromEntries(headers.entries());
        }
        break;

      case 'modify-response-header':
        if (rule.action.config.headerKey && rule.action.config.headerValue !== undefined) {
          const headers = new Headers(Object.entries(modifiedReq.responseHeaders || {}));
          headers.set(rule.action.config.headerKey, rule.action.config.headerValue);
          modifiedReq.responseHeaders = Object.fromEntries(headers.entries());
        }
        break;

      case 'replace-response-body':
        if (rule.action.config.bodyContent !== undefined) {
          modifiedReq.responseBody = rule.action.config.bodyContent;
        }
        break;
    }
  }

  return modifiedReq;
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const RewriteRules: React.FC<Props> = ({ isOpen, onClose }) => {
  const [rules, setRules] = useState<RewriteRule[]>([]);
  const [editingRule, setEditingRule] = useState<RewriteRule | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [urlPattern, setUrlPattern] = useState('');
  const [actionType, setActionType] = useState<RewriteRule['action']['type']>('redirect');
  const [targetUrl, setTargetUrl] = useState('');
  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');
  const [bodyContent, setBodyContent] = useState('');

  useEffect(() => {
    setRules(loadRules());
  }, []);

  const resetForm = () => {
    setName('');
    setUrlPattern('');
    setActionType('redirect');
    setTargetUrl('');
    setHeaderKey('');
    setHeaderValue('');
    setBodyContent('');
    setEditingRule(null);
    setIsAdding(false);
  };

  const handleSave = () => {
    if (!name.trim() || !urlPattern.trim()) {
      alert('名称和 URL 模式不能为空');
      return;
    }

    // Validate action config
    if (actionType === 'redirect' && !targetUrl.trim()) {
      alert('重定向需要目标 URL');
      return;
    }
    if ((actionType === 'modify-request-header' || actionType === 'modify-response-header') && 
        (!headerKey.trim() || headerValue === undefined)) {
      alert('修改请求头需要键和值');
      return;
    }
    if (actionType === 'replace-response-body' && bodyContent === undefined) {
      alert('替换响应体需要内容');
      return;
    }

    const config: RewriteRule['action']['config'] = {};
    if (actionType === 'redirect') config.targetUrl = targetUrl;
    if (actionType === 'modify-request-header' || actionType === 'modify-response-header') {
      config.headerKey = headerKey;
      config.headerValue = headerValue;
    }
    if (actionType === 'replace-response-body') config.bodyContent = bodyContent;

    const newRule: RewriteRule = {
      id: editingRule?.id || Date.now().toString(),
      name: name.trim(),
      urlPattern: urlPattern.trim(),
      enabled: editingRule?.enabled ?? true,
      action: {
        type: actionType,
        config
      }
    };

    let updatedRules: RewriteRule[];
    if (editingRule) {
      updatedRules = rules.map(r => r.id === editingRule.id ? newRule : r);
    } else {
      updatedRules = [...rules, newRule];
    }

    setRules(updatedRules);
    saveRules(updatedRules);
    resetForm();
  };

  const handleEdit = (rule: RewriteRule) => {
    setEditingRule(rule);
    setName(rule.name);
    setUrlPattern(rule.urlPattern);
    setActionType(rule.action.type);
    setTargetUrl(rule.action.config.targetUrl || '');
    setHeaderKey(rule.action.config.headerKey || '');
    setHeaderValue(rule.action.config.headerValue || '');
    setBodyContent(rule.action.config.bodyContent || '');
    setIsAdding(true);
  };

  const handleDelete = (id: string) => {
    const updatedRules = rules.filter(r => r.id !== id);
    setRules(updatedRules);
    saveRules(updatedRules);
  };

  const toggleEnabled = (id: string) => {
    const updatedRules = rules.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    );
    setRules(updatedRules);
    saveRules(updatedRules);
  };

  const getActionIcon = (type: RewriteRule['action']['type']) => {
    switch (type) {
      case 'redirect': return <ArrowRight size={14} />;
      case 'modify-request-header': return <FileEdit size={14} />;
      case 'modify-response-header': return <FileEdit size={14} />;
      case 'replace-response-body': return <RefreshCw size={14} />;
    }
  };

  const getActionLabel = (type: RewriteRule['action']['type']) => {
    switch (type) {
      case 'redirect': return '重定向';
      case 'modify-request-header': return '修改请求头';
      case 'modify-response-header': return '修改响应头';
      case 'replace-response-body': return '替换响应体';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-slate-700 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <RefreshCw size={20} className="text-purple-400" />
            重写规则管理
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Rules List */}
          <div className="space-y-2">
            {rules.length === 0 && !isAdding && (
              <div className="text-center py-8 text-slate-400">
                暂无重写规则，点击下方按钮添加
              </div>
            )}

            {rules.map(rule => (
              <div
                key={rule.id}
                className={`bg-slate-700/50 rounded-lg p-3 border ${
                  rule.enabled ? 'border-purple-500/30' : 'border-slate-600/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={() => toggleEnabled(rule.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">{rule.name}</div>
                    <div className="text-sm text-slate-300 font-mono truncate">{rule.urlPattern}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs">
                        {getActionIcon(rule.action.type)}
                        {getActionLabel(rule.action.type)}
                      </div>
                      {rule.action.type === 'redirect' && rule.action.config.targetUrl && (
                        <span className="text-xs text-slate-400 truncate">→ {rule.action.config.targetUrl}</span>
                      )}
                      {(rule.action.type === 'modify-request-header' || rule.action.type === 'modify-response-header') &&
                        rule.action.config.headerKey && (
                        <span className="text-xs text-slate-400">{rule.action.config.headerKey}: {rule.action.config.headerValue}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(rule)}
                      className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(rule.id)}
                      className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add/Edit Form */}
          {isAdding && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/30 space-y-3">
              <h3 className="font-semibold text-white">{editingRule ? '编辑规则' : '添加规则'}</h3>

              <div>
                <label className="block text-sm text-slate-300 mb-1">规则名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="例如: 重定向API到测试环境"
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">URL 模式 (支持 * 通配符)</label>
                <input
                  type="text"
                  value={urlPattern}
                  onChange={e => setUrlPattern(e.target.value)}
                  placeholder="例如: https://api.example.com/*"
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 outline-none font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-300 mb-1">操作类型</label>
                <select
                  value={actionType}
                  onChange={e => setActionType(e.target.value as RewriteRule['action']['type'])}
                  className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 outline-none"
                >
                  <option value="redirect">重定向 URL</option>
                  <option value="modify-request-header">修改请求头</option>
                  <option value="modify-response-header">修改响应头</option>
                  <option value="replace-response-body">替换响应体</option>
                </select>
              </div>

              {/* Conditional Config Fields */}
              {actionType === 'redirect' && (
                <div>
                  <label className="block text-sm text-slate-300 mb-1">目标 URL</label>
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={e => setTargetUrl(e.target.value)}
                    placeholder="https://test-api.example.com/data"
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 outline-none font-mono text-sm"
                  />
                </div>
              )}

              {(actionType === 'modify-request-header' || actionType === 'modify-response-header') && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Header 键</label>
                      <input
                        type="text"
                        value={headerKey}
                        onChange={e => setHeaderKey(e.target.value)}
                        placeholder="Authorization"
                        className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 outline-none font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-1">Header 值</label>
                      <input
                        type="text"
                        value={headerValue}
                        onChange={e => setHeaderValue(e.target.value)}
                        placeholder="Bearer test-token"
                        className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 outline-none font-mono text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {actionType === 'replace-response-body' && (
                <div>
                  <label className="block text-sm text-slate-300 mb-1">响应体内容</label>
                  <textarea
                    value={bodyContent}
                    onChange={e => setBodyContent(e.target.value)}
                    placeholder='{"success": true, "data": "mock response"}'
                    rows={4}
                    className="w-full bg-slate-800 text-white px-3 py-2 rounded border border-slate-600 focus:border-purple-500 outline-none font-mono text-sm"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Save size={16} />
                  {editingRule ? '更新' : '添加'}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Plus size={16} />
              添加新规则
            </button>
          )}
          <p className="text-xs text-slate-400 mt-2">
            重写规则将自动应用于匹配的请求。支持 * 通配符匹配任意字符。
          </p>
        </div>
      </div>
    </div>
  );
};
