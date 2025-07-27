import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { User } from '../common/data-entities/user';
import { MysqlUserRepository } from './mysql-user.repository';
import { USER_REPOSITORY } from './user-repository.interface';
import { TokenService } from './token.service';
import { HouseholdModule } from '../household/household.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key', // Use environment variable in production
      signOptions: { expiresIn: '1d' },
    }),
    HouseholdModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: MysqlUserRepository,
    },
    TokenService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
