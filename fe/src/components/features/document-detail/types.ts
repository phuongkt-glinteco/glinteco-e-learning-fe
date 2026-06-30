export interface GuideContent {
  body: string;
}

export interface TutorialContent {
  explanation: string;
  steps: Array<{ title: string; body: string }>;
}

export interface RunbookContent {
  background: string;
  severity?: string;
  incidentId?: string;
  estimatedTime?: string;
  symptoms?: string[];
  status?: string;
  phases: Array<{
    name: string;
    steps: Array<{ title: string; body: string }>;
  }>;
}

export interface ReferenceContent {
  sections: Array<{ heading: string; body: string }>;
}

export interface LinkContent {
  description: string;
  overview: string;
}

export type DocumentContent = GuideContent | TutorialContent | RunbookContent | ReferenceContent | LinkContent;
