export type UserRole = 'Admin' | 'Learner';

export interface UserDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  cohortName: string;
  avatarInitials: string;
  avatarColorHsl: string;
  title?: string;
  createdAt: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  cohort?: string;
}

export interface UserListResponse {
  data: UserDto[];
  total: number;
  page: number;
  limit: number;
}

export interface UserCreateDto {
  fullName: string;
  email: string;
  role: UserRole;
  cohortName?: string;
  title?: string;
  bio?: string;
}

export interface UserUpdateDto {
  role?: UserRole;
  cohortName?: string;
}

const INITIAL_MOCK_USERS: UserDto[] = [
  {
    id: 'usr_001',
    fullName: 'Nguyễn Huy',
    email: 'huy.nguyen@company.com',
    role: 'Admin',
    cohortName: 'Central Admin Group',
    avatarInitials: 'NH',
    avatarColorHsl: 'hsl(210, 70%, 50%)',
    title: 'Đầu mối quản trị hệ thống đào tạo nội bộ.',
    createdAt: '2024-01-15T08:30:00Z',
  },
  {
    id: 'usr_002',
    fullName: 'Trần Lan',
    email: 'lan.tran@company.com',
    role: 'Learner',
    cohortName: 'Engineering 2024',
    avatarInitials: 'TL',
    avatarColorHsl: 'hsl(280, 70%, 60%)',
    title: 'Thành viên mới tham gia chương trình Ramp Up 2024.',
    createdAt: '2024-02-01T09:15:00Z',
  },
  {
    id: 'usr_003',
    fullName: 'Phạm Văn',
    email: 'van.pham@company.com',
    role: 'Learner',
    cohortName: 'Backend Fundamentals',
    avatarInitials: 'PV',
    avatarColorHsl: 'hsl(160, 60%, 45%)',
    title: 'Tập trung nghiên cứu Node.js và hệ thống phân tán.',
    createdAt: '2024-02-10T10:00:00Z',
  },
  {
    id: 'usr_004',
    fullName: 'Lê Hoa',
    email: 'hoa.le@company.com',
    role: 'Learner',
    cohortName: 'Frontend Track',
    avatarInitials: 'LH',
    avatarColorHsl: 'hsl(340, 75%, 60%)',
    title: 'Đam mê UI/UX và React ecosystem.',
    createdAt: '2024-02-12T14:20:00Z',
  },
  {
    id: 'usr_005',
    fullName: 'Hoàng Minh',
    email: 'minh.hoang@company.com',
    role: 'Admin',
    cohortName: 'Central Admin Group',
    avatarInitials: 'HM',
    avatarColorHsl: 'hsl(25, 85%, 55%)',
    title: 'Phụ trách định hướng và đánh giá KPI đào tạo.',
    createdAt: '2024-01-10T11:00:00Z',
  },
  {
    id: 'usr_006',
    fullName: 'Vũ Đức',
    email: 'duc.vu@company.com',
    role: 'Learner',
    cohortName: 'Engineering 2024',
    avatarInitials: 'VĐ',
    avatarColorHsl: 'hsl(190, 80%, 45%)',
    title: 'Học viên Kỹ sư năm 2024.',
    createdAt: '2024-03-01T08:00:00Z',
  },
  {
    id: 'usr_007',
    fullName: 'Đặng Ngọc',
    email: 'ngoc.dang@company.com',
    role: 'Learner',
    cohortName: 'Frontend Track',
    avatarInitials: 'ĐN',
    avatarColorHsl: 'hsl(310, 65%, 55%)',
    title: 'Tập trung phát triển giao diện người dùng độ phản hồi cao.',
    createdAt: '2024-03-05T09:30:00Z',
  },
  {
    id: 'usr_008',
    fullName: 'Bùi Tuấn',
    email: 'tuan.bui@company.com',
    role: 'Learner',
    cohortName: 'Backend Fundamentals',
    avatarInitials: 'BT',
    avatarColorHsl: 'hsl(140, 65%, 45%)',
    title: 'Đang theo học khóa cơ bản về Backend.',
    createdAt: '2024-03-12T13:15:00Z',
  },
  {
    id: 'usr_009',
    fullName: 'Đỗ Quỳnh',
    email: 'quynh.do@company.com',
    role: 'Learner',
    cohortName: 'Engineering 2024',
    avatarInitials: 'ĐQ',
    avatarColorHsl: 'hsl(45, 90%, 45%)',
    title: 'Quan tâm đến tự động hóa kiểm thử và tích hợp CI/CD.',
    createdAt: '2024-03-15T15:45:00Z',
  },
  {
    id: 'usr_010',
    fullName: 'Trịnh Quốc',
    email: 'quoc.trinh@company.com',
    role: 'Learner',
    cohortName: 'Backend Fundamentals',
    avatarInitials: 'TQ',
    avatarColorHsl: 'hsl(200, 75%, 50%)',
    title: 'Học viên khóa an ninh và bảo mật hệ thống.',
    createdAt: '2024-03-18T10:20:00Z',
  },
  {
    id: 'usr_011',
    fullName: 'Lý Mai',
    email: 'mai.ly@company.com',
    role: 'Learner',
    cohortName: 'Frontend Track',
    avatarInitials: 'LM',
    avatarColorHsl: 'hsl(350, 70%, 55%)',
    title: 'Theo đuổi lập trình web hiện đại.',
    createdAt: '2024-03-20T08:50:00Z',
  },
  {
    id: 'usr_012',
    fullName: 'Mai Anh',
    email: 'anh.mai@company.com',
    role: 'Admin',
    cohortName: 'Central Admin Group',
    avatarInitials: 'MA',
    avatarColorHsl: 'hsl(260, 65%, 55%)',
    title: 'Điều phối viên chương trình Ramp Up.',
    createdAt: '2024-01-20T14:00:00Z',
  },
  {
    id: 'usr_013',
    fullName: 'Ngô Thanh',
    email: 'thanh.ngo@company.com',
    role: 'Learner',
    cohortName: 'Engineering 2024',
    avatarInitials: 'NT',
    avatarColorHsl: 'hsl(170, 70%, 45%)',
    title: 'Nghiên cứu hạ tầng Cloud và Kubernetes.',
    createdAt: '2024-03-22T09:10:00Z',
  },
  {
    id: 'usr_014',
    fullName: 'Phan Bảo',
    email: 'bao.phan@company.com',
    role: 'Learner',
    cohortName: 'Backend Fundamentals',
    avatarInitials: 'PB',
    avatarColorHsl: 'hsl(230, 75%, 60%)',
    title: 'Đang theo dõi lộ trình kỹ sư Backend.',
    createdAt: '2024-03-25T11:30:00Z',
  },
  {
    id: 'usr_015',
    fullName: 'Hồ Chi',
    email: 'chi.ho@company.com',
    role: 'Learner',
    cohortName: 'Frontend Track',
    avatarInitials: 'HC',
    avatarColorHsl: 'hsl(30, 80%, 50%)',
    title: 'Kết hợp giữa thiết kế đồ họa và lập trình giao diện.',
    createdAt: '2024-03-28T16:00:00Z',
  },
  {
    id: 'usr_016',
    fullName: 'Dương Hùng',
    email: 'hung.duong@company.com',
    role: 'Learner',
    cohortName: 'Engineering 2024',
    avatarInitials: 'DH',
    avatarColorHsl: 'hsl(290, 60%, 50%)',
    title: 'Học viên tích cực khóa 2024.',
    createdAt: '2024-04-01T08:15:00Z',
  },
  {
    id: 'usr_017',
    fullName: 'Đoàn Linh',
    email: 'linh.doan@company.com',
    role: 'Learner',
    cohortName: 'Frontend Track',
    avatarInitials: 'ĐL',
    avatarColorHsl: 'hsl(330, 70%, 55%)',
    title: 'Mở rộng kỹ năng từ mobile sang web.',
    createdAt: '2024-04-05T10:45:00Z',
  },
  {
    id: 'usr_018',
    fullName: 'Võ Lâm',
    email: 'lam.vo@company.com',
    role: 'Learner',
    cohortName: 'Backend Fundamentals',
    avatarInitials: 'VL',
    avatarColorHsl: 'hsl(150, 75%, 40%)',
    title: 'Xử lý luồng dữ liệu lớn và tối ưu hóa truy vấn.',
    createdAt: '2024-04-10T14:20:00Z',
  },
  {
    id: 'usr_019',
    fullName: 'Tạ Long',
    email: 'long.ta@company.com',
    role: 'Admin',
    cohortName: 'Central Admin Group',
    avatarInitials: 'TL',
    avatarColorHsl: 'hsl(215, 80%, 50%)',
    title: 'Cố vấn chiến lược cho chương trình đào tạo.',
    createdAt: '2024-01-05T09:00:00Z',
  },
  {
    id: 'usr_020',
    fullName: 'Cao Sơn',
    email: 'son.cao@company.com',
    role: 'Learner',
    cohortName: 'Engineering 2024',
    avatarInitials: 'CS',
    avatarColorHsl: 'hsl(180, 70%, 45%)',
    title: 'Học viên kỹ sư hạ tầng đám mây.',
    createdAt: '2024-04-15T11:00:00Z',
  },
];

