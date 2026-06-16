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

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Simulate logged in user
    request.user = { id: 'u_mina01' }; // Mock UUID
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
  async updateProfile(@Req() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.usersService.updateProfile(userId, updateProfileDto);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get learning stats for dashboard' })
  async getStats(@Req() req) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }
    return this.usersService.getStats(userId);
  }
}
