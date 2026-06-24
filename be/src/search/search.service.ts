import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Track } from '../database/entities/track.entity';
import { Document } from '../database/entities/document.entity';
import { Exercise } from '../database/entities/exercise.entity';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchResponseDto } from './dto/search-response.dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
  ) {}

  async globalSearch(query: SearchQueryDto): Promise<SearchResponseDto> {
    const { q } = query;

    const tracks = await this.trackRepository.find({
      where: { title: ILike(`%${q}%`) },
      take: 10,
    });

    const documents = await this.documentRepository.find({
      where: { title: ILike(`%${q}%`) },
      take: 10,
    });

    const exercises = await this.exerciseRepository.find({
      where: { title: ILike(`%${q}%`) },
      relations: { track: true },
      take: 10,
    });

    return {
      tracks: tracks.map((track) => ({
        id: track.id,
        title: track.title,
      })),
      documents: documents.map((doc) => ({
        id: doc.id,
        title: doc.title,
        kind: doc.kind,
      })),
      exercises: exercises.map((ex) => ({
        id: ex.id,
        title: ex.title,
        tag: ex.track?.title || 'N/A',
      })),
    };
  }
}
