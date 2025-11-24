import { NetworkRequest } from '../types';

/**
 * HAR 1.2 Format Converter
 * Spec: http://www.softwareishard.com/blog/har-12-spec/
 */

interface HAREntry {
  startedDateTime: string;
  time: number;
  request: {
    method: string;
    url: string;
    httpVersion: string;
    headers: { name: string; value: string }[];
    queryString: { name: string; value: string }[];
    cookies: { name: string; value: string }[];
    headersSize: number;
    bodySize: number;
    postData?: {
      mimeType: string;
      text: string;
    };
  };
  response: {
    status: number;
    statusText: string;
    httpVersion: string;
    headers: { name: string; value: string }[];
    cookies: { name: string; value: string }[];
    content: {
      size: number;
      mimeType: string;
      text?: string;
    };
    redirectURL: string;
    headersSize: number;
    bodySize: number;
  };
  cache: {};
  timings: {
    send: number;
    wait: number;
    receive: number;
  };
}

interface HARFormat {
  log: {
    version: string;
    creator: {
      name: string;
      version: string;
    };
    entries: HAREntry[];
  };
}

/**
 * Convert NetworkRequest array to HAR format
 */
export const convertToHAR = (requests: NetworkRequest[]): HARFormat => {
  const entries: HAREntry[] = requests
    .filter(req => req.status !== 0) // Only include completed requests
    .map(req => {
      // Parse URL for query string
      const url = new URL(req.url);
      const queryString = Array.from(url.searchParams.entries()).map(([name, value]) => ({
        name,
        value
      }));

      // Convert headers
      const requestHeaders = Object.entries(req.requestHeaders || {}).map(([name, value]) => ({
        name,
        value: String(value)
      }));

      const responseHeaders = Object.entries(req.responseHeaders || {}).map(([name, value]) => ({
        name,
        value: String(value)
      }));

      // Parse cookies
      const cookies = Object.entries(req.cookies || {}).map(([name, value]) => ({
        name,
        value: String(value)
      }));

      // Get content type
      const contentType = req.responseHeaders['content-type'] || 'text/plain';

      return {
        startedDateTime: new Date(req.timestamp).toISOString(),
        time: req.time,
        request: {
          method: req.method,
          url: req.url,
          httpVersion: req.protocol || 'HTTP/1.1',
          headers: requestHeaders,
          queryString,
          cookies,
          headersSize: -1, // -1 means not available
          bodySize: req.requestBody?.length || 0,
          ...(req.requestBody && {
            postData: {
              mimeType: req.requestHeaders['content-type'] || 'application/x-www-form-urlencoded',
              text: req.requestBody
            }
          })
        },
        response: {
          status: req.status,
          statusText: req.statusText || getStatusText(req.status),
          httpVersion: req.protocol || 'HTTP/1.1',
          headers: responseHeaders,
          cookies,
          content: {
            size: req.size,
            mimeType: contentType,
            text: req.responseBody
          },
          redirectURL: '',
          headersSize: -1,
          bodySize: req.size
        },
        cache: {},
        timings: {
          send: 0,
          wait: req.time * 0.8, // Approximate 80% waiting
          receive: req.time * 0.2 // Approximate 20% receiving
        }
      };
    });

  return {
    log: {
      version: '1.2',
      creator: {
        name: 'NetRunner Academy Reqable Simulator',
        version: '0.1.0'
      },
      entries
    }
  };
};

/**
 * Convert HAR format to NetworkRequest array
 */
export const convertFromHAR = (har: HARFormat): NetworkRequest[] => {
  return har.log.entries.map((entry, index) => {
    // Convert headers back to object
    const requestHeaders: Record<string, string> = {};
    entry.request.headers.forEach(h => {
      requestHeaders[h.name.toLowerCase()] = h.value;
    });

    const responseHeaders: Record<string, string> = {};
    entry.response.headers.forEach(h => {
      responseHeaders[h.name.toLowerCase()] = h.value;
    });

    // Convert cookies back to object
    const cookies: Record<string, string> = {};
    entry.response.cookies.forEach(c => {
      cookies[c.name] = c.value;
    });

    // Determine request type
    const contentType = entry.response.content.mimeType || '';
    let type: NetworkRequest['type'] = 'fetch';
    if (contentType.includes('javascript')) type = 'script';
    else if (contentType.includes('css')) type = 'css';
    else if (contentType.includes('image')) type = 'img';
    else if (entry.request.url.includes('html')) type = 'document';

    return {
      id: `har-import-${Date.now()}-${index}`,
      url: entry.request.url,
      method: entry.request.method,
      status: entry.response.status,
      statusText: entry.response.statusText,
      type,
      size: entry.response.content.size,
      time: entry.time,
      timestamp: new Date(entry.startedDateTime).getTime(),
      requestHeaders,
      responseHeaders,
      requestBody: entry.request.postData?.text,
      responseBody: entry.response.content.text,
      protocol: entry.request.httpVersion,
      remoteAddress: '',
      cookies
    };
  });
};

/**
 * Download HAR file
 */
export const downloadHAR = (requests: NetworkRequest[], filename = 'netrunner-traffic.har') => {
  const har = convertToHAR(requests);
  const blob = new Blob([JSON.stringify(har, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
};

/**
 * Get HTTP status text from status code
 */
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable'
  };
  
  return statusTexts[status] || 'Unknown';
}
