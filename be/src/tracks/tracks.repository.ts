import { Injectable } from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { Track } from '../database/entities/track.entity';

/**
 * Data-access layer for {@link Track}. Wraps the TypeORM repository and owns the
 * transactional write used by the reorder endpoint so the service stays free of
 * persistence concerns.
 */
@Injectable()
export class TracksRepository {
  private readonly repository: Repository<Track>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Track);
  }

  /** Total number of tracks in the timeline. */
  count(): Promise<number> {
    return this.repository.count();
  }

  /** Loads every track whose id is in `ids` (order not guaranteed). */
  findByIds(ids: string[]): Promise<Track[]> {
    if (ids.length === 0) {
      return Promise.resolve([]);
    }
    return this.repository.find({ where: { id: In(ids) } });
  }

  /**
   * Persists the new ordering. `orderedIds[i]` receives `track_order = i + 1`
   * (1-based, matching the seed convention) inside a single transaction so the
   * timeline is never left half-reordered. `track_order` is indexed but NOT
   * unique, so a straight single-pass assignment is safe — no temp-value
   * juggling required.
   *
   * @returns the number of rows updated.
   */
  async applyOrder(orderedIds: string[]): Promise<number> {
    return this.dataSource.transaction(async (manager) => {
      let updated = 0;
      for (let index = 0; index < orderedIds.length; index += 1) {
        const result = await manager.update(
          Track,
          { id: orderedIds[index] },
          { order: index + 1 },
        );
        updated += result.affected ?? 0;
      }
      return updated;
    });
  }
}
