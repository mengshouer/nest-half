import { Module } from '@nestjs/common';
import { QLModule } from './ql/ql.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // * dotenv
    ConfigModule.forRoot({ isGlobal: true }),
    // * database
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './db/users.db',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    // * otherModules
    QLModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
