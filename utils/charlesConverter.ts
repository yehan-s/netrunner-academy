import { NetworkRequest } from '../types';

/**
 * Charles Session (.chls) file format converter
 * Note: .chls files are actually ZIP archives containing XML data
 * For simulation purposes, we support a simplified JSON-based format
 */

interface CharlesSession {
  version: string;
  transactions: CharlesTransaction[];
}

interface CharlesTransaction {
  url: string;
  method: string;
  status: number;
  statusText?: string;
  requestTime: number;
  duration: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  protocol?: string;
  remoteAddress?: string;
}

/**
 * Convert NetworkRequest array to Charles-like session format
 */
export const convertToCharlesFormat = (requests: NetworkRequest[]): CharlesSession => {
  return {
    version: '1.0',
    transactions: requests
      .filter(r => r.status > 0)
      .map(r => ({
        url: r.url,
        method: r.method,
        status: r.status,
        statusText: r.statusText,
        requestTime: r.timestamp,
        duration: r.time,
        requestHeaders: r.requestHeaders,
        responseHeaders: r.responseHeaders,
        requestBody: r.requestBody,
        responseBody: r.responseBody,
        protocol: r.protocol,
        remoteAddress: r.remoteAddress,
      })),
  };
};

/**
 * Convert Charles session format to NetworkRequest array
 */
export const convertFromCharlesFormat = (session: CharlesSession): NetworkRequest[] => {
  return session.transactions.map((t, index) => ({
    id: `charles-${Date.now()}-${index}`,
    url: t.url,
    method: t.method,
    status: t.status,
    statusText: t.statusText,
    type: detectRequestType(t.url, t.responseHeaders),
    size: estimateSize(t.responseBody),
    time: t.duration,
    timestamp: t.requestTime,
    requestHeaders: t.requestHeaders || {},
    responseHeaders: t.responseHeaders || {},
    requestBody: t.requestBody,
    responseBody: t.responseBody,
    protocol: t.protocol,
    remoteAddress: t.remoteAddress,
  }));
};

/**
 * Detect request type from URL and headers
 */
const detectRequestType = (
  url: string,
  headers: Record<string, string>
): NetworkRequest['type'] => {
  const contentType = Object.entries(headers).find(
    ([k]) => k.toLowerCase() === 'content-type'
  )?.[1] || '';

  if (contentType.includes('html')) return 'document';
  if (contentType.includes('javascript')) return 'script';
  if (contentType.includes('css')) return 'css';
  if (contentType.includes('image')) return 'img';
  if (contentType.includes('json') || contentType.includes('xml')) return 'xhr';

  // Fallback to URL extension
  const ext = url.split('?')[0].split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'html':
    case 'htm':
      return 'document';
    case 'js':
      return 'script';
    case 'css':
      return 'css';
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return 'img';
    default:
      return 'xhr';
  }
};

/**
 * Estimate response size from body
 */
const estimateSize = (body?: string): number => {
  if (!body) return 0;
  return new Blob([body]).size;
};

/**
 * Download requests as Charles-compatible session file
 */
export const downloadCharlesSession = (
  requests: NetworkRequest[],
  filename = 'netrunner-session.chls.json'
) => {
  const session = convertToCharlesFormat(requests);
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/**
 * Parse Charles session file content
 * Supports both JSON format and attempts to parse XML-like formats
 */
export const parseCharlesSession = async (file: File): Promise<NetworkRequest[]> => {
  const text = await file.text();

  // Try JSON format first
  try {
    const json = JSON.parse(text);
    
    // Check if it's our format
    if (json.version && json.transactions) {
      return convertFromCharlesFormat(json as CharlesSession);
    }
    
    // Check if it's HAR format (common export from Charles)
    if (json.log && json.log.entries) {
      // Import HAR converter
      const { convertFromHAR } = await import('./harConverter');
      return convertFromHAR(json);
    }

    throw new Error('Unknown JSON format');
  } catch (e) {
    // Not JSON, might be XML or binary
    console.error('Failed to parse Charles session:', e);
    throw new Error(
      '无法解析文件格式。请确保文件是有效的 Charles 会话文件或 HAR 文件。\n' +
      '提示：可以在 Charles 中选择 File > Export Session > JSON 导出为 JSON 格式。'
    );
  }
};

/**
 * Validate if a file is a Charles session
 */
export const isCharlesFile = (filename: string): boolean => {
  const lower = filename.toLowerCase();
  return (
    lower.endsWith('.chls') ||
    lower.endsWith('.chls.json') ||
    lower.endsWith('.chlsj')
  );
};
