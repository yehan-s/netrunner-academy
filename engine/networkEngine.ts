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
    requestHeaders: {},
    responseHeaders: { 'Content-Type': 'text/html' },
    responseBody: '<html>...</html>',
  };
  requests.push(docReq);

  // Case-specific API traffic
  if (caseId === 'case_04') {
    requests.push({
      id: `api-${now}`,
      url: 'https://shop.demo/api/orders/1001',
      method: 'GET',
      status: 200,
      type: 'fetch',
      size: 450,
      time: 150,
      timestamp: now + 50,
      requestHeaders: { Cookie: 'session=user_1001' },
      responseHeaders: {},
      responseBody: JSON.stringify(
        {
          id: 1001,
          item: 'Mechanical Keyboard',
          price: 150,
          user: 'Guest User',
          address: '123 Main St',
        },
        null,
        2,
      ),
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
  };

  let shouldTriggerSuccess = false;

  if (activeCaseId === 'case_01') {
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
  } else if (activeCaseId === 'case_02' && req.url.includes('/checkout')) {
    try {
      const body = JSON.parse(req.requestBody || '{}');
      if (body.price > 0 && body.price < 1000) {
        responseReq.status = 200;
        responseReq.responseBody = JSON.stringify(
          { success: true, msg: 'Order Confirmed', orderId: 9921 },
          null,
          2,
        );
        shouldTriggerSuccess = true;
      } else {
        responseReq.status = 403;
        responseReq.responseBody = JSON.stringify(
          { error: 'Insufficient Funds for this Item' },
          null,
          2,
        );
      }
    } catch (e) {
      responseReq.status = 400;
    }
  }
  // 其余关卡逻辑保持原样，只将 triggerSuccess 替换为标记 shouldTriggerSuccess
  else if (activeCaseId === 'case_04' && req.url.includes('/orders/1002')) {
    shouldTriggerSuccess = true;
  } else if (activeCaseId === 'case_03' && req.url.includes("' OR")) {
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

