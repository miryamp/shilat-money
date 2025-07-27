import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, AuthResponse } from 'shared/entities/auth.interface';

@Injectable()
export class AuthService {
  private users = new Map<string, any>(); // Replace with your database implementation

  constructor(private readonly jwtService: JwtService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = this.users.get(email);
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    if (this.users.has(registerDto.email)) {
      throw new UnauthorizedException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = {
      id: Date.now().toString(),
      ...registerDto,
      password: hashedPassword,
    };

    this.users.set(registerDto.email, user);
    
    return this.createToken(user);
  }

  async login(user: any): Promise<AuthResponse> {
    return this.createToken(user);
  }

  private createToken(user: any): AuthResponse {
    const payload = { 
      email: user.email, 
      sub: user.id,
      householdId: user.householdId || 'mainhousehold' // TODO: Replace with actual household assignment logic
    };
    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        householdId: user.householdId || 'mainhousehold'
      },
    };
  }
}
