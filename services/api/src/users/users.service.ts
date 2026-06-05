import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly users: Model<UserDocument>) {}

  async create(dto: CreateUserDto & { passwordHash: string }): Promise<UserDocument> {
    const existing = await this.users.findOne({ email: dto.email.toLowerCase() }).exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    return this.users.create({
      email: dto.email.toLowerCase(),
      passwordHash: dto.passwordHash,
      profile: {
        age: dto.age,
        sex: dto.sex,
        heightCm: dto.heightCm,
        weightKg: dto.weightKg,
      },
      preferences: {
        dietaryRestrictions: dto.dietaryRestrictions ?? [],
        activityLevel: dto.activityLevel ?? 'moderate',
      },
    });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.users.findOne({ email: email.toLowerCase() }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.users.findById(id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: string, dto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.users
      .findByIdAndUpdate(
        id,
        {
          $set: {
            ...(dto.email ? { email: dto.email.toLowerCase() } : {}),
            profile: {
              age: dto.age,
              sex: dto.sex,
              heightCm: dto.heightCm,
              weightKg: dto.weightKg,
            },
            preferences: {
              dietaryRestrictions: dto.dietaryRestrictions ?? [],
              activityLevel: dto.activityLevel ?? 'moderate',
            },
          },
        },
        { new: true },
      )
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  serialize(user: UserDocument) {
    return {
      id: user.id,
      email: user.email,
      roles: user.roles,
      scopes: user.scopes,
      profile: user.profile,
      preferences: user.preferences,
    };
  }
}
