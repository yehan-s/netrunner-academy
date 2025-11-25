import React, { useState } from 'react';
import { Send, Lock } from 'lucide-react';
import { NetworkRequest } from '../../types';
import { KeyValEditor, KeyValItem } from './KeyValEditor';

export type ComposerTab = 'params' | 'headers' | 'body' | 'auth';

export interface ComposerProps {
  onSend: (req: NetworkRequest) => void;
  onSwitchToTraffic: () => void;
  getMethodColor: (method: string) => string;
  initialMethod?: string;
  initialUrl?: string;
  initialBody?: string;
  initialHeaders?: KeyValItem[];
}

export const Composer: React.FC<ComposerProps> = ({
  onSend,
  onSwitchToTraffic,
  getMethodColor,
  initialMethod = 'GET',
  initialUrl = 'https://',
  initialBody = '',
  initialHeaders
}) => {
  const [composerMethod, setComposerMethod] = useState(initialMethod);
  const [composerUrl, setComposerUrl] = useState(initialUrl);
  const [composerBody, setComposerBody] = useState(initialBody);
  const [composerTab, setComposerTab] = useState<ComposerTab>('body');
  const [composerHeaders, setComposerHeaders] = useState<KeyValItem[]>(
    initialHeaders || [
      { key: 'User-Agent', value: 'Reqable/2.16.0', enabled: true },
      { key: '', value: '', enabled: true }
    ]
  );
  const [composerParams, setComposerParams] = useState<KeyValItem[]>([
    { key: '', value: '', enabled: true }
  ]);

  const handleSend = () => {
    const headers = composerHeaders.reduce((acc, item) => {
      if (item.enabled && item.key) acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    // Append params to URL
    const urlObj = new URL(composerUrl);
    composerParams.forEach(p => {
      if (p.enabled && p.key) urlObj.searchParams.append(p.key, p.value);
    });

    const req = {
      id: 'comp-' + Date.now(),
      url: urlObj.toString(),
      method: composerMethod,
      status: 0,
      type: 'fetch',
      size: 0,
      time: 0,
      timestamp: Date.now(),
      requestHeaders: headers,
      responseHeaders: {},
      requestBody: composerBody
    } as NetworkRequest;

    onSend(req);
    onSwitchToTraffic(); // Switch back to traffic to see result
  };

  return (
    <div className="flex-1 flex flex-col bg-[#1e1e1e] min-h-0">
      {/* URL Bar */}
      <div className="h-12 bg-[#252526] border-b border-[#333] flex items-center px-4 gap-3 shrink-0">
        <select
          data-testid="reqable-composer-method"
          value={composerMethod}
          onChange={(e) => setComposerMethod(e.target.value)}
          className={`h-8 bg-[#1e1e1e] border border-[#333] font-bold text-xs rounded px-2 outline-none ${getMethodColor(composerMethod)}`}
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
        <input
          data-testid="reqable-composer-url"
          value={composerUrl}
          onChange={(e) => setComposerUrl(e.target.value)}
          className="flex-1 h-8 bg-[#1e1e1e] border border-[#333] text-gray-300 text-xs px-3 rounded outline-none font-mono"
          placeholder="https://example.com/api"
        />
        <button
          data-testid="reqable-composer-send"
          onClick={handleSend}
          className="h-8 px-6 bg-[#4ec9b0] text-black text-xs font-bold rounded hover:bg-[#3db89f] flex items-center gap-2"
        >
          <Send size={14} /> Send
        </button>
      </div>

      {/* Composer Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="h-9 bg-[#1e1e1e] border-b border-[#333] flex items-center px-4 gap-4">
          {['Params', 'Headers', 'Body', 'Auth'].map(t => (
            <button
              key={t}
              onClick={() => setComposerTab(t.toLowerCase() as ComposerTab)}
              className={`h-full text-xs border-b-2 px-1 ${composerTab === t.toLowerCase() ? 'text-[#4ec9b0] border-[#4ec9b0] font-bold' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex-1 bg-[#1e1e1e] overflow-auto p-0">
          {composerTab === 'params' && (
            <KeyValEditor items={composerParams} onChange={setComposerParams} />
          )}
          {composerTab === 'headers' && (
            <KeyValEditor items={composerHeaders} onChange={setComposerHeaders} />
          )}
          {composerTab === 'body' && (
            <div className="flex flex-col h-full">
              <div className="h-8 bg-[#252526] flex items-center px-2 gap-2 border-b border-[#333]">
                <div className="flex items-center gap-2">
                  <input type="radio" name="bodyType" id="none" className="accent-[#4ec9b0]" /> <label htmlFor="none" className="text-xs text-gray-400">none</label>
                  <input type="radio" name="bodyType" id="json" defaultChecked className="accent-[#4ec9b0]" /> <label htmlFor="json" className="text-xs text-gray-400">json</label>
                  <input type="radio" name="bodyType" id="form" className="accent-[#4ec9b0]" /> <label htmlFor="form" className="text-xs text-gray-400">form-data</label>
                </div>
              </div>
              <textarea
                data-testid="reqable-composer-body"
                value={composerBody}
                onChange={(e) => setComposerBody(e.target.value)}
                className="flex-1 bg-[#1e1e1e] text-gray-300 font-mono text-xs p-4 resize-none outline-none"
                placeholder="{}"
              />
            </div>
          )}
          {composerTab === 'auth' && (
            <div className="p-8 text-center text-gray-500 text-xs">
              <Lock size={32} className="mx-auto mb-2 opacity-20" />
              No Authorization
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
