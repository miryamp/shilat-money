import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { GoogleAuthController } from './controllers/google.auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { User } from '../common/data-entities/user';
import { MysqlUserRepository } from './mysql-user.repository';
import { USER_REPOSITORY } from './user-repository.interface';
import { TokenService } from './token.service';
import { HouseholdModule } from '../household/household.module';
import { EmailService } from './email.service';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    HouseholdModule,
    CategoryModule,
  ],
  controllers: [AuthController, GoogleAuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: MysqlUserRepository,
    },

    TokenService,
    EmailService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
