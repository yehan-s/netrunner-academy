
import React, { useState } from 'react';
import { Book, ChevronRight, ExternalLink, Lightbulb, Shield, Zap, Code2, Terminal, Play, Layers, PenTool } from 'lucide-react';

interface DocsViewerProps {
  onNavigateToLevel: (caseId: string) => void;
}

const DOCS_MENU = [
  {
    title: '快速入门',
    items: [
      { id: 'intro', title: '抓包技术简介' },
      { id: 'devtools-vs-proxy', title: 'DevTools vs 抓包工具' },
    ]
  },
  {
    title: 'Reqable 核心功能',
    items: [
      { id: 'traffic-analysis', title: '流量分析基础' },
      { id: 'composer', title: 'API 构造器 (Composer)' },
      { id: 'breakpoints', title: '断点与拦截 (Breakpoints)' },
      // { id: 'rewriting', title: '脚本与重写 (Scripting)' }, // Placeholder for future content
    ]
  },
  {
    title: '安全攻防概念',
    items: [
      { id: 'idor', title: '越权访问 (IDOR)' },
      { id: 'xss', title: 'XSS 与 WAF 绕过' },
      { id: 'jwt', title: 'JWT 令牌攻击' },
    ]
  }
];

export const DocsViewer: React.FC<DocsViewerProps> = ({ onNavigateToLevel }) => {
  const [activeDoc, setActiveDoc] = useState('intro');

  const renderContent = () => {
    switch(activeDoc) {
      case 'intro':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h1 className="text-4xl font-bold text-white mb-4">网络抓包技术简介</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              网络抓包 (Network Sniffing) 是指捕获并检查网络上流动的数据包的技术。对于前端工程师和安全研究员来说，这通常特指分析浏览器与服务器之间的 <strong>HTTP/HTTPS 流量</strong>。
            </p>
            
            <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r">
              <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-2"><Lightbulb size={18}/> 为什么要学抓包？</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-300">
                <li><strong>故障排查 (Debugging):</strong> 精确了解前端发送了什么数据，后端返回了什么错误。</li>
                <li><strong>安全审计 (Security):</strong> 发现敏感数据泄露、越权访问 (IDOR) 和认证缺陷。</li>
                <li><strong>逆向工程 (Reverse Engineering):</strong> 分析第三方未公开的 API 接口逻辑。</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-white mt-8 border-b border-gray-700 pb-2">NetRunner 模拟系统</h2>
            <p className="text-gray-300">
              NetRunner 提供了一个虚拟的操作系统环境，你可以同时使用两种核心工具：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
               <div className="bg-[#252526] p-4 rounded border border-[#333]">
                  <div className="flex items-center gap-2 text-blue-400 font-bold mb-2"><Terminal size={16}/> Chrome DevTools</div>
                  <p className="text-sm text-gray-400">擅长查看 DOM 结构、Console 日志和基础的网络请求查看。</p>
               </div>
               <div className="bg-[#252526] p-4 rounded border border-[#333]">
                  <div className="flex items-center gap-2 text-yellow-400 font-bold mb-2"><Zap size={16}/> Reqable 模拟器</div>
                  <p className="text-sm text-gray-400">系统级代理工具。擅长高级拦截、断点调试、请求重写和脚本自动化。</p>
               </div>
            </div>
            
            <div className="mt-8">
               <button onClick={() => onNavigateToLevel('case_01')} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors">
                  <Play size={18} /> 开始第一课：API 协议分析
               </button>
            </div>
          </div>
        );
      
      case 'devtools-vs-proxy':
         return (
            <div className="space-y-6 animate-in fade-in duration-300">
               <h1 className="text-3xl font-bold text-white">DevTools vs 专业抓包工具</h1>
               <p className="text-gray-300">
                  初学者常见的问题是：<em>"既然我有 Chrome 自带的 Network 面板，为什么还需要 Reqable / Charles / Fiddler？"</em>
               </p>
               
               <table className="w-full text-left border-collapse mt-4">
                  <thead>
                     <tr className="border-b border-gray-700 text-gray-400 text-sm uppercase">
                        <th className="py-2">功能特性</th>
                        <th className="py-2 text-blue-400">Chrome DevTools</th>
                        <th className="py-2 text-yellow-400">Reqable / Proxy</th>
                     </tr>
                  </thead>
                  <tbody className="text-gray-300 text-sm">
                     <tr className="border-b border-gray-800"><td className="py-3 font-bold">可视范围</td><td className="py-3">仅当前浏览器标签页</td><td className="py-3">系统全局 (App, 小程序, 所有浏览器)</td></tr>
                     <tr className="border-b border-gray-800"><td className="py-3 font-bold">请求修改</td><td className="py-3">有限 (仅支持重放 Fetch/XHR)</td><td className="py-3">完全控制 (修改 Body, Header, Method)</td></tr>
                     <tr className="border-b border-gray-800"><td className="py-3 font-bold">拦截能力</td><td className="py-3">无 (只读模式)</td><td className="py-3">支持断点 (Breakpoints) 暂停请求</td></tr>
                     <tr className="border-b border-gray-800"><td className="py-3 font-bold">脚本扩展</td><td className="py-3">JS 控制台</td><td className="py-3">Python/JS 中间件脚本</td></tr>
                  </tbody>
               </table>
            </div>
         );

      case 'composer':
          return (
            <div className="space-y-6 animate-in fade-in duration-300">
               <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <PenTool className="text-yellow-400"/> API 构造器 (Composer)
               </h1>
               <p className="text-gray-300">
                  <strong>Composer</strong> 是你的实验台。它允许你“凭空”构造 HTTP 请求，或者基于已捕获的请求进行“篡改”和“重发”。
               </p>

               <h3 className="text-xl font-bold text-white mt-6">核心能力</h3>
               <ul className="list-disc pl-5 space-y-2 text-gray-300">
                  <li><strong>方法篡改 (Method Tampering):</strong> 比如将前端限制的 <code>GET</code> 请求改为 <code>DELETE</code> 来尝试删除数据。</li>
                  <li><strong>载荷伪造 (Payload Crafting):</strong> 手动编写 JSON Body，绕过前端表单的校验逻辑。</li>
                  <li><strong>头注入 (Header Injection):</strong> 添加伪造的 Header，如 <code>X-Forwarded-For</code> (伪造 IP) 或 <code>Referer</code> (绕过防盗链)。</li>
               </ul>

               <div className="bg-[#1e1e1e] border border-yellow-900/30 p-6 rounded-lg mt-6">
                  <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2"><Terminal size={16}/> 实战演练</h4>
                  <p className="text-sm text-gray-400 mb-4">
                     在 <strong>Case 02</strong> 中，你需要用 1 元钱买下昂贵的笔记本电脑。这在浏览器界面上是不可能的，但使用 Composer 修改请求体就能轻松实现。
                  </p>
                  <button onClick={() => onNavigateToLevel('case_02')} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors">
                     启动关卡 02：价格篡改
                  </button>
               </div>
            </div>
          );

      case 'breakpoints':
          return (
            <div className="space-y-6 animate-in fade-in duration-300">
               <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Shield className="text-red-400"/> 断点与拦截 (Breakpoints)
               </h1>
               <p className="text-gray-300">
                  断点功能允许你拥有 <strong>暂停时间</strong> 的能力。你可以在请求离开你的电脑之前拦截它，修改它，然后再放行。
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                      <h3 className="text-lg font-bold text-white mb-2">请求断点 (Request)</h3>
                      <p className="text-sm text-gray-400">在发送给服务器之前暂停。用于绕过前端验证、修改上传文件内容等。</p>
                  </div>
                  <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                      <h3 className="text-lg font-bold text-white mb-2">响应断点 (Response)</h3>
                      <p className="text-sm text-gray-400">在浏览器收到数据之前暂停。用于伪造服务器响应、测试前端对错误代码的处理。</p>
                  </div>
               </div>

               <div className="bg-red-900/20 border border-red-500/30 p-4 rounded mt-6">
                  <p className="text-red-200 text-sm font-mono">
                     <strong>任务目标:</strong> 在 Case 07 中，前端锁死了折扣比例。使用断点拦截请求，将 "10%" 改为 "100%"。
                  </p>
                  <button onClick={() => onNavigateToLevel('case_07')} className="mt-3 text-red-400 hover:text-red-300 text-sm font-bold flex items-center gap-1 transition-colors">
                     前往练习断点操作 <ChevronRight size={14}/>
                  </button>
               </div>
            </div>
          );
      
      case 'traffic-analysis':
          return (
            <div className="space-y-6 animate-in fade-in duration-300">
               <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Layers className="text-blue-400"/> 流量分析基础
               </h1>
               <p className="text-gray-300">
                  学会“阅读”HTTP 流量是第一步。在 Reqable 的列表中，每一行都代表一次完整的请求与响应交互。
               </p>
               <ul className="space-y-4 mt-4 text-gray-300">
                   <li className="bg-[#161b22] p-3 rounded border border-[#30363d]">
                       <div className="font-bold text-white mb-1">Method (方法)</div>
                       <div>GET (获取), POST (提交), PUT (更新), DELETE (删除)。颜色通常用于区分它们。</div>
                   </li>
                   <li className="bg-[#161b22] p-3 rounded border border-[#30363d]">
                       <div className="font-bold text-white mb-1">Status Code (状态码)</div>
                       <div>
                           <span className="text-green-400 font-mono mr-2">2xx</span> 成功<br/>
                           <span className="text-yellow-400 font-mono mr-2">3xx</span> 重定向<br/>
                           <span className="text-red-400 font-mono mr-2">4xx</span> 客户端错误 (如 403 Forbidden)<br/>
                           <span className="text-red-500 font-mono mr-2">5xx</span> 服务器错误
                       </div>
                   </li>
               </ul>
            </div>
          );

      case 'idor':
          return (
              <div className="space-y-6 animate-in fade-in duration-300">
                  <h1 className="text-3xl font-bold text-white">越权访问 (IDOR)</h1>
                  <p className="text-gray-300">
                      <strong>Insecure Direct Object References</strong> 是最常见的逻辑漏洞之一。它发生在应用程序直接暴露了对象的内部 ID（如订单号、用户 ID），且后端没有验证请求者是否拥有该对象的访问权限。
                  </p>
                  <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-4">
                      <h4 className="text-yellow-400 font-bold">典型场景</h4>
                      <p className="text-gray-400 text-sm mt-1">
                          你的 URL 是 <code>/api/orders/1001</code>。你只需要把 <code>1001</code> 改为 <code>1002</code>，就能看到别人的订单。
                      </p>
                  </div>
                  <button onClick={() => onNavigateToLevel('case_04')} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold text-sm transition-colors">
                      实战 Case 04：简单的 IDOR
                  </button>
              </div>
          );
      
      case 'xss':
          return (
              <div className="space-y-6 animate-in fade-in duration-300">
                  <h1 className="text-3xl font-bold text-white">XSS 与 WAF 绕过</h1>
                  <p className="text-gray-300">
                      <strong>跨站脚本攻击 (XSS)</strong> 允许攻击者在受害者的浏览器中执行恶意 JavaScript。这通常用于窃取 Cookie、Session 令牌或重定向用户。
                  </p>
                  <h3 className="text-xl font-bold text-white mt-4">WAF (Web Application Firewall)</h3>
                  <p className="text-gray-300">
                      防火墙通常通过黑名单来防御 XSS，例如拦截 <code>&lt;script&gt;</code> 标签。但黑客可以使用替代标签（如 <code>&lt;img&gt;</code>, <code>&lt;svg&gt;</code>）或事件处理器（<code>onerror</code>, <code>onload</code>）来绕过检测。
                  </p>
                  <button onClick={() => onNavigateToLevel('case_15')} className="mt-4 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold text-sm transition-colors">
                      实战 Case 15：WAF 绕过挑战
                  </button>
              </div>
          );

      case 'jwt':
          return (
              <div className="space-y-6 animate-in fade-in duration-300">
                  <h1 className="text-3xl font-bold text-white">JWT 令牌攻击</h1>
                  <p className="text-gray-300">
                      <strong>JSON Web Token (JWT)</strong> 是现代 Web 应用常用的认证方式。它由 Header, Payload, Signature 三部分组成。
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-2">
                      <li><strong>None 算法攻击:</strong> 某些库允许 Header 中声明 <code>alg: "none"</code>，从而跳过签名验证。</li>
                      <li><strong>弱密钥破解:</strong> 如果签名密钥太简单，可以被暴力破解。</li>
                      <li><strong>未校验签名:</strong> 开发者在代码中可能忘记验证签名，只解码了 Payload。</li>
                  </ul>
                  <button onClick={() => onNavigateToLevel('case_13')} className="mt-4 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold text-sm transition-colors">
                      实战 Case 13：None 算法漏洞
                  </button>
              </div>
          );

      default:
        return <div className="text-gray-500 flex items-center justify-center h-64">请从左侧菜单选择一个主题</div>;
    }
  };

  return (
    <div className="h-full flex bg-[#0d1117] text-gray-300 font-sans">
      {/* Sidebar */}
      <div className="w-64 border-r border-[#30363d] bg-[#0d1117] flex flex-col shrink-0">
         <div className="p-6 border-b border-[#30363d]">
             <h2 className="text-lg font-bold text-white flex items-center gap-2">
                 <Book size={20} className="text-blue-500"/>
                 NetRunner 学院
             </h2>
             <p className="text-xs text-gray-500 mt-1">官方文档中心</p>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
             {DOCS_MENU.map((section, idx) => (
                 <div key={idx}>
                     <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">{section.title}</h3>
                     <div className="space-y-1">
                         {section.items.map(item => (
                             <button
                                key={item.id}
                                onClick={() => setActiveDoc(item.id)}
                                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                                    activeDoc === item.id 
                                    ? 'bg-blue-500/10 text-blue-400 font-medium' 
                                    : 'text-gray-400 hover:bg-[#161b22] hover:text-gray-200'
                                }`}
                             >
                                 {item.title}
                             </button>
                         ))}
                     </div>
                 </div>
             ))}
         </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-[#0d1117] custom-scrollbar">
          <div className="max-w-4xl mx-auto py-12 px-10">
              {renderContent()}
          </div>
      </div>
    </div>
  );
};
