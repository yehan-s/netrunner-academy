
import { CaseStudy } from './types';

export const CASE_STUDIES: CaseStudy[] = [
  // --- BASICS ---
  {
    id: 'case_01',
    title: "API 协议分析与构造",
    category: 'Basics',
    difficulty: 'Beginner',
    description: "用户反馈登录功能彻底损坏。浏览器只显示模糊的错误信息。你需要使用抓包工具 (Reqable) 捕获底层的错误详情，解码线索，并手动构造一个修复后的请求。",
    initialUrl: "https://api-legacy.corp/login",
    learningObjectives: [
      "理解浏览器 DevTools 与专业抓包工具的区别",
      "查看 Response Headers 中的隐蔽信息",
      "Base64 解码分析",
      "使用 Composer (构造器) 手动测试 API"
    ],
    guideSteps: [
      {
        title: "1. 启动抓包工具",
        content: "打开 Chrome 浏览器并进入目标登录页面，按 F12 打开 DevTools，切换到 **Network** 面板；同时点击底部 Dock 栏的 **Reqable** 图标启动抓包工具，保持它在后台运行（或使用分屏模式）。"
      },
      {
        title: "2. 捕获错误",
        content: "在浏览器中点击 **'Login'**，观察 Chrome DevTools 的 Network 列表，确认有登录请求发出并且状态码为 500。然后切换到 **Reqable**，在流量列表中找到同一条 500 错误请求。"
      },
      {
        title: "3. 寻找线索",
        content: "在 Reqable 中点击该请求，查看 **Headers/Response** 面板。注意响应头里的 `X-Error-Info` 字段，它看起来是一串 Base64 编码的字符串。"
      },
      {
        title: "4. 解码与构造",
        content: "使用任意可信的 Base64 解码工具（或你熟悉的脚本/命令行）解码 `X-Error-Info` 字段，得到新接口地址。然后在 Reqable 中将这条请求发送到 **Compose/Composer** 编辑器，调整 URL 和必要参数，点击发送按钮重新构造请求，直到收到成功响应。"
      }
    ]
  },
  
  // --- SECURITY ---
  {
    id: 'case_02',
    title: "逻辑漏洞：价格篡改",
    category: 'Security',
    difficulty: 'Intermediate',
    description: "这是一个测试环境的电商支付接口。开发人员犯了一个严重错误：信任了前端发送的价格数据。你的任务是以 1 元的价格买下原本昂贵的商品。",
    initialUrl: "https://shop.demo/checkout",
    learningObjectives: [
      "理解“永远不要信任客户端”原则",
      "使用 Composer 修改请求体",
      "理解 API 接口的数据结构"
    ],
    guideSteps: [
      {
        title: "1. 捕获请求",
        content: "在浏览器中打开结算页面，使用 Chrome DevTools 的 **Network** 面板监控网络请求，然后点击 **“立即支付”**，确认有一个带有价格字段的支付请求被发送。"
      },
      {
        title: "2. 发送至构造器",
        content: "保证浏览器流量经过 Reqable 代理，重复点击 **“立即支付”**，在 Reqable 流量列表中找到对应请求，将其发送到 Compose/Composer 编辑器，并确认请求体为 JSON 格式。"
      },
      {
        title: "3. 篡改并发送",
        content: "根据 Reqable 官方 Body 文档，在 Body 编辑器中修改 JSON 请求体里的 `price` 字段为 `1`（保持 JSON 语法有效），然后点击发送按钮重放请求；如果后端信任客户端价格，你会收到 200 OK 和订单确认信息，这就是典型的 Web Parameter Tampering 逻辑漏洞。"
      }
    ]
  },
  {
    id: 'case_03',
    title: "SQL 注入基础",
    category: 'Security',
    difficulty: 'Intermediate',
    description: "员工搜索接口存在经典的 SQL 注入漏洞。我们可以通过构造特殊的输入，让数据库执行我们要的命令。",
    initialUrl: "https://hr.corp/search",
    learningObjectives: [
      "识别 URL 参数中的查询点",
      "理解 SQL 拼接漏洞原理",
      "通过 Network 观察全量数据泄露"
    ],
    guideSteps: [
      {
        title: "1. 正常搜索",
        content: "尝试搜索 'Alice'。观察 Network 中的请求 URL，参数 `q=Alice` 被发送到了服务器。"
      },
      {
        title: "2. 注入测试",
        content: "尝试输入 `' OR '1'='1`。这段代码试图闭合原本的 SQL 查询引号，并添加一个永远为真的条件。"
      },
      {
        title: "3. 验证结果",
        content: "如果漏洞利用成功，服务器可能会返回数据库中的**所有**员工记录，而不仅仅是被搜索的那个人。检查 Response 看看有没有意外收获。"
      }
    ]
  },
  {
    id: 'case_04',
    title: "越权访问 (IDOR)",
    category: 'Security',
    difficulty: 'Intermediate',
    description: "你正在查看自己的订单详情。URL 中包含了一个数字 ID。如果修改这个 ID，服务器会校验你的身份吗？",
    initialUrl: "https://shop.demo/orders/1001",
    learningObjectives: [
      "识别 IDOR (Insecure Direct Object Reference) 漏洞",
      "观察 RESTful API 的 URL 结构",
      "通过修改 URL 参数访问未授权数据"
    ],
    guideSteps: [
      {
        title: "1. 观察当前请求",
        content: "页面加载时，在浏览器 DevTools 的 Network 面板中观察订单详情接口（例如 `GET /api/orders/1001`），确认 URL 中的数值 ID 与当前订单对应。"
      },
      {
        title: "2. 使用构造器",
        content: "确保流量经过 Reqable 代理，捕获同一条订单详情请求，并将其发送到 Reqable 的 Compose/Composer 编辑器。"
      },
      {
        title: "3. 重放攻击",
        content: "在 Reqable 中仅修改 URL 中的订单 ID，将 `1001` 改为 `1002` 并发送请求。如果服务器没有做访问控制校验，你会在响应中看到其他用户的订单数据，这就是 OWASP 文档中定义的 IDOR 漏洞。"
      }
    ]
  },

  // --- DEBUGGING ---
  {
    id: 'case_16',
    title: "Header 伪造：IP 限制绕过",
    category: 'Debugging',
    difficulty: 'Intermediate',
    description: "管理后台只允许从公司内网 (127.0.0.1) 访问。但服务器判断 IP 的方式存在缺陷，它信任了 HTTP Header。尝试使用 Reqable 伪造请求头来绕过限制。",
    initialUrl: "https://admin-internal.corp/manage",
    learningObjectives: [
      "理解 HTTP Headers 的作用",
      "学习常见的 IP 伪造头 (X-Forwarded-For)",
      "使用 Composer 添加自定义 Header"
    ],
    guideSteps: [
      {
        title: "1. 访问受限页面",
        content: "尝试访问页面，你会收到 403 Forbidden，提示 'External IP Denied'。"
      },
      {
        title: "2. 发送至构造器",
        content: "在 Reqable 中找到该 403 请求，发送到 **Composer**。"
      },
      {
        title: "3. 伪造 IP",
        content: "在 Headers 区域，手动添加一行：`X-Forwarded-For: 127.0.0.1`。"
      },
      {
        title: "4. 发送验证",
        content: "发送请求。如果服务器信任此 Header，你将看到 'Welcome Admin' 的响应。"
      }
    ]
  },
  {
    id: 'case_18',
    title: "Header 伪造：User-Agent",
    category: 'Debugging',
    difficulty: 'Intermediate',
    description: "该应用下载页面检测到你是桌面浏览器，因此禁用了下载按钮。你需要将自己伪装成移动设备（iPhone 或 Android）来欺骗服务器。",
    initialUrl: "https://app-store.demo/download",
    learningObjectives: [
      "理解 User-Agent (UA) 的作用",
      "识别移动端 UA 标识",
      "通过抓包工具伪装客户端身份"
    ],
    guideSteps: [
      {
        title: "1. 触发请求",
        content: "点击页面上的下载按钮，提示 'Desktop not supported'。"
      },
      {
        title: "2. 编辑请求",
        content: "在 Reqable 中找到该请求，发送到 **Composer**。"
      },
      {
        title: "3. 修改 UA",
        content: "找到 `User-Agent` 头。将其值修改为包含 `iPhone` 或 `Android` 的字符串 (例如: `Mozilla/5.0 (iPhone; CPU iPhone OS 15_0...)`)。"
      },
      {
        title: "4. 验证",
        content: "发送请求。如果成功，服务器将返回 200 OK 和下载链接。"
      }
    ]
  },
  {
    id: 'case_19',
    title: "Header 伪造：Referer 防盗链",
    category: 'Debugging',
    difficulty: 'Intermediate',
    description: "你发现了一张机密图片，但直接访问时服务器返回 403。这是因为服务器开启了 Referer 校验（防盗链），只允许来自合作伙伴网站的请求。",
    initialUrl: "https://cdn.secure/secret-image.jpg",
    learningObjectives: [
      "理解 Referer 头的含义与安全风险",
      "绕过图片/资源的防盗链机制",
      "伪造来源网站"
    ],
    guideSteps: [
      {
        title: "1. 尝试访问",
        content: "页面显示图片破损图标。Reqable 中显示 403 Forbidden。"
      },
      {
        title: "2. 分析原因",
        content: "Response 显示错误信息：'Access denied. Requests must originate from partner-site.com'。"
      },
      {
        title: "3. 伪造来源",
        content: "在 Composer 中，添加 Header: `Referer: https://partner-site.com`。"
      },
      {
        title: "4. 获取资源",
        content: "发送请求。你应该能看到 200 OK，Body 中包含图片数据。"
      }
    ]
  },
  {
    id: 'case_20',
    title: "Cookie 操控：刷票脚本",
    category: 'Debugging',
    difficulty: 'Intermediate',
    description: "这个投票系统通过 Cookie 来记录用户是否已经投过票。通过分析和修改 Cookie，你可以实现无限刷票。",
    initialUrl: "https://poll.demo/vote",
    learningObjectives: [
      "理解 Cookie 在状态保持中的作用",
      "在请求中识别和修改 Cookie",
      "利用 Cookie 逻辑漏洞"
    ],
    guideSteps: [
      {
        title: "1. 首次投票",
        content: "点击 Vote 按钮。按钮变灰，提示 'Already Voted'。"
      },
      {
        title: "2. 分析 Cookie",
        content: "查看 Reqable 中的请求/响应。Response Set-Cookie 设置了 `voted=true`。后续请求都带上了这个 Cookie。"
      },
      {
        title: "3. 绕过限制",
        content: "在 Composer 中，删除 `Cookie` 头，或者将 `voted=true` 改为 `voted=false`。"
      },
      {
        title: "4. 刷票",
        content: "发送请求。服务器会认为你是新用户，允许再次投票。"
      }
    ]
  },
  {
    id: 'case_07',
    title: "中间人拦截：断点修改",
    category: 'Debugging',
    difficulty: 'Intermediate',
    description: "前端页面限制了优惠券折扣只能是 10%。你需要使用 Reqable 的 **断点 (Breakpoints)** 功能，拦截发出的请求，在它到达服务器前将其改为 100%。",
    initialUrl: "https://promo.site/claim",
    learningObjectives: [
      "学习使用抓包工具的 Breakpoint (断点) 功能",
      "拦截并修改 Pending 状态的请求",
      "绕过前端验证"
    ],
    guideSteps: [
      {
        title: "1. 开启断点",
        content: "在 Reqable 工具栏点击 **盾牌图标 (Breakpoints)** 开启全局断点。"
      },
      {
        title: "2. 触发请求",
        content: "在浏览器点击 'Claim Discount'。请求会卡住，Reqable 会弹出拦截窗口。"
      },
      {
        title: "3. 篡改数据",
        content: "在 Reqable 的拦截界面中，将 Body 中的 `discount: 10` 修改为 `discount: 100`。"
      },
      {
        title: "4. 放行 (Execute)",
        content: "点击 **Execute** 发送修改后的请求。"
      }
    ]
  },
  {
    id: 'case_17',
    title: "API 爆破：参数枚举 (Fuzzing)",
    category: 'Debugging',
    difficulty: 'Advanced',
    description: "你得到了一个优惠券兑换接口，已知优惠码格式为 'VIP-xx' (xx为两位数字)。但只有其中一个是有效的。使用 Composer 手动进行简单的模糊测试 (Fuzzing) 来找到它。",
    initialUrl: "https://shop.demo/redeem",
    learningObjectives: [
      "理解 Fuzzing (模糊测试) 的基本概念",
      "使用 Composer 快速重放请求",
      "分析不同参数带来的响应差异"
    ],
    guideSteps: [
      {
        title: "1. 捕获基准请求",
        content: "在页面输入 `VIP-00` 并点击兑换。在 Reqable 中捕获该请求。"
      },
      {
        title: "2. 发送至构造器",
        content: "将请求发送到 Composer。"
      },
      {
        title: "3. 手动枚举",
        content: "尝试修改 Body 中的 code 为 `VIP-10`, `VIP-55`, `VIP-88` 等。观察 Response Body 的变化。"
      },
      {
        title: "4. 找到目标",
        content: "实际上有效代码是 `VIP-88`。在真实场景中，你会使用专门的 Fuzzer 工具，但这里你可以手动体验这个过程。"
      }
    ]
  },
  {
    id: 'case_08',
    title: "API 调试：手动构造请求",
    category: 'Debugging',
    difficulty: 'Advanced',
    description: "你拿到了一份 API 文档，其中提到有一个隐藏接口 `POST /api/admin/reset-server`。页面上没有按钮。你需要使用 Reqable 的 **Composer** 功能凭空构造请求。",
    initialUrl: "https://api-docs.internal/v1",
    learningObjectives: [
      "在没有 UI 的情况下测试后端接口",
      "手动构造 HTTP Method, URL 和 Body",
      "理解 API 调试流程"
    ],
    guideSteps: [
      {
        title: "1. 分析文档",
        content: "文档显示目标接口是 `POST /api/admin/reset-server`，且需要 Header `x-confirm: true`。"
      },
      {
        title: "2. 打开构造器",
        content: "切换到 Reqable 的 **Composer** 标签页。"
      },
      {
        title: "3. 填写参数",
        content: "Method 选 `POST`，URL 填 `https://api-docs.internal/api/admin/reset-server`。在 Headers 区域添加 `x-confirm` 值为 `true`。"
      },
      {
        title: "4. 发送",
        content: "点击发送。如果一切正确，服务器会返回重置成功的消息。"
      }
    ]
  },

  // --- REVERSE ENGINEERING (NEW) ---
  {
    id: 'case_09',
    title: "源码分析：硬编码密码",
    category: 'Reverse',
    difficulty: 'Beginner',
    description: "这个管理后台的登录逻辑似乎完全写在前端。你能通过查看源代码找到管理员密码吗？",
    initialUrl: "https://admin.local/login",
    sourceCode: `
/* logic.js - Authentication Module */

function handleLogin() {
  const user = document.getElementById('username').value;
  const pass = document.getElementById('password').value;

  // TODO: Move this to server side later
  const SECRET = "SuperAdmin2025";

  if (user === "admin" && pass === SECRET) {
    window.location.href = "/dashboard";
    return true;
  } else {
    showError("Invalid Credentials");
    return false;
  }
}
`,
    learningObjectives: [
      "使用 DevTools 的 Sources 面板查看脚本",
      "识别前端硬编码的安全风险",
      "阅读基础 JavaScript 逻辑"
    ],
    guideSteps: [
      {
        title: "1. 切换面板",
        content: "在浏览器 DevTools 中，点击顶部的 **Sources** (源代码) 标签页。"
      },
      {
        title: "2. 分析代码",
        content: "查看 `logic.js` 文件。阅读 `handleLogin` 函数的逻辑。"
      },
      {
        title: "3. 发现秘密",
        content: "找到变量 `SECRET` 的值。那就是密码。"
      },
      {
        title: "4. 登录验证",
        content: "回到页面，输入用户名 `admin` 和你找到的密码。"
      }
    ]
  },
  {
    id: 'case_10',
    title: "控制台调试：变量篡改",
    category: 'Reverse',
    difficulty: 'Beginner',
    description: "页面加载了一个全局对象 `appConfig`，其中定义了当前用户的权限。请尝试使用 Console 控制台在运行时修改它，以获取 Admin 权限。",
    initialUrl: "https://app.local/profile",
    sourceCode: `
/* config.js */
window.appConfig = {
  version: "1.0.2",
  env: "production",
  currentUser: {
    id: 8842,
    username: "guest_user",
    isAdmin: false // Try to change this!
  }
};

function checkAccess() {
  if (window.appConfig.currentUser.isAdmin) {
    unlockAdminPanel();
  } else {
    alert("Access Denied: Admins only.");
  }
}
`,
    learningObjectives: [
      "使用 DevTools 的 Console (控制台) 面板",
      "查看和修改全局变量",
      "理解运行时内存篡改"
    ],
    guideSteps: [
      {
        title: "1. 打开控制台",
        content: "切换到 DevTools 的 **Console** 标签页。"
      },
      {
        title: "2. 检查变量",
        content: "输入 `window.appConfig` 并回车，查看当前状态。"
      },
      {
        title: "3. 篡改状态",
        content: "输入 `window.appConfig.currentUser.isAdmin = true` 并回车。变量已被内存修改。"
      },
      {
        title: "4. 触发检查",
        content: "点击页面上的 'Access Admin Panel' 按钮。现在应该能通过检查了。"
      }
    ]
  },
  {
    id: 'case_11',
    title: "JS 逆向：手动调用函数",
    category: 'Reverse',
    difficulty: 'Intermediate',
    description: "按钮是灰显的（Disabled），且移除了 Click 事件。但是核心功能的 JavaScript 函数依然存在于内存中。你能通过 Console 直接调用它吗？",
    initialUrl: "https://feature.local/beta",
    sourceCode: `
/* app.js */
var _internal = {
  enableBeta: function() {
    // This function is hidden from UI
    console.log("Beta features enabled!");
    serverRequest("/api/enable-beta");
  }
};

// UI Logic
document.getElementById('beta-btn').disabled = true;
`,
    learningObjectives: [
      "绕过 UI 限制",
      "在 Console 中调用页面内部函数",
      "分析对象结构"
    ],
    guideSteps: [
      {
        title: "1. 分析代码",
        content: "在 Sources 面板中发现 `_internal` 对象包含一个 `enableBeta` 方法。"
      },
      {
        title: "2. 尝试调用",
        content: "切换到 Console。输入 `_internal` 查看对象结构。"
      },
      {
        title: "3. 执行函数",
        content: "输入 `_internal.enableBeta()` 并回车。直接触发业务逻辑。"
      }
    ]
  },
  {
    id: 'case_25',
    title: "逻辑炸弹：拆除计时器",
    category: 'Reverse',
    difficulty: 'Intermediate',
    description: "进入页面后，一个自动销毁程序（计时器）启动了。你只有 15 秒的时间分析代码，找到计时器 ID，并在 Console 中使用 `clearTimeout` 终止它。",
    initialUrl: "https://secure-vault.local/countdown",
    sourceCode: `
/* bomb.js */
console.log("Self-destruct sequence initiated...");

// The security timer is exposed globally for "debugging" (or is it?)
window.securityTimer = setTimeout(function() {
  document.body.innerHTML = "<h1>ACCESS DENIED - SYSTEM LOCKED</h1>";
  console.error("BOOM! You were too slow.");
}, 15000);

function checkStatus() {
  // If you stop the timer, you can access the vault
  console.log("Checking system status...");
}
`,
    learningObjectives: [
      "理解 setTimeout 和 clearTimeout",
      "使用 Console 干预正在执行的时间逻辑",
      "识别全局变量引用的计时器 ID"
    ],
    guideSteps: [
      {
        title: "1. 观察现象",
        content: "页面上有一个红色的倒计时。Sources 面板显示 `bomb.js` 正在运行。"
      },
      {
        title: "2. 分析代码",
        content: "发现 `setTimeout` 的返回值被赋给了全局变量 `window.securityTimer`。"
      },
      {
        title: "3. 拆除炸弹",
        content: "快速切换到 Console，输入 `clearTimeout(window.securityTimer)` 并回车。"
      },
      {
        title: "4. 确认",
        content: "如果倒计时停止，说明拆弹成功。"
      }
    ]
  },
  {
    id: 'case_26',
    title: "存储篡改：本地存储 (LocalStorage)",
    category: 'Reverse',
    difficulty: 'Intermediate',
    description: "这个软件提示“试用期已结束”。通常这种状态会保存在浏览器的 LocalStorage 中。请通过分析代码并修改存储值来激活高级版。",
    initialUrl: "https://software.local/license",
    sourceCode: `
/* license.js */
function checkLicense() {
  const status = localStorage.getItem('license_status');
  const trialEnd = localStorage.getItem('trial_end');

  if (status === 'premium') {
    showPremiumFeatures();
  } else {
    showTrialExpired();
  }
}

// Initial State (Simulated)
if (!localStorage.getItem('license_status')) {
  localStorage.setItem('license_status', 'expired');
}
`,
    learningObjectives: [
      "理解 LocalStorage 的作用",
      "使用 Console 读写 localStorage",
      "修改客户端持久化状态"
    ],
    guideSteps: [
      {
        title: "1. 分析逻辑",
        content: "代码显示它在检查 `localStorage.getItem('license_status')` 是否等于 `'premium'`。"
      },
      {
        title: "2. 查看当前值",
        content: "在 Console 输入 `localStorage.getItem('license_status')`，发现是 `'expired'`。"
      },
      {
        title: "3. 篡改存储",
        content: "输入 `localStorage.setItem('license_status', 'premium')` 并回车。"
      },
      {
        title: "4. 刷新生效",
        content: "点击页面上的“检查许可证”或刷新按钮 (模拟)。"
      }
    ]
  },
  {
    id: 'case_27',
    title: "逆向工程：混淆逻辑分析",
    category: 'Reverse',
    difficulty: 'Advanced',
    description: "你需要输入正确的序列号才能解锁。但校验逻辑被混淆了。你需要通过静态分析还原出数学逻辑，算出正确的数字。",
    initialUrl: "https://crackme.local/serial",
    sourceCode: `
/* validate.js (Obfuscated) */
function checkSerial(input) {
  var _0x5a = parseInt(input);
  
  // Obfuscated Math Logic
  var _0x1 = 1337;
  var _0x2 = 55;
  
  // Real check: (input * 1337) == 73535
  if (_0x5a * _0x1 === 73535) {
    return true;
  } else {
    return false;
  }
}
`,
    learningObjectives: [
      "分析简单的混淆代码",
      "还原数学逻辑",
      "逆向推导输入值"
    ],
    guideSteps: [
      {
        title: "1. 阅读源码",
        content: "查看 Sources 中的代码。忽略变量名，关注数学运算。"
      },
      {
        title: "2. 提取逻辑",
        content: "核心判断是 `input * 1337 === 73535`。"
      },
      {
        title: "3. 逆向推导",
        content: "计算 `73535 / 1337` 等于多少？(答案是 55)"
      },
      {
        title: "4. 验证",
        content: "在页面输入框输入 `55` 并点击验证。"
      }
    ]
  },
  {
    id: 'case_28',
    title: "反调试绕过 (Anti-Debugging)",
    category: 'Reverse',
    difficulty: 'Advanced',
    description: "当你尝试打开 DevTools 时，脚本会执行死循环或频繁调用 debugger，导致页面卡死。你需要覆盖原生函数来禁用这种行为。",
    initialUrl: "https://secure-video.local/watch",
    sourceCode: `
/* protector.js */
(function() {
  // Annoys hackers by pausing constantly
  setInterval(function() {
    console.log("Checking integrity...");
    // debugger; // In real life, this pauses the browser
    checkStatus(); 
  }, 500);
  
  function checkStatus() {
    // ...
  }
})();
`,
    learningObjectives: [
      "识别常见的反调试手段 (setInterval + debugger)",
      "Hook/Override 原生浏览器 API",
      "在控制台重写 setInterval"
    ],
    guideSteps: [
      {
        title: "1. 遭遇卡顿",
        content: "页面提示 'System Integrity Check' 并在控制台疯狂输出日志。模拟器中虽然不会真卡死，但代表了真实场景。"
      },
      {
        title: "2. 分析对策",
        content: "代码使用 `setInterval` 频繁执行检查。我们需要把 `setInterval` 替换成一个空函数。"
      },
      {
        title: "3. Hook 函数",
        content: "在 Console 输入 `window.setInterval = function() {};` 并回车。这会阻止后续所有的定时器创建。"
      },
      {
        title: "4. 清理屏幕",
        content: "日志停止刷新，按钮解锁。"
      }
    ]
  },
  {
    id: 'case_29',
    title: "函数劫持 (Hooking)",
    category: 'Reverse',
    difficulty: 'Advanced',
    description: "页面通过一个闭包内的函数发送加密数据。你无法直接访问该数据，但你可以'劫持'全局的发送函数，在它发送前把数据偷出来。",
    initialUrl: "https://bank.local/transfer",
    sourceCode: `
/* secure-transport.js */
// The sensitive data is generated here
var secretFlag = "FLAG-" + Math.floor(Math.random() * 9999);

// We want to see what secretFlag is!
// But we can only access the submitData function.

function submitData(data) {
  // In real life this sends to server
  console.log("Sending encrypted data to server...");
}

// Application logic calls this automatically
setTimeout(() => {
  submitData(secretFlag);
}, 10000);
`,
    learningObjectives: [
      "理解函数 Hook (钩子) 原理",
      "重写全局函数以拦截参数",
      "提取闭包或私有作用域中的数据"
    ],
    guideSteps: [
      {
        title: "1. 预判逻辑",
        content: "代码会在几秒后调用 `submitData(secretFlag)`。我们需要在它调用前重写 `submitData`。"
      },
      {
        title: "2. 编写 Hook",
        content: "在 Console 输入：`window.submitData = function(data) { console.log('Captured:', data); }`。"
      },
      {
        title: "3. 等待触发",
        content: "等待页面逻辑执行（或者手动点击页面上的重试按钮）。"
      },
      {
        title: "4. 获取 Flag",
        content: "控制台将打印出 Captured: FLAG-xxxx。这就是答案。"
      }
    ]
  },
  {
    id: 'case_30',
    title: "原型链污染 (Prototype Pollution)",
    category: 'Reverse',
    difficulty: 'Advanced',
    description: "系统检查 `currentUser.isAdmin`。但 `currentUser` 是普通用户。利用 JavaScript 的原型链特性，污染 `Object.prototype`，让所有对象都默认拥有 isAdmin 属性。",
    initialUrl: "https://cloud.local/admin",
    sourceCode: `
/* auth.js */
var currentUser = {
  name: "Guest",
  // isAdmin is undefined
};

function checkAuth() {
  // Logic: if currentUser.isAdmin is true...
  if (currentUser.isAdmin) {
    grantAccess();
  } else {
    denyAccess();
  }
}
`,
    learningObjectives: [
      "理解 JavaScript 原型继承机制",
      "实施原型链污染攻击",
      "绕过基于属性检查的鉴权"
    ],
    guideSteps: [
      {
        title: "1. 检查对象",
        content: "输入 `currentUser`，发现没有 isAdmin 属性。"
      },
      {
        title: "2. 污染原型",
        content: "输入 `Object.prototype.isAdmin = true`。这会让所有对象（包括 currentUser）在查找 isAdmin 时都返回 true。"
      },
      {
        title: "3. 验证",
        content: "再次输入 `currentUser.isAdmin`，现在应该返回 true 了。"
      },
      {
        title: "4. 登录",
        content: "点击 Login 按钮，鉴权通过。"
      }
    ]
  },

  {
    id: 'case_12',
    title: "逆向工程：算法分析",
    category: 'Reverse',
    difficulty: 'Advanced',
    description: "这个 API 请求包含一个 `sign` 签名参数。你需要阅读混淆后的 JS 代码，还原出它的签名生成算法（MD5），并在请求中伪造正确的签名。",
    initialUrl: "https://secure.api/v1/data",
    sourceCode: `
/* security.js (Obfuscated) */
function makeRequest(data) {
  var ts = Date.now();
  // The server requires a signature: md5(data + timestamp + salt)
  var s = "S@lt_99"; 
  var token = doHash(data + ts + s); 
  
  fetch('/api/check?sign=' + token + '&ts=' + ts);
}

function doHash(str) {
  // Simplified MD5 simulation
  return "md5_" + str.split("").reverse().join("");
}
`,
    learningObjectives: [
      "阅读并理解简单的混淆逻辑",
      "还原加密/签名算法",
      "在 Console 中验证算法"
    ],
    guideSteps: [
      {
        title: "1. 阅读逻辑",
        content: "在 Sources 中分析 `makeRequest` 函数。发现签名逻辑是 `doHash(data + ts + s)`。"
      },
      {
        title: "2. 寻找 Salt",
        content: "发现变量 `s` (Salt) 的值是 `S@lt_99`。"
      },
      {
        title: "3. 验证",
        content: "在 Console 中输入 `doHash('test' + Date.now() + 'S@lt_99')` 看看输出是否符合预期。"
      },
      {
        title: "4. 模拟攻击",
        content: "在 Console 输入 `makeRequest('admin')`，如果逻辑正确，你将通过关卡。"
      }
    ]
  },

  // --- ADVANCED ---
  {
    id: 'case_21',
    title: "HTTP 方法篡改 (REST Bypass)",
    category: 'Security',
    difficulty: 'Advanced',
    description: "你找到了一个日志查看页面，但删除按钮被禁用了。根据 RESTful 风格猜测，删除操作通常使用 DELETE 方法。你能手动构造请求来删除日志吗？",
    initialUrl: "https://admin.logs/view",
    learningObjectives: [
      "理解 RESTful API 风格",
      "使用 Composer 修改 HTTP Method",
      "测试 HTTP Verbs (GET/POST/DELETE/PUT)"
    ],
    guideSteps: [
      {
        title: "1. 查看日志",
        content: "页面显示系统日志。点击 'Delete All' 按钮，没有任何反应（或只发出了 GET 请求）。"
      },
      {
        title: "2. 发送至构造器",
        content: "在 Reqable 中捕获该请求并发送到 Composer。"
      },
      {
        title: "3. 修改方法",
        content: "将 HTTP Method 从 `GET` 修改为 `DELETE`。"
      },
      {
        title: "4. 攻击",
        content: "发送请求。如果后端实现了 DELETE 处理逻辑但未在前端暴露，你将成功删除日志。"
      }
    ]
  },
  {
    id: 'case_22',
    title: "GraphQL 注入：内省查询",
    category: 'Security',
    difficulty: 'Advanced',
    description: "这个搜索功能基于 GraphQL。如果服务器没有关闭内省 (Introspection)，我们可以查询整个数据库架构，找到隐藏的字段。",
    initialUrl: "https://api.graphql/search",
    learningObjectives: [
      "理解 GraphQL 的基本结构",
      "使用 __schema 进行内省查询 (Introspection)",
      "提取隐藏字段"
    ],
    guideSteps: [
      {
        title: "1. 正常查询",
        content: "搜索 'test'。查看 Network，发现 POST 请求体是 GraphQL 格式。"
      },
      {
        title: "2. 构造内省查询",
        content: "在 Composer 中，将 Body 修改为查询架构：`{\"query\": \"{ __schema { types { name } } }\"}`。"
      },
      {
        title: "3. 发送",
        content: "如果服务器返回了大量类型定义，说明内省开启。在真实攻击中，你会进一步查找 User 类型下的敏感字段。"
      }
    ]
  },
  {
    id: 'case_23',
    title: "影子 API 探测",
    category: 'Security',
    difficulty: 'Advanced',
    description: "你正在使用 `/api/v1/user` 接口。通常开发人员会发布新版本 `/api/v2` 或保留 `/api/internal`，这些接口可能没有经过严格的安全测试。",
    initialUrl: "https://service.corp/profile",
    learningObjectives: [
      "识别 API 版本命名规范",
      "猜测未公开的 API 路径 (Shadow API)",
      "访问无保护的内部接口"
    ],
    guideSteps: [
      {
        title: "1. 分析当前路径",
        content: "页面加载时请求了 `https://service.corp/api/v1/user`。"
      },
      {
        title: "2. 猜测路径",
        content: "在 Composer 中，尝试将 `v1` 改为 `v2`，或者改为 `internal`。"
      },
      {
        title: "3. 发送",
        content: "尝试访问 `/api/internal/user`。如果返回了 200 OK 且包含敏感数据，说明你找到了影子 API。"
      }
    ]
  },
  {
    id: 'case_24',
    title: "文件上传：MIME 绕过",
    category: 'Security',
    difficulty: 'Advanced',
    description: "上传功能只允许图片 (image/jpeg)。但后端仅通过 `Content-Type` 头来判断文件类型。我们需要上传一个恶意脚本，并伪造类型欺骗服务器。",
    initialUrl: "https://upload.demo/avatar",
    learningObjectives: [
      "理解文件上传漏洞原理",
      "伪造 Content-Type 头",
      "绕过简单的文件类型检查"
    ],
    guideSteps: [
      {
        title: "1. 尝试上传",
        content: "尝试上传一个 `.php` 或 `.js` 文件（模拟）。服务器提示 'Only images allowed'。"
      },
      {
        title: "2. 抓包修改",
        content: "拦截上传请求。观察 `Content-Type` 可能是 `application/x-javascript`。"
      },
      {
        title: "3. 伪造类型",
        content: "在 Composer 中，将 `Content-Type` 修改为 `image/jpeg`，但保持 Body 内容（脚本）不变。"
      },
      {
        title: "4. 发送",
        content: "如果后端只检查 Header，文件将被成功保存。"
      }
    ]
  },
  {
    id: 'case_05',
    title: "存储型 XSS",
    category: 'Advanced',
    difficulty: 'Advanced',
    description: "博客评论区允许用户发布内容。如果服务器没有正确过滤 HTML 标签，我们是否可以注入恶意脚本？",
    initialUrl: "https://blog.site/post/welcome",
    learningObjectives: [
      "理解存储型 XSS 原理",
      "识别 HTML 注入点",
      "构造 Payload 获取 Cookie"
    ],
    guideSteps: [
      {
        title: "1. 发布正常评论",
        content: "输入 'Hello' 并发送。观察请求。"
      },
      {
        title: "2. 尝试 HTML 注入",
        content: "输入 `<b>Bold</b>`。如果文字变粗，说明 HTML 被解析了。"
      },
      {
        title: "3. 注入脚本",
        content: "输入 `<script>alert(document.cookie)</script>`。观察是否弹窗。"
      }
    ]
  },
  {
    id: 'case_15',
    title: "存储型 XSS：WAF 绕过",
    category: 'Advanced',
    difficulty: 'Advanced',
    description: "网站升级了防火墙 (WAF)，它会拦截所有的 <script> 标签。你需要找到一种替代方案（如事件处理器）来执行 JavaScript 代码。",
    initialUrl: "https://secure-blog.site/post/waf-test",
    learningObjectives: [
      "理解 WAF (Web Application Firewall) 的过滤机制",
      "寻找 <script> 标签的替代方案 (如 onerror)",
      "执行高级 XSS 攻击"
    ],
    guideSteps: [
      {
        title: "1. 尝试常规注入",
        content: "输入 `<script>alert(1)</script>` 并发送。服务器返回 Error，说明标签被拦截。"
      },
      {
        title: "2. 构造绕过 Payload",
        content: "尝试使用 `<img src=x onerror=alert(1)>`。这种方式不使用 script 标签，而是利用图片加载失败事件来执行代码。"
      },
      {
        title: "3. 验证执行",
        content: "如果成功，评论将被保存，且你的代码会在页面加载时执行。"
      }
    ]
  },
  {
    id: 'case_06',
    title: "JWT 令牌分析",
    category: 'Advanced',
    difficulty: 'Advanced',
    description: "当前用户是普通权限。认证使用 JWT。你的任务是分析并尝试伪造管理员令牌。",
    initialUrl: "https://auth.provider/profile",
    learningObjectives: [
      "识别 Authorization Header",
      "理解 JWT 的三段式结构",
      "尝试修改 Payload 中的 Role 字段"
    ],
    guideSteps: [
      {
        title: "1. 获取 Token",
        content: "在 Reqable 中找到包含 `Authorization: Bearer eyJ...` 的请求。"
      },
      {
        title: "2. 复制 Token",
        content: "复制 Token 字符串。"
      },
      {
        title: "3. 篡改尝试",
        content: "在 Composer 中，尝试修改 Token 的 Payload 部分（Base64 解码后将 user 改为 admin 再编码回去）。虽然签名校验会失败，但这是理解过程的第一步。"
      }
    ]
  },
  {
    id: 'case_13',
    title: "JWT 进阶：None 算法攻击",
    category: 'Advanced',
    difficulty: 'Advanced',
    description: "某些旧的 JWT 库存在严重漏洞，允许 'none' 算法（不签名）。你的任务是：1. 捕获 Token；2. 将 Header 修改为使用 none 算法；3. 将 Payload 改为 admin；4. 移除签名部分。",
    initialUrl: "https://auth.vulnerable/v2/dashboard",
    learningObjectives: [
      "深入理解 JWT Header 中的 alg 字段",
      "利用 JWT 'None' Algorithm 漏洞",
      "手动构造无签名的 JWT 令牌"
    ],
    guideSteps: [
      {
        title: "1. 捕获 Token",
        content: "在 Reqable 中找到 Authorization Header。复制 Bearer 后的 Token。"
      },
      {
        title: "2. 构造 Header",
        content: "构造一个新的 JSON Header: `{\"alg\":\"none\",\"typ\":\"JWT\"}` 并 Base64 编码。"
      },
      {
        title: "3. 构造 Payload",
        content: "构造 Payload: `{\"user\":\"admin\"}` 并 Base64 编码。"
      },
      {
        title: "4. 组合攻击",
        content: "在 Composer 中，使用 `Header.Payload.` (注意最后的点，不要签名) 作为新的 Token 发送请求。"
      }
    ]
  },
  {
    id: 'case_14',
    title: "JWT 漏洞：签名未校验",
    category: 'Advanced',
    difficulty: 'Advanced',
    description: "开发人员为了方便调试，在某些情况下关闭了 JWT 签名校验，但忘记在生产环境中开启。这意味着你可以随意修改 Payload 而无需担心签名。",
    initialUrl: "https://internal-tools.corp/admin",
    learningObjectives: [
      "识别未校验签名的 JWT 漏洞",
      "使用 Reqable 篡改 Token Payload",
      "理解签名校验在安全中的重要性"
    ],
    guideSteps: [
      {
        title: "1. 获取 Guest Token",
        content: "访问页面，Reqable 会捕获到一个 Authorization Token。通过 Base64 解码发现 `role: guest`。"
      },
      {
        title: "2. 篡改 Payload",
        content: "将 Payload 中的 `guest` 修改为 `admin`。保持 Header (HS256) 不变。"
      },
      {
        title: "3. 重新编码",
        content: "将修改后的 JSON Base64 编码。组合成 `Header.NewPayload.OriginalSignature` (保留原签名即可，反正后端不看)。"
      },
      {
        title: "4. 发送请求",
        content: "在 Composer 中使用伪造的 Token 访问接口。如果成功，说明后端完全忽略了签名部分。"
      }
    ]
  }
];
