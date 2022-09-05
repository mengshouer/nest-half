import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findOne(@Req() req, @Query('username') username: string) {
    if (req.user.username !== username) throw new UnauthorizedException();
    return this.usersService.findOne(username);
  }

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  remove(@Req() req, @Param('username') username: string) {
    if (req.user.username !== username) throw new UnauthorizedException();
    return this.usersService.remove(username);
  }

  @UseGuards(JwtAuthGuard)
  @Post('update')
  update(@Req() req, @Body() updateUserDto: UpdateUserDto) {
    if (req.user.username !== updateUserDto.username)
      throw new UnauthorizedException();
    return this.usersService.update(updateUserDto);
  }
}
