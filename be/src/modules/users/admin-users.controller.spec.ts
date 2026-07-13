import { Test, TestingModule } from '@nestjs/testing';
import { AdminUsersController } from './admin-users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from '../../database/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { BanUserDto } from './dto/ban-user.dto';

describe('AdminUsersController', () => {
  let controller: AdminUsersController;
  let service: jest.Mocked<
    Pick<
      UsersService,
      | 'adminList'
      | 'adminCreate'
      | 'adminUpdate'
      | 'adminChangeRole'
      | 'adminSetStatus'
      | 'adminBan'
      | 'adminUnban'
      | 'adminDelete'
      | 'adminAssignCohort'
    >
  >;

  const mockAdminUser = {
    id: 'admin-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: UserRole.ADMIN,
  } as User;

  const mockTargetUser = {
    id: 'user-2',
    email: 'user@example.com',
    name: 'Target User',
    role: UserRole.LEARNER,
  } as User;

  beforeEach(async () => {
    service = {
      adminList: jest.fn(),
      adminCreate: jest.fn(),
      adminUpdate: jest.fn(),
      adminChangeRole: jest.fn(),
      adminSetStatus: jest.fn(),
      adminBan: jest.fn(),
      adminUnban: jest.fn(),
      adminDelete: jest.fn(),
      adminAssignCohort: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminUsersController],
      providers: [
        {
          provide: UsersService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<AdminUsersController>(AdminUsersController);
  });

  describe('findAll', () => {
    it('should call service.adminList', async () => {
      const query = { page: 1, limit: 10 };
      const expectedResponse = {
        data: [mockTargetUser],
        meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
      };
      service.adminList.mockResolvedValue(expectedResponse);

      const result = await controller.findAll(query);

      expect(service.adminList).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('create', () => {
    it('should call service.adminCreate', async () => {
      const dto: CreateUserDto = {
        email: 'new@example.com',
        name: 'New',
        password: 'Password123',
        role: UserRole.LEARNER,
      };
      service.adminCreate.mockResolvedValue(mockTargetUser);

      const result = await controller.create(dto);

      expect(service.adminCreate).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTargetUser);
    });
  });

  describe('update', () => {
    it('should call service.adminUpdate', async () => {
      const dto: UpdateUserAdminDto = {
        role: UserRole.ADMIN,
        cohortId: 'cohort-1',
      };
      service.adminUpdate.mockResolvedValue(mockTargetUser);

      const result = await controller.update(
        mockTargetUser.id,
        mockAdminUser,
        dto,
      );

      expect(service.adminUpdate).toHaveBeenCalledWith(
        mockAdminUser.id,
        mockTargetUser.id,
        dto,
      );
      expect(result).toEqual(mockTargetUser);
    });
  });

  describe('changeRole', () => {
    it('should call service.adminChangeRole', async () => {
      const dto: UpdateUserRoleDto = { role: UserRole.ADMIN };
      service.adminChangeRole.mockResolvedValue(mockTargetUser);

      const result = await controller.changeRole(
        mockTargetUser.id,
        mockAdminUser,
        dto,
      );

      expect(service.adminChangeRole).toHaveBeenCalledWith(
        mockAdminUser.id,
        mockTargetUser.id,
        UserRole.ADMIN,
      );
      expect(result).toEqual(mockTargetUser);
    });
  });

  describe('changeStatus', () => {
    it('should call service.adminSetStatus', async () => {
      const dto: UpdateUserStatusDto = { isActive: false };
      service.adminSetStatus.mockResolvedValue(mockTargetUser);

      const result = await controller.changeStatus(
        mockTargetUser.id,
        mockAdminUser,
        dto,
      );

      expect(service.adminSetStatus).toHaveBeenCalledWith(
        mockAdminUser.id,
        mockTargetUser.id,
        false,
      );
      expect(result).toEqual(mockTargetUser);
    });
  });

  describe('banUser', () => {
    it('should call service.adminBan', async () => {
      const dto: BanUserDto = { reason: 'rules', expiresAt: null };
      service.adminBan.mockResolvedValue(mockTargetUser);

      const result = await controller.banUser(
        mockTargetUser.id,
        mockAdminUser,
        dto,
      );

      expect(service.adminBan).toHaveBeenCalledWith(
        mockAdminUser.id,
        mockTargetUser.id,
        dto,
      );
      expect(result).toEqual(mockTargetUser);
    });
  });

  describe('unbanUser', () => {
    it('should call service.adminUnban', async () => {
      service.adminUnban.mockResolvedValue(mockTargetUser);

      const result = await controller.unbanUser(
        mockTargetUser.id,
        mockAdminUser,
      );

      expect(service.adminUnban).toHaveBeenCalledWith(
        mockAdminUser.id,
        mockTargetUser.id,
      );
      expect(result).toEqual(mockTargetUser);
    });
  });

  describe('delete', () => {
    it('should call service.adminDelete', async () => {
      service.adminDelete.mockResolvedValue(undefined);

      await controller.delete(mockTargetUser.id, mockAdminUser);

      expect(service.adminDelete).toHaveBeenCalledWith(
        mockAdminUser.id,
        mockTargetUser.id,
      );
    });
  });

  describe('assignCohort', () => {
    it('should call service.adminAssignCohort', async () => {
      const dto = { cohortId: 'cohort-1' };
      service.adminAssignCohort.mockResolvedValue(mockTargetUser);

      const result = await controller.assignCohort(
        mockTargetUser.id,
        mockAdminUser,
        dto,
      );

      expect(service.adminAssignCohort).toHaveBeenCalledWith(
        mockAdminUser.id,
        mockTargetUser.id,
        dto.cohortId,
      );
      expect(result).toEqual(mockTargetUser);
    });
  });
});
