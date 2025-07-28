import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto, LoginDto, AuthResponse, HouseholdInviteResponse, ShareHouseholdByEmailRequest } from 'shared/entities/auth.interface';
import { HouseholdDetailsDto } from 'shared/dto/household-details.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('household/invite')
  async generateHouseholdInvite(@Request() req): Promise<HouseholdInviteResponse> {
    return this.authService.generateHouseholdInvite(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('household/share')
  async shareHouseholdByEmail(
    @Request() req,
    @Body() shareRequest: ShareHouseholdByEmailRequest
  ): Promise<void> {
    await this.authService.shareHouseholdByEmail(req.user.id, shareRequest.email);
  }

  @Get('household/details/:token')
  async getHouseholdDetailsByToken(@Param('token') token: string): Promise<HouseholdDetailsDto> {
    return this.authService.getHouseholdDetailsByToken(token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('household/join/:token')
  async joinHousehold(@Request() req, @Param('token') token: string): Promise<void> {
    await this.authService.joinHousehold(req.user.id, token);
  }
}
