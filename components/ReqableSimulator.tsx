
import React, { useState } from 'react';
import { NetworkRequest } from '../types';
import { Play, Shield, Trash2, Search, Layers, PenTool, Settings, Code, MoreHorizontal, X, ChevronRight, ChevronDown, Plus } from 'lucide-react';
import { ObjectExplorer } from './ObjectExplorer';

interface ReqableSimulatorProps {
  requests: NetworkRequest[];
  onClear: () => void;
  onComposerSend: (req: NetworkRequest) => void;
  breakpointActive: boolean;
  toggleBreakpoint: () => void;
  onResumeRequest: (id: string, modifiedBody?: string) => void;
  onDropRequest: (id: string) => void;
  onRuleEnable?: (type: 'rewrite'|'script'|'mapLocal', enabled: boolean) => void;
}

export const ReqableSimulator: React.FC<ReqableSimulatorProps> = ({
  requests,
  onClear,
  onComposerSend,
  breakpointActive,
  toggleBreakpoint,
  onResumeRequest,
  onDropRequest,
  onRuleEnable
}) => {
  const [activeTab, setActiveTab] = useState<'traffic' | 'composer' | 'tools'>('traffic');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'body' | 'headers'>('overview');
  
  // Composer State
  const [compMethod, setCompMethod] = useState('GET');
  const [compUrl, setCompUrl] = useState('https://');
  const [compTab, setCompTab] = useState<'Params' | 'Headers' | 'Body'>('Body');
  const [compHeaders, setCompHeaders] = useState('Content-Type: application/json');
  const [compBody, setCompBody] = useState('');

  // Decoder State
  const [decodeInput, setDecodeInput] = useState('');
  const [decodeOutput, setDecodeOutput] = useState('');

  const selectedReq = requests.find(r => r.id === selectedId);

  const handleBase64Decode = () => {
    try {
        setDecodeOutput(atob(decodeInput));
    } catch(e) {
        setDecodeOutput("Error: Invalid Base64 string");
    }
  };

  const copyToComposer = (req: NetworkRequest) => {
      setCompMethod(req.method);
      setCompUrl(req.url);
      const headerStr = Object.entries(req.requestHeaders).map(([k,v]) => `${k}: ${v}`).join('\n');
      setCompHeaders(headerStr);
      setCompBody(req.requestBody || '');
      setActiveTab('composer');
  };

  const handleComposerSend = () => {
      const headers: Record<string, string> = {};
      compHeaders.split('\n').forEach(line => {
          const [k, ...v] = line.split(':');
          if(k && v) headers[k.trim()] = v.join(':').trim();
      });

      const newReq: NetworkRequest = {
          id: 'composer-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          url: compUrl,
          method: compMethod,
          status: 0,
          type: 'fetch',
          size: 0,
          time: 0,
          timestamp: Date.now(),
          requestHeaders: headers,
          responseHeaders: {},
          requestBody: compBody
      };
      onComposerSend(newReq);
  };

  const getMethodColor = (m: string) => {
      switch(m) {
          case 'GET': return 'bg-green-600 text-white';
          case 'POST': return 'bg-orange-500 text-white';
          case 'PUT': return 'bg-blue-500 text-white';
          case 'DELETE': return 'bg-red-500 text-white';
          default: return 'bg-gray-500 text-white';
      }
  };

  const getStatusColor = (s: number) => {
      if (s === 0) return 'text-gray-400';
      if (s >= 200 && s < 300) return 'text-green-400';
      if (s >= 300 && s < 400) return 'text-yellow-400';
      return 'text-red-400';
  };

  return (
    <div className="h-full flex bg-[#181818] text-[#cccccc] font-sans overflow-hidden select-none">
        
        {/* --- ACTIVITY BAR (Leftmost) --- */}
        <div className="w-12 bg-[#252526] flex flex-col items-center py-3 border-r border-[#333] shrink-0 z-20">
            <div className="mb-6 text-yellow-400 font-black text-xl tracking-tighter">RQ</div>
            
            <button 
                data-testid="reqable-tab-traffic"
                onClick={() => setActiveTab('traffic')}
                className={`p-2.5 rounded-lg mb-3 transition-all relative group ${activeTab === 'traffic' ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <Layers size={22} strokeWidth={1.5} />
                {activeTab === 'traffic' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-yellow-400 rounded-r"></div>}
            </button>
            
            <button 
                data-testid="reqable-tab-composer"
                onClick={() => setActiveTab('composer')}
                className={`p-2.5 rounded-lg mb-3 transition-all relative group ${activeTab === 'composer' ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <PenTool size={22} strokeWidth={1.5} />
                {activeTab === 'composer' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-yellow-400 rounded-r"></div>}
            </button>

            <button 
                data-testid="reqable-tab-tools"
                onClick={() => setActiveTab('tools')}
                className={`p-2.5 rounded-lg mb-3 transition-all relative group ${activeTab === 'tools' ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'}`}
            >
                <Code size={22} strokeWidth={1.5} />
                {activeTab === 'tools' && <div className="absolute left-0 top-2 bottom-2 w-1 bg-yellow-400 rounded-r"></div>}
            </button>

            <div className="flex-1"></div>
            <button className="p-2.5 text-gray-500 hover:text-gray-300"><Settings size={22} strokeWidth={1.5}/></button>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
            
            {/* GLOBAL TOOLBAR */}
            <div className="h-10 bg-[#252526] border-b border-[#333] flex items-center px-3 gap-2 shrink-0">
                <div className="flex items-center gap-1 bg-[#333] rounded p-0.5">
                    <button onClick={onClear} className="p-1 hover:bg-[#444] rounded text-gray-400" title="Clear All"><Trash2 size={14}/></button>
                    <div className="w-[1px] h-4 bg-[#555]"></div>
                    <button 
                        onClick={toggleBreakpoint}
                        className={`p-1 rounded flex items-center gap-1.5 px-2 transition-colors ${breakpointActive ? 'bg-red-900/50 text-red-400' : 'hover:bg-[#444] text-gray-400'}`}
                    >
                        <Shield size={14} />
                        <span className="text-[11px] font-bold">{breakpointActive ? 'Interceptor ON' : 'Interceptor OFF'}</span>
                    </button>
                </div>

                <div className="flex-1 flex items-center bg-[#181818] border border-[#333] rounded h-7 px-2 mx-2 text-xs focus-within:border-yellow-500/50 transition-colors">
                    <Search size={12} className="text-gray-500 mr-2"/>
                    <input placeholder="Filter by URL, Method or Body..." className="bg-transparent outline-none flex-1 text-gray-300 placeholder-gray-600 h-full" />
                </div>

                <div className="px-2 py-0.5 bg-[#2d2d2d] rounded border border-[#333] flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                    <span className="text-[10px] font-mono text-gray-400">Proxy: 8888</span>
                </div>
            </div>

            {/* --- VIEW: TRAFFIC LIST & DETAIL --- */}
            {activeTab === 'traffic' && (
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Top: Request List */}
                    <div className={`${selectedReq ? 'h-1/2' : 'h-full'} flex flex-col min-h-0 transition-[height] duration-200 ease-in-out`}>
                        <div className="flex items-center bg-[#252526] border-b border-[#333] text-[11px] text-gray-500 font-bold uppercase py-1 px-2 select-none">
                            <div className="w-14 pl-1"># ID</div>
                            <div className="w-16">Method</div>
                            <div className="w-12">Code</div>
                            <div className="w-32">Host</div>
                            <div className="flex-1">Path</div>
                            <div className="w-16 text-right pr-2">Size</div>
                            <div className="w-16 text-right pr-2">Time</div>
                        </div>
                        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-[#1e1e1e]">
                            {requests.map((req, i) => (
                                <div 
                                    key={req.id}
                                    onClick={() => setSelectedId(req.id)}
                                    className={`flex items-center px-2 py-1 text-[12px] font-mono border-b border-[#2a2a2a] cursor-pointer group ${
                                        selectedId === req.id ? 'bg-[#2a2d3e]' : 'hover:bg-[#252526]'
                                    } ${req.isPaused ? 'bg-yellow-900/10' : ''}`}
                                >
                                    <div className="w-14 text-gray-600 shrink-0 pl-1">{(i+1)}</div>
                                    <div className="w-16 shrink-0">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-sm ${getMethodColor(req.method)}`}>{req.method}</span>
                                    </div>
                                    <div className={`w-12 font-bold shrink-0 ${getStatusColor(req.status)}`}>
                                        {req.isPaused ? <span className="text-yellow-500">WAIT</span> : req.status || '...'}
                                    </div>
                                    <div className="w-32 text-gray-400 truncate shrink-0" title={req.url}>{new URL(req.url).host}</div>
                                    <div className="flex-1 text-gray-300 truncate px-2" title={req.url}>
                                        {req.isPaused && <span className="mr-2 text-yellow-500">⏸</span>}
                                        {new URL(req.url).pathname + new URL(req.url).search}
                                    </div>
                                    <div className="w-16 text-right text-gray-500 shrink-0 pr-2">{req.size > 0 ? `${req.size}B` : '-'}</div>
                                    <div className="w-16 text-right text-gray-500 shrink-0 pr-2">{req.time}ms</div>
                                </div>
                            ))}
                            {requests.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-2">
                                    <Layers size={40} strokeWidth={1} className="opacity-20"/>
                                    <div className="text-sm">No traffic captured</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom: Inspector Panel */}
                    {selectedReq && (
                        <div className="h-1/2 border-t border-[#333] bg-[#1e1e1e] flex flex-col min-h-0 shadow-[0_-5px_15px_rgba(0,0,0,0.3)] relative z-10">
                            
                            {/* Actions & Tabs */}
                            <div className="h-9 bg-[#252526] border-b border-[#333] flex items-center justify-between px-2 shrink-0">
                                <div className="flex gap-1">
                                    {['Overview', 'Headers', 'Body', 'Cookies'].map(t => (
                                        <button 
                                            key={t} 
                                            onClick={() => setDetailTab(t.toLowerCase() as any)}
                                            className={`px-3 py-1 text-[11px] rounded hover:bg-[#333] transition-colors ${detailTab === t.toLowerCase() ? 'text-yellow-400 font-bold bg-[#333]' : 'text-gray-400'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => copyToComposer(selectedReq)}
                                        className="text-[11px] bg-[#333] hover:bg-[#444] text-yellow-400 px-3 py-1 rounded flex items-center gap-1.5 border border-[#444]"
                                    >
                                        <PenTool size={12}/> Edit
                                    </button>
                                    <button 
                                        onClick={() => setSelectedId(null)}
                                        className="text-gray-500 hover:text-gray-300 p-1"
                                    >
                                        <X size={14}/>
                                    </button>
                                </div>
                            </div>

                            {/* Interception Control */}
                            {selectedReq.isPaused && (
                                <div className="bg-yellow-900/20 border-b border-yellow-500/20 p-2 flex items-center justify-between animate-in slide-in-from-top-2">
                                    <div className="flex items-center gap-2 text-yellow-500 text-xs font-bold px-2">
                                        <Shield size={14} className="animate-pulse"/>
                                        REQUEST INTERCEPTED
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => onDropRequest(selectedReq.id)} className="px-4 py-1 bg-[#333] hover:bg-red-900/50 text-red-400 border border-red-900/50 rounded text-xs font-bold transition-colors">Drop</button>
                                        <button onClick={() => onResumeRequest(selectedReq.id)} className="px-4 py-1 bg-green-600 hover:bg-green-500 text-white rounded text-xs font-bold shadow-lg shadow-green-900/20 transition-colors">Execute</button>
                                    </div>
                                </div>
                            )}

                            {/* Detail Content */}
                            <div className="flex-1 overflow-y-auto p-0 min-h-0">
                                {detailTab === 'overview' && (
                                    <div className="p-4 space-y-4 text-xs font-mono">
                                        <div className="grid grid-cols-[100px_1fr] gap-y-2">
                                            <div className="text-gray-500">URL</div>
                                            <div className="text-blue-300 select-text break-all">{selectedReq.url}</div>
                                            <div className="text-gray-500">Status</div>
                                            <div className={getStatusColor(selectedReq.status)}>{selectedReq.status} {selectedReq.status === 200 ? 'OK' : ''}</div>
                                            <div className="text-gray-500">Time</div>
                                            <div className="text-gray-300">{selectedReq.time}ms</div>
                                            <div className="text-gray-500">Client IP</div>
                                            <div className="text-gray-300">127.0.0.1</div>
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'headers' && (
                                    <div className="flex flex-col min-h-full">
                                        <div className="bg-[#1e1e1e] px-4 py-2 border-b border-[#333] text-xs font-bold text-yellow-500">Request Headers</div>
                                        <div className="p-2 font-mono text-xs space-y-1 border-b border-[#333]">
                                            {Object.entries(selectedReq.requestHeaders).map(([k, v]) => (
                                                <div key={k} className="flex gap-2 hover:bg-[#252526] p-1 rounded">
                                                    <span className="text-gray-500 font-bold min-w-[120px] shrink-0">{k}</span>
                                                    <span className="text-gray-300 break-all">{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-[#1e1e1e] px-4 py-2 border-b border-[#333] text-xs font-bold text-green-500 mt-2">Response Headers</div>
                                        <div className="p-2 font-mono text-xs space-y-1">
                                            {Object.entries(selectedReq.responseHeaders).map(([k, v]) => (
                                                <div key={k} className="flex gap-2 hover:bg-[#252526] p-1 rounded">
                                                    <span className="text-gray-500 font-bold min-w-[120px] shrink-0">{k}</span>
                                                    <span className="text-gray-300 break-all">{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {detailTab === 'body' && (
                                    <div className="h-full flex flex-col">
                                        <div className="bg-[#1e1e1e] px-4 py-1 border-b border-[#333] text-[10px] text-gray-500 flex justify-between items-center">
                                            <span>{selectedReq.responseBody ? 'RESPONSE BODY' : 'REQUEST BODY'}</span>
                                            <span>JSON</span>
                                        </div>
                                        <div className="flex-1 p-4 overflow-auto bg-[#1a1b26]">
                                            {(() => {
                                                const body = selectedReq.responseBody || selectedReq.requestBody;
                                                if (!body) return <span className="text-gray-600 italic text-xs">// No body content</span>;
                                                
                                                try {
                                                    const parsed = JSON.parse(body);
                                                    return <ObjectExplorer data={parsed} theme="reqable" />;
                                                } catch(e) {
                                                    return <pre className="text-xs font-mono text-green-300 whitespace-pre-wrap break-all select-text">{body}</pre>;
                                                }
                                            })()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- VIEW: COMPOSER --- */}
            {activeTab === 'composer' && (
                <div className="flex-1 flex flex-col min-h-0 bg-[#1e1e1e]">
                    <div className="p-4 border-b border-[#333]">
                        <div className="flex gap-2 mb-4">
                            <select 
                                data-testid="reqable-composer-method"
                                value={compMethod} 
                                onChange={(e) => setCompMethod(e.target.value)}
                                className={`bg-[#252526] text-white font-bold px-4 rounded outline-none border border-[#444] focus:border-yellow-500 appearance-none`}
                                style={{ textAlignLast: 'center' }}
                            >
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>DELETE</option>
                                <option>PATCH</option>
                            </select>
                            <div className="flex-1 flex items-center bg-[#252526] border border-[#444] rounded focus-within:border-yellow-500 focus-within:ring-1 focus-within:ring-yellow-500/50 transition-all">
                                <input 
                                    data-testid="reqable-composer-url"
                                    value={compUrl}
                                    onChange={(e) => setCompUrl(e.target.value)}
                                    className="flex-1 bg-transparent border-none outline-none text-gray-200 px-3 py-2 font-mono text-sm"
                                    placeholder="Enter request URL"
                                />
                            </div>
                            <button 
                                data-testid="reqable-composer-send"
                                onClick={handleComposerSend}
                                className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-6 rounded flex items-center gap-2 transition-colors shadow-[0_0_10px_rgba(250,204,21,0.2)]"
                            >
                                <Play size={16} fill="black"/> SEND
                            </button>
                        </div>
                    </div>

                    {/* Composer Tabs */}
                    <div className="flex border-b border-[#333] bg-[#252526]">
                        {['Params', 'Headers', 'Body', 'Auth'].map(t => (
                            <button
                                key={t}
                                onClick={() => setCompTab(t as any)}
                                className={`px-6 py-2 text-xs font-bold transition-colors border-b-2 ${
                                    compTab === t 
                                    ? 'border-yellow-500 text-yellow-500 bg-[#1e1e1e]' 
                                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a]'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 bg-[#1e1e1e] p-0 relative overflow-hidden">
                        {compTab === 'Headers' && (
                            <div className="h-full flex flex-col">
                                <div className="flex-1 p-4">
                                    <label className="block text-xs text-gray-500 mb-2 uppercase font-bold tracking-wider">Raw Headers</label>
                                    <textarea 
                                        value={compHeaders}
                                        onChange={(e) => setCompHeaders(e.target.value)}
                                        className="w-full h-full bg-[#1a1b26] border border-[#333] rounded p-4 font-mono text-sm text-gray-300 outline-none focus:border-yellow-500/50 resize-none leading-relaxed"
                                        placeholder="Key: Value"
                                        spellCheck={false}
                                    />
                                </div>
                            </div>
                        )}
                        {compTab === 'Body' && (
                            <div className="h-full flex flex-col">
                                <div className="h-8 bg-[#252526] border-b border-[#333] flex items-center px-2 gap-2">
                                    <span className="text-[10px] text-gray-500 uppercase font-bold px-2">Content Type:</span>
                                    <button className="text-[10px] text-yellow-500 bg-[#333] px-2 py-0.5 rounded">JSON</button>
                                    <button className="text-[10px] text-gray-500 hover:text-gray-300 px-2">Form-Data</button>
                                    <button className="text-[10px] text-gray-500 hover:text-gray-300 px-2">Raw</button>
                                </div>
                                <div className="flex-1 p-0">
                                    <textarea 
                                        data-testid="reqable-composer-body"
                                        value={compBody}
                                        onChange={(e) => setCompBody(e.target.value)}
                                        className="w-full h-full bg-[#1a1b26] border-none p-4 font-mono text-sm text-yellow-100/80 outline-none resize-none leading-relaxed"
                                        placeholder="{ ... }"
                                        spellCheck={false}
                                    />
                                </div>
                            </div>
                        )}
                         {compTab === 'Params' && (
                            <div className="h-full flex items-center justify-center text-gray-600 text-sm">
                                Params editor is simulated. Please append query params to the URL directly.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* --- VIEW: TOOLS (DECODER) --- */}
            {activeTab === 'tools' && (
                <div className="flex-1 flex flex-col p-6 bg-[#1e1e1e] overflow-y-auto">
                    <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg"><Code size={20} className="text-blue-400"/></div>
                        Utilities / Base64 Decoder
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-6 h-96">
                        <div className="flex flex-col">
                            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Encoded Input</label>
                            <textarea 
                                value={decodeInput}
                                onChange={(e) => setDecodeInput(e.target.value)}
                                className="flex-1 bg-[#1a1b26] border border-[#333] rounded-lg p-4 font-mono text-sm text-gray-300 outline-none focus:border-blue-500 resize-none"
                                placeholder="Paste Base64 string here..."
                            />
                        </div>
                        <div className="flex flex-col relative">
                            <label className="text-xs font-bold text-gray-500 mb-2 uppercase">Decoded Output</label>
                            <textarea 
                                readOnly
                                value={decodeOutput}
                                className="flex-1 bg-[#1a1b26] border border-[#333] rounded-lg p-4 font-mono text-sm text-green-400 outline-none resize-none"
                                placeholder="Result will appear here..."
                            />
                            <button 
                                onClick={handleBase64Decode}
                                className="absolute top-1/2 left-[-24px] -translate-y-1/2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-full shadow-lg z-10"
                            >
                                <ChevronRight size={16}/>
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    </div>
  );
};
