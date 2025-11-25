import React, { useState } from 'react';
import { NetworkRequest } from '../../types';
import { ObjectExplorer } from '../ObjectExplorer';
import { Copy, Check } from 'lucide-react';

export type DetailTab = 'summary' | 'headers' | 'body';
type BodyViewMode = 'pretty' | 'raw' | 'hex';

export interface TrafficDetailProps {
  selectedRequest: NetworkRequest;
  getMethodColor: (method: string) => string;
  getStatusColor: (status: number) => string;
  formatSize: (bytes: number) => string;
}

// 复制按钮组件
const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={handleCopy} className="p-0.5 text-[#858585] hover:text-[#cccccc] transition-colors">
      {copied ? <Check size={10} className="text-[#4ec9b0]" /> : <Copy size={10} />}
    </button>
  );
};

export const TrafficDetail: React.FC<TrafficDetailProps> = ({
  selectedRequest,
  getMethodColor,
  getStatusColor,
  formatSize
}) => {
  const [detailTab, setDetailTab] = useState<DetailTab>('summary');
  const [reqBodyViewMode, setReqBodyViewMode] = useState<BodyViewMode>('pretty');
  const [resBodyViewMode, setResBodyViewMode] = useState<BodyViewMode>('pretty');

  const reqHeadersCount = Object.keys(selectedRequest.requestHeaders || {}).length;
  const resHeadersCount = Object.keys(selectedRequest.responseHeaders || {}).length;

  return (
    <div className="w-[45%] flex flex-col min-w-0 bg-[#1e1e1e]">
      {/* TOP: Request Detail */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-[#3c3c3c]">
        {/* Tab Bar - Reqable 风格 */}
        <div className="h-8 bg-[#252526] flex items-center px-1 border-b border-[#3c3c3c]">
          {[
            { key: 'summary', label: 'Summary' },
            { key: 'headers', label: `Headers(${reqHeadersCount})` },
            { key: 'body', label: 'Body' }
          ].map(t => {
            const isActive = t.key === detailTab;
            return (
              <button
                key={t.key}
                onClick={() => setDetailTab(t.key as DetailTab)}
                className={`px-3 py-1.5 text-[11px] transition-colors ${
                  isActive 
                    ? 'text-[#cccccc] bg-[#1e1e1e] border-t-2 border-t-[#4ec9b0]' 
                    : 'text-[#858585] hover:text-[#cccccc]'
                }`}
              >
                {t.label}
              </button>
            )
          })}
          <div className="flex-1" />
          <div className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium ${getMethodColor(selectedRequest.method)}`}>
            {selectedRequest.method}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-3 font-mono text-[11px]">
          {/* Summary 面板 - Reqable 风格表格 */}
          {detailTab === 'summary' && (
            <div className="space-y-0">
              {[
                { label: 'URL', value: selectedRequest.url },
                { label: 'Status', value: selectedRequest.status ? `${selectedRequest.status} ${selectedRequest.statusText || ''}` : 'Pending', color: getStatusColor(selectedRequest.status || 0) },
                { label: 'Method', value: selectedRequest.method, color: getMethodColor(selectedRequest.method).replace('text-', '') },
                { label: 'Protocol', value: selectedRequest.protocol || 'HTTP/1.1' },
                { label: 'Code', value: selectedRequest.status || '-' },
                { label: 'Remote Address', value: selectedRequest.remoteAddress || '127.0.0.1:443' },
                { label: 'Size', value: formatSize(selectedRequest.size || 0) },
                { label: 'Time', value: `${selectedRequest.time || 0}ms` },
              ].map((row, idx) => (
                <div key={idx} className="flex items-center py-1.5 border-b border-[#3c3c3c]/50 group">
                  <div className="w-[120px] text-[#858585] shrink-0">{row.label}</div>
                  <div 
                    className="flex-1 text-[#cccccc] break-all select-text"
                    style={row.color ? { color: row.color } : undefined}
                  >
                    {row.value}
                  </div>
                  <CopyButton text={String(row.value)} />
                </div>
              ))}
            </div>
          )}

          {/* Headers 面板 */}
          {detailTab === 'headers' && (
            <div className="space-y-0">
              {Object.entries(selectedRequest.requestHeaders || {}).map(([k, v]) => (
                <div key={k} className="flex items-start py-1.5 border-b border-[#3c3c3c]/50 group">
                  <span className="text-[#4ec9b0] min-w-[140px] shrink-0 select-text">{k}</span>
                  <span className="text-[#cccccc] break-all flex-1 select-text">{v}</span>
                  <CopyButton text={`${k}: ${v}`} />
                </div>
              ))}
            </div>
          )}

          {/* Body 面板 */}
          {detailTab === 'body' && (
            <div className="flex flex-col h-full -m-3">
              {/* Body 工具栏 */}
              <div className="flex items-center gap-1 px-3 py-1.5 border-b border-[#3c3c3c] bg-[#252526]">
                {(['pretty', 'raw', 'hex'] as BodyViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setReqBodyViewMode(mode)}
                    className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                      reqBodyViewMode === mode 
                        ? 'bg-[#37373d] text-[#cccccc]' 
                        : 'text-[#858585] hover:text-[#cccccc]'
                    }`}
                  >
                    {mode === 'pretty' ? 'Pretty' : mode === 'raw' ? 'Raw' : 'Hex'}
                  </button>
                ))}
                <div className="flex-1" />
                <span className="text-[10px] text-[#858585]">
                  {selectedRequest.requestHeaders?.['content-type'] || 'text/plain'}
                </span>
              </div>

              <div className="flex-1 overflow-auto p-3 text-[#cccccc]">
                {(() => {
                  const contentType = selectedRequest.requestHeaders?.['content-type'] || '';
                  const isJson = contentType.includes('json');
                  const body = selectedRequest.requestBody || '';

                  if (reqBodyViewMode === 'hex') {
                    const hex = Array.from(new TextEncoder().encode(body))
                      .map(b => b.toString(16).padStart(2, '0'))
                      .join(' ');
                    return <div className="font-mono text-[11px] text-[#858585]">{hex || '<Empty>'}</div>;
                  }

                  if (reqBodyViewMode === 'raw') {
                    return <div className="font-mono text-[11px] whitespace-pre-wrap">{body || '<No Body>'}</div>;
                  }

                  if (isJson && body) {
                    try {
                      const json = JSON.parse(body);
                      return <ObjectExplorer data={json} theme="reqable" />;
                    } catch {
                      return <div className="text-[#f48771] text-xs">Invalid JSON</div>;
                    }
                  }

                  return <div className="font-mono text-[11px] whitespace-pre-wrap">{body || '<No Body>'}</div>;
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM: Response Detail */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Response Header Bar */}
        <div className="h-8 bg-[#252526] flex items-center px-3 border-b border-[#3c3c3c]">
          <div className="text-[11px] font-medium text-[#858585]">Response</div>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 bg-[#37373d] text-[#cccccc] text-[10px] rounded font-mono">
              {selectedRequest.protocol || 'h2'}
            </span>
            <span 
              className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
              style={{ 
                backgroundColor: `${getStatusColor(selectedRequest.status || 0)}20`,
                color: getStatusColor(selectedRequest.status || 0)
              }}
            >
              {selectedRequest.status || '-'}
            </span>
          </div>
        </div>

        {/* Response Tabs */}
        <div className="h-7 bg-[#252526] flex items-center px-1 border-b border-[#3c3c3c]">
          <button className="px-3 py-1 text-[11px] text-[#cccccc] bg-[#1e1e1e] border-t-2 border-t-[#4ec9b0]">
            Headers({resHeadersCount})
          </button>
          <button className="px-3 py-1 text-[11px] text-[#858585] hover:text-[#cccccc]">
            Body
          </button>
        </div>

        <div className="flex-1 overflow-auto p-3 font-mono text-[11px]">
          {/* Response Headers */}
          <div className="space-y-0">
            {Object.entries(selectedRequest.responseHeaders || {}).map(([k, v]) => (
              <div key={k} className="flex items-start py-1.5 border-b border-[#3c3c3c]/50 group">
                <span className="text-[#4ec9b0] min-w-[140px] shrink-0 select-text">{k}</span>
                <span className="text-[#cccccc] break-all flex-1 select-text">{v}</span>
                <CopyButton text={`${k}: ${v}`} />
              </div>
            ))}
          </div>

          {/* Response Body Section */}
          <div className="mt-4 pt-3 border-t border-[#3c3c3c]">
            <div className="flex items-center gap-1 mb-3">
              {(['pretty', 'raw', 'hex'] as BodyViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => setResBodyViewMode(mode)}
                  className={`text-[10px] px-2 py-0.5 rounded capitalize ${
                    resBodyViewMode === mode 
                      ? 'bg-[#37373d] text-[#cccccc]' 
                      : 'text-[#858585] hover:text-[#cccccc]'
                  }`}
                >
                  {mode === 'pretty' ? 'Pretty' : mode === 'raw' ? 'Raw' : 'Hex'}
                </button>
              ))}
              <div className="flex-1" />
              <span className="text-[10px] text-[#858585]">
                {selectedRequest.responseHeaders?.['content-type'] || 'text/plain'}
              </span>
            </div>

            <div className="text-[#cccccc]">
              {(() => {
                const contentType = selectedRequest.responseHeaders?.['content-type'] || '';
                const isJson = contentType.includes('json');
                const body = selectedRequest.responseBody || '';

                if (resBodyViewMode === 'hex') {
                  const hex = Array.from(new TextEncoder().encode(body))
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join(' ');
                  return <div className="font-mono text-[11px] text-[#858585]">{hex || '<Empty>'}</div>;
                }

                if (resBodyViewMode === 'raw') {
                  return <div className="font-mono text-[11px] whitespace-pre-wrap">{body || '<No Body>'}</div>;
                }

                if (isJson && body) {
                  try {
                    const json = JSON.parse(body);
                    return <ObjectExplorer data={json} theme="reqable" />;
                  } catch {
                    return <div className="text-[#f48771] text-xs">Invalid JSON</div>;
                  }
                }

                return <div className="font-mono text-[11px] whitespace-pre-wrap">{body || '<No Body>'}</div>;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
