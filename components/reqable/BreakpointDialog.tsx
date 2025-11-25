import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Play, StopCircle, ArrowRight, AlertTriangle } from 'lucide-react';
import { NetworkRequest } from '../../types';
import { KeyValEditor, KeyValItem } from './KeyValEditor';

export interface BreakpointDialogProps {
  request: NetworkRequest;
  onContinue: (modifiedRequest: Partial<NetworkRequest>) => void;
  onContinueWithoutChanges: () => void;
  onBlock: () => void;
}

type Tab = 'request' | 'response';

export const BreakpointDialog: React.FC<BreakpointDialogProps> = ({
  request,
  onContinue,
  onContinueWithoutChanges,
  onBlock
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('request');

  // Request 编辑状态
  const [editedUrl, setEditedUrl] = useState(request.url);
  const [editedMethod, setEditedMethod] = useState(request.method);
  const [editedHeaders, setEditedHeaders] = useState<KeyValItem[]>(
    Object.entries(request.requestHeaders || {}).map(([key, value]) => ({
      key,
      value,
      enabled: true
    })).concat([{ key: '', value: '', enabled: true }])
  );
  const [editedBody, setEditedBody] = useState(request.requestBody || '');

  // 检测是否有修改
  const hasChanges = () => {
    if (editedUrl !== request.url) return true;
    if (editedMethod !== request.method) return true;
    if (editedBody !== (request.requestBody || '')) return true;

    const originalHeaders = Object.entries(request.requestHeaders || {}).sort();
    const currentHeaders = editedHeaders
      .filter(h => h.enabled && h.key)
      .map(h => [h.key, h.value])
      .sort();

    if (JSON.stringify(originalHeaders) !== JSON.stringify(currentHeaders)) return true;

    return false;
  };

  const handleContinue = () => {
    const modifiedHeaders = editedHeaders.reduce((acc, item) => {
      if (item.enabled && item.key) {
        acc[item.key] = item.value;
      }
      return acc;
    }, {} as Record<string, string>);

    onContinue({
      url: editedUrl,
      method: editedMethod,
      requestHeaders: modifiedHeaders,
      requestBody: editedBody
    });
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-4">
      <div className="bg-[#1e1e1e] border border-[#4ec9b0] rounded-lg w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#333] bg-[#252526]">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-[#4ec9b0]" />
            <div>
              <h3 className="text-lg font-bold text-white">断点拦截</h3>
              <p className="text-xs text-gray-400">
                请求已被暂停，您可以修改后继续或阻止此请求
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges() && (
              <span className="text-xs text-[#4ec9b0] bg-[#4ec9b0]/10 px-2 py-1 rounded border border-[#4ec9b0]/30">
                已修改
              </span>
            )}
          </div>
        </div>

        {/* Request Info Bar */}
        <div className="flex items-center gap-3 px-6 py-3 bg-[#252526] border-b border-[#333]">
          <span className={`text-xs font-bold px-2 py-1 rounded ${
            editedMethod === 'GET' ? 'text-[#4ec9b0] bg-[#4ec9b0]/10' :
            editedMethod === 'POST' ? 'text-[#ce9178] bg-[#ce9178]/10' :
            editedMethod === 'PUT' ? 'text-[#dcdcaa] bg-[#dcdcaa]/10' :
            editedMethod === 'DELETE' ? 'text-[#f48771] bg-[#f48771]/10' :
            'text-gray-400 bg-gray-400/10'
          }`}>
            {editedMethod}
          </span>
          <span className="text-xs text-gray-300 font-mono flex-1 truncate">{editedUrl}</span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 px-6 py-2 bg-[#1e1e1e] border-b border-[#333]">
          <button
            onClick={() => setActiveTab('request')}
            className={`text-sm px-3 py-1.5 rounded transition-colors ${
              activeTab === 'request'
                ? 'text-[#4ec9b0] bg-[#4ec9b0]/10 font-bold'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Request
          </button>
          <button
            onClick={() => setActiveTab('response')}
            className={`text-sm px-3 py-1.5 rounded transition-colors ${
              activeTab === 'response'
                ? 'text-[#4ec9b0] bg-[#4ec9b0]/10 font-bold'
                : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            Response
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 min-h-0">
          {activeTab === 'request' && (
            <div className="space-y-6">
              {/* URL 编辑 */}
              <div>
                <label className="text-sm font-bold text-gray-300 mb-2 block">Request URL</label>
                <div className="flex gap-2">
                  <select
                    value={editedMethod}
                    onChange={(e) => setEditedMethod(e.target.value)}
                    className="h-10 bg-[#252526] border border-[#333] text-gray-300 text-sm rounded px-3 outline-none focus:border-[#4ec9b0] font-bold"
                  >
                    <option>GET</option>
                    <option>POST</option>
                    <option>PUT</option>
                    <option>DELETE</option>
                    <option>PATCH</option>
                    <option>HEAD</option>
                    <option>OPTIONS</option>
                  </select>
                  <input
                    value={editedUrl}
                    onChange={(e) => setEditedUrl(e.target.value)}
                    className="flex-1 h-10 bg-[#252526] border border-[#333] text-gray-300 text-sm px-3 rounded outline-none focus:border-[#4ec9b0] font-mono"
                    placeholder="https://api.example.com/endpoint"
                  />
                </div>
              </div>

              {/* Headers 编辑 */}
              <div>
                <label className="text-sm font-bold text-gray-300 mb-2 block">Request Headers</label>
                <div className="border border-[#333] rounded overflow-hidden">
                  <KeyValEditor items={editedHeaders} onChange={setEditedHeaders} />
                </div>
              </div>

              {/* Body 编辑 */}
              <div>
                <label className="text-sm font-bold text-gray-300 mb-2 block">Request Body</label>
                <textarea
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full h-64 bg-[#252526] border border-[#333] text-gray-300 text-sm p-3 rounded outline-none focus:border-[#4ec9b0] font-mono resize-none"
                  placeholder="Request body (JSON, XML, form-data, etc.)"
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      try {
                        const formatted = JSON.stringify(JSON.parse(editedBody), null, 2);
                        setEditedBody(formatted);
                      } catch (e) {
                        // 不是 JSON，忽略
                      }
                    }}
                    className="text-xs text-gray-400 hover:text-[#4ec9b0] transition-colors"
                  >
                    美化 JSON
                  </button>
                  <span className="text-xs text-gray-500">|</span>
                  <span className="text-xs text-gray-500">
                    {editedBody.length} 字符
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'response' && (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center">
                <StopCircle size={48} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">请求尚未发送</p>
                <p className="text-xs text-gray-600 mt-1">继续请求后，响应将在此显示</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#333] bg-[#252526]">
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">断点类型: Request</span>
            <span className="text-xs text-gray-600">•</span>
            <span className="text-xs text-gray-500">ID: {request.id}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBlock}
              className="h-9 px-4 bg-[#f48771]/10 text-[#f48771] border border-[#f48771]/30 text-sm font-bold rounded hover:bg-[#f48771]/20 transition-colors flex items-center gap-2"
            >
              <StopCircle size={16} />
              Block
            </button>

            <button
              onClick={onContinueWithoutChanges}
              className="h-9 px-4 bg-[#333] text-gray-300 text-sm font-bold rounded hover:bg-[#444] transition-colors flex items-center gap-2"
            >
              <Play size={16} />
              Continue (no changes)
            </button>

            <button
              onClick={handleContinue}
              disabled={!hasChanges()}
              className={`h-9 px-4 text-sm font-bold rounded transition-colors flex items-center gap-2 ${
                hasChanges()
                  ? 'bg-[#4ec9b0] text-black hover:bg-[#3db89f]'
                  : 'bg-[#333] text-gray-600 cursor-not-allowed'
              }`}
            >
              <ArrowRight size={16} />
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
