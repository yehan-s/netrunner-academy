import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { GitCompare, X, ChevronDown, ChevronRight, ArrowLeftRight, Copy, Check } from 'lucide-react';
import { NetworkRequest } from '../../types';

interface DiffViewerProps {
  requests: NetworkRequest[];
  onClose: () => void;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged' | 'modified';
  left?: string;
  right?: string;
  field?: string;
}

// Compare two strings and return diff lines
const computeLineDiff = (left: string, right: string): DiffLine[] => {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const result: DiffLine[] = [];
  const maxLen = Math.max(leftLines.length, rightLines.length);

  for (let i = 0; i < maxLen; i++) {
    const l = leftLines[i];
    const r = rightLines[i];

    if (l === r) {
      result.push({ type: 'unchanged', left: l, right: r });
    } else if (l === undefined) {
      result.push({ type: 'added', right: r });
    } else if (r === undefined) {
      result.push({ type: 'removed', left: l });
    } else {
      result.push({ type: 'modified', left: l, right: r });
    }
  }

  return result;
};

// Format headers for display
const formatHeaders = (headers: Record<string, string>): string => {
  return Object.entries(headers)
    .map(([k, v]) => `${k}: ${v}`)
    .sort()
    .join('\n');
};

// Format body for display
const formatBody = (body?: string): string => {
  if (!body) return '(empty)';
  try {
    return JSON.stringify(JSON.parse(body), null, 2);
  } catch {
    return body;
  }
};

