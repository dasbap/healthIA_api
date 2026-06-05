import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { env } from '../config/env.config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({ ...dto, passwordHash });

    return this.authResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authResponse(user);
  }

  private authResponse(user: Awaited<ReturnType<UsersService['findById']>>) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      scopes: user.scopes,
    };

    return {
      user: this.usersService.serialize(user),
      accessToken: this.jwtService.sign(payload),
      tokenType: 'Bearer',
      expiresIn: env.jwtExpiresIn,
    };
  }
}
