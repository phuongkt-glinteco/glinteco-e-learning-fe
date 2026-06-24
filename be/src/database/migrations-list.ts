import { InitialSchema1781611485949 } from './migrations/1781611485949-InitialSchema';
import { UpdateUserAndLessonProgress1781615351400 } from './migrations/1781615351400-UpdateUserAndLessonProgress';
import { AddGoogleIdToUsers1781616508023 } from './migrations/1781616508023-AddGoogleIdToUsers';
import { UpdateSubmissionStatusEnum1781617000000 } from './migrations/1781617000000-UpdateSubmissionStatusEnum';
import { AddTrackOrderIndex1781617100000 } from './migrations/1781617100000-AddTrackOrderIndex';
import { AddKindToDocumentsAndSearchIndexes1781617508000 } from './migrations/1781617508000-AddKindToDocumentsAndSearchIndexes';
import { AddExerciseDetails1781622361007 } from './migrations/1781622361007-AddExerciseDetails';
import { AddUserBookmarks1781623541186 } from './migrations/1781623541186-AddUserBookmarks';
import { AddIsActiveToCohorts1781624224625 } from './migrations/1781624224625-AddIsActiveToCohorts';
import { AddLessonsCompletedToTrackProgress1781628751000 } from './migrations/1781628751000-AddLessonsCompletedToTrackProgress';
import { AddAuthSchema1781700000000 } from './migrations/1781700000000-AddAuthSchema';
import { AddResetPasswordFieldsToUser1781700100000 } from './migrations/1781700100000-AddResetPasswordFieldsToUser';
import { CreateNotificationsTable1781700200000 } from './migrations/1781700200000-CreateNotificationsTable';
import { AddLeaderboardIndexes1784301321000 } from './migrations/1784301321000-AddLeaderboardIndexes';
import { UpdateSubmissionHistorySchema1784301322000 } from './migrations/1784301322000-UpdateSubmissionHistorySchema';
import { AddLastClaimedXpAtToUsers1784301323000 } from './migrations/1784301323000-AddLastClaimedXpAtToUsers';
import { UpdateTracksAndLessonsSchema1784400000000 } from './migrations/1784400000000-UpdateTracksAndLessonsSchema';
import { UpdateEntitiesForFeAudit1784500000000 } from './migrations/1784500000000-UpdateEntitiesForFeAudit';
import { AddDescriptionToLessons1784600000000 } from './migrations/1784600000000-AddDescriptionToLessons';

export const MIGRATIONS = [
  InitialSchema1781611485949,
  UpdateUserAndLessonProgress1781615351400,
  AddGoogleIdToUsers1781616508023,
  UpdateSubmissionStatusEnum1781617000000,
  AddTrackOrderIndex1781617100000,
  AddKindToDocumentsAndSearchIndexes1781617508000,
  AddExerciseDetails1781622361007,
  AddUserBookmarks1781623541186,
  AddIsActiveToCohorts1781624224625,
  AddLessonsCompletedToTrackProgress1781628751000,
  AddAuthSchema1781700000000,
  AddResetPasswordFieldsToUser1781700100000,
  CreateNotificationsTable1781700200000,
  AddLeaderboardIndexes1784301321000,
  UpdateSubmissionHistorySchema1784301322000,
  AddLastClaimedXpAtToUsers1784301323000,
  UpdateTracksAndLessonsSchema1784400000000,
  UpdateEntitiesForFeAudit1784500000000,
  AddDescriptionToLessons1784600000000,
];
