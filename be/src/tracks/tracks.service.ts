import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';
import { ReorderTracksResponseDto } from './dto/reorder-tracks-response.dto';
import { TracksRepository } from './tracks.repository';

@Injectable()
export class TracksService {
  constructor(private readonly tracksRepository: TracksRepository) {}

  /**
   * Reorders the entire track timeline.
   *
   * Contract (per the approved design — "sắp xếp lại toàn bộ các Track"): the
   * `order` payload must list EVERY track exactly once. We therefore enforce a
   * full-set match:
   *   - every id must reference an existing track (else 404), and
   *   - the count must equal the total number of tracks (else 400),
   * so the operation can never leave the timeline partially ordered with gaps.
   * The DTO already guarantees the array is non-empty and contains unique v4
   * UUIDs.
   */
  async reorder(dto: ReorderTracksDto): Promise<ReorderTracksResponseDto> {
    const { order } = dto;

    const [existing, total] = await Promise.all([
      this.tracksRepository.findByIds(order),
      this.tracksRepository.count(),
    ]);

    const existingIds = new Set(existing.map((track) => track.id));
    const missing = order.filter((id) => !existingIds.has(id));
    if (missing.length > 0) {
      throw new NotFoundException(
        `Không tìm thấy track với id: ${missing.join(', ')}`,
      );
    }

    if (order.length !== total) {
      throw new BadRequestException(
        `Danh sách order phải bao gồm toàn bộ ${total} track của timeline ` +
          `(đã nhận ${order.length}).`,
      );
    }

    const count = await this.tracksRepository.applyOrder(order);

    return { message: 'Tracks reordered', count };
  }
}
