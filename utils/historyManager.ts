import { NetworkRequest } from '../types';

// LocalStorage key for history persistence
const HISTORY_STORAGE_KEY = 'netrunner_request_history';

// Maximum history entries to persist (prevent localStorage quota issues)
const MAX_HISTORY_SIZE = 500;

/**
 * Load request history from localStorage
 * @returns Array of NetworkRequest objects, or empty array if none found
 */
export const loadRequestHistory = (): NetworkRequest[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);

    // Validate that it's an array
    if (!Array.isArray(parsed)) {
      console.warn('Invalid history data format, clearing history');
      return [];
    }

    // Convert timestamp strings back to numbers if needed
    return parsed.map((req: any) => ({
      ...req,
      timestamp: typeof req.timestamp === 'string' ? parseInt(req.timestamp, 10) : req.timestamp,
    }));
  } catch (error) {
    console.error('Failed to load request history:', error);
    return [];
  }
};

/**
 * Save request history to localStorage
 * @param requests - Array of NetworkRequest objects to save
 */
export const saveRequestHistory = (requests: NetworkRequest[]): void => {
  if (typeof window === 'undefined') return;

  try {
    // Limit history size to prevent localStorage quota issues
    const trimmedRequests = requests.slice(-MAX_HISTORY_SIZE);

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(trimmedRequests));
  } catch (error) {
    console.error('Failed to save request history:', error);

    // If quota exceeded, try clearing old entries and retry
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        const reducedRequests = requests.slice(-Math.floor(MAX_HISTORY_SIZE / 2));
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(reducedRequests));
        console.warn(`History truncated to ${reducedRequests.length} entries due to storage quota`);
      } catch (retryError) {
        console.error('Failed to save even reduced history:', retryError);
      }
    }
  }
};

/**
 * Clear all request history from localStorage
 */
export const clearRequestHistory = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear request history:', error);
  }
};

/**
 * Get current history size in localStorage
 * @returns Size in bytes, or 0 if unavailable
 */
export const getHistorySize = (): number => {
  if (typeof window === 'undefined') return 0;

  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!stored) return 0;

    // Calculate size in bytes (UTF-16 encoding, 2 bytes per character)
    return new Blob([stored]).size;
  } catch (error) {
    console.error('Failed to get history size:', error);
    return 0;
  }
};

/**
 * Format bytes to human-readable string
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 KB", "2.3 MB")
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
