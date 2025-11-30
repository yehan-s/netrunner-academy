import React, { useState, useEffect } from 'react';
import { Send, Lock, Key, User, Cookie, Clock, ChevronDown, X, Plus, Trash2, Save } from 'lucide-react';
import { NetworkRequest } from '../../types';
import { KeyValEditor, KeyValItem } from './KeyValEditor';

export type ComposerTab = 'params' | 'headers' | 'body' | 'auth' | 'cookies';
type AuthType = 'none' | 'basic' | 'bearer' | 'apikey';
type ApiKeyLocation = 'header' | 'query';

interface AuthConfig {
  type: AuthType;
  basic: { username: string; password: string };
  bearer: { token: string };
  apikey: { key: string; value: string; addTo: ApiKeyLocation };
}

interface CookieItem {
  id: string;
  name: string;
  value: string;
  enabled: boolean;
}

// 请求指标类型
interface RequestMetrics {
  dnsLookup: number;
  tcpConnection: number;
  tlsHandshake: number;
  requestSent: number;
  waiting: number;
  contentDownload: number;
  total: number;
}

export interface ComposerProps {
  onSend: (req: NetworkRequest) => void;
  onSwitchToTraffic: () => void;
  onSaveToCollection?: (req: NetworkRequest) => void;
  getMethodColor: (method: string) => string;
  initialMethod?: string;
  initialUrl?: string;
  initialBody?: string;
  initialHeaders?: KeyValItem[];
}

