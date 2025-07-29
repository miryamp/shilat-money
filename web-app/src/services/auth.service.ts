import { AuthResponse, LoginDto, RegisterDto } from 'shared/entities/auth.interface';
import { HouseholdDetailsDto } from 'shared/dto/household-details.dto';
import { getAuthHeaders } from '@/utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const authService = {
    async login(credentials: LoginDto): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        return response.json();
    },

    async register(data: RegisterDto): Promise<AuthResponse> {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        return response.json();
    },

    async getHouseholdDetailsByToken(token: string): Promise<HouseholdDetailsDto> {
        const response = await fetch(`${API_URL}/auth/household/details/${token}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to get household details');
        }

        return response.json();
    },

    async generateHouseholdInvite(): Promise<{ inviteToken: string }> {
        const response = await fetch(`${API_URL}/auth/household/invite`, {
            method: 'POST',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Failed to generate invite');
        }

        return response.json();
    },

    async shareHouseholdByEmail(email: string): Promise<void> {
        const response = await fetch(`${API_URL}/auth/household/share`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            throw new Error('Failed to share household');
        }
    },

    async joinHousehold(token: string): Promise<void> {
        const response = await fetch(`${API_URL}/auth/household/join/${token}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!response.ok) {
            throw new Error('Failed to join household');
        }
    },
};
