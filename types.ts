
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
  isPaused?: boolean;
}

export interface ScriptRule {
  id: string;
  name: string;
  matchUrl: string;
  action: 'Allow' | 'Block' | 'Modify Response';
  active: boolean;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: 'Basics' | 'Security' | 'Debugging' | 'Advanced' | 'Reverse';
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