export const Composer: React.FC<ComposerProps> = ({
  onSend,
  onSwitchToTraffic,
  onSaveToCollection,
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
  const [protocol, setProtocol] = useState<'HTTP/1.1' | 'HTTP/2'>('HTTP/1.1');
  
  const [composerHeaders, setComposerHeaders] = useState<KeyValItem[]>(
    initialHeaders || [
      { key: 'User-Agent', value: 'Reqable/2.16.0', enabled: true },
      { key: '', value: '', enabled: true }
    ]
  );
  const [composerParams, setComposerParams] = useState<KeyValItem[]>([
    { key: '', value: '', enabled: true }
  ]);
  
  // Authorization state
  const [auth, setAuth] = useState<AuthConfig>({
    type: 'none',
    basic: { username: '', password: '' },
    bearer: { token: '' },
    apikey: { key: 'X-API-Key', value: '', addTo: 'header' }
  });
  
  // Cookies state
  const [cookies, setCookies] = useState<CookieItem[]>([]);
  
  // Response metrics (模拟数据，实际发送后填充)
  const [metrics, setMetrics] = useState<RequestMetrics | null>(null);
  const [lastResponse, setLastResponse] = useState<NetworkRequest | null>(null);

  // 生成 Authorization header
  const generateAuthHeader = (): { key: string; value: string } | null => {
    switch (auth.type) {
      case 'basic':
        if (auth.basic.username || auth.basic.password) {
          const encoded = btoa(`${auth.basic.username}:${auth.basic.password}`);
          return { key: 'Authorization', value: `Basic ${encoded}` };
        }
        break;
      case 'bearer':
        if (auth.bearer.token) {
          return { key: 'Authorization', value: `Bearer ${auth.bearer.token}` };
        }
        break;
      case 'apikey':
        if (auth.apikey.key && auth.apikey.value && auth.apikey.addTo === 'header') {
          return { key: auth.apikey.key, value: auth.apikey.value };
        }
        break;
    }
    return null;
  };

  const handleSend = () => {
    const headers = composerHeaders.reduce((acc, item) => {
      if (item.enabled && item.key) acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);

    // Add auth header
    const authHeader = generateAuthHeader();
    if (authHeader) {
      headers[authHeader.key] = authHeader.value;
    }
    
    // Add cookies
    if (cookies.length > 0) {
      const cookieStr = cookies
        .filter(c => c.enabled && c.name)
        .map(c => `${c.name}=${c.value}`)
        .join('; ');
      if (cookieStr) {
        headers['Cookie'] = cookieStr;
      }
    }

    // Build URL with params
    const urlObj = new URL(composerUrl);
    composerParams.forEach(p => {
      if (p.enabled && p.key) urlObj.searchParams.append(p.key, p.value);
    });
    
    // Add API Key to query if configured
    if (auth.type === 'apikey' && auth.apikey.addTo === 'query' && auth.apikey.key && auth.apikey.value) {
      urlObj.searchParams.append(auth.apikey.key, auth.apikey.value);
    }

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
      requestBody: composerBody,
      protocol: protocol === 'HTTP/2' ? 'h2' : 'HTTP/1.1'
    } as NetworkRequest;

    // 模拟请求指标
    const simulatedMetrics: RequestMetrics = {
      dnsLookup: Math.floor(Math.random() * 50) + 5,
      tcpConnection: Math.floor(Math.random() * 30) + 10,
      tlsHandshake: Math.floor(Math.random() * 100) + 50,
      requestSent: Math.floor(Math.random() * 10) + 1,
      waiting: Math.floor(Math.random() * 200) + 50,
      contentDownload: Math.floor(Math.random() * 50) + 10,
      total: 0
    };
    simulatedMetrics.total = Object.values(simulatedMetrics).reduce((a, b) => a + b, 0);
    setMetrics(simulatedMetrics);
    setLastResponse(req);

    onSend(req);
    onSwitchToTraffic();
  };
  
  // 构建当前请求对象（用于保存）
  const buildCurrentRequest = (): NetworkRequest => {
    const headers = composerHeaders.reduce((acc, item) => {
      if (item.enabled && item.key) acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>);
    
    const authHeader = generateAuthHeader();
    if (authHeader) headers[authHeader.key] = authHeader.value;
    
    if (cookies.length > 0) {
      const cookieStr = cookies.filter(c => c.enabled && c.name).map(c => `${c.name}=${c.value}`).join('; ');
      if (cookieStr) headers['Cookie'] = cookieStr;
    }
    
    let finalUrl = composerUrl;
    try {
      const urlObj = new URL(composerUrl);
      composerParams.forEach(p => { if (p.enabled && p.key) urlObj.searchParams.append(p.key, p.value); });
      if (auth.type === 'apikey' && auth.apikey.addTo === 'query' && auth.apikey.key && auth.apikey.value) {
        urlObj.searchParams.append(auth.apikey.key, auth.apikey.value);
      }
      finalUrl = urlObj.toString();
    } catch {}
    
    return {
      id: 'save-' + Date.now(),
      url: finalUrl,
      method: composerMethod,
      status: 0,
      type: 'fetch',
      size: 0,
      time: 0,
      timestamp: Date.now(),
      requestHeaders: headers,
      responseHeaders: {},
      requestBody: composerBody,
      protocol: protocol === 'HTTP/2' ? 'h2' : 'HTTP/1.1'
    } as NetworkRequest;
  };
  
  // 保存到集合
  const handleSave = () => {
    if (onSaveToCollection) {
      onSaveToCollection(buildCurrentRequest());
    }
  };
  
  // 添加 Cookie
  const addCookie = () => {
    setCookies(prev => [...prev, { id: `cookie-${Date.now()}`, name: '', value: '', enabled: true }]);
  };
  
  // 删除 Cookie
  const removeCookie = (id: string) => {
    setCookies(prev => prev.filter(c => c.id !== id));
  };
  
  // 更新 Cookie
  const updateCookie = (id: string, field: 'name' | 'value' | 'enabled', val: string | boolean) => {
    setCookies(prev => prev.map(c => c.id === id ? { ...c, [field]: val } : c));
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
          <option>PATCH</option>
          <option>HEAD</option>
          <option>OPTIONS</option>
        </select>
        <input
          data-testid="reqable-composer-url"
          value={composerUrl}
          onChange={(e) => setComposerUrl(e.target.value)}
          className="flex-1 h-8 bg-[#1e1e1e] border border-[#333] text-gray-300 text-xs px-3 rounded outline-none font-mono"
          placeholder="https://example.com/api"
        />
        
        {/* Protocol Selector */}
        <select
          data-testid="protocol-select"
          value={protocol}
          onChange={(e) => setProtocol(e.target.value as 'HTTP/1.1' | 'HTTP/2')}
          className="h-8 bg-[#1e1e1e] border border-[#333] text-gray-400 text-xs rounded px-2 outline-none"
        >
          <option value="HTTP/1.1">HTTP/1.1</option>
          <option value="HTTP/2">HTTP/2</option>
        </select>
        
        <button
          data-testid="reqable-composer-send"
          onClick={handleSend}
          className="h-8 px-6 bg-[#4ec9b0] text-black text-xs font-bold rounded hover:bg-[#3db89f] flex items-center gap-2"
        >
          <Send size={14} /> Send
        </button>
        {onSaveToCollection && (
          <button
            data-testid="reqable-composer-save"
            onClick={handleSave}
            className="h-8 px-4 bg-[#333] text-gray-300 text-xs rounded hover:bg-[#444] flex items-center gap-2 border border-[#454545]"
            title="Save to Collection"
          >
            <Save size={14} />
          </button>
        )}
      </div>

      {/* Composer Tabs */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="h-9 bg-[#1e1e1e] border-b border-[#333] flex items-center px-4 gap-4">
          {[
            { key: 'params', label: 'Params' },
            { key: 'headers', label: 'Headers' },
            { key: 'body', label: 'Body' },
            { key: 'auth', label: 'Auth' },
            { key: 'cookies', label: 'Cookies' }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setComposerTab(t.key as ComposerTab)}
              className={`h-full text-xs border-b-2 px-1 ${composerTab === t.key ? 'text-[#4ec9b0] border-[#4ec9b0] font-bold' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
            >
              {t.label}
              {t.key === 'auth' && auth.type !== 'none' && (
                <span className="ml-1 w-1.5 h-1.5 bg-[#4ec9b0] rounded-full inline-block" />
              )}
              {t.key === 'cookies' && cookies.filter(c => c.enabled).length > 0 && (
                <span className="ml-1 text-[10px] text-gray-500">({cookies.filter(c => c.enabled).length})</span>
              )}
            </button>
          ))}
          
          {/* Metrics indicator */}
          {metrics && (
            <button
              onClick={() => setComposerTab('params')} // Could add metrics tab
              className="ml-auto text-[10px] text-gray-500 flex items-center gap-1"
            >
              <Clock size={10} />
              {metrics.total}ms
            </button>
          )}
        </div>

        <div className="flex-1 bg-[#1e1e1e] overflow-auto p-0">
          {/* Params Tab */}
          {composerTab === 'params' && (
            <KeyValEditor items={composerParams} onChange={setComposerParams} />
          )}
          
          {/* Headers Tab */}
          {composerTab === 'headers' && (
            <KeyValEditor items={composerHeaders} onChange={setComposerHeaders} />
          )}
          
          {/* Body Tab */}
          {composerTab === 'body' && (
            <div className="flex flex-col h-full">
              <div className="h-8 bg-[#252526] flex items-center px-2 gap-2 border-b border-[#333]">
                <div className="flex items-center gap-2">
                  <input type="radio" name="bodyType" id="none" className="accent-[#4ec9b0]" /> 
                  <label htmlFor="none" className="text-xs text-gray-400">none</label>
                  <input type="radio" name="bodyType" id="json" defaultChecked className="accent-[#4ec9b0]" /> 
                  <label htmlFor="json" className="text-xs text-gray-400">json</label>
                  <input type="radio" name="bodyType" id="form" className="accent-[#4ec9b0]" /> 
                  <label htmlFor="form" className="text-xs text-gray-400">form-data</label>
                  <input type="radio" name="bodyType" id="urlencoded" className="accent-[#4ec9b0]" /> 
                  <label htmlFor="urlencoded" className="text-xs text-gray-400">x-www-form-urlencoded</label>
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
          
          {/* Auth Tab */}
          {composerTab === 'auth' && (
            <div className="p-4" data-testid="auth-tab">
              {/* Auth Type Selector */}
              <div className="mb-4">
                <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 block">Type</label>
                <select
                  data-testid="auth-type-select"
                  value={auth.type}
                  onChange={(e) => setAuth(prev => ({ ...prev, type: e.target.value as AuthType }))}
                  className="w-full h-8 bg-[#252526] border border-[#333] text-gray-300 text-xs rounded px-2 outline-none"
                >
                  <option value="none">No Auth</option>
                  <option value="basic">Basic Auth</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="apikey">API Key</option>
                </select>
              </div>
              
              {/* No Auth */}
              {auth.type === 'none' && (
                <div className="text-center text-gray-500 text-xs py-8">
                  <Lock size={32} className="mx-auto mb-2 opacity-20" />
                  This request does not use any authorization.
                </div>
              )}
              
              {/* Basic Auth */}
              {auth.type === 'basic' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Username</label>
                    <div className="flex items-center gap-2">
                      <User size={14} className="text-gray-500" />
                      <input
                        data-testid="basic-username"
                        type="text"
                        value={auth.basic.username}
                        onChange={(e) => setAuth(prev => ({ ...prev, basic: { ...prev.basic, username: e.target.value } }))}
                        className="flex-1 h-8 bg-[#252526] border border-[#333] text-gray-300 text-xs rounded px-2 outline-none"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Password</label>
                    <div className="flex items-center gap-2">
                      <Key size={14} className="text-gray-500" />
                      <input
                        data-testid="basic-password"
                        type="password"
                        value={auth.basic.password}
                        onChange={(e) => setAuth(prev => ({ ...prev, basic: { ...prev.basic, password: e.target.value } }))}
                        className="flex-1 h-8 bg-[#252526] border border-[#333] text-gray-300 text-xs rounded px-2 outline-none"
                        placeholder="password"
                      />
                    </div>
                  </div>
                  {auth.basic.username && (
                    <div className="mt-4 p-3 bg-[#252526] rounded border border-[#333]">
                      <div className="text-[10px] text-gray-500 mb-1">Generated Header</div>
                      <code className="text-[11px] text-[#4ec9b0] break-all">
                        Authorization: Basic {btoa(`${auth.basic.username}:${auth.basic.password}`)}
                      </code>
                    </div>
                  )}
                </div>
              )}
              
              {/* Bearer Token */}
              {auth.type === 'bearer' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Token</label>
                    <div className="flex items-center gap-2">
                      <Key size={14} className="text-gray-500" />
                      <input
                        data-testid="bearer-token"
                        type="text"
                        value={auth.bearer.token}
                        onChange={(e) => setAuth(prev => ({ ...prev, bearer: { token: e.target.value } }))}
                        className="flex-1 h-8 bg-[#252526] border border-[#333] text-gray-300 text-xs rounded px-2 outline-none font-mono"
                        placeholder="your-jwt-token"
                      />
                    </div>
                  </div>
                  {auth.bearer.token && (
                    <div className="mt-4 p-3 bg-[#252526] rounded border border-[#333]">
                      <div className="text-[10px] text-gray-500 mb-1">Generated Header</div>
                      <code className="text-[11px] text-[#4ec9b0] break-all">
                        Authorization: Bearer {auth.bearer.token}
                      </code>
                    </div>
                  )}
                </div>
              )}
              
              {/* API Key */}
              {auth.type === 'apikey' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Key</label>
                    <input
                      data-testid="apikey-name"
                      type="text"
                      value={auth.apikey.key}
                      onChange={(e) => setAuth(prev => ({ ...prev, apikey: { ...prev.apikey, key: e.target.value } }))}
                      className="w-full h-8 bg-[#252526] border border-[#333] text-gray-300 text-xs rounded px-2 outline-none"
                      placeholder="X-API-Key"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Value</label>
                    <input
                      data-testid="apikey-value"
                      type="text"
                      value={auth.apikey.value}
                      onChange={(e) => setAuth(prev => ({ ...prev, apikey: { ...prev.apikey, value: e.target.value } }))}
                      className="w-full h-8 bg-[#252526] border border-[#333] text-gray-300 text-xs rounded px-2 outline-none font-mono"
                      placeholder="your-api-key"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 uppercase tracking-wider mb-1 block">Add to</label>
                    <select
                      data-testid="apikey-location"
                      value={auth.apikey.addTo}
                      onChange={(e) => setAuth(prev => ({ ...prev, apikey: { ...prev.apikey, addTo: e.target.value as ApiKeyLocation } }))}
                      className="w-full h-8 bg-[#252526] border border-[#333] text-gray-300 text-xs rounded px-2 outline-none"
                    >
                      <option value="header">Header</option>
                      <option value="query">Query Params</option>
                    </select>
                  </div>
                  {auth.apikey.key && auth.apikey.value && (
                    <div className="mt-4 p-3 bg-[#252526] rounded border border-[#333]">
                      <div className="text-[10px] text-gray-500 mb-1">
                        Will be added to {auth.apikey.addTo === 'header' ? 'Headers' : 'Query Parameters'}
                      </div>
                      <code className="text-[11px] text-[#4ec9b0]">
                        {auth.apikey.key}: {auth.apikey.value}
                      </code>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Cookies Tab */}
          {composerTab === 'cookies' && (
            <div className="p-4" data-testid="cookies-tab">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">Cookies</span>
                <button 
                  onClick={addCookie}
                  className="text-[10px] text-[#4ec9b0] hover:text-[#3db89f] flex items-center gap-1"
                  data-testid="add-cookie"
                >
                  <Plus size={12} /> Add Cookie
                </button>
              </div>
              
              {cookies.length === 0 ? (
                <div className="text-center text-gray-500 text-xs py-8">
                  <Cookie size={32} className="mx-auto mb-2 opacity-20" />
                  No cookies configured
                </div>
              ) : (
                <div className="space-y-2" data-testid="cookie-list">
                  {cookies.map(cookie => (
                    <div key={cookie.id} className="flex items-center gap-2 p-2 bg-[#252526] rounded border border-[#333]" data-testid="cookie-item">
                      <input
                        type="checkbox"
                        checked={cookie.enabled}
                        onChange={(e) => updateCookie(cookie.id, 'enabled', e.target.checked)}
                        className="accent-[#4ec9b0]"
                      />
                      <input
                        data-testid="cookie-name"
                        type="text"
                        value={cookie.name}
                        onChange={(e) => updateCookie(cookie.id, 'name', e.target.value)}
                        className="flex-1 h-7 bg-[#1e1e1e] border border-[#333] text-gray-300 text-xs rounded px-2 outline-none"
                        placeholder="name"
                      />
                      <span className="text-gray-500">=</span>
                      <input
                        data-testid="cookie-value"
                        type="text"
                        value={cookie.value}
                        onChange={(e) => updateCookie(cookie.id, 'value', e.target.value)}
                        className="flex-1 h-7 bg-[#1e1e1e] border border-[#333] text-gray-300 text-xs rounded px-2 outline-none font-mono"
                        placeholder="value"
                      />
                      <button 
                        onClick={() => removeCookie(cookie.id)}
                        className="p-1 text-gray-500 hover:text-[#f48771]"
                        data-testid="delete-cookie"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Request Metrics Panel (显示在底部) */}
      {metrics && (
        <div className="h-24 bg-[#252526] border-t border-[#333] p-3 shrink-0" data-testid="metrics-panel">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Request Timing <span className="text-[9px] text-gray-600">(Simulated)</span></div>
          <div className="flex items-end gap-1 h-12">
            {[
              { label: 'DNS', value: metrics.dnsLookup, color: '#4ec9b0' },
              { label: 'TCP', value: metrics.tcpConnection, color: '#569cd6' },
              { label: 'TLS', value: metrics.tlsHandshake, color: '#dcdcaa' },
              { label: 'Send', value: metrics.requestSent, color: '#ce9178' },
              { label: 'Wait', value: metrics.waiting, color: '#c586c0' },
              { label: 'Download', value: metrics.contentDownload, color: '#4ec9b0' },
            ].map(item => (
              <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full rounded-t transition-all" 
                  style={{ 
                    height: Math.max(4, (item.value / metrics.total) * 40),
                    backgroundColor: item.color 
                  }}
                  title={`${item.label}: ${item.value}ms`}
                />
                <span className="text-[9px] text-gray-500">{item.label}</span>
                <span className="text-[9px] text-gray-400">{item.value}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
