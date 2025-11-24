import React, { useState } from 'react';
import { NetworkRequest } from '../../types';
import { ObjectExplorer } from '../ObjectExplorer';

export type DetailTab = 'overview' | 'primitive' | 'params' | 'headers' | 'cookies' | 'body';

export interface TrafficDetailProps {
  selectedRequest: NetworkRequest;
  getMethodColor: (method: string) => string;
  getStatusColor: (status: number) => string;
  formatSize: (bytes: number) => string;
}

export const TrafficDetail: React.FC<TrafficDetailProps> = ({
  selectedRequest,
  getMethodColor,
  getStatusColor,
  formatSize
}) => {
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');
  const [reqBodyViewMode, setReqBodyViewMode] = useState<'pretty' | 'raw' | 'preview'>('pretty');
  const [resBodyViewMode, setResBodyViewMode] = useState<'pretty' | 'raw' | 'preview'>('pretty');

  return (
    <div className="w-[45%] flex flex-col min-w-0 bg-[#1e1e1e]">
      {/* TOP: Request Detail */}
      <div className="flex-1 flex flex-col min-h-0 border-b border-[#333]">
        <div className="h-8 bg-[#252526] flex items-center px-2 border-b border-[#111]">
          {['Overview', 'Primitive', 'Params', 'Headers', 'Cookies', 'Body'].map(t => {
            const isActive = t.toLowerCase() === detailTab;
            return (
              <button
                key={t}
                onClick={() => setDetailTab(t.toLowerCase() as DetailTab)}
                className={`px-3 py-1 text-[11px] rounded-[2px] ${isActive ? 'text-[#fcd34d] font-bold bg-[#333]' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {t}
              </button>
            )
          })}
          <div className="flex-1" />
          <div className={`text-[10px] px-1.5 py-0.5 bg-[#333] rounded font-mono ${getMethodColor(selectedRequest.method)}`}>{selectedRequest.method}</div>
        </div>

        <div className="flex-1 overflow-auto p-3 font-mono text-[11px]">
          {detailTab === 'overview' && (
            <div className="grid grid-cols-[100px_1fr] gap-y-1.5 text-[#cccccc]">
              <div className="text-gray-500">URL</div>
              <div className="break-all select-text">{selectedRequest.url}</div>
              <div className="text-gray-500">Method</div>
              <div>{selectedRequest.method}</div>
              <div className="text-gray-500">Status</div>
              <div style={{ color: getStatusColor(selectedRequest.status || 0) }}>{selectedRequest.status}</div>
              <div className="text-gray-500">Protocol</div>
              <div>{selectedRequest.protocol || 'HTTP/1.1'}</div>
              <div className="text-gray-500">Remote Address</div>
              <div>{selectedRequest.remoteAddress || '127.0.0.1:443'}</div>
              <div className="text-gray-500">Time</div>
              <div>{selectedRequest.time}ms</div>
            </div>
          )}
          {detailTab === 'headers' && (
            <div>
              {Object.entries(selectedRequest.requestHeaders || {}).map(([k, v]) => (
                <div key={k} className="flex mb-1 border-b border-[#333]/50 pb-0.5">
                  <span className="text-[#9cdcfe] min-w-[100px] font-medium select-text">{k}</span>
                  <span className="text-[#ce9178] break-all flex-1 select-text">{v}</span>
                </div>
              ))}
            </div>
          )}
          {detailTab === 'cookies' && (
            <div>
              {selectedRequest.cookies && Object.keys(selectedRequest.cookies).length > 0 ? (
                Object.entries(selectedRequest.cookies).map(([k, v]) => (
                  <div key={k} className="flex mb-1 border-b border-[#333]/50 pb-0.5">
                    <span className="text-[#dcdcaa] min-w-[100px] font-medium select-text">{k}</span>
                    <span className="text-[#ce9178] break-all flex-1 select-text">{v}</span>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">No cookies in request</div>
              )}
            </div>
          )}
          {detailTab === 'body' && (
            <div className="flex flex-col h-full">
              {/* Request Body Sub-Toolbar */}
              <div className="flex items-center gap-2 px-2 py-1 border-b border-[#333] mb-2">
                {['Pretty', 'Raw', 'Preview'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => setReqBodyViewMode(mode.toLowerCase() as any)}
                    className={`text-[10px] px-2 py-0.5 rounded ${reqBodyViewMode === mode.toLowerCase() ? 'bg-[#333] text-[#fcd34d]' : 'text-gray-500 hover:text-gray-300'}`}
                  >
                    {mode}
                  </button>
                ))}
                <div className="w-px h-3 bg-[#333] mx-1" />
                <span className="text-[10px] text-gray-500">{selectedRequest.requestHeaders?.['content-type'] || 'text/plain'}</span>
              </div>

              <div className="flex-1 overflow-auto text-[#d4d4d4] whitespace-pre-wrap break-all select-text p-1">
                {(() => {
                  const contentType = selectedRequest.requestHeaders?.['content-type'] || '';
                  const isJson = contentType.includes('json');

                  if (reqBodyViewMode === 'raw') {
                    return <div className="font-mono text-[11px]">{selectedRequest.requestBody}</div>;
                  }

                  if (isJson && reqBodyViewMode === 'pretty') {
                    try {
                      const json = JSON.parse(selectedRequest.requestBody || '{}');
                      return <ObjectExplorer data={json} theme="reqable" />;
                    } catch (e) {
                      return <div className="text-red-400 text-xs">Invalid JSON</div>;
                    }
                  }

                  return <div className="font-mono text-[11px]">{selectedRequest.requestBody || '<No Body>'}</div>;
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM: Response Detail */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="h-8 bg-[#252526] flex items-center px-2 border-b border-[#111] gap-2">
          <div className="text-[11px] font-bold text-gray-400 px-2">Response</div>
          <div className="flex-1" />
          <div className="flex gap-1">
            <span className="px-1 bg-[#333] text-[#4ec9b0] text-[10px] rounded">h2</span>
            <span className="px-1 bg-[#333] text-[#4ec9b0] text-[10px] rounded">{selectedRequest.status}</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2 font-mono text-[11px]">
          {/* Simplified Response View for now - just Body and Headers */}
          <div className="mb-2 text-[#fcd34d] font-bold">Headers</div>
          {Object.entries(selectedRequest.responseHeaders).map(([k, v]) => (
            <div key={k} className="flex mb-1 border-b border-[#333]/50 pb-0.5">
              <span className="text-[#9cdcfe] min-w-[100px] font-medium select-text">{k}</span>
              <span className="text-[#ce9178] break-all flex-1 select-text">{v}</span>
            </div>
          ))}
          <div className="mt-4 mb-2 text-[#fcd34d] font-bold">Body</div>
          <div className="flex flex-col h-full min-h-[200px]">
            {/* Response Body Sub-Toolbar */}
            <div className="flex items-center gap-2 px-2 py-1 border-b border-[#333] mb-2">
              {['Pretty', 'Raw', 'Preview'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setResBodyViewMode(mode.toLowerCase() as any)}
                  className={`text-[10px] px-2 py-0.5 rounded ${resBodyViewMode === mode.toLowerCase() ? 'bg-[#333] text-[#fcd34d]' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {mode}
                </button>
              ))}
              <div className="w-px h-3 bg-[#333] mx-1" />
              <span className="text-[10px] text-gray-500">{selectedRequest.responseHeaders['content-type'] || 'text/plain'}</span>
            </div>

            <div className="flex-1 overflow-auto text-[#d4d4d4] whitespace-pre-wrap break-all select-text p-1">
              {(() => {
                const contentType = selectedRequest.responseHeaders['content-type'] || '';
                const isJson = contentType.includes('json');
                const isImage = contentType.includes('image');

                if (resBodyViewMode === 'raw') {
                  return <div className="font-mono text-[11px]">{selectedRequest.responseBody}</div>;
                }

                if (isImage && (resBodyViewMode === 'pretty' || resBodyViewMode === 'preview')) {
                  return (
                    <div className="flex flex-col items-center justify-center p-4">
                      <div className="border border-[#333] bg-[url('https://reqable.com/assets/transparent-grid.png')] p-2">
                        <img src={selectedRequest.url} alt="Preview" className="max-w-full max-h-[200px] object-contain" />
                      </div>
                      <div className="mt-2 text-xs text-gray-500">{formatSize(selectedRequest.size)}</div>
                    </div>
                  );
                }

                if (isJson && resBodyViewMode === 'pretty') {
                  try {
                    const json = JSON.parse(selectedRequest.responseBody || '{}');
                    return <ObjectExplorer data={json} theme="reqable" />;
                  } catch (e) {
                    return <div className="text-red-400 text-xs">Invalid JSON</div>;
                  }
                }

                return <div className="font-mono text-[11px]">{selectedRequest.responseBody}</div>;
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