let mockUsersStore = [...INITIAL_MOCK_USERS];

export async function mockFetchUsers(params: UserQueryParams = {}): Promise<UserListResponse> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const page = params.page && params.page > 0 ? params.page : 1;
  const limit = params.limit && params.limit > 0 ? params.limit : 10;
  const search = params.search?.trim().toLowerCase() || '';
  const role = params.role && params.role !== 'all' ? params.role : '';
  const cohort = params.cohort && params.cohort !== 'all' ? params.cohort : '';

  const filtered = mockUsersStore.filter((u) => {
    const matchSearch =
      !search ||
      u.fullName.toLowerCase().includes(search) ||
      u.email.toLowerCase().includes(search);
    const matchRole = !role || u.role.toLowerCase() === role.toLowerCase();
    const matchCohort = !cohort || u.cohortName.toLowerCase() === cohort.toLowerCase();
    return matchSearch && matchRole && matchCohort;
  });

  // Để mô phỏng con số 1,248 tài khoản khi không có bộ lọc (như trong mô tả trang Quản lý người dùng),
  // nếu người dùng đang ở chế độ xem tất cả (không filter), chúng ta hiển thị total = 1248 (hoặc số thực trong store nếu > 1248).
  const isDefaultFilter = !search && !role && !cohort;
  const total = isDefaultFilter ? Math.max(1248, mockUsersStore.length) : filtered.length;

  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  // Nếu page lớn nhưng không có đủ trong mảng tĩnh 20 user khi ở chế độ default filter, ta tạo động user để demo mượt mà
  if (isDefaultFilter && paginatedData.length < limit && startIndex < total) {
    const needed = Math.min(limit - paginatedData.length, total - startIndex);
    for (let i = 0; i < needed; i++) {
      const idx = startIndex + paginatedData.length + 1;
      const roleChoice: UserRole = idx % 5 === 0 ? 'Admin' : 'Learner';
      const cohortChoice = roleChoice === 'Admin' ? 'Central Admin Group' : idx % 3 === 0 ? 'Frontend Track' : idx % 2 === 0 ? 'Backend Fundamentals' : 'Engineering 2024';
      paginatedData.push({
        id: `usr_demo_${idx}`,
        fullName: `Học viên Thành Viên #${idx}`,
        email: `member.${idx}@company.com`,
        role: roleChoice,
        cohortName: cohortChoice,
        avatarInitials: `TV${idx % 100}`,
        avatarColorHsl: `hsl(${(idx * 37) % 360}, 65%, 50%)`,
        title: `Tài khoản học viên số #${idx} trong hệ thống đào tạo.`,
        createdAt: '2024-05-01T10:00:00Z',
      });
    }
  }

  return {
    data: paginatedData,
    total,
    page,
    limit,
  };
}

