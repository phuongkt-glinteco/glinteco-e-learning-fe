export class SubmissionReviewedEvent {
  submissionId: string;      // UUID
  userId: string;            // UUID
  userName: string;
  userEmail: string;
  slackUserId?: string;      // User's Slack Member ID (for DM)
  exerciseId: string;        // UUID
  exerciseTitle: string;
  status: 'approved' | 'rejected' | 'changes'; // outcome
  adminId: string;           // UUID
  adminName: string;
  comment?: string;          // Admin review feedback
  xpAwarded: number;         // XP gained (0 if not approved)
  newXp: number;             // Updated total XP
  newLevel: number;          // Updated Level
  levelUpgraded: boolean;    // True if user leveled up
  reviewedAt: Date;
}
