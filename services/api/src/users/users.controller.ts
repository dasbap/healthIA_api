import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Scopes } from '../auth/scopes.decorator';
import { ScopesGuard } from '../auth/scopes.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

type AuthRequest = Request & { user: { sub: string } };

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, ScopesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @Scopes('profile:read')
  async me(@Req() request: AuthRequest) {
    const user = await this.usersService.findById(request.user.sub);
    return this.usersService.serialize(user);
  }

  @Patch('me')
  @Scopes('profile:write')
  async updateMe(@Req() request: AuthRequest, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.update(request.user.sub, dto);
    return this.usersService.serialize(user);
  }
}
