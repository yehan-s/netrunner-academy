
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

// Network Throttling Configuration
export interface ThrottleConfig {
  id: string;
  name: string;
  enabled: boolean;
  // Download speed in KB/s (0 = no limit)
  downloadSpeed: number;
  // Upload speed in KB/s (0 = no limit)
  uploadSpeed: number;
  // Latency in ms (added delay to each request)
  latency: number;
  // Packet loss percentage (0-100)
  packetLoss: number;
  // Is this a preset or custom config
  isPreset?: boolean;
}

// Diff comparison result
export interface DiffResult {
  id: string;
  timestamp: number;
  leftRequest: NetworkRequest;
  rightRequest: NetworkRequest;
  differences: {
    field: string;
    leftValue: string;
    rightValue: string;
  }[];
}

// Access Control Rule (Blacklist/Whitelist)
export interface AccessControlRule {
  id: string;
  name: string;
  pattern: string; // URL or domain pattern with wildcard support
  type: 'blacklist' | 'whitelist';
  matchType: 'domain' | 'url' | 'ip';
  enabled: boolean;
  description?: string;
}

// Proxy Terminal Configuration
export interface ProxyConfig {
  enabled: boolean;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'socks5';
  requireAuth: boolean;
  username?: string;
  password?: string;
  bypassList: string[]; // Domains to bypass proxy
}

// Turbo Mode Configuration
export interface TurboModeConfig {
  enabled: boolean;
  disableImages: boolean;
  disableScripts: boolean;
  disableFonts: boolean;
  disableStylesheets: boolean;
  compressionLevel: 'none' | 'low' | 'medium' | 'high';
  cacheEnabled: boolean;
  maxConcurrentRequests: number;
}

// Reverse Proxy Rule
export interface ReverseProxyRule {
  id: string;
  name: string;
  enabled: boolean;
  listenPath: string; // e.g., "/api/*"
  targetUrl: string; // e.g., "https://backend.example.com"
  rewritePath: boolean; // Whether to rewrite the path
  addHeaders: Record<string, string>;
  removeHeaders: string[];
  description?: string;
}