const DiffViewer: React.FC<DiffViewerProps> = ({ requests, onClose }) => {
  const [leftId, setLeftId] = useState<string>('');
  const [rightId, setRightId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'headers' | 'body'>('overview');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['general', 'requestHeaders', 'responseHeaders']));
  const [copied, setCopied] = useState(false);

  const leftRequest = useMemo(() => requests.find(r => r.id === leftId), [requests, leftId]);
  const rightRequest = useMemo(() => requests.find(r => r.id === rightId), [requests, rightId]);

  const toggleSection = (section: string) => {
    const next = new Set(expandedSections);
    if (next.has(section)) {
      next.delete(section);
    } else {
      next.add(section);
    }
    setExpandedSections(next);
  };

  const handleSwap = () => {
    const temp = leftId;
    setLeftId(rightId);
    setRightId(temp);
  };

  const handleCopyDiff = () => {
    if (!leftRequest || !rightRequest) return;

    const diff = `=== Diff Report ===
Left: ${leftRequest.method} ${leftRequest.url}
Right: ${rightRequest.method} ${rightRequest.url}

--- General ---
Method: ${leftRequest.method} | ${rightRequest.method}
Status: ${leftRequest.status} | ${rightRequest.status}
Size: ${leftRequest.size} | ${rightRequest.size}
Time: ${leftRequest.time}ms | ${rightRequest.time}ms

--- Request Headers ---
Left:
${formatHeaders(leftRequest.requestHeaders)}

Right:
${formatHeaders(rightRequest.requestHeaders)}

--- Response Body ---
Left:
${formatBody(leftRequest.responseBody)}

Right:
${formatBody(rightRequest.responseBody)}
`;

    navigator.clipboard.writeText(diff);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Compute differences
  const differences = useMemo(() => {
    if (!leftRequest || !rightRequest) return null;

    return {
      general: [
        { field: 'URL', left: leftRequest.url, right: rightRequest.url },
        { field: 'Method', left: leftRequest.method, right: rightRequest.method },
        { field: 'Status', left: `${leftRequest.status} ${leftRequest.statusText || ''}`, right: `${rightRequest.status} ${rightRequest.statusText || ''}` },
        { field: 'Size', left: `${leftRequest.size} bytes`, right: `${rightRequest.size} bytes` },
        { field: 'Time', left: `${leftRequest.time} ms`, right: `${rightRequest.time} ms` },
        { field: 'Protocol', left: leftRequest.protocol || '-', right: rightRequest.protocol || '-' },
      ],
      requestHeaders: computeLineDiff(
        formatHeaders(leftRequest.requestHeaders),
        formatHeaders(rightRequest.requestHeaders)
      ),
      responseHeaders: computeLineDiff(
        formatHeaders(leftRequest.responseHeaders),
        formatHeaders(rightRequest.responseHeaders)
      ),
      requestBody: computeLineDiff(
        formatBody(leftRequest.requestBody),
        formatBody(rightRequest.requestBody)
      ),
      responseBody: computeLineDiff(
        formatBody(leftRequest.responseBody),
        formatBody(rightRequest.responseBody)
      ),
    };
  }, [leftRequest, rightRequest]);

  const renderDiffLines = (lines: DiffLine[]) => (
    <div className="font-mono text-xs">
      {lines.map((line, i) => (
        <div
          key={i}
          className={`flex ${
            line.type === 'added' ? 'bg-green-900/30' :
            line.type === 'removed' ? 'bg-red-900/30' :
            line.type === 'modified' ? 'bg-yellow-900/20' :
            ''
          }`}
        >
          <div className="w-1/2 px-2 py-0.5 border-r border-gray-700 whitespace-pre-wrap break-all">
            {line.type === 'removed' && <span className="text-red-400">- </span>}
            {line.type === 'modified' && <span className="text-yellow-400">~ </span>}
            {line.left !== undefined && <span className={line.type === 'removed' ? 'text-red-300' : line.type === 'modified' ? 'text-yellow-300' : 'text-gray-300'}>{line.left}</span>}
          </div>
          <div className="w-1/2 px-2 py-0.5 whitespace-pre-wrap break-all">
            {line.type === 'added' && <span className="text-green-400">+ </span>}
            {line.type === 'modified' && <span className="text-yellow-400">~ </span>}
            {line.right !== undefined && <span className={line.type === 'added' ? 'text-green-300' : line.type === 'modified' ? 'text-yellow-300' : 'text-gray-300'}>{line.right}</span>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderSection = (title: string, sectionKey: string, content: React.ReactNode) => {
    const isExpanded = expandedSections.has(sectionKey);
    return (
      <div className="border border-gray-700 rounded overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center gap-2 px-3 py-2 bg-[#252526] hover:bg-[#1a2744] transition text-left"
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="text-sm font-medium text-gray-300">{title}</span>
        </button>
        {isExpanded && (
          <div className="bg-[#2d2d30] max-h-[300px] overflow-y-auto">
            {content}
          </div>
        )}
      </div>
    );
  };

  const content = (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
      <div className="bg-[#1e1e1e] border border-[#3c3c3c] rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3c3c3c]">
          <div className="flex items-center gap-3">
            <GitCompare className="text-[#4ec9b0]" size={24} />
            <div>
              <h2 className="text-xl font-bold text-[#4ec9b0]">请求对比</h2>
              <p className="text-xs text-gray-400">对比两个请求的差异</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {leftRequest && rightRequest && (
              <button
                onClick={handleCopyDiff}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded transition"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? '已复制' : '复制报告'}
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Selection Row */}
        <div className="p-4 bg-[#252526] border-b border-[#3c3c3c] flex items-center gap-4">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">左侧请求</label>
            <select
              value={leftId}
              onChange={e => setLeftId(e.target.value)}
              className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
            >
              <option value="">选择请求...</option>
              {requests.map(r => (
                <option key={r.id} value={r.id}>
                  {r.method} {r.url.substring(0, 60)}{r.url.length > 60 ? '...' : ''} ({r.status})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwap}
            disabled={!leftId || !rightId}
            className="mt-5 p-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded transition"
            title="交换左右"
          >
            <ArrowLeftRight size={16} />
          </button>

          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-1">右侧请求</label>
            <select
              value={rightId}
              onChange={e => setRightId(e.target.value)}
              className="w-full bg-[#2d2d30] border border-gray-600 rounded px-3 py-2 text-white text-sm focus:border-[#4ec9b0] focus:outline-none"
            >
              <option value="">选择请求...</option>
              {requests.map(r => (
                <option key={r.id} value={r.id}>
                  {r.method} {r.url.substring(0, 60)}{r.url.length > 60 ? '...' : ''} ({r.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!leftId || !rightId ? (
            <div className="text-center py-12 text-gray-400">
              <GitCompare size={48} className="mx-auto mb-4 opacity-50" />
              <p>请选择两个请求进行对比</p>
              <p className="text-sm mt-2 text-gray-500">
                提示：可以对比不同参数、不同时间的同一接口请求
              </p>
            </div>
          ) : differences ? (
            <div className="space-y-3">
              {/* General Info */}
              {renderSection('基本信息', 'general', (
                <table className="w-full text-sm">
                  <tbody>
                    {differences.general.map((item, i) => (
                      <tr key={i} className={item.left !== item.right ? 'bg-yellow-900/20' : ''}>
                        <td className="px-3 py-1.5 text-gray-400 w-24">{item.field}</td>
                        <td className="px-3 py-1.5 text-gray-300 border-r border-gray-700 w-1/2 font-mono text-xs break-all">
                          {item.left}
                        </td>
                        <td className="px-3 py-1.5 text-gray-300 w-1/2 font-mono text-xs break-all">
                          {item.right}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}

              {/* Request Headers */}
              {renderSection('请求头', 'requestHeaders', renderDiffLines(differences.requestHeaders))}

              {/* Response Headers */}
              {renderSection('响应头', 'responseHeaders', renderDiffLines(differences.responseHeaders))}

              {/* Request Body */}
              {renderSection('请求体', 'requestBody', renderDiffLines(differences.requestBody))}

              {/* Response Body */}
              {renderSection('响应体', 'responseBody', renderDiffLines(differences.responseBody))}
            </div>
          ) : null}
        </div>

        {/* Legend */}
        {differences && (
          <div className="px-4 py-2 border-t border-[#3c3c3c] flex items-center gap-6 text-xs">
            <span className="text-gray-400">图例:</span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-green-900/50 rounded" /> 新增
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-red-900/50 rounded" /> 删除
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 bg-yellow-900/50 rounded" /> 修改
            </span>
          </div>
        )}

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

export default DiffViewer;
