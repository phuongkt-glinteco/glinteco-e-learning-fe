export class SubmissionResubmittedEvent {
  submissionId: string; // UUID
  userId: string; // UUID
  userName: string;
  userEmail: string;
  exerciseId: string; // UUID
  exerciseTitle: string;
  trackId: string; // UUID
  trackName: string;
  prUrl: string;
  submittedAt: Date;
  previousComments: string[]; // History of feedback comments
}
