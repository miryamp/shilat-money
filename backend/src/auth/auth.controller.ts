import { Controller, Post, Body, UseGuards, Request, Get, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import { RegisterDto, LoginDto, AuthResponse, HouseholdInviteResponse, ShareHouseholdByEmailRequest } from 'shared/entities/auth.interface';
import { HouseholdDetailsDto } from 'shared/dto/household-details.dto';
import { UserId } from '../common/auth/user-id.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

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
  async generateHouseholdInvite(@UserId() userId: string): Promise<HouseholdInviteResponse> {
    return this.authService.generateHouseholdInvite(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('household/share')
  async shareHouseholdByEmail(
    @Request() req,
    @UserId() userId: string,
    @Body() shareRequest: ShareHouseholdByEmailRequest
  ): Promise<void> {
    await this.authService.shareHouseholdByEmail(userId, shareRequest.email);
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard will handle the authentication
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res) {
    const { accessToken } = await this.authService.validateOrCreateGoogleUser(req.user);
    
    // Redirect to frontend with token
    const frontendUrl = this.configService.get('FRONTEND_URL');
    res.redirect(`${frontendUrl}/auth/google/callback?token=${accessToken}`);
  }
}
