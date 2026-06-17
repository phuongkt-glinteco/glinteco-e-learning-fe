import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cohort } from '../database/entities/cohort.entity';
import { User } from '../database/entities/user.entity';
import { CreateCohortDto } from './dto/create-cohort.dto';
import { UpdateCohortDto } from './dto/update-cohort.dto';

@Injectable()
export class CohortService {
  constructor(
    @InjectRepository(Cohort)
    private readonly cohortRepository: Repository<Cohort>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createCohortDto: CreateCohortDto): Promise<Cohort> {
    const cohort = this.cohortRepository.create(createCohortDto);
    return this.cohortRepository.save(cohort);
  }

  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{
    data: Cohort[];
    meta: { total: number; page: number; limit: number; lastPage: number };
  }> {
    const adjustedLimit = Math.min(limit, 50);
    const skip = (page - 1) * adjustedLimit;

    const [data, total] = await this.cohortRepository.findAndCount({
      skip,
      take: adjustedLimit,
      order: { createdAt: 'DESC' },
    });

    const lastPage = Math.ceil(total / adjustedLimit);

    return {
      data,
      meta: {
        total,
        page,
        limit: adjustedLimit,
        lastPage: lastPage || 1,
      },
    };
  }

  async findOne(id: string): Promise<Cohort> {
    const cohort = await this.cohortRepository.findOne({
      where: { id },
    });
    if (!cohort) {
      throw new NotFoundException(`Không tìm thấy Cohort với ID: ${id}`);
    }
    return cohort;
  }

  async update(id: string, updateCohortDto: UpdateCohortDto): Promise<Cohort> {
    const cohort = await this.findOne(id);
    Object.assign(cohort, updateCohortDto);
    return this.cohortRepository.save(cohort);
  }

  async remove(id: string): Promise<void> {
    const cohort = await this.findOne(id);

    // Check if there are users in this cohort
    const usersCount = await this.userRepository.count({
      where: { cohortId: id },
    });
    if (usersCount > 0) {
      throw new BadRequestException(
        'Không thể xóa Cohort vì đang có học viên trực thuộc.',
      );
    }

    await this.cohortRepository.remove(cohort);
  }
}
