import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // * flag判断是否为新注册账号
  async findOne(username: string, flag?: boolean) {
    const user = await this.userRepository.findOneBy({ username });
    if (!user && !flag) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    if (await this.findOne(createUserDto.username, true)) {
      throw new ForbiddenException(
        `User with username ${createUserDto.username} already exists`,
      );
    }
    if (createUserDto.inviteCode !== process.env.INVITECODE) {
      throw new ForbiddenException(
        `Invite code ${createUserDto.inviteCode} is invalid`,
      );
    }
    const user = new User();
    user.username = createUserDto.username;
    user.password = createUserDto.password;
    return this.userRepository.save(user);
  }

  async update(updateUserDto: UpdateUserDto) {
    const user = await this.findOne(updateUserDto.username);
    user.username = updateUserDto.username;
    user.password = updateUserDto.password;
    user.cookie = updateUserDto.cookie;
    return this.userRepository.save(user);
  }

  async remove(username: string) {
    if (!username) throw new ForbiddenException('Username is required');
    const user = await this.findOne(username);
    return this.userRepository.remove(user);
  }
}
