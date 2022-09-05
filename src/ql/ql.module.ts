import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { QLController } from './ql.controller';
import { QLService } from './ql.service';

@Module({
  imports: [ScheduleModule.forRoot(), AuthModule, UsersModule],
  controllers: [QLController],
  providers: [QLService],
})
export class QLModule {}
