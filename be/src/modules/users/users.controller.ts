import {
  Controller,
  Get,
  Patch,
  Body,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

// A mock guard to simulate user auth since real auth guard wasn't in scope.
// You should replace it with the real JWT Guard when merging.
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

interface RequestWithUser {
  user?: {
    id: string;
  };
}

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    // Simulate logged in user
    request.user = { id: 'e2e2e2e2-e2e2-e2e2-e2e2-e2e2e2e2e2e2' }; // Mock UUID
    return true;
  }
}

@ApiTags('users')
@ApiBearerAuth()
@Controller('api/v1/users')
@UseGuards(MockAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  @ApiOperation({ summary: 'Update personal profile' })
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get learning stats for dashboard' })
  async getStats(@Req() req: RequestWithUser) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.usersService.getStats(userId);
  }
}
