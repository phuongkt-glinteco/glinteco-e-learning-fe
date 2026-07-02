export interface ResourceRef {
  id: string;
  name?: string;
  title?: string;
  kind?: string;
}

export interface GuideContent {
  objective?: string;
  prerequisites?: ResourceRef[];
  steps?: string;
  expectedResult?: string;
  relatedDocs?: ResourceRef[];
  // Legacy fallback
  body?: string;
}

export interface TutorialContent {
  learningObjectives?: string[];
  prerequisites?: ResourceRef[];
  duration?: number;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  steps?: string;
  exercises?: string[];
  summary?: string;
  // Legacy fallback
  explanation?: string;
  legacySteps?: Array<{ title: string; body: string }>;
}

export interface RunbookContent {
  trigger?: string;
  impact?: string;
  prerequisites?: ResourceRef[];
  procedure?: string;
  validation?: string;
  rollback?: string;
  escalation?: string;
  relatedDocs?: ResourceRef[];
  // Legacy fallback
  background?: string;
  severity?: string;
  incidentId?: string;
  estimatedTime?: string;
  symptoms?: string[];
  status?: string;
  phases?: Array<{
    name: string;
    steps: Array<{ title: string; body: string }>;
  }>;
}

export interface ReferenceProperty {
  name: string;
  type?: string;
  required?: boolean;
  description?: string;
  defaultValue?: string;
}

export interface ReferenceContent {
  category?: string;
  version?: string;
  properties?: ReferenceProperty[];
  examples?: string;
  notes?: string;
  // Legacy fallback
  sections?: Array<{ heading: string; body: string }>;
}

export interface LinkContent {
  url?: string;
  provider?: string;
  type?: string;
  openInNewTab?: boolean;
  description?: string;
  // Legacy fallback
  overview?: string;
}

export type DocumentContent = GuideContent | TutorialContent | RunbookContent | ReferenceContent | LinkContent;
