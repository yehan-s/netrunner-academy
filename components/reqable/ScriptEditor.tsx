import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ScriptRule } from '../../types';
import { loadScriptRules, saveScriptRules } from '../../utils/scriptEngine';
import { X, Plus, Edit2, Trash2, Play } from 'lucide-react';

interface ScriptEditorProps {
  onClose: () => void;
}

const EXAMPLE_SCRIPTS = {
  addAuthHeader: `// Add authentication header
console.log("Adding auth token to request");
setHeader("Authorization", "Bearer test-token-12345");
`,
  modifyResponse: `// Modify response data
console.log("Original body:", getBody());
const data = { success: true, message: "Modified by script" };
setBody(JSON.stringify(data));
`,
  logRequest: `// Log request details
console.log("Request URL:", request.url);
console.log("Request Method:", request.method);
console.log("Request Headers:", request.requestHeaders);
`,
  changeStatus: `// Change response status
console.log("Changing status to 404");
setStatus(404, "Not Found");
`
};

export const ScriptEditor: React.FC<ScriptEditorProps> = ({ onClose }) => {
  const [rules, setRules] = useState<ScriptRule[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<ScriptRule>>({
    name: '',
    urlPattern: '',
    trigger: 'request',
    code: EXAMPLE_SCRIPTS.addAuthHeader,
    enabled: true,
    description: ''
  });

  // Load rules on mount
  useEffect(() => {
    setRules(loadScriptRules());
  }, []);

  // Save rules whenever they change
  useEffect(() => {
    saveScriptRules(rules);
  }, [rules]);

  const handleAdd = () => {
    if (!formData.name || !formData.urlPattern || !formData.code) {
      alert('Please fill in all required fields');
      return;
    }

    const newRule: ScriptRule = {
      id: `script-${Date.now()}`,
      name: formData.name,
      urlPattern: formData.urlPattern,
      trigger: formData.trigger || 'request',
      code: formData.code,
      enabled: formData.enabled !== undefined ? formData.enabled : true,
      description: formData.description
    };

    setRules([...rules, newRule]);
    setFormData({
      name: '',
      urlPattern: '',
      trigger: 'request',
      code: EXAMPLE_SCRIPTS.addAuthHeader,
      enabled: true,
      description: ''
    });
  };

  const handleEdit = (rule: ScriptRule) => {
    setEditingId(rule.id);
    setFormData(rule);
  };

  const handleUpdate = () => {
    if (!editingId) return;

    setRules(rules.map(r =>
      r.id === editingId
        ? { ...r, ...formData }
        : r
    ));

    setEditingId(null);
    setFormData({
      name: '',
      urlPattern: '',
      trigger: 'request',
      code: EXAMPLE_SCRIPTS.addAuthHeader,
      enabled: true,
      description: ''
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this script rule?')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const handleToggle = (id: string) => {
    setRules(rules.map(r =>
      r.id === id ? { ...r, enabled: !r.enabled } : r
    ));
  };

  const handleLoadExample = (key: keyof typeof EXAMPLE_SCRIPTS) => {
    setFormData({ ...formData, code: EXAMPLE_SCRIPTS[key] });
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60">
      <div className="bg-[#1e1e1e] border border-[#454545] rounded-lg shadow-2xl w-[90vw] h-[85vh] max-w-[1200px] flex flex-col">
        {/* Header */}
        <div className="h-14 bg-[#252526] border-b border-[#454545] flex items-center justify-between px-6 shrink-0">
          <div>
            <h2 className="text-white font-bold text-base">Script Rules</h2>
            <p className="text-gray-500 text-xs mt-0.5">Execute JavaScript code on requests/responses</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#333] rounded text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex min-h-0">
          {/* Left Panel - Rules List */}
          <div className="w-80 border-r border-[#454545] flex flex-col">
            <div className="p-4 border-b border-[#454545]">
              <button
                onClick={handleAdd}
                disabled={editingId !== null}
                className="w-full px-4 py-2 bg-[#0e639c] hover:bg-[#1177bb] disabled:bg-[#333] disabled:text-gray-600 text-white text-sm rounded flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={14} />
                Add New Rule
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {rules.length === 0 ? (
                <div className="text-center text-gray-500 text-xs mt-8">
                  No script rules yet.<br />Click "Add New Rule" to create one.
                </div>
              ) : (
                <div className="space-y-2">
                  {rules.map(rule => (
                    <div
                      key={rule.id}
                      className={`p-3 rounded border ${
                        editingId === rule.id
                          ? 'bg-[#094771] border-[#1177bb]'
                          : 'bg-[#252526] border-[#333] hover:border-[#454545]'
                      } transition-colors`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">
                            {rule.name}
                          </div>
                          <div className="text-gray-500 text-xs font-mono truncate mt-0.5">
                            {rule.urlPattern}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              rule.trigger === 'request' ? 'bg-blue-500/20 text-blue-400' :
                              rule.trigger === 'response' ? 'bg-green-500/20 text-green-400' :
                              'bg-purple-500/20 text-purple-400'
                            }`}>
                              {rule.trigger.toUpperCase()}
                            </span>
                            {rule.enabled && (
                              <span className="px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 text-[10px] font-bold">
                                ENABLED
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-1 ml-2">
                          <button
                            onClick={() => handleToggle(rule.id)}
                            className={`p-1.5 rounded transition-colors ${
                              rule.enabled
                                ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                : 'bg-gray-700 text-gray-500 hover:bg-gray-600'
                            }`}
                            title={rule.enabled ? 'Disable' : 'Enable'}
                          >
                            <Play size={12} />
                          </button>
                          <button
                            onClick={() => handleEdit(rule)}
                            className="p-1.5 bg-[#333] hover:bg-[#444] text-gray-400 hover:text-white rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => handleDelete(rule.id)}
                            className="p-1.5 bg-[#333] hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Edit Form */}
          <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            <h3 className="text-white font-bold mb-4">
              {editingId ? 'Edit Script Rule' : 'New Script Rule'}
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Rule Name *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Add Auth Header"
                  className="w-full px-3 py-2 bg-[#252526] border border-[#454545] rounded text-white text-sm focus:outline-none focus:border-[#0e639c]"
                />
              </div>

              {/* URL Pattern */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  URL Pattern * <span className="text-gray-600">(supports * wildcard)</span>
                </label>
                <input
                  type="text"
                  value={formData.urlPattern || ''}
                  onChange={e => setFormData({ ...formData, urlPattern: e.target.value })}
                  placeholder="e.g., https://api.example.com/*"
                  className="w-full px-3 py-2 bg-[#252526] border border-[#454545] rounded text-white text-sm font-mono focus:outline-none focus:border-[#0e639c]"
                />
              </div>

              {/* Trigger */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Trigger On
                </label>
                <select
                  value={formData.trigger || 'request'}
                  onChange={e => setFormData({ ...formData, trigger: e.target.value as 'request' | 'response' | 'both' })}
                  className="w-full px-3 py-2 bg-[#252526] border border-[#454545] rounded text-white text-sm focus:outline-none focus:border-[#0e639c]"
                >
                  <option value="request">Request</option>
                  <option value="response">Response</option>
                  <option value="both">Both (Request & Response)</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Description <span className="text-gray-600">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.description || ''}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this script do?"
                  className="w-full px-3 py-2 bg-[#252526] border border-[#454545] rounded text-white text-sm focus:outline-none focus:border-[#0e639c]"
                />
              </div>

              {/* Example Scripts */}
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  Load Example
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleLoadExample('addAuthHeader')}
                    className="px-3 py-1.5 bg-[#252526] hover:bg-[#333] border border-[#454545] text-gray-300 text-xs rounded transition-colors"
                  >
                    Add Auth
                  </button>
                  <button
                    onClick={() => handleLoadExample('modifyResponse')}
                    className="px-3 py-1.5 bg-[#252526] hover:bg-[#333] border border-[#454545] text-gray-300 text-xs rounded transition-colors"
                  >
                    Modify Response
                  </button>
                  <button
                    onClick={() => handleLoadExample('logRequest')}
                    className="px-3 py-1.5 bg-[#252526] hover:bg-[#333] border border-[#454545] text-gray-300 text-xs rounded transition-colors"
                  >
                    Log Request
                  </button>
                  <button
                    onClick={() => handleLoadExample('changeStatus')}
                    className="px-3 py-1.5 bg-[#252526] hover:bg-[#333] border border-[#454545] text-gray-300 text-xs rounded transition-colors"
                  >
                    Change Status
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1">
                <label className="block text-gray-400 text-xs font-medium mb-1.5">
                  JavaScript Code *
                </label>
                <div className="relative">
                  <textarea
                    value={formData.code || ''}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="// Write your JavaScript code here..."
                    className="w-full h-[280px] px-3 py-2 bg-[#1e1e1e] border border-[#454545] rounded text-[#d4d4d4] text-sm font-mono resize-none focus:outline-none focus:border-[#0e639c]"
                    spellCheck={false}
                  />
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-[#252526] border border-[#333] rounded text-[10px] text-gray-500 font-mono">
                    JavaScript
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500 bg-[#252526] rounded p-3 border border-[#333]">
                  <div className="font-bold text-gray-400 mb-1">Available APIs:</div>
                  <div className="space-y-0.5 font-mono">
                    <div><span className="text-blue-400">console.log</span>(message) - Log to console</div>
                    <div><span className="text-blue-400">setHeader</span>(key, value) - Set header</div>
                    <div><span className="text-blue-400">getHeader</span>(key) - Get header</div>
                    <div><span className="text-blue-400">setBody</span>(content) - Set body</div>
                    <div><span className="text-blue-400">getBody</span>() - Get body</div>
                    <div><span className="text-blue-400">setStatus</span>(code, text?) - Set status</div>
                    <div><span className="text-blue-400">request</span> - Current request object</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                {editingId ? (
                  <>
                    <button
                      onClick={handleUpdate}
                      className="flex-1 px-4 py-2.5 bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm rounded transition-colors"
                    >
                      Update Rule
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setFormData({
                          name: '',
                          urlPattern: '',
                          trigger: 'request',
                          code: EXAMPLE_SCRIPTS.addAuthHeader,
                          enabled: true,
                          description: ''
                        });
                      }}
                      className="px-4 py-2.5 bg-[#333] hover:bg-[#444] text-white text-sm rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAdd}
                    className="flex-1 px-4 py-2.5 bg-[#0e639c] hover:bg-[#1177bb] text-white text-sm rounded transition-colors"
                  >
                    Add Rule
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
