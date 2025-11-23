
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
                <img src="https://www.google.com/favicon.ico" className="w-3 h-3 opacity-50"/>
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
                <ChevronLeft size={16} className="cursor-pointer hover:text-gray-700"/>
                <ChevronRight size={16} className="cursor-pointer hover:text-gray-700"/>
                <RefreshCw size={14} className={`cursor-pointer hover:text-gray-700 transition-transform duration-500 ${isRefreshing ? 'animate-spin text-blue-500' : 'hover:rotate-180'}`} onClick={onRefresh}/>
            </div>
            <div className="flex-1 bg-[#f1f3f4] rounded-full h-7 flex items-center px-4 text-xs text-gray-700 min-w-0">
                <span className="text-gray-400 mr-2 shrink-0">🔒</span>
                <span className="flex-1 truncate">{currentUrl}</span>
                <Star size={12} className="text-gray-400 shrink-0 ml-2 cursor-pointer hover:text-yellow-400"/>
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
                                <ChevronRight size={14}/>
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

interface VirtualBrowserProps {
  activeCase: CaseStudy;
  onNavigate: (request: NetworkRequest) => void;
  onRefresh: () => void;
}

export const VirtualBrowser: React.FC<VirtualBrowserProps> = ({ activeCase, onNavigate, onRefresh }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const renderCase = (caseId: string) => {
    let html = '';

    if (caseId === 'case_01') {
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
    } else if (caseId === 'case_02') {
        html = `<div class="h-full bg-gray-100 p-6 font-sans"><div class="bg-white p-6 rounded shadow max-w-2xl mx-auto"><h2 class="text-2xl font-bold text-gray-800">Laptop</h2><div class="text-right mb-4"><span class="text-3xl font-bold text-gray-900">$2,499.00</span></div><div class="flex justify-end gap-4 items-center"><div class="text-sm text-gray-600">Balance: <span class="text-red-500 font-bold">$50.00</span></div><button id="buy-btn" class="bg-black text-white px-6 py-2 rounded font-bold">Checkout</button></div><div id="shop-msg" class="mt-4 hidden text-sm"></div></div></div>`;
    } else if (caseId === 'case_03') {
        html = `<div class="h-full bg-white flex flex-col font-sans"><div class="bg-blue-600 p-4 text-white"><h2 class="font-bold">Staff Search</h2></div><div class="p-6"><div class="flex gap-2 max-w-lg mb-6"><input id="search-input" type="text" class="flex-1 border p-2 rounded" placeholder="Search..." /><button id="search-btn" class="bg-blue-600 text-white px-4 rounded">Search</button></div><div class="border rounded p-2" id="table-body"></div></div></div>`;
    } else if (caseId === 'case_04') {
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
        const target = e.target as HTMLElement;
        const id = target.id;
        const now = Date.now();

        // Case 01
        if (id === 'login-btn' && activeCase.id === 'case_01') {
             const msg = document.getElementById('msg-area');
             if(msg) { msg.style.display = 'block'; msg.innerText = "System Error"; }
             onNavigate({ id: crypto.randomUUID(), url: "https://api-legacy.corp/login", method: "POST", status: 500, type: "fetch", size: 0, time: 100, timestamp: now, requestHeaders: {}, responseHeaders: {"X-Error-Info": btoa("API Deprecated. Please use v2 endpoint: POST /api/v2/login")}, responseBody: "" });
        }
        // ... (Existing logic for 02, 03, 04, 05, 15, 07, 17, 24, 09, 27) ...
        if (id === 'buy-btn') {
             const msg = document.getElementById('shop-msg');
             if(msg) { msg.style.display = 'block'; msg.innerText = "Processing..."; }
             onNavigate({ id: crypto.randomUUID(), url: "https://shop.demo/api/checkout", method: "POST", status: 0, type: "fetch", size: 50, time: 80, timestamp: now, requestHeaders: { "Content-Type": "application/json" }, responseHeaders: {}, requestBody: JSON.stringify({ price: 2499.00, id: 101 }) });
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

  return <div className="flex-1 overflow-hidden relative" ref={containerRef}></div>;
}
