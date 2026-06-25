import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { SearchDocumentsDto } from './dto/search-documents.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { CreateTagDto } from './dto/create-tag.dto';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../modules/auth/guards/roles.guard';
import { DocumentKind } from '../database/entities/document.entity';

describe('DocumentsController', () => {
  let controller: DocumentsController;

  const mockDocumentsService = {
    findAll: jest.fn(),
    findRecent: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    bookmark: jest.fn(),
    unbookmark: jest.fn(),
    findAllTags: jest.fn(),
    createTag: jest.fn(),
    deleteTag: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        { provide: DocumentsService, useValue: mockDocumentsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DocumentsController>(DocumentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate findAll to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      const query: SearchDocumentsDto = { q: 'test' };
      mockDocumentsService.findAll.mockResolvedValue({ data: [] });

      const result = await controller.findAll(query, req);
      expect(mockDocumentsService.findAll).toHaveBeenCalledWith(
        query,
        'user-1',
      );
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findRecent', () => {
    it('should delegate findRecent to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockDocumentsService.findRecent.mockResolvedValue({ data: [] });

      const result = await controller.findRecent(req);
      expect(mockDocumentsService.findRecent).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate findOne to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockDocumentsService.findOne.mockResolvedValue({ id: 'doc-1' });

      const result = await controller.findOne('doc-1', req);
      expect(mockDocumentsService.findOne).toHaveBeenCalledWith(
        'doc-1',
        'user-1',
      );
      expect(result).toEqual({ id: 'doc-1' });
    });
  });

  describe('create', () => {
    it('should delegate create to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      const dto: CreateDocumentDto = { title: 'Doc', kind: DocumentKind.GUIDE };
      mockDocumentsService.create.mockResolvedValue({ id: 'doc-1' });

      const result = await controller.create(dto, req);
      expect(mockDocumentsService.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual({ id: 'doc-1' });
    });
  });

  describe('update', () => {
    it('should delegate update to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      const dto: UpdateDocumentDto = { title: 'New Doc' };
      mockDocumentsService.update.mockResolvedValue({ id: 'doc-1' });

      const result = await controller.update('doc-1', dto, req);
      expect(mockDocumentsService.update).toHaveBeenCalledWith(
        'doc-1',
        dto,
        'user-1',
      );
      expect(result).toEqual({ id: 'doc-1' });
    });
  });

  describe('delete', () => {
    it('should delegate delete to service', async () => {
      mockDocumentsService.delete.mockResolvedValue(undefined);
      await controller.delete('doc-1');
      expect(mockDocumentsService.delete).toHaveBeenCalledWith('doc-1');
    });
  });

  describe('bookmark', () => {
    it('should delegate bookmark to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockDocumentsService.bookmark.mockResolvedValue({
        documentId: 'doc-1',
        bookmarked: true,
      });

      const result = await controller.bookmark('doc-1', req);
      expect(mockDocumentsService.bookmark).toHaveBeenCalledWith(
        'doc-1',
        'user-1',
      );
      expect(result).toEqual({ documentId: 'doc-1', bookmarked: true });
    });
  });

  describe('unbookmark', () => {
    it('should delegate unbookmark to service', async () => {
      const req = { user: { id: 'user-1', role: 'learner' } };
      mockDocumentsService.unbookmark.mockResolvedValue(undefined);

      await controller.unbookmark('doc-1', req);
      expect(mockDocumentsService.unbookmark).toHaveBeenCalledWith(
        'doc-1',
        'user-1',
      );
    });
  });

  describe('findAllTags', () => {
    it('should delegate findAllTags to service', async () => {
      mockDocumentsService.findAllTags.mockResolvedValue([]);
      const result = await controller.findAllTags();
      expect(mockDocumentsService.findAllTags).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('createTag', () => {
    it('should delegate createTag to service', async () => {
      const dto: CreateTagDto = { name: 'React' };
      mockDocumentsService.createTag.mockResolvedValue({
        id: 'tag-1',
        name: 'React',
      });

      const result = await controller.createTag(dto);
      expect(mockDocumentsService.createTag).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: 'tag-1', name: 'React' });
    });
  });

  describe('deleteTag', () => {
    it('should delegate deleteTag to service', async () => {
      mockDocumentsService.deleteTag.mockResolvedValue(undefined);
      await controller.deleteTag('tag-1');
      expect(mockDocumentsService.deleteTag).toHaveBeenCalledWith('tag-1');
    });
  });
});
