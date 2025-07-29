import { Injectable, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmailService } from './email.service';
import { DataSource } from 'typeorm';
import { RegisterDto, AuthResponse, HouseholdInviteResponse, NewHouseholdData, GoogleUser } from 'shared/entities/auth.interface';
import { HouseholdDetailsDto } from 'shared/dto/household-details.dto';
import { UserRepository, USER_REPOSITORY } from './user-repository.interface';
import { TokenService } from './token.service';
import { HouseholdRepository, HOUSEHOLD_REPOSITORY } from '../household/household-repository.interface';
import { CategoryRepository } from '../category/category-repository.interface';
import { User } from '../common/data-entities/user';
import { Category } from '../common/data-entities/category';
import { defaultCategories } from '../category/default-categories';
import { plainToInstance } from 'class-transformer';
import { Language } from 'shared/entities/language.enum';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
        private readonly tokenService: TokenService,
        @Inject(HOUSEHOLD_REPOSITORY) private readonly householdRepository: HouseholdRepository,
        @Inject('CategoryRepo') private readonly categoryRepository: CategoryRepository,
        private readonly emailService: EmailService,
        private readonly dataSource: DataSource
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
                const household = await this.householdRepository.findOne(decodedHouseholdId);
                if (!household) {
                    throw new Error('Invalid household token');
                }
                newUser = await this.userRepository.create({
                    ...registerDto,
                    password: hashedPassword,
                    householdId: decodedHouseholdId
                });
                newUser.householdId = decodedHouseholdId;
            } catch (error) {
                throw new Error('Invalid or expired household token');
            }
        } else if (registerDto.newHousehold) {
            try {
                newUser = await this.dataSource.transaction(async (manager) => {
                    const household = await this.householdRepository.create({
                        name: registerDto.newHousehold!.name,
                        currency: registerDto.newHousehold!.currency
                    }, manager);

                    // Create default categories using repository
                    await Promise.all(defaultCategories.map(async defaultCategory => {
                        const category = plainToInstance(Category, defaultCategory);
                        await this.categoryRepository.create(category, household.id, manager);
                    }));
                    
                    return await this.userRepository.create({
                        email: registerDto.email,
                        firstName: registerDto.firstName,
                        lastName: registerDto.lastName,
                        language: registerDto.language,
                        password: hashedPassword,
                        householdId: household.id
                    }, manager);
                });
            } catch (error) {
                throw new Error('Failed to create user and household');
            }
        } else {
            throw new Error('Must either provide a household token or new household data');
        }

        return this.createToken(newUser);
    }

    async shareHouseholdByEmail(userId: string, email: string): Promise<void> {
        const user = await this.userRepository.findOne(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (!user.householdId) {
            throw new Error('User does not belong to a household');
        }

        if (!user.household) {
            throw new Error('Household not found');
        }

        const inviteToken = this.createHouseholdInviteToken(user.householdId);
        
        if (!user.email) {
            throw new Error('User email not found');
        }
        
        await this.emailService.sendHouseholdInvite(
            email,
            user.email,
            user.household.name,
            inviteToken.inviteToken
        );
    }

    async generateHouseholdInvite(userId: string): Promise<HouseholdInviteResponse> {
        const user = await this.userRepository.findOne(userId);
        if (!user) {
            throw new Error('User not found');
        }

        return this.createHouseholdInviteToken(user.householdId);
    }

    async login(user: any): Promise<AuthResponse> {
        return this.createToken(user);
    }

    async validateOrCreateGoogleUser(googleUser: GoogleUser): Promise<AuthResponse> {
        let user = await this.userRepository.findByEmail(googleUser.email);
        
        if (!user) {
            // Create a new user with Google profile data
            user = await this.userRepository.create({
                ...googleUser,
                // For Google auth users, we don't store a password
                // This is safe as Google users will never log in with password
                password: '', 
                language: Language.EN,
            });
        } else if (!user.googleId) {
            // If user exists but doesn't have googleId (registered via email), link the accounts
            await this.userRepository.update(user.id, {
                googleId: googleUser.googleId
            });
        }

        // Reload user after update if needed
        if (!user.googleId) {
            user = await this.userRepository.findOne(user.id) || user;
        }

        return this.createToken(user);
    }

    private createToken(user: any): AuthResponse {
        const payload = {
            email: user.email,
            sub: user.id,
            householdId: user.householdId,
            language: user.language
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user,
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

    async getHouseholdDetailsByToken(token: string): Promise<HouseholdDetailsDto> {
        try {
            const { householdId } = this.tokenService.decodeHouseholdToken(token);
            const household = await this.householdRepository.findOne(householdId);
            
            if (!household) {
                throw new Error('Household not found');
            }

            const users = await this.userRepository.findByHouseholdId(householdId);
            
            return {
                id: household.id,
                name: household.name,
                currency: household.currency,
                users: users.map(user => ({
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }))
            };
        } catch (error) {
            throw new Error('Invalid or expired token');
        }
    }

    async joinHousehold(userId: string, token: string): Promise<void> {
        try {
            await this.dataSource.transaction(async (manager) => {
                const { householdId } = this.tokenService.decodeHouseholdToken(token);
                const user = await this.userRepository.findOne(userId, manager);
                
                if (!user) {
                    throw new Error('User not found');
                }

                const household = await this.householdRepository.findOne(householdId, manager);
                if (!household) {
                    throw new Error('Household not found');
                }

                if (user.householdId) {
                    const usersInHousehold = await this.userRepository.findByHouseholdId(user.householdId, manager);
                    if (usersInHousehold.length === 1) {
                        await this.householdRepository.remove(user.householdId, manager);
                    }
                }

                await this.userRepository.update(user.id, { householdId }, manager);
            });
        } catch (error) {
            throw new Error('Failed to join household');
        }
    }
}
