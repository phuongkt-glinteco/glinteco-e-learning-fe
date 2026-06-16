import { Test } from '@nestjs/testing';
import { UsersModule } from './users.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  User,
  Cohort,
  Track,
  Lesson,
  TrackProgress,
  Exercise,
  Submission,
  SubmissionHistory,
  Document,
  Tag,
  LessonProgress,
} from '../../database/entities';

describe('UsersModule', () => {
  it('should compile the module', async () => {
    const module = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({})
      .overrideProvider(getRepositoryToken(Cohort))
      .useValue({})
      .overrideProvider(getRepositoryToken(Track))
      .useValue({})
      .overrideProvider(getRepositoryToken(Lesson))
      .useValue({})
      .overrideProvider(getRepositoryToken(TrackProgress))
      .useValue({})
      .overrideProvider(getRepositoryToken(Exercise))
      .useValue({})
      .overrideProvider(getRepositoryToken(Submission))
      .useValue({})
      .overrideProvider(getRepositoryToken(SubmissionHistory))
      .useValue({})
      .overrideProvider(getRepositoryToken(Document))
      .useValue({})
      .overrideProvider(getRepositoryToken(Tag))
      .useValue({})
      .overrideProvider(getRepositoryToken(LessonProgress))
      .useValue({})
      .compile();

    expect(module).toBeDefined();
  });
});
