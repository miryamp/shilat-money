import { Currency } from '../entities/currency.enum';

export interface HouseholdDetailsDto {
    id: string;
    name: string;
    currency: Currency;
    users: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    }[];
}