export async function mockCreateUser(payload: UserCreateDto): Promise<UserDto> {
  await new Promise((resolve) => setTimeout(resolve, 400));

  const words = payload.fullName.trim().split(/\s+/);
  const initials = words.length >= 2 
    ? `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
    : `${words[0][0]}${words[0][1] || ''}`.toUpperCase();

  const hue = Math.floor(Math.random() * 360);
  const avatarColorHsl = `hsl(${hue}, 70%, 50%)`;

  const newUser: UserDto = {
    id: `usr_${Date.now()}`,
    fullName: payload.fullName.trim(),
    email: payload.email.trim(),
    role: payload.role,
    cohortName: payload.cohortName || (payload.role === 'Admin' ? 'Central Admin Group' : 'Engineering 2024'),
    avatarInitials: initials,
    avatarColorHsl,
    title: payload.title || 'Ramp Up Member',
    createdAt: new Date().toISOString(),
  };

  mockUsersStore = [newUser, ...mockUsersStore];
  return newUser;
}

export async function mockUpdateUser(id: string, payload: UserUpdateDto): Promise<UserDto> {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const index = mockUsersStore.findIndex((u) => u.id === id);
  if (index === -1) {
    throw new Error('User not found');
  }

  const updated: UserDto = {
    ...mockUsersStore[index],
    ...(payload.role && { role: payload.role }),
    ...(payload.cohortName && { cohortName: payload.cohortName }),
  };

  mockUsersStore[index] = updated;
  return updated;
}
