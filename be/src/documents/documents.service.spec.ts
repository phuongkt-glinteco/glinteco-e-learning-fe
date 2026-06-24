import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentsService } from './documents.service';
import { Document, DocumentKind } from '../database/entities/document.entity';
import { Tag } from '../database/entities/tag.entity';
import { User } from '../database/entities/user.entity';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('DocumentsService', () => {
  let service: DocumentsService;

  const mockQueryBuilder = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockImplementation((cond: any) => {
      if (typeof cond === 'function') {
        (cond as (qb: any) => any)(mockQueryBuilder);
      }
      return mockQueryBuilder;
    }),
    subQuery: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getQuery: jest.fn().mockReturnValue('(SUBQUERY)'),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  const mockDocumentRepository = {
    createQueryBuilder: jest.fn(() => mockQueryBuilder),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockTagRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: mockDocumentRepository,
        },
        { provide: getRepositoryToken(Tag), useValue: mockTagRepository },
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should search documents with filters and cursor pagination', async () => {
      const queryDto: SearchDocumentsDto = {
        q: 'react',
        kind: DocumentKind.GUIDE,
        tags: 'tech, react',
        limit: 2,
        cursor:
          'eyJjcmVhdGVkQXQiOiIyMDI2LTA2LTE3VDEyOjAwOjAwWiIsImlkIjoiZG9jLTEifQ==',
      };
      const docList = [
        {
          id: 'doc-1',
          title: 'React Guide',
          content: 'Intro to react',
          kind: DocumentKind.GUIDE,
          tags: [],
          createdAt: new Date(),
        },
        {
          id: 'doc-2',
          title: 'React Hooks',
          content: 'Intro to hooks',
          kind: DocumentKind.GUIDE,
          tags: [],
          createdAt: new Date(),
        },
      ];

      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        bookmarkedDocuments: [],
      });
      mockQueryBuilder.getMany.mockResolvedValue(docList);

      const result = await service.findAll(queryDto, 'user-1');

      expect(mockDocumentRepository.createQueryBuilder).toHaveBeenCalledWith(
        'document',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.hasMore).toBe(false);
    });

    it('should handle invalid cursor gracefully', async () => {
      const queryDto: SearchDocumentsDto = { cursor: 'invalid-base64' };
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        bookmarkedDocuments: [],
      });
      mockQueryBuilder.getMany.mockResolvedValue([]);

      const result = await service.findAll(queryDto, 'user-1');
      expect(result.data).toHaveLength(0);
    });
  });

  describe('findRecent', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findRecent('invalid-user')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return recently bookmarked documents', async () => {
      const bookmarked = [
        {
          id: 'doc-1',
          title: 'React Doc',
          content: 'Guide',
          url: 'http',
          kind: DocumentKind.GUIDE,
          tags: [],
        },
      ];
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        bookmarkedDocuments: bookmarked,
      });

      const result = await service.findRecent('user-1');
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('doc-1');
      expect(result.data[0].isBookmarked).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should return document detail with bookmark status', async () => {
      const doc = { id: 'doc-1', title: 'Doc 1', tags: [] };
      mockDocumentRepository.findOne.mockResolvedValue(doc);
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        bookmarkedDocuments: [{ id: 'doc-1' }],
      });

      const result = await service.findOne('doc-1', 'user-1');
      expect(result.id).toBe('doc-1');
      expect(result.isBookmarked).toBe(true);
    });

    it('should throw NotFoundException if document not found', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('invalid-doc', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and save a document with tag ids', async () => {
      const dto: CreateDocumentDto = {
        title: 'New Doc',
        kind: DocumentKind.GUIDE,
        tagIds: ['tag-1'],
      };
      const savedDoc = {
        id: 'doc-new',
        title: 'New Doc',
        kind: DocumentKind.GUIDE,
        tags: [{ id: 'tag-1', name: 'React' }],
      };

      mockTagRepository.find.mockResolvedValue([
        { id: 'tag-1', name: 'React' },
      ]);
      mockDocumentRepository.create.mockReturnValue(savedDoc);
      mockDocumentRepository.save.mockResolvedValue(savedDoc);
      mockDocumentRepository.findOne.mockResolvedValue(savedDoc);
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        bookmarkedDocuments: [],
      });

      const result = await service.create(dto, 'user-1');
      expect(result.id).toBe('doc-new');
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if document not found', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);
      await expect(service.update('invalid-doc', {}, 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should update and save a document', async () => {
      const doc = {
        id: 'doc-1',
        title: 'Old Doc',
        content: 'Old content',
        tags: [],
      };
      const dto: UpdateDocumentDto = {
        title: 'New Doc',
        content: 'New content',
        tagIds: ['tag-1'],
      };
      const updatedDoc = {
        ...doc,
        title: 'New Doc',
        content: 'New content',
        tags: [{ id: 'tag-1', name: 'React' }],
      };

      mockDocumentRepository.findOne.mockResolvedValue(doc);
      mockTagRepository.find.mockResolvedValue([
        { id: 'tag-1', name: 'React' },
      ]);
      mockDocumentRepository.save.mockResolvedValue(updatedDoc);
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        bookmarkedDocuments: [],
      });

      const result = await service.update('doc-1', dto, 'user-1');
      expect(result.title).toBe('New Doc');
    });

    it('should clear tags if empty tagIds array is passed', async () => {
      const doc = { id: 'doc-1', title: 'Old Doc', tags: [{ id: 'tag-1' }] };
      const dto: UpdateDocumentDto = { tagIds: [] };

      mockDocumentRepository.findOne.mockResolvedValue(doc);
      mockDocumentRepository.save.mockResolvedValue(doc);
      mockUserRepository.findOne.mockResolvedValue({
        id: 'user-1',
        bookmarkedDocuments: [],
      });

      await service.update('doc-1', dto, 'user-1');
      expect(doc.tags).toEqual([]);
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if document to delete not found', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);
      await expect(service.delete('invalid-doc')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove the document', async () => {
      const doc = { id: 'doc-1' };
      mockDocumentRepository.findOne.mockResolvedValue(doc);
      mockDocumentRepository.remove.mockResolvedValue(doc);

      await service.delete('doc-1');
      expect(mockDocumentRepository.remove).toHaveBeenCalledWith(doc);
    });
  });

  describe('bookmark', () => {
    it('should throw NotFoundException if document not found', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);
      await expect(service.bookmark('invalid-doc', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user not found during bookmark', async () => {
      mockDocumentRepository.findOne.mockResolvedValue({ id: 'doc-1' });
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.bookmark('doc-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should add document to user bookmarks', async () => {
      const doc = { id: 'doc-1', title: 'Doc 1' };
      const user = { id: 'user-1', bookmarkedDocuments: [] };

      mockDocumentRepository.findOne.mockResolvedValue(doc);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(user);

      const result = await service.bookmark('doc-1', 'user-1');
      expect(result.documentId).toBe('doc-1');
      expect(result.bookmarked).toBe(true);
      expect(user.bookmarkedDocuments).toHaveLength(1);
    });
  });

  describe('unbookmark', () => {
    it('should throw NotFoundException if document not found', async () => {
      mockDocumentRepository.findOne.mockResolvedValue(null);
      await expect(service.unbookmark('invalid-doc', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException if user not found during unbookmark', async () => {
      mockDocumentRepository.findOne.mockResolvedValue({ id: 'doc-1' });
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.unbookmark('doc-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove document from user bookmarks', async () => {
      const doc = { id: 'doc-1', title: 'Doc 1' };
      const user = { id: 'user-1', bookmarkedDocuments: [doc] };

      mockDocumentRepository.findOne.mockResolvedValue(doc);
      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue(user);

      await service.unbookmark('doc-1', 'user-1');
      expect(user.bookmarkedDocuments).toHaveLength(0);
    });
  });

  describe('findAllTags', () => {
    it('should return all tags ordered by name', async () => {
      const tags = [{ id: 'tag-1', name: 'React' }];
      mockTagRepository.find.mockResolvedValue(tags);

      const result = await service.findAllTags();
      expect(result).toEqual(tags);
      expect(mockTagRepository.find).toHaveBeenCalledWith({
        order: { name: 'ASC' },
      });
    });
  });

  describe('createTag', () => {
    it('should create a tag if it does not exist', async () => {
      const dto: CreateTagDto = { name: 'NestJS' };
      const expectedTag = { id: 'tag-1', name: 'NestJS' };

      mockTagRepository.findOne.mockResolvedValue(null);
      mockTagRepository.create.mockReturnValue(expectedTag);
      mockTagRepository.save.mockResolvedValue(expectedTag);

      const result = await service.createTag(dto);
      expect(result).toEqual(expectedTag);
    });

    it('should throw ConflictException if tag name already exists', async () => {
      const dto: CreateTagDto = { name: 'NestJS' };
      mockTagRepository.findOne.mockResolvedValue({
        id: 'tag-1',
        name: 'NestJS',
      });

      await expect(service.createTag(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteTag', () => {
    it('should throw NotFoundException if tag not found', async () => {
      mockTagRepository.findOne.mockResolvedValue(null);
      await expect(service.deleteTag('invalid-tag')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should remove tag', async () => {
      const tag = { id: 'tag-1', name: 'React' };
      mockTagRepository.findOne.mockResolvedValue(tag);
      mockTagRepository.remove.mockResolvedValue(tag);

      await service.deleteTag('tag-1');
      expect(mockTagRepository.remove).toHaveBeenCalledWith(tag);
    });
  });
});
