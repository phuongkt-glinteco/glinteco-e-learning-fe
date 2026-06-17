import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Document } from '../database/entities/document.entity';
import { Tag } from '../database/entities/tag.entity';
import { User } from '../database/entities/user.entity';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(query: SearchDocumentsDto, userId: string) {
    const { q, tags, kind, limit = 20, cursor } = query;

    // Load user's bookmarks to calculate isBookmarked field
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { bookmarkedDocuments: true },
    });
    const bookmarkedDocIds = new Set(
      user?.bookmarkedDocuments?.map((d) => d.id) || [],
    );

    const qb = this.documentRepository
      .createQueryBuilder('document')
      .leftJoinAndSelect('document.tags', 'tag');

    // Filter by keyword in title or content
    if (q) {
      qb.andWhere('(document.title ILIKE :q OR document.content ILIKE :q)', {
        q: `%${q}%`,
      });
    }

    // Filter by document kind
    if (kind) {
      qb.andWhere('document.kind = :kind', { kind });
    }

    // Filter by tags (comma-separated names)
    if (tags) {
      const tagList = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      if (tagList.length > 0) {
        // Find documents that have tag matching any of tagList
        // We do this by subquery or where condition on joined tags
        qb.andWhere((sub) => {
          const subQuery = sub
            .subQuery()
            .select('doc.id')
            .from(Document, 'doc')
            .leftJoin('doc.tags', 't')
            .where('t.name IN (:...tagList)', { tagList })
            .getQuery();
          return 'document.id IN ' + subQuery;
        });
      }
    }

    // Sorting: order by createdAt DESC, id ASC for keyset pagination
    qb.orderBy('document.createdAt', 'DESC').addOrderBy('document.id', 'ASC');

    // Keyset pagination cursor decoding & filter
    if (cursor) {
      try {
        const decoded = JSON.parse(
          Buffer.from(cursor, 'base64').toString('ascii'),
        ) as { createdAt?: string; id?: string };
        const { createdAt, id } = decoded;

        if (createdAt && id) {
          qb.andWhere(
            '(document.createdAt < :createdAt OR (document.createdAt = :createdAt AND document.id > :id))',
            { createdAt: new Date(createdAt), id },
          );
        }
      } catch {
        // Ignore invalid cursor
      }
    }

    // Fetch limit + 1 to check for next page
    qb.take(limit + 1);

    const results = await qb.getMany();

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const lastItem = data[data.length - 1];
      nextCursor = Buffer.from(
        JSON.stringify({
          createdAt: lastItem.createdAt.toISOString(),
          id: lastItem.id,
        }),
      ).toString('base64');
    }

    const resolvedData = data.map((doc) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      url: doc.url,
      kind: doc.kind,
      tags: doc.tags || [],
      isBookmarked: bookmarkedDocIds.has(doc.id),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }));

    return {
      data: resolvedData,
      nextCursor,
      hasMore,
    };
  }

  async findRecent(userId: string) {
    // Recently bookmarked documents by the user
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { bookmarkedDocuments: { tags: true } },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Order user bookmarks by doc createdAt or just return them
    const data = (user.bookmarkedDocuments || []).map((doc) => ({
      id: doc.id,
      title: doc.title,
      content: doc.content,
      url: doc.url,
      kind: doc.kind,
      tags: doc.tags || [],
      isBookmarked: true,
    }));

    return { data };
  }

  async findOne(id: string, userId: string) {
    const doc = await this.documentRepository.findOne({
      where: { id },
      relations: { tags: true },
    });

    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Check if bookmarked
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { bookmarkedDocuments: true },
    });
    const isBookmarked = (user?.bookmarkedDocuments || []).some(
      (d) => d.id === id,
    );

    return {
      id: doc.id,
      title: doc.title,
      content: doc.content,
      url: doc.url,
      kind: doc.kind,
      tags: doc.tags || [],
      isBookmarked,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async create(createDocDto: CreateDocumentDto, userId: string) {
    const { title, content, url, kind, tagIds } = createDocDto;

    let tags: Tag[] = [];
    if (tagIds && tagIds.length > 0) {
      tags = await this.tagRepository.find({
        where: { id: In(tagIds) },
      });
    }

    const doc = this.documentRepository.create({
      title,
      content,
      url,
      kind,
      tags,
    });

    const savedDoc = await this.documentRepository.save(doc);
    return await this.findOne(savedDoc.id, userId);
  }

  async update(id: string, updateDocDto: UpdateDocumentDto, userId: string) {
    const doc = await this.documentRepository.findOne({
      where: { id },
      relations: { tags: true },
    });

    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    const { title, content, url, kind, tagIds } = updateDocDto;

    if (title !== undefined) doc.title = title;
    if (content !== undefined) doc.content = content;
    if (url !== undefined) doc.url = url;
    if (kind !== undefined) doc.kind = kind;

    if (tagIds !== undefined) {
      if (tagIds.length > 0) {
        doc.tags = await this.tagRepository.find({
          where: { id: In(tagIds) },
        });
      } else {
        doc.tags = [];
      }
    }

    await this.documentRepository.save(doc);
    return await this.findOne(id, userId);
  }

  async delete(id: string) {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    await this.documentRepository.remove(doc);
  }

  async bookmark(id: string, userId: string) {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { bookmarkedDocuments: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.bookmarkedDocuments.some((d) => d.id === id)) {
      user.bookmarkedDocuments.push(doc);
      await this.userRepository.save(user);
    }

    return {
      documentId: id,
      bookmarked: true,
    };
  }

  async unbookmark(id: string, userId: string) {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { bookmarkedDocuments: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.bookmarkedDocuments = user.bookmarkedDocuments.filter(
      (d) => d.id !== id,
    );
    await this.userRepository.save(user);
  }

  // --- Tags Logic ---

  async findAllTags() {
    return await this.tagRepository.find({
      order: { name: 'ASC' },
    });
  }

  async createTag(createTagDto: CreateTagDto) {
    const name = createTagDto.name.trim();

    const existingTag = await this.tagRepository.findOne({
      where: { name },
    });

    if (existingTag) {
      throw new ConflictException(`Tag với tên '${name}' đã tồn tại`);
    }

    const tag = this.tagRepository.create({ name });
    return await this.tagRepository.save(tag);
  }

  async deleteTag(id: string) {
    const tag = await this.tagRepository.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }
    await this.tagRepository.remove(tag);
  }
}
