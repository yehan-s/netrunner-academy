
import React, { useEffect, useRef, useState } from 'react';
import { CaseStudy, NetworkRequest } from '../types';
import { MoreVertical, RefreshCw, ChevronLeft, ChevronRight, Star, UploadCloud, Trash2 } from 'lucide-react';

interface BrowserToolbarProps {
  activeCase: CaseStudy;
  onOpenDevTools: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const BrowserToolbar: React.FC<BrowserToolbarProps> = ({ activeCase, onOpenDevTools, onRefresh, isRefreshing = false }) => {
  const [showMenu, setShowMenu] = useState(false);
  const currentUrl = activeCase.initialUrl;

  return (
    <div className="h-20 bg-[#dee1e6] flex flex-col shrink-0 border-b border-gray-300 z-30 relative" onClick={() => setShowMenu(false)}>
      {/* Tab Bar */}
      <div className="flex-1 flex items-end px-2 gap-1 overflow-hidden">
        <div className="bg-white px-4 py-2 rounded-t-lg text-xs font-bold text-gray-700 flex items-center gap-2 shadow-sm relative bottom-[-1px] z-10 w-48 shrink-0">
          <img src="https://www.google.com/favicon.ico" className="w-3 h-3 opacity-50" />
          <span className="truncate">{activeCase.title}</span>
          <div className="ml-auto hover:bg-gray-200 rounded-full p-0.5 cursor-pointer"><div className="w-2 h-2 text-gray-400 text-xs flex items-center justify-center">✕</div></div>
        </div>
        <div className="px-4 py-2 rounded-t-lg text-xs text-gray-600 flex items-center gap-2 w-32 hover:bg-gray-300/50 transition-colors shrink-0 cursor-default">
          <span className="truncate">New Tab</span>
        </div>
        <div className="ml-auto p-2"><div className="w-3 h-3 bg-gray-400 rounded-full"></div></div>
      </div>

      {/* Address Bar Row */}
      <div className="h-9 bg-white flex items-center px-3 gap-3 relative z-20">
        <div className="flex gap-3 text-gray-500 shrink-0">
          <ChevronLeft size={16} className="cursor-pointer hover:text-gray-700" />
          <ChevronRight size={16} className="cursor-pointer hover:text-gray-700" />
          <RefreshCw size={14} className={`cursor-pointer hover:text-gray-700 transition-transform duration-500 ${isRefreshing ? 'animate-spin text-blue-500' : 'hover:rotate-180'}`} onClick={onRefresh} />
        </div>
        <div className="flex-1 bg-[#f1f3f4] rounded-full h-7 flex items-center px-4 text-xs text-gray-700 min-w-0">
          <span className="text-gray-400 mr-2 shrink-0">🔒</span>
          <span className="flex-1 truncate">{currentUrl}</span>
          <Star size={12} className="text-gray-400 shrink-0 ml-2 cursor-pointer hover:text-yellow-400" />
        </div>
        <div className="flex gap-3 text-gray-500 items-center relative shrink-0">
          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold cursor-default">U</div>
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className={`hover:bg-gray-200 rounded-full p-1 transition-colors ${showMenu ? 'bg-gray-200' : ''}`}
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <div className="absolute top-8 right-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 text-gray-700 text-[13px] font-sans text-left">
              <div className="px-4 py-1.5 hover:bg-gray-100 flex justify-between cursor-default"><span>New Tab</span><span className="text-gray-400">Ctrl+T</span></div>
              <div className="px-4 py-1.5 hover:bg-gray-100 flex justify-between cursor-default"><span>New Window</span><span className="text-gray-400">Ctrl+N</span></div>
              <div className="h-[1px] bg-gray-200 my-1"></div>
              <div className="px-4 py-1.5 hover:bg-gray-100 group relative cursor-default">
                <div className="flex justify-between items-center">
                  <span>More Tools</span>
                  <ChevronRight size={14} />
                </div>
                <div className="absolute right-full top-0 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 hidden group-hover:block mr-1">
                  <button
                    onClick={() => { onOpenDevTools(); setShowMenu(false); }}
                    className="w-full text-left px-4 py-1.5 hover:bg-gray-100 flex justify-between"
                  >
                    <span>Developer Tools</span>
                    <span className="text-gray-400">Ctrl+Shift+I</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { ContextMenu } from './ContextMenu';
import { ArrowLeft, ArrowRight, RotateCw, Code, Printer, Save } from 'lucide-react';

interface VirtualBrowserProps {
  activeCase: CaseStudy;
  onNavigate: (request: NetworkRequest) => void;
  onRefresh: () => void;
  onOpenDevTools: () => void;
}

export const VirtualBrowser: React.FC<VirtualBrowserProps> = ({ activeCase, onNavigate, onRefresh, onOpenDevTools }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number } | null>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const renderCase = (caseId: string) => {
    let html = '';

    if (caseId === 'case_01' || caseId === 'story_01_login_outage') {
      html = `
            <div class="flex flex-col items-center justify-center h-full bg-gray-100 font-sans">
                <div class="bg-white p-8 rounded shadow-md w-full max-w-sm">
                    <h2 class="text-2xl font-bold mb-6 text-gray-800 text-center">Corporate Login</h2>
                    <div class="mb-4"><label class="block text-gray-700 text-sm font-bold mb-2">Username</label><input id="user" class="border rounded w-full py-2 px-3" type="text" placeholder="Username"></div>
                    <div class="mb-6"><label class="block text-gray-700 text-sm font-bold mb-2">Password</label><input id="pass" class="border rounded w-full py-2 px-3" type="password" placeholder="******************"></div>
                    <button id="login-btn" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign In</button>
                    <div id="msg-area" class="mt-4 text-center text-sm text-red-500 hidden"></div>
                </div>
            </div>`;
    } else if (caseId === 'story_02_price_tampering') {
      html = `<div class=\"h-full bg-gray-100 p-6 font-sans\"><div class=\"bg-white p-6 rounded shadow max-w-2xl mx-auto\"><h2 class=\"text-2xl font-bold text-gray-800\">会员中心 · 限时折扣</h2><div class=\"flex justify-between items-baseline mb-4\"><div><div class=\"text-sm text-gray-500 mb-1\">商品：年度高级会员</div><div class=\"text-3xl font-bold text-red-500\">￥299.00</div></div><div class=\"text-sm text-gray-600\">实付（本次请求）：<span class=\"text-green-600 font-bold\">￥0.01</span></div></div><div class=\"flex justify-end gap-4 items-center\"><div class=\"text-sm text-gray-600\">账户余额：<span class=\"text-red-500 font-bold\">￥5.00</span></div><button id=\"buy-btn\" class=\"bg-green-600 text-white px-6 py-2 rounded font-bold\">微信支付</button></div><div id=\"shop-msg\" class=\"mt-4 hidden text-sm\"></div></div></div>`;
    } else if (caseId === 'story_05_metrics_misleading') {
        html = `<div class=\"h-full bg-[#0b1120] text-white font-sans p-6\">
            <div class=\"max-w-4xl mx-auto h-full flex flex-col gap-6\">
                <div>
                    <h2 class=\"text-2xl font-bold text-slate-100\">订单转化监控 · 关键指标</h2>
                    <p class=\"text-sm text-slate-400 mt-1\">下单成功率曲线几乎归零，请核实埋点是否准确。</p>
                </div>
                <div class=\"grid grid-cols-3 gap-4\">
                    <div class=\"bg-[#111b2e] rounded-lg p-4 border border-slate-800\">
                        <div class=\"text-xs text-slate-400 uppercase tracking-widest\">下单成功率</div>
                        <div class=\"text-4xl font-black text-red-400 mt-2\">1.5%</div>
                        <div class=\"text-xs text-slate-500 mt-1\">图表显示几乎归零</div>
                    </div>
                    <div class=\"bg-[#111b2e] rounded-lg p-4 border border-slate-800\">
                        <div class=\"text-xs text-slate-400 uppercase tracking-widest\">真实失败率</div>
                        <div class=\"text-4xl font-black text-emerald-400 mt-2\">10%</div>
                        <div class=\"text-xs text-slate-500 mt-1\">基于业务日志估算</div>
                    </div>
                    <div class=\"bg-[#111b2e] rounded-lg p-4 border border-slate-800\">
                        <div class=\"text-xs text-slate-400 uppercase tracking-widest\">重试事件</div>
                        <div class=\"text-4xl font-black text-yellow-400 mt-2\">800</div>
                        <div class=\"text-xs text-slate-500 mt-1\">怀疑被埋点算成失败</div>
                    </div>
                </div>
                <div class=\"bg-[#111b2e] rounded-xl p-5 border border-slate-800 flex flex-col gap-4\">
                    <div class=\"flex items-center justify-between\">
                        <div>
                            <h3 class=\"text-lg font-semibold\">数据核对操作</h3>
                            <p class=\"text-sm text-slate-400\">使用 Reqable 抓取接口，确认真实日志与埋点之间的差异。</p>
                        </div>
                    </div>
                    <div class=\"grid grid-cols-2 gap-4\">
                        <button id=\"metrics-logs-btn\" class=\"bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 rounded-lg p-4 text-left\">
                            <div class=\"text-sm text-slate-400\">业务日志接口</div>
                            <div class=\"text-xl font-bold\">/api/logs/orders</div>
                            <div class=\"text-xs text-slate-500 mt-2\">真实成功/失败比例</div>
                        </button>
                        <button id=\"metrics-raw-btn\" class=\"bg-slate-800 hover:bg-slate-700 transition-colors border border-slate-700 rounded-lg p-4 text-left\">
                            <div class=\"text-sm text-slate-400\">埋点原始数据</div>
                            <div class=\"text-xl font-bold\">/metrics/raw</div>
                            <div class=\"text-xs text-slate-500 mt-2\">包含重试事件的统计</div>
                        </button>
                    </div>
                    <p class=\"text-xs text-slate-500\">提示：在 Reqable 中查看接口响应，判断是否存在埋点误报，再把差异同步给监控团队。</p>
                </div>
            </div>
        </div>`;
    } else if (caseId === 'story_06_stacktrace_leak') {
        html = `<div class=\"h-full bg-gray-100 p-8 font-sans\">
            <div class=\"max-w-3xl mx-auto bg-white rounded-2xl shadow border border-gray-200 overflow-hidden\">
                <div class=\"px-6 py-4 border-b border-gray-200\">
                    <h2 class=\"text-2xl font-bold text-gray-800\">订单详情 · 错误页面</h2>
                    <p class=\"text-sm text-gray-500\">用户端截图显示 SQL 报错被直接吐给终端用户，需要抓包确认泄露信息。</p>
                </div>
                <div class=\"px-6 py-6 space-y-4\">
                    <div class=\"bg-gray-900 text-green-400 font-mono text-xs rounded-lg p-4 overflow-auto h-48\" id=\"stacktrace-panel\">
                        <div>SQLException: relation \"orders\" does not exist</div>
                        <div>  at com.example.orders.OrderDAO.list(OrderDAO.java:58)</div>
                        <div>  at com.example.orders.OrderController.handle(OrderController.java:34)</div>
                        <div>  at sun.reflect.NativeMethodAccessorImpl.invoke0(Native Method)</div>
                        <div>  at org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014)</div>
                        <div>Server: app-node-3 | Path: /api/orders/error</div>
                    </div>
                    <p class=\"text-xs text-red-500\">⚠ 以上内容全部直接返回给终端用户，包含内部类名、文件路径和数据库信息。</p>
                    <button id=\"stacktrace-fetch-btn\" class=\"w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-500 transition-colors\">
                        复现并抓取 /api/orders/error 响应
                    </button>
                    <p class=\"text-xs text-gray-500\">提示：在 Reqable 中查看该响应，记录泄露的信息类型，并思考如何只返回错误码/工单号。</p>
                </div>
            </div>
        </div>`;
    } else if (caseId === 'story_07_waf_callback') {
        html = `<div class=\"h-full bg-[#0b0f19] text-white font-sans p-6\">
            <div class=\"max-w-4xl mx-auto h-full flex flex-col gap-5\">
                <div class=\"flex items-center justify-between\">
                    <div>
                        <h2 class=\"text-2xl font-bold\">支付回调监控 · WAF 拦截</h2>
                        <p class=\"text-sm text-slate-400\">回调成功率骤降，错误面板提示 WAF 阻断。</p>
                    </div>
                </div>
                <div class=\"grid grid-cols-3 gap-4\">
                    <div class=\"bg-[#131a2a] rounded-lg border border-slate-800 p-4\">
                        <div class=\"text-xs text-slate-400 uppercase\">成功回调</div>
                        <div class=\"text-4xl font-black text-red-400 mt-2\">12%</div>
                    </div>
                    <div class=\"bg-[#131a2a] rounded-lg border border-slate-800 p-4\">
                        <div class=\"text-xs text-slate-400 uppercase\">WAF 拦截</div>
                        <div class=\"text-4xl font-black text-yellow-400 mt-2\">68%</div>
                    </div>
                    <div class=\"bg-[#131a2a] rounded-lg border border-slate-800 p-4\">
                        <div class=\"text-xs text-slate-400 uppercase\">待重试</div>
                        <div class=\"text-4xl font-black text-slate-300 mt-2\">20%</div>
                    </div>
                </div>
                <div class=\"bg-[#131a2a] rounded-xl border border-slate-800 p-5 space-y-4\">
                    <h3 class=\"text-lg font-semibold\">操作面板</h3>
                    <div class=\"grid grid-cols-2 gap-4\">
                        <button id=\"waf-preview-btn\" class=\"bg-slate-900 border border-slate-700 rounded-lg p-4 text-left hover:bg-slate-800 transition-colors\">
                            <div class=\"text-sm text-slate-400\">复现回调（正常 Header）</div>
                            <div class=\"text-xl font-bold\">POST /api/payments/callback</div>
                            <div class=\"text-xs text-slate-500 mt-2\">触发 WAF 拦截，查看错误原因</div>
                        </button>
                        <button id=\"waf-allow-btn\" class=\"bg-green-700/80 border border-green-500/60 rounded-lg p-4 text-left hover:bg-green-600 transition-colors\">
                            <div class=\"text-sm text-green-200\">携带临时放行 Header</div>
                            <div class=\"text-xl font-bold\">X-WAF-Allow: callback</div>
                            <div class=\"text-xs text-green-200 mt-2\">验证回调是否恢复成功</div>
                        </button>
                    </div>
                    <p class=\"text-xs text-slate-500\">提示：在 Reqable 中对比两次请求的响应，记录 WAF 拦截原因与临时放行策略。</p>
                </div>
            </div>
        </div>`;
    } else if (caseId === 'story_incident_feature_flag_patch') {
        html = `<div class=\"h-full bg-[#0b1524] text-slate-100 font-sans p-8\">
        <div class=\"max-w-4xl mx-auto space-y-6\">
          <div>
            <h2 class=\"text-2xl font-bold\">Feature Flag 控制台</h2>
            <p class=\"text-sm text-slate-400 mt-1\">AB 实验 wx-landing-ab 被误推 100%。请在 DevTools Console 注入热补丁，强制回退。</p>
          </div>
          <div class=\"bg-[#111c2f] rounded-xl border border-slate-800 p-5 grid grid-cols-2 gap-4\">
            <div>
              <div class=\"text-xs text-slate-500 uppercase tracking-widest\">当前实验</div>
              <div class=\"text-3xl font-black text-amber-400 mt-2\" id=\"feature-flag-status\">状态：forceLegacyFlow(false)</div>
              <p class=\"text-xs text-slate-500 mt-2\">Console 执行 <code>window.featureFlags.forceLegacyFlow(true)</code> 后应变更为 true。</p>
            </div>
            <div class=\"bg-[#0f172a] rounded-lg border border-slate-700 p-4\">
              <div class=\"text-xs text-slate-500 uppercase\">实验详情</div>
              <div class=\"text-lg font-semibold mt-1\">wx-landing-ab</div>
              <p class=\"text-xs text-slate-500\">traffic: 100% · tracker: legacy.analytics.corp · risk: 高</p>
            </div>
          </div>
          <div class=\"bg-[#111c2f] rounded-xl border border-slate-800 p-5\">
            <div class=\"flex items-center justify-between\">
              <div>
                <h3 class=\"text-lg font-semibold\">操作步骤</h3>
                <p class=\"text-xs text-slate-500\">参考 Chrome DevTools 官方文档打开 Console，并执行热补丁。</p>
              </div>
            </div>
            <pre class=\"mt-4 bg-black/30 rounded-lg p-4 text-xs overflow-auto\">
window.featureFlags.forceLegacyFlow(true);
window.featureFlags.disablePromo('wx-landing-ab');
console.info('rollback@' + new Date().toISOString());
            </pre>
            <p class=\"text-xs text-slate-500 mt-3\">回退后使用 Reqable 确认脚本不再访问过期 tracker，再点击「同步线索」。</p>
          </div>
        </div>
      </div>`;
      if (typeof window !== 'undefined') {
        (window as any).featureFlags = (window as any).featureFlags || {
          legacyFlow: false,
          forceLegacyFlow: (val: boolean) => {
            (window as any).featureFlags.legacyFlow = val;
          },
          disablePromo: () => {},
        };
      }
    } else if (caseId === 'story_incident_gray_release') {
        html = `<div class=\"h-full bg-[#080f1d] text-slate-100 font-sans p-8\">
        <div class=\"max-w-5xl mx-auto space-y-6\">
          <div class=\"flex items-start justify-between gap-4\">
            <div>
              <h2 class=\"text-2xl font-bold\">Ops 灰度面板 · override</h2>
              <p class=\"text-sm text-slate-400\">需通过内部 API 关闭实验 wechat-ab-992，防止凌晨重启再次推送。</p>
            </div>
            <div class=\"text-right\">
              <div class=\"text-xs text-slate-500\">当前状态</div>
              <div id=\"gray-status\" class=\"text-2xl font-black text-emerald-400\">enabled</div>
            </div>
          </div>
          <div class=\"grid grid-cols-2 gap-4\">
            <div class=\"bg-[#0f172a] border border-slate-800 rounded-xl p-4\">
              <div class=\"text-xs text-slate-500 uppercase\">API 目标</div>
              <div class=\"text-lg font-semibold mt-1\">POST https://ops.corp/api/gray-release/override</div>
              <ul class=\"mt-3 space-y-1 text-xs text-slate-400\">
                <li>Header：X-OPS-Token</li>
                <li>Body.action：disable</li>
                <li>Body.reason：incident-hotfix</li>
                <li>Body.owner：wechat-security</li>
              </ul>
            </div>
            <div class=\"bg-[#0f172a] border border-slate-800 rounded-xl p-4\">
              <div class=\"text-xs text-slate-500 uppercase\">示例 Body</div>
              <pre class=\"text-xs overflow-auto\">
{
  "experimentId": "wechat-ab-992",
  "action": "disable",
  "reason": "incident-hotfix",
  "owner": "wechat-security"
}
              </pre>
            </div>
          </div>
          <div class=\"bg-[#0f172a] border border-slate-800 rounded-xl p-4\">
            <h3 class=\"text-sm font-semibold\">提示</h3>
            <ul class=\"mt-2 text-xs text-slate-400 list-disc list-inside space-y-1\">
              <li>使用 Reqable Composer 发送请求并保存记录，方便复盘。</li>
              <li>响应 {\"status\":\"ok\",\"rollout\":\"disabled\"} 表示 override 成功。</li>
              <li>刷新页面确认状态，并回微信群同步线索。</li>
            </ul>
          </div>
        </div>
      </div>`;
    } else if (caseId === 'story_polyfill_ioc_capture') {
        html = `<div class=\"h-full bg-[#060b16] text-white font-sans p-8\">
            <div class=\"max-w-4xl mx-auto h-full flex flex-col gap-6\">
                <div>
                    <h2 class=\"text-2xl font-bold text-emerald-200\">Polyfill IOC 检查</h2>
                    <p class=\"text-sm text-slate-400 mt-1\">依据 Cloudflare / Google TAG 公告，确认 polyfill.io 是否被接管。</p>
                </div>
                <div class=\"bg-[#0f1729] rounded-xl border border-emerald-500/30 p-5\">
                    <div class=\"text-xs uppercase text-emerald-300 tracking-widest\">响应片段 (节选)</div>
                    <pre class=\"mt-3 text-[11px] bg-black/40 p-3 rounded-lg overflow-auto h-40 text-emerald-200\">const payload = atob('ZGV2aWNldGVsZW1ldHMuLi4=');\nfetch('https://analytics.polyfill.io/v1/collect', {\n  method: 'POST',\n  body: payload,\n});</pre>
                    <p class=\"text-xs text-emerald-400 mt-3\">提示：使用 Reqable 抓取完整响应，将 IOC 同步回微信群。</p>
                </div>
                <div class=\"flex gap-4\">
                    <button id=\"polyfill-fetch-btn\" class=\"flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors\">下载 polyfill.js（抓包）</button>
                    <button id=\"polyfill-harvest-btn\" class=\"flex-1 bg-slate-700 text-slate-200 border border-slate-500 rounded-lg py-3 hover:bg-slate-600\">查看 IOC 提示</button>
                </div>
            </div>
        </div>`;
    } else if (caseId === 'story_polyfill_tls_fallback') {
        html = `<div class=\"h-full bg-[#020617] text-white font-sans p-6\">
            <div class=\"max-w-4xl mx-auto h-full flex flex-col gap-5\">
                <div class=\"flex items-center justify-between\">
                    <div>
                        <h2 class=\"text-2xl font-bold\">TLS 兼容监控</h2>
                        <p class=\"text-sm text-slate-400\">force-h2 已上线，老终端握手失败飙升。</p>
                    </div>
                    <div class=\"text-right text-sm\">
                        <div class=\"text-slate-400\">失败率</div>
                        <div class=\"text-3xl font-black text-red-400\">78%</div>
                    </div>
                </div>
                <div class=\"grid grid-cols-2 gap-4\">
                    <button id=\"tls-h2-btn\" class=\"bg-slate-800 border border-slate-700 rounded-xl p-4 text-left hover:bg-slate-700 transition-colors\">
                        <div class=\"text-xs text-slate-400\">HTTP/2 探测</div>
                        <div class=\"text-xl font-bold\">/api/tls/probe?h2</div>
                        <div class=\"text-xs text-slate-500 mt-2\">捕获握手失败日志</div>
                    </button>
                    <button id=\"tls-fallback-btn\" class=\"bg-emerald-700/80 border border-emerald-500/60 rounded-xl p-4 text-left hover:bg-emerald-600 transition-colors\">
                        <div class=\"text-xs text-emerald-100\">HTTP/1.1 回退</div>
                        <div class=\"text-xl font-bold\">X-Debug-Force-TLS: http1</div>
                        <div class=\"text-xs text-emerald-100 mt-2\">验证兼容性恢复</div>
                    </button>
                </div>
                <p class=\"text-xs text-slate-400\">提示：在 Reqable Composer 中复现请求，比较两次响应并将兼容性线索同步回微信群。</p>
            </div>
        </div>`;
    } else if (caseId === 'story_polyfill_reqable_rule') {
        html = `<div class=\"h-full bg-[#0d1117] text-white font-sans p-6\">
            <div class=\"max-w-4xl mx-auto h-full flex flex-col gap-4\">
                <div>
                    <h2 class=\"text-2xl font-bold\">Reqable Scriptable Rule</h2>
                    <p class=\"text-sm text-slate-400\">临时拦截 analytics.polyfill.io，阻断恶意上报。</p>
                </div>
                <textarea id=\"reqable-rule-editor\" class=\"flex-1 bg-[#080b13] border border-slate-700 rounded-lg p-4 font-mono text-xs focus:outline-none focus:border-emerald-500\">if (request.url.includes('analytics.polyfill.io')) {\n  request.block();\n  console.log('[Rule] blocked polyfill beacon');\n}</textarea>
                <button id=\"reqable-rule-btn\" class=\"bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg shadow\">执行脚本并同步规则</button>
                <p class=\"text-xs text-slate-500\">该按钮会模拟向 /api/rules/apply 提交脚本。确保 Body 中包含 analytics.polyfill.io 与 block() 逻辑。</p>
            </div>
        </div>`;
    } else if (caseId === 'story_polyfill_cdn_validation') {
        html = `<div class=\"h-full bg-[#050e18] text-white font-sans p-6\">
            <div class=\"max-w-4xl mx-auto h-full flex flex-col gap-5\">
                <div class=\"flex items-center justify-between\">
                    <div>
                        <h2 class=\"text-2xl font-bold\">CDN Purge 验证</h2>
                        <p class=\"text-sm text-slate-400\">确认自托管 polyfill 已经命中最新缓存。</p>
                    </div>
                    <div class=\"text-right text-sm\">
                        <div class=\"text-slate-400\">Cache 命中</div>
                        <div class=\"text-3xl font-black text-emerald-400\">94%</div>
                    </div>
                </div>
                <div class=\"bg-[#0f1a2c] rounded-xl border border-slate-800 p-5\">
                    <div class=\"text-xs text-slate-400 uppercase tracking-widest\">待验证 URL</div>
                    <div class=\"text-lg font-bold mt-1\">https://self-cdn.corp/polyfill.min.js?purge_check=1</div>
                    <p class=\"text-xs text-slate-500 mt-2\">使用 Reqable / Network 面板抓包，核对响应头：Cache-Control、Age、X-Cache-Status。</p>
                    <button id=\"cdn-validate-btn\" class=\"mt-4 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg\">刷新并验证</button>
                </div>
            </div>
        </div>`;
    } else if (caseId === 'case_02') {
      html = `<div class=\"h-full bg-gray-100 p-6 font-sans\"><div class=\"bg-white p-6 rounded shadow max-w-2xl mx-auto\"><h2 class=\"text-2xl font-bold text-gray-800\">Laptop</h2><div class=\"text-right mb-4\"><span class=\"text-3xl font-bold text-gray-900\">$2,499.00</span></div><div class=\"flex justify-end gap-4 items-center\"><div class=\"text-sm text-gray-600\">Balance: <span class=\"text-red-500 font-bold\">$50.00</span></div><button id=\"buy-btn\" class=\"bg-black text-white px-6 py-2 rounded font-bold\">Checkout</button></div><div id=\"shop-msg\" class=\"mt-4 hidden text-sm\"></div></div></div>`;
    } else if (caseId === 'case_03' || caseId === 'story_03_sql_injection') {
      if (caseId === 'story_03_sql_injection') {
        html = `<div class=\"h-full bg-white flex flex-col font-sans\"><div class=\"bg-blue-600 p-4 text-white\"><h2 class=\"font-bold\">员工搜索 · 内部通讯录</h2></div><div class=\"p-6\"><div class=\"mb-2 text-xs text-gray-500\">仅限内部员工使用，查询结果包含姓名、部门、手机与邮箱。</div><div class=\"flex gap-2 max-w-lg mb-6\"><input id=\"search-input\" type=\"text\" class=\"flex-1 border p-2 rounded\" placeholder=\"输入姓名或工号...\" /><button id=\"search-btn\" class=\"bg-blue-600 text-white px-4 rounded\">搜索</button></div><div class=\"border rounded p-2\" id=\"table-body\"></div></div></div>`;
      } else {
        html = `<div class=\"h-full bg-white flex flex-col font-sans\"><div class=\"bg-blue-600 p-4 text-white\"><h2 class=\"font-bold\">Staff Search</h2></div><div class=\"p-6\"><div class=\"flex gap-2 max-w-lg mb-6\"><input id=\"search-input\" type=\"text\" class=\"flex-1 border p-2 rounded\" placeholder=\"Search...\" /><button id=\"search-btn\" class=\"bg-blue-600 text-white px-4 rounded\">Search</button></div><div class=\"border rounded p-2\" id=\"table-body\"></div></div></div>`;
      }
    } else if (caseId === 'case_04' || caseId === 'story_04_idor') {
      html = `<div class="p-10 font-sans h-full bg-gray-50">
            <h2 class="text-2xl font-bold mb-4">Order Details</h2>
            <div class="bg-white p-6 rounded shadow">
                <h3 class="font-bold text-lg mb-2">Order #1001</h3>
                <p class="text-gray-600">Fetching details...</p>
                <button id="refresh-btn" class="mt-4 text-sm text-blue-500 hover:underline">Refresh Data</button>
            </div>
        </div>`;
    } else if (caseId === 'case_07') {
      html = `<div class="h-full bg-purple-50 flex items-center justify-center font-sans"><div class="bg-white p-8 rounded shadow text-center"><h2 class="text-2xl font-bold text-purple-900 mb-2">Discount</h2><div class="bg-gray-100 p-4 rounded mb-4"><input type="text" value="10%" disabled class="text-3xl font-bold text-center w-20 bg-transparent" /></div><button id="claim-btn" class="w-full bg-purple-600 text-white font-bold py-3 rounded">Claim</button><div id="result-area" class="mt-4 hidden"></div></div></div>`;
    } else if (caseId === 'case_08') {
      html = `<div class="h-full bg-slate-900 text-slate-300 font-mono p-8"><h1 class="text-3xl text-green-400 mb-4">API Docs</h1><div class="border border-slate-700 p-4 rounded"><h3 class="text-xl text-white">Admin Reset</h3><div class="bg-black p-2 rounded text-sm text-yellow-400 mt-2">POST /api/admin/reset-server</div><div class="mt-2 text-xs text-red-400">Header: x-confirm: true</div></div></div>`;
    } else if (caseId === 'case_05') {
      html = `<div class="h-full bg-white p-6 font-sans"><h1 class="text-2xl font-bold mb-4">Guestbook</h1><div id="comments" class="space-y-4 mb-8"><div class="border p-3 rounded bg-gray-50"><div class="font-bold text-xs text-blue-600">System</div><div>Welcome!</div></div></div><div class="border-t pt-4"><textarea id="comment-input" class="w-full border p-2 rounded mb-2" rows="3" placeholder="Leave a comment..."></textarea><button id="post-btn" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Post</button></div></div>`;
    } else if (caseId === 'case_15') {
      html = `<div class="h-full bg-slate-50 p-6 font-sans"><h1 class="text-2xl font-bold mb-4 text-slate-800">Secure Blog <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded border border-green-300 ml-2">WAF Enabled</span></h1><div id="comments-waf" class="space-y-4 mb-8"><div class="border p-3 rounded bg-white shadow-sm"><div class="font-bold text-xs text-slate-600">Admin</div><div>Security updated. Script tags are now blocked.</div></div></div><div class="border-t border-slate-200 pt-4"><textarea id="comment-input-waf" class="w-full border p-2 rounded mb-2" rows="3" placeholder="Protected comment section..."></textarea><button id="post-btn-waf" class="bg-slate-800 text-white px-4 py-2 rounded hover:bg-slate-700">Post Comment</button><div id="waf-msg" class="mt-2 text-xs h-4 text-red-500 font-bold"></div></div></div>`;
    } else if (caseId === 'case_06') {
      html = `<div class="p-10 font-sans"><h1 class="text-2xl font-bold mb-4">User Profile</h1><div class="bg-gray-100 p-4 rounded border"><div class="font-bold">Role: USER</div></div></div>`;
    }
    else if (caseId === 'case_16') {
      html = `<div class="h-full bg-gray-100 flex items-center justify-center font-sans"><div class="bg-white p-8 rounded shadow text-center border-t-4 border-red-500 w-full max-w-md"><h1 class="text-4xl font-bold text-red-600 mb-4">403</h1><h2 class="text-xl font-bold text-gray-800 mb-4">Access Denied</h2><p class="text-gray-600 mb-6">Your IP address is not authorized to access this internal resource.</p><div class="bg-gray-200 p-3 rounded font-mono text-sm text-gray-700">Allowed IP: 127.0.0.1 (Localhost)<br/>Your IP: 203.0.113.42</div></div></div>`;
    } else if (caseId === 'case_17') {
      html = `<div class="h-full bg-white p-10 font-sans flex flex-col items-center"><h1 class="text-3xl font-bold text-purple-700 mb-8">Voucher Redemption</h1><div class="w-full max-w-sm space-y-4"><div><label class="block text-sm font-bold text-gray-700 mb-2">Enter Code</label><input id="voucher-code" class="w-full border-2 border-purple-200 rounded-lg p-3 text-center text-xl uppercase tracking-widest focus:border-purple-500 outline-none transition-colors" placeholder="VIP-XX" /></div><button id="redeem-btn" class="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-lg shadow-purple-500/30">Redeem Now</button><div id="redeem-msg" class="text-center text-sm h-5 text-red-500 font-bold"></div></div></div>`;
    }
    else if (caseId === 'case_27') {
      html = `<div class="h-full bg-slate-900 text-green-500 font-mono flex items-center justify-center p-4"><div class="w-full max-w-md border border-green-800 bg-black p-6 rounded"><h1 class="text-xl mb-4 border-b border-green-800 pb-2">SECURE_LOGIN_V3</h1><p class="mb-4 text-sm text-green-700">Enter unique serial key to unlock.</p><input id="serial-input" class="w-full bg-slate-800 border border-green-700 text-white p-2 rounded mb-4 focus:outline-none focus:border-green-500" placeholder="Serial Key..." /><button id="serial-btn" class="w-full bg-green-900 text-green-400 border border-green-700 p-2 rounded hover:bg-green-800">AUTHENTICATE</button><div id="serial-msg" class="mt-2 text-xs h-4"></div></div></div>`;
    }
    // Add missing cases
    else if (caseId === 'case_10') {
      html = `<div class="h-full bg-white p-8 font-sans"><h1 class="text-2xl font-bold mb-4">Admin Panel</h1><div id="admin-content" class="p-4 border rounded bg-gray-50 text-gray-500">Access Denied. Current User: Guest</div><button id="check-access-btn" class="mt-4 bg-gray-800 text-white px-4 py-2 rounded">Access Admin Panel</button></div>`;
    }
    else if (caseId === 'case_18') {
      html = `<div class="h-full flex items-center justify-center bg-gray-100 font-sans"><div class="bg-white p-8 rounded shadow text-center"><h2 class="text-xl font-bold mb-4">Mobile App Download</h2><button id="download-btn" disabled class="bg-gray-300 text-gray-500 px-6 py-3 rounded font-bold cursor-not-allowed">Download (Mobile Only)</button><p class="text-xs text-red-500 mt-2">Desktop detected.</p></div></div>`;
    }
    else if (caseId === 'case_20') {
      html = `<div class="h-full flex items-center justify-center bg-blue-50 font-sans"><div class="bg-white p-8 rounded shadow text-center"><h2 class="text-xl font-bold mb-4 text-blue-800">Poll of the Year</h2><button id="vote-btn" class="bg-blue-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-blue-700">VOTE NOW</button><div id="vote-msg" class="mt-4 text-sm font-bold h-5"></div></div></div>`;
    }
    else if (caseId === 'case_21') {
      html = `<div class="h-full bg-gray-900 text-gray-300 p-6 font-mono"><h2 class="text-xl text-white mb-4 border-b border-gray-700 pb-2">System Logs</h2><div class="space-y-2 mb-4"><div class="text-xs">[INFO] System started</div><div class="text-xs text-yellow-500">[WARN] Memory high</div><div class="text-xs text-red-500">[ERR] Connection lost</div></div><button id="delete-logs-btn" class="bg-red-900/50 text-red-400 border border-red-800 px-4 py-2 rounded hover:bg-red-900">DELETE ALL LOGS</button></div>`;
    }
    else if (caseId === 'case_22') {
      html = `<div class="h-full bg-white p-8 font-sans"><h2 class="text-2xl font-bold mb-6 text-purple-800">User Search (GraphQL)</h2><div class="flex gap-2"><input id="gql-search" class="border-2 border-purple-200 rounded p-2 flex-1" placeholder="Username..." /><button id="gql-btn" class="bg-purple-600 text-white px-4 rounded font-bold">Search</button></div></div>`;
    }
    else if (caseId === 'case_26') {
      html = `<div class="h-full flex items-center justify-center bg-gray-100 font-sans"><div class="bg-white p-8 rounded shadow text-center max-w-md"><h2 class="text-2xl font-bold text-gray-800 mb-2">Software License</h2><div class="text-5xl mb-4">🔒</div><p class="text-red-500 font-bold mb-4">TRIAL EXPIRED</p><button id="check-license-btn" class="bg-gray-800 text-white px-6 py-2 rounded">Check License</button><div id="license-msg" class="mt-4 h-5"></div></div></div>`;
    }
    else if (caseId === 'case_28') {
      html = `<div class="h-full bg-black text-green-500 font-mono p-8 flex flex-col items-center justify-center"><h1 class="text-2xl mb-4 animate-pulse">SYSTEM INTEGRITY CHECK</h1><div id="sys-msg" class="text-red-500 text-sm">Debugger Detected. Execution Paused.</div><button id="sys-unlock-btn" disabled class="mt-8 border border-gray-700 text-gray-700 px-6 py-2 rounded cursor-not-allowed">SYSTEM LOCKED</button></div>`;
    }
    else if (caseId === 'case_29') {
      html = `<div class="h-full bg-slate-800 text-slate-200 flex items-center justify-center font-sans"><div class="p-8 border border-slate-600 rounded bg-slate-700/50"><h2 class="text-xl font-bold mb-4">Secure Data Transport</h2><p class="text-sm text-slate-400 mb-4">Sending encrypted payload...</p><button id="retry-hook-btn" class="bg-blue-600 text-white px-4 py-2 rounded text-sm">Retry Send</button></div></div>`;
    }
    else if (caseId === 'case_30') {
      html = `<div class="h-full bg-white p-8 font-sans flex items-center justify-center"><div class="w-full max-w-sm border p-6 rounded shadow-sm"><h2 class="text-lg font-bold mb-4">Cloud Portal</h2><button id="proto-login-btn" class="w-full bg-gray-200 text-gray-500 py-2 rounded font-bold">Login (Admin Only)</button></div></div>`;
    }
    else if (caseId === 'case_32' || caseId === 'case_33' || caseId === 'case_34') {
      html = `<div class="h-full flex items-center justify-center bg-gray-100 font-sans"><div class="bg-white p-8 rounded shadow text-center"><h2 class="text-xl font-bold mb-4">Reqable Test</h2><button id="reqable-test-btn" class="bg-yellow-500 text-black px-6 py-3 rounded font-bold">Trigger Request</button></div></div>`;
    }

    if (containerRef.current) containerRef.current.innerHTML = html;
  };

  useEffect(() => {
    if (containerRef.current) renderCase(activeCase.id);
  }, [activeCase]);

  // Listen for refresh prop changes to re-render
  useEffect(() => {
    if (containerRef.current) renderCase(activeCase.id);
  }, [onRefresh]);

  useEffect(() => {
    if (!containerRef.current) return;
    const handleClick = (e: MouseEvent) => {
      let target = e.target as HTMLElement | null;
      let id = target?.id || '';
      while (!id && target && target !== containerRef.current) {
        target = target.parentElement;
        id = target?.id || '';
      }
      if (!id) return;
      const now = Date.now();

      // Case 01 / Story 01
      if (id === 'login-btn' && (activeCase.id === 'case_01' || activeCase.id === 'story_01_login_outage')) {
        const msg = document.getElementById('msg-area');
        if (msg) { msg.style.display = 'block'; msg.innerText = "System Error"; }
        onNavigate({ id: crypto.randomUUID(), url: "https://api-legacy.corp/login", method: "POST", status: 500, type: "fetch", size: 0, time: 100, timestamp: now, requestHeaders: {}, responseHeaders: { "X-Error-Info": btoa("API Deprecated. Please use v2 endpoint: POST /api/v2/login") }, responseBody: "" });
      }
      // ... (Existing logic for 02, 03, 04, 05, 15, 07, 17, 24, 09, 27) ...
      if (id === 'buy-btn') {
        const msg = document.getElementById('shop-msg');
        if (msg) { msg.style.display = 'block'; msg.innerText = "Processing..."; }
        onNavigate({ id: crypto.randomUUID(), url: "https://shop.demo/api/checkout", method: "POST", status: 0, type: "fetch", size: 50, time: 80, timestamp: now, requestHeaders: { "Content-Type": "application/json" }, responseHeaders: {}, requestBody: JSON.stringify({ price: 2499.00, id: 101 }) });
      }
      if (id === 'metrics-logs-btn' && activeCase.id === 'story_05_metrics_misleading') {
        onNavigate({ id: crypto.randomUUID(), url: "https://metrics.corp/api/logs/orders", method: "GET", status: 0, type: "fetch", size: 0, time: 100, timestamp: now, requestHeaders: {}, responseHeaders: {}, responseBody: "" });
      }
      if (id === 'metrics-raw-btn' && activeCase.id === 'story_05_metrics_misleading') {
        onNavigate({ id: crypto.randomUUID(), url: "https://metrics.corp/metrics/raw", method: "GET", status: 0, type: "fetch", size: 0, time: 100, timestamp: now, requestHeaders: {}, responseHeaders: {}, responseBody: "" });
      }
      if (id === 'polyfill-fetch-btn' && activeCase.id === 'story_polyfill_ioc_capture') {
        onNavigate({ id: crypto.randomUUID(), url: "https://cdn.polyfill.io/v3/polyfill.min.js", method: "GET", status: 0, type: "fetch", size: 0, time: 120, timestamp: now, requestHeaders: { "User-Agent": "Mozilla/5.0 (iPhone; WeChat)" }, responseHeaders: {}, responseBody: "" });
      }
      if (id === 'polyfill-harvest-btn' && activeCase.id === 'story_polyfill_ioc_capture') {
        onNavigate({ id: crypto.randomUUID(), url: "https://analytics.polyfill.io/v1/collect", method: "POST", status: 0, type: "fetch", size: 150, time: 80, timestamp: now, requestHeaders: { "Content-Type": "application/json" }, responseHeaders: {}, requestBody: JSON.stringify({ beacon: 'exfiltration' }) });
      }
      if (id === 'tls-h2-btn' && activeCase.id === 'story_polyfill_tls_fallback') {
        onNavigate({ id: crypto.randomUUID(), url: "https://status.corp/api/tls/probe", method: "POST", status: 0, type: "fetch", size: 50, time: 90, timestamp: now, requestHeaders: { "X-Debug-Force-TLS": "h2" }, responseHeaders: {}, requestBody: JSON.stringify({ userAgent: 'Android 7.1' }) });
      }
      if (id === 'tls-fallback-btn' && activeCase.id === 'story_polyfill_tls_fallback') {
        onNavigate({ id: crypto.randomUUID(), url: "https://status.corp/api/tls/probe", method: "POST", status: 0, type: "fetch", size: 50, time: 90, timestamp: now, requestHeaders: { "X-Debug-Force-TLS": "http1", "Cache-Control": "no-cache" }, responseHeaders: {}, requestBody: JSON.stringify({ userAgent: 'Android 7.1' }) });
      }
      if (id === 'reqable-rule-btn' && activeCase.id === 'story_polyfill_reqable_rule') {
        const script = (document.getElementById('reqable-rule-editor') as HTMLTextAreaElement)?.value || '';
        onNavigate({ id: crypto.randomUUID(), url: "https://reqable.corp/api/rules/apply", method: "POST", status: 0, type: "fetch", size: script.length, time: 110, timestamp: now, requestHeaders: { "Content-Type": "application/json" }, responseHeaders: {}, requestBody: JSON.stringify({ rule: script }) });
      }
      if (id === 'cdn-validate-btn' && activeCase.id === 'story_polyfill_cdn_validation') {
        onNavigate({ id: crypto.randomUUID(), url: "https://self-cdn.corp/polyfill.min.js?purge_check=1", method: "GET", status: 0, type: "fetch", size: 0, time: 120, timestamp: now, requestHeaders: { "Cache-Control": "no-cache", "Pragma": "no-cache" }, responseHeaders: {}, responseBody: "" });
      }
      if (id === 'stacktrace-fetch-btn' && activeCase.id === 'story_06_stacktrace_leak') {
        onNavigate({ id: crypto.randomUUID(), url: "https://shop.demo/api/orders/error", method: "GET", status: 0, type: "fetch", size: 0, time: 100, timestamp: now, requestHeaders: {}, responseHeaders: {}, responseBody: "" });
      }
      if (id === 'waf-preview-btn' && activeCase.id === 'story_07_waf_callback') {
        onNavigate({ id: crypto.randomUUID(), url: "https://payments.corp/api/callback", method: "POST", status: 0, type: "fetch", size: 200, time: 120, timestamp: now, requestHeaders: { "Content-Type": "application/json" }, responseHeaders: {}, requestBody: JSON.stringify({ event: 'PAYMENT_SUCCESS', amount: 299 }) });
      }
      if (id === 'waf-allow-btn' && activeCase.id === 'story_07_waf_callback') {
        onNavigate({ id: crypto.randomUUID(), url: "https://payments.corp/api/callback", method: "POST", status: 0, type: "fetch", size: 200, time: 120, timestamp: now, requestHeaders: { "Content-Type": "application/json", "X-WAF-Allow": "callback" }, responseHeaders: {}, requestBody: JSON.stringify({ event: 'PAYMENT_SUCCESS', amount: 299 }) });
      }
      if (id === 'search-btn') {
        const input = (document.getElementById('search-input') as HTMLInputElement).value;
        onNavigate({ id: crypto.randomUUID(), url: `https://hr.corp/search?q=${encodeURIComponent(input)}`, method: "GET", status: 0, type: "fetch", size: 0, time: 100, timestamp: now, requestHeaders: {}, responseHeaders: {}, responseBody: "" });
      }
      if (id === 'refresh-btn') {
        onNavigate({ id: crypto.randomUUID(), url: "https://shop.demo/api/orders/1001", method: "GET", status: 200, type: "fetch", size: 450, time: 60, timestamp: now, requestHeaders: { "Cookie": "session=user_1001" }, responseHeaders: {}, responseBody: JSON.stringify({ id: 1001, item: "Mechanical Keyboard", price: 150, user: "Guest User", address: "123 Main St" }) });
      }
      if (id === 'post-btn' || id === 'post-btn-waf') {
        const inputId = activeCase.id === 'case_05' ? 'comment-input' : 'comment-input-waf';
        const val = (document.getElementById(inputId) as HTMLTextAreaElement).value;
        onNavigate({ id: crypto.randomUUID(), url: activeCase.id === 'case_05' ? "https://blog.site/api/comments" : "https://secure-blog.site/api/comments", method: "POST", status: 0, type: "fetch", size: val.length, time: 50, timestamp: now, requestHeaders: { "Content-Type": "application/json" }, responseHeaders: {}, requestBody: JSON.stringify({ comment: val }) });
      }
      if (id === 'claim-btn') {
        onNavigate({ id: crypto.randomUUID(), url: "https://promo.site/api/claim", method: "POST", status: 0, type: "fetch", size: 20, time: 50, timestamp: now, requestHeaders: { "Content-Type": "application/json" }, responseHeaders: {}, requestBody: JSON.stringify({ discount: "10" }) });
      }
      if (id === 'redeem-btn') {
        const code = (document.getElementById('voucher-code') as HTMLInputElement).value;
        onNavigate({ id: crypto.randomUUID(), url: "https://shop.demo/api/redeem", method: "POST", status: 0, type: "fetch", size: code.length, time: 80, timestamp: now, requestHeaders: { "Content-Type": "application/json" }, responseHeaders: {}, requestBody: JSON.stringify({ code }) });
      }
      if (id === 'upload-btn') { // Assuming logic from previous state
        onNavigate({ id: crypto.randomUUID(), url: "https://upload.demo/api/upload", method: "POST", status: 400, type: "fetch", size: 500, time: 300, timestamp: now, requestHeaders: { "Content-Type": "application/x-php" }, responseHeaders: {}, responseBody: JSON.stringify({ error: "Invalid file type. Allowed: image/jpeg, image/png" }), requestBody: "<php>system('ls')</php>" });
      }
      if (id === 'r-login-btn') {
        const user = (document.getElementById('r-user') as HTMLInputElement).value;
        const pass = (document.getElementById('r-pass') as HTMLInputElement).value;
        if (user === 'admin' && pass === 'SuperAdmin2025') {
          onNavigate({ id: crypto.randomUUID(), url: "https://admin.local/dashboard", method: "GET", status: 200, type: "document", size: 1200, time: 200, timestamp: now, requestHeaders: {}, responseHeaders: {}, responseBody: "Welcome Admin" });
        }
      }
      if (id === 'serial-btn') {
        const input = (document.getElementById('serial-input') as HTMLInputElement).value;
        onNavigate({ id: crypto.randomUUID(), url: "https://crackme.local/verify", method: "POST", status: 0, type: "fetch", size: 10, time: 150, timestamp: now, requestHeaders: {}, responseHeaders: {}, requestBody: JSON.stringify({ serial: input }) });
      }

      // --- MISSING HANDLERS RESTORED ---
      if (id === 'check-access-btn' && activeCase.id === 'case_10') {
        // This is a client-side logic case, but we can simulate a check
        onNavigate({ id: crypto.randomUUID(), url: "https://app.local/api/check_access", method: "GET", status: 403, type: "fetch", size: 0, time: 50, timestamp: now, requestHeaders: {}, responseHeaders: {}, responseBody: JSON.stringify({ error: "Admin Access Required" }) });
      }
      if (id === 'download-btn' && activeCase.id === 'case_18') {
        onNavigate({ id: crypto.randomUUID(), url: "https://app-store.demo/api/download", method: "GET", status: 403, type: "fetch", size: 0, time: 60, timestamp: now, requestHeaders: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0)" }, responseHeaders: {}, responseBody: JSON.stringify({ error: "Desktop not supported" }) });
      }
      if (id === 'vote-btn' && activeCase.id === 'case_20') {
        onNavigate({ id: crypto.randomUUID(), url: "https://poll.demo/api/vote", method: "POST", status: 403, type: "fetch", size: 0, time: 70, timestamp: now, requestHeaders: { "Cookie": "voted=true" }, responseHeaders: {}, responseBody: JSON.stringify({ error: "Already voted" }) });
      }
      if (id === 'delete-logs-btn' && activeCase.id === 'case_21') {
        onNavigate({ id: crypto.randomUUID(), url: "https://admin.logs/api/logs", method: "GET", status: 200, type: "fetch", size: 0, time: 100, timestamp: now, requestHeaders: {}, responseHeaders: {}, responseBody: JSON.stringify({ msg: "Logs retrieved (Read Only)" }) });
      }
      if (id === 'gql-btn' && activeCase.id === 'case_22') {
        const val = (document.getElementById('gql-search') as HTMLInputElement).value;
        onNavigate({ id: crypto.randomUUID(), url: "https://api.graphql/search", method: "POST", status: 200, type: "fetch", size: val.length, time: 120, timestamp: now, requestHeaders: { "Content-Type": "application/json" }, responseHeaders: {}, requestBody: JSON.stringify({ query: `{ search(term: "${val}") { id, name } }` }) });
      }
      if (id === 'check-license-btn' && activeCase.id === 'case_26') {
        // Client-side logic mainly, but simulate server check
        // Logic handled in console command mostly, but clicking refreshes state
        onRefresh();
      }
      if (id === 'retry-hook-btn' && activeCase.id === 'case_29') {
        // Trigger logic
        const script = document.createElement('script');
        script.textContent = `if(window.submitData) window.submitData("FLAG-" + Math.floor(Math.random() * 9999));`;
        document.body.appendChild(script);
      }
      if (id === 'proto-login-btn' && activeCase.id === 'case_30') {
        // This button changes text if success, no network needed for success visual, but let's fire one
        onNavigate({ id: crypto.randomUUID(), url: "https://cloud.local/api/login", method: "POST", status: 403, type: "fetch", size: 0, time: 80, timestamp: now, requestHeaders: {}, responseHeaders: {}, responseBody: JSON.stringify({ error: "Admin privilege required" }) });
      }
      if (id === 'reqable-test-btn') {
        let url = "https://reqable.test/api/status";
        if (activeCase.id === 'case_33') url = "https://reqable.test/api/license";
        if (activeCase.id === 'case_34') url = "https://reqable.test/assets/config.js";

        onNavigate({ id: crypto.randomUUID(), url, method: "GET", status: 200, type: activeCase.id === 'case_34' ? 'script' : 'fetch', size: 100, time: 60, timestamp: now, requestHeaders: {}, responseHeaders: {}, responseBody: JSON.stringify({ status: "ok" }) });
      }
    };

    containerRef.current.addEventListener('click', handleClick);
    return () => containerRef.current?.removeEventListener('click', handleClick);
  }, [activeCase, onNavigate, onRefresh]);

  return (
    <div className="flex-1 overflow-hidden relative" ref={containerRef} onContextMenu={handleContextMenu}>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
          actions={[
            { label: 'Back', onClick: () => { }, icon: ArrowLeft, shortcut: 'Alt+Left', disabled: true },
            { label: 'Forward', onClick: () => { }, icon: ArrowRight, shortcut: 'Alt+Right', disabled: true },
            { label: 'Reload', onClick: onRefresh, icon: RotateCw, shortcut: 'Ctrl+R' },
            { separator: true, label: '', onClick: () => { } },
            { label: 'Save As...', onClick: () => { }, icon: Save, shortcut: 'Ctrl+S', disabled: true },
            { label: 'Print...', onClick: () => { }, icon: Printer, shortcut: 'Ctrl+P', disabled: true },
            { separator: true, label: '', onClick: () => { } },
            { label: 'Inspect', onClick: onOpenDevTools, icon: Code, shortcut: 'Ctrl+Shift+I' },
          ]}
        />
      )}
    </div>
  );
}
