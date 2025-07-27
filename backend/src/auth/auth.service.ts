import { Inject, Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email.service';
import { RegisterDto, AuthResponse, HouseholdInviteResponse, NewHouseholdData } from 'shared/entities/auth.interface';
import { UserRepository, USER_REPOSITORY } from './user-repository.interface';
import { TokenService } from './token.service';
import { HouseholdService } from '../household/household.service';
import { User } from '@/common/data-entities/user';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
        private readonly householdService: HouseholdService,
        private readonly emailService: EmailService
    ) { }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.userRepository.findByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async register(registerDto: RegisterDto): Promise<AuthResponse> {
        const existingUser = await this.userRepository.findByEmail(registerDto.email);
        if (existingUser) {
            throw new Error('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        let newUser: User;
        if (registerDto.householdToken) {
            try {
                const { householdId: decodedHouseholdId } = this.tokenService.decodeHouseholdToken(registerDto.householdToken);
                const household = await this.householdService.findOne(decodedHouseholdId);
                if (!household) {
                    throw new Error('Invalid household token');
                }
                newUser = await this.userRepository.create({
                    email: registerDto.email,
                    username: registerDto.username,
                    language: registerDto.language,
                    password: hashedPassword,
                    householdId: decodedHouseholdId
                });
                newUser.householdId = decodedHouseholdId;
            } catch (error) {
                throw new Error('Invalid or expired household token');
            }
        } else if (registerDto.newHousehold) {
            newUser = await this.userRepository.create({
                email: registerDto.email,
                username: registerDto.username,
                language: registerDto.language,
                password: hashedPassword,
                household: registerDto.newHousehold
            });

        } else {
            throw new Error('Must either provide a household token or new household data');
        }

        return this.createToken(newUser);
    }

    async shareHouseholdByEmail(userId: string, email: string): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        if (!user.householdId) {
            throw new BadRequestException('User does not belong to a household');
        }

        if (!user.household) {
            throw new BadRequestException('Household not found');
        }

        const inviteToken = this.createHouseholdInviteToken(user.householdId);
        
        if (!user.email) {
            throw new BadRequestException('User email not found');
        }
        
        await this.emailService.sendHouseholdInvite(
            email,
            user.email,
            user.household.name,
            inviteToken.inviteToken
        );
    }

    async generateHouseholdInvite(userId: string): Promise<HouseholdInviteResponse> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return this.createHouseholdInviteToken(user.householdId);
    }

    async login(user: any): Promise<AuthResponse> {
        return this.createToken(user);
    }

    private createToken(user: any): AuthResponse {
        const payload = {
            email: user.email,
            sub: user.id,
            householdId: user.householdId
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                householdId: user.householdId
            },
        };
    }

    private createHouseholdInviteToken(householdId: string): HouseholdInviteResponse {
        const token = this.tokenService.generateHouseholdToken(householdId);
        const { expiresAt } = this.tokenService.decodeHouseholdToken(token);

        return {
            inviteToken: token,
            expiresAt: new Date(expiresAt)
        };
    }
}
