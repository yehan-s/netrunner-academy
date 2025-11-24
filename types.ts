
export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  statusText?: string;
  type: 'xhr' | 'fetch' | 'script' | 'css' | 'img' | 'document';
  size: number;
  time: number; // Duration in ms
  timestamp: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  protocol?: string;
  remoteAddress?: string;
  cookies?: Record<string, string>;
  isPaused?: boolean;
}

export interface ScriptRule {
  id: string;
  name: string;
  urlPattern: string; // Support wildcard *
  enabled: boolean;
  trigger: 'request' | 'response' | 'both';
  code: string; // JavaScript code to execute
  description?: string;
}

export interface ScriptLog {
  timestamp: number;
  ruleId: string;
  ruleName: string;
  type: 'log' | 'error' | 'info' | 'warn';
  message: string;
}

export interface BreakpointRule {
  id: string;
  name: string;
  urlPattern: string; // Support wildcard *
  type: 'request' | 'response' | 'both';
  enabled: boolean;
}

export interface RewriteRule {
  id: string;
  name: string;
  urlPattern: string;
  enabled: boolean;
  action: {
    type: 'redirect' | 'modify-request-header' | 'modify-response-header' | 'replace-response-body';
    config: {
      // For redirect
      targetUrl?: string;
      // For header modification
      headerKey?: string;
      headerValue?: string;
      // For body replacement
      bodyContent?: string;
    };
  };
}

export interface MapLocalRule {
  id: string;
  name: string;
  urlPattern: string; // Support wildcard *
  enabled: boolean;
  localContent: string; // Local file content
  contentType: string; // MIME type, e.g., 'application/json', 'text/html'
}

export interface GatewayRule {
  id: string;
  name: string;
  urlPattern: string; // Support wildcard *, e.g., "https://ads.example.com/*"
  enabled: boolean;
  action: 'block' | 'allow'; // 'block' to block requests, 'allow' for whitelist
  description?: string; // Optional description
}

export interface MirrorRule {
  id: string;
  name: string;
  sourcePattern: string; // Source URL pattern with wildcard *, e.g., "https://api.prod.com/*"
  targetDomain: string; // Target domain to mirror to, e.g., "https://api.test.com"
  enabled: boolean;
  description?: string; // Optional description
}

export interface HighlightRule {
  id: string;
  name: string;
  condition: {
    type: 'url' | 'status' | 'size'; // Condition type
    // For URL: pattern with wildcard support
    // For status: status code range (e.g., "4xx", "500", "200-299")
    // For size: size comparison (e.g., ">1MB", "<100KB")
    value: string;
  };
  color: string; // Hex color code for row background (e.g., "#ff6b6b")
  enabled: boolean;
  description?: string; // Optional description
}

export interface CaseStudy {
  id: string;
  title: string;
  category: 'Basics' | 'Security' | 'Debugging' | 'Advanced' | 'Reverse' | 'Reqable' | 'Story';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  learningObjectives: string[];
  initialUrl: string;
  sourceCode?: string; // For Reverse Engineering levels
  guideSteps: {
    title: string;
    content: string;
  }[];
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  source: 'AI' | 'SYSTEM' | 'GAME';
  message: string;
}

export interface Level {
  id: string | number;
  type: string;
  description: string;
  learningContent: {
    topic: string;
    theory: string;
    guide: string;
  };
}
