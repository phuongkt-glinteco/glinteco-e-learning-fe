import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { UpdateProfileDto } from './update-profile.dto';

/**
 * These tests assert the DoD invariant: a learner can only edit
 * name / title / avatarHue. email and role are not part of the DTO, so the
 * global ValidationPipe (configured with whitelist + forbidNonWhitelisted in
 * main.ts) must reject any request that tries to set them.
 */
describe('UpdateProfileDto validation', () => {
  // Mirror the global pipe configuration from main.ts.
  const pipe = new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  });
  const metadata = {
    type: 'body' as const,
    metatype: UpdateProfileDto,
  };

  it('accepts a valid name / title / avatarHue payload', async () => {
    const result = await pipe.transform(
      { name: 'Mina', title: 'Senior Frontend Engineer', avatarHue: 200 },
      metadata,
    );
    expect(result).toEqual({
      name: 'Mina',
      title: 'Senior Frontend Engineer',
      avatarHue: 200,
    });
  });

  it('rejects an attempt to change email', async () => {
    await expect(
      pipe.transform({ email: 'hacker@example.com' }, metadata),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects an attempt to change role (privilege escalation)', async () => {
    await expect(
      pipe.transform({ role: 'admin' }, metadata),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects avatarHue outside the 0-360 range', async () => {
    await expect(
      pipe.transform({ avatarHue: 999 }, metadata),
    ).rejects.toThrow(BadRequestException);
  });
});
