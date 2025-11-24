import { ScriptRule, ScriptLog, NetworkRequest } from '../types';

const STORAGE_KEY = 'netrunner_script_rules';
const LOGS_KEY = 'netrunner_script_logs';

/**
 * Load script rules from localStorage
 */
export const loadScriptRules = (): ScriptRule[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load script rules:', error);
    return [];
  }
};

/**
 * Save script rules to localStorage
 */
export const saveScriptRules = (rules: ScriptRule[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch (error) {
    console.error('Failed to save script rules:', error);
  }
};

/**
 * Get active (enabled) script rules
 */
export const getActiveScriptRules = (): ScriptRule[] => {
  return loadScriptRules().filter(rule => rule.enabled);
};

/**
 * URL pattern matching with wildcard support
 */
export const matchesScriptPattern = (url: string, pattern: string): boolean => {
  const regexPattern = pattern
    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*');
  const regex = new RegExp(`^${regexPattern}$`);
  return regex.test(url);
};

/**
 * Script execution context - provides safe API for scripts
 */
interface ScriptContext {
  request: NetworkRequest;
  console: {
    log: (...args: any[]) => void;
    info: (...args: any[]) => void;
    warn: (...args: any[]) => void;
    error: (...args: any[]) => void;
  };
  // Helper functions
  setHeader: (key: string, value: string) => void;
  getHeader: (key: string) => string | undefined;
  setBody: (content: string) => void;
  getBody: () => string | undefined;
  setStatus: (code: number, text?: string) => void;
}

/**
 * Execute a script rule on a request
 */
export const executeScriptRule = (
  rule: ScriptRule,
  request: NetworkRequest,
  onLog: (log: ScriptLog) => void
): NetworkRequest => {
  let modifiedRequest = { ...request };

  // Create log helper
  const createLog = (type: 'log' | 'error' | 'info' | 'warn', ...args: any[]) => {
    const message = args.map(arg =>
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' ');

    onLog({
      timestamp: Date.now(),
      ruleId: rule.id,
      ruleName: rule.name,
      type,
      message
    });
  };

  // Create script context
  const context: ScriptContext = {
    request: { ...modifiedRequest },
    console: {
      log: (...args) => createLog('log', ...args),
      info: (...args) => createLog('info', ...args),
      warn: (...args) => createLog('warn', ...args),
      error: (...args) => createLog('error', ...args)
    },
    setHeader: (key: string, value: string) => {
      if (rule.trigger === 'request' || rule.trigger === 'both') {
        modifiedRequest.requestHeaders = {
          ...modifiedRequest.requestHeaders,
          [key]: value
        };
      } else if (rule.trigger === 'response') {
        modifiedRequest.responseHeaders = {
          ...modifiedRequest.responseHeaders,
          [key]: value
        };
      }
    },
    getHeader: (key: string) => {
      if (rule.trigger === 'request' || rule.trigger === 'both') {
        return modifiedRequest.requestHeaders[key];
      } else {
        return modifiedRequest.responseHeaders[key];
      }
    },
    setBody: (content: string) => {
      if (rule.trigger === 'request' || rule.trigger === 'both') {
        modifiedRequest.requestBody = content;
      } else {
        modifiedRequest.responseBody = content;
      }
    },
    getBody: () => {
      if (rule.trigger === 'request' || rule.trigger === 'both') {
        return modifiedRequest.requestBody;
      } else {
        return modifiedRequest.responseBody;
      }
    },
    setStatus: (code: number, text?: string) => {
      modifiedRequest.status = code;
      if (text) modifiedRequest.statusText = text;
    }
  };

  try {
    // Execute script in sandboxed context
    // Using Function constructor instead of eval for better control
    const scriptFunction = new Function('context', `
      with (context) {
        ${rule.code}
      }
    `);

    scriptFunction(context);

    createLog('info', `Script "${rule.name}" executed successfully`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    createLog('error', `Script "${rule.name}" failed: ${errorMessage}`);
    console.error(`Script execution error in rule "${rule.name}":`, error);
  }

  return modifiedRequest;
};

/**
 * Apply all active script rules to a request
 */
export const applyScriptRules = (
  request: NetworkRequest,
  trigger: 'request' | 'response',
  onLog?: (log: ScriptLog) => void
): NetworkRequest => {
  const rules = getActiveScriptRules();
  let modifiedRequest = { ...request };

  const noop = () => {};
  const logHandler = onLog || noop;

  for (const rule of rules) {
    // Skip if trigger doesn't match
    if (rule.trigger !== trigger && rule.trigger !== 'both') {
      continue;
    }

    // Skip if URL doesn't match
    if (!matchesScriptPattern(request.url, rule.urlPattern)) {
      continue;
    }

    modifiedRequest = executeScriptRule(rule, modifiedRequest, logHandler);
  }

  return modifiedRequest;
};

/**
 * Load script logs from localStorage
 */
export const loadScriptLogs = (): ScriptLog[] => {
  try {
    const stored = localStorage.getItem(LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load script logs:', error);
    return [];
  }
};

/**
 * Save script logs to localStorage
 */
export const saveScriptLogs = (logs: ScriptLog[]): void => {
  try {
    // Keep only last 1000 logs
    const limitedLogs = logs.slice(-1000);
    localStorage.setItem(LOGS_KEY, JSON.stringify(limitedLogs));
  } catch (error) {
    console.error('Failed to save script logs:', error);
  }
};

/**
 * Add a log entry
 */
export const addScriptLog = (log: ScriptLog): void => {
  const logs = loadScriptLogs();
  logs.push(log);
  saveScriptLogs(logs);
};

/**
 * Clear all script logs
 */
export const clearScriptLogs = (): void => {
  localStorage.removeItem(LOGS_KEY);
};
